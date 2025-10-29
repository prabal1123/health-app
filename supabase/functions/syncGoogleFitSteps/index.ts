

// import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
// import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// const corsHeaders = {
//   'Access-Control-Allow-Origin': '*',
//   'Access-Control-Allow-Methods': 'POST, OPTIONS',
//   'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
//   'Content-Type': 'application/json',
// };

// serve(async (req) => {
//   if (req.method === 'OPTIONS') {
//     return new Response('ok', { headers: corsHeaders });
//   }

//   try {
//     if (req.method !== 'POST') {
//       return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
//         status: 405,
//         headers: { ...corsHeaders, 'Content-Type': 'application/json' },
//       });
//     }

//     const authHeader = req.headers.get('Authorization');
//     if (!authHeader) {
//       return new Response(JSON.stringify({ error: 'Authorization header missing.' }), {
//         status: 401,
//         headers: { ...corsHeaders, 'Content-Type': 'application/json' },
//       });
//     }
//     const supabaseJwt = authHeader.split(' ')[1];

//     const supabaseAdmin = createClient(
//       Deno.env.get('SUPABASE_URL')!,
//       Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
//     );

//     const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(supabaseJwt);

//     if (authError || !user) {
//       console.error('Supabase JWT verification failed:', authError);
//       return new Response(JSON.stringify({ error: 'Unauthorized: Invalid Supabase session.' }), {
//         status: 401,
//         headers: { ...corsHeaders, 'Content-Type': 'application/json' },
//       });
//     }

//     const userId = user.id;
//     const { user_id, userTimeZone } = await req.json();

//     if (!userTimeZone) {
//         console.warn('userTimeZone not provided in request body. Using default UTC for aggregation.');
//     }

//     // 🔁 1. Get refresh token
//     const { data: tokenRow, error: tokenError } = await supabaseAdmin
//       .from('google_fit_tokens')
//       .select('refresh_token')
//       .eq('user_id', userId)
//       .single();

//     if (tokenError || !tokenRow?.refresh_token) {
//       console.error('Supabase DB error fetching refresh token:', tokenError);
//       return new Response(JSON.stringify({ error: 'Google Fit refresh token not found for this user. Please reconnect Google Fit.' }), {
//         headers: corsHeaders,
//         status: 401,
//       });
//     }

//     const refresh_token = tokenRow.refresh_token;

//     // 🔁 2. Exchange refresh token for new access token
//     const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
//       body: new URLSearchParams({
//         client_id: Deno.env.get('GOOGLE_CLIENT_ID')!,
//         client_secret: Deno.env.get('GOOGLE_CLIENT_SECRET')!,
//         refresh_token,
//         grant_type: 'refresh_token',
//       }),
//     });

//     const tokenData = await tokenRes.json();
//     const googleToken = tokenData.access_token;
//     const expiresIn = tokenData.expires_in;

//     if (!googleToken) {
//       console.error('Failed to refresh Google Fit access token:', tokenData);
//       return new Response(JSON.stringify({ error: 'Failed to refresh Google Fit access token.', details: tokenData.error_description || tokenData.error }), {
//         headers: corsHeaders,
//         status: 401,
//       });
//     }

//     const { error: updateTokenError } = await supabaseAdmin
//       .from('google_fit_tokens')
//       .update({
//         access_token: googleToken,
//         expires_in: expiresIn,
//         expires_at: new Date(Date.now() + expiresIn * 1000).toISOString(),
//       })
//       .eq('user_id', userId);
    
//     if (updateTokenError) {
//         console.error('Error updating access token in DB:', updateTokenError);
//     }

//     // 3️⃣ Fetch step data from Google Fit API
//     const now = new Date();
//     const startTimeMillis = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
//     const endTimeMillis = Date.now() - 60000; 

//     const fitResponse = await fetch(
//       'https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate',
//       {
//         method: 'POST',
//         headers: {
//           Authorization: `Bearer ${googleToken}`,
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           aggregateBy: [
//             {
//               dataTypeName: 'com.google.step_count.delta',
//               dataSourceId: 'derived:com.google.step_count.delta:com.google.android.gms:merge_step_deltas',
//             },
//           ],
//           bucketByTime: {
//             durationMillis: 86400000,
//             timeZone: userTimeZone || 'UTC'
//           },
//           startTimeMillis,
//           endTimeMillis,
//           includeAllApps: true,
//         }),
//       }
//     );

//     const fitData = await fitResponse.json();
//     console.log('📦 Raw Google Fit API response:', JSON.stringify(fitData, null, 2));

//     if (!fitResponse.ok) {
//         console.error('Google Fit API error response:', fitData);
//         if (fitData.error && fitData.error.code === 401) {
//             return new Response(JSON.stringify({
//                 error: 'Google Fit access token invalid or expired. Please re-authenticate.',
//                 details: fitData.error.message
//             }), {
//                 headers: corsHeaders,
//                 status: 401,
//             });
//         }
//         return new Response(JSON.stringify({
//             error: `Failed to fetch from Google Fit API: ${fitResponse.statusText}`,
//             details: fitData.error?.message || 'No additional error message provided.'
//         }), {
//             headers: corsHeaders,
//             status: fitResponse.status,
//         });
//     }

//     let todaySteps = 0;
//     const buckets = fitData.bucket || [];

//     for (const bucket of buckets) {
//       if (bucket.dataset) {
//         for (const dataset of bucket.dataset) {
//           if (dataset.point) {
//             for (const point of dataset.point) {
//               if (point.value) {
//                 for (const value of point.value) {
//                   todaySteps += value.intVal || 0;
//                 }
//               }
//             }
//           }
//         }
//       }
//     }

//     // 4️⃣ Update user_info
//     const isoNow = new Date().toISOString();
//     const { error: updateUserInfoError } = await supabaseAdmin
//       .from('user_info')
//       .update({
//         steps_source: 'googlefit',
//         googlefit_last_synced: isoNow,
//         steps: todaySteps
//       })
//       .eq('id', userId);

//     if (updateUserInfoError) {
//       console.error('Error updating user_info in DB:', updateUserInfoError);
//       return new Response(JSON.stringify({ error: updateUserInfoError.message, message: 'Failed to update user info in database.' }), {
//         headers: corsHeaders,
//         status: 500,
//       });
//     }

//     // ✅ Success response to the frontend
//     return new Response(
//       JSON.stringify({
//         stepsToday: todaySteps,
//         lastSynced: isoNow,
//       }),
//       { headers: corsHeaders, status: 200 }
//     );
//   } catch (err: any) {
//     console.error('❌ Unhandled Google Fit sync error in Edge Function:', err);
//     return new Response(JSON.stringify({ error: 'Internal server error.', details: err.message || 'Unknown error' }), {
//       headers: corsHeaders,
//       status: 500,
//     });
//   }
// });
// @ts-nocheck
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  const origin = req.headers.get('origin') ?? '*';
  const corsHeaders = {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Content-Type': 'application/json',
  };

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
        status: 405,
        headers: corsHeaders,
      });
    }

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Authorization header missing.' }), {
        status: 401,
        headers: corsHeaders,
      });
    }
    const supabaseJwt = authHeader.split(' ')[1];

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Verify the Supabase user from the JWT
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(supabaseJwt);
    if (authError || !user) {
      console.error('Supabase JWT verification failed:', authError);
      return new Response(JSON.stringify({ error: 'Unauthorized: Invalid Supabase session.' }), {
        status: 401,
        headers: corsHeaders,
      });
    }
    const userId = user.id;

    const { userTimeZone } = await req.json().catch(() => ({ userTimeZone: 'UTC' as const }));
    if (!userTimeZone) {
      console.warn('userTimeZone not provided in request body. Using default UTC for aggregation.');
    }

    // 1) Get refresh token
    const { data: tokenRow, error: tokenError } = await supabaseAdmin
      .from('google_fit_tokens')
      .select('refresh_token')
      .eq('user_id', userId)
      .maybeSingle();

    if (tokenError || !tokenRow?.refresh_token) {
      console.warn('Refresh token missing or DB error:', tokenError);
      // Self-heal: ensure any broken row is removed
      await supabaseAdmin.from('google_fit_tokens').delete().eq('user_id', userId);
      return new Response(
        JSON.stringify({ error: 'Google Fit not connected.', code: 'RECONNECT_REQUIRED' }),
        { headers: corsHeaders, status: 409 }
      );
    }

    const refresh_token = tokenRow.refresh_token;

    // 2) Exchange refresh token for new access token
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: Deno.env.get('GOOGLE_CLIENT_ID')!,
        client_secret: Deno.env.get('GOOGLE_CLIENT_SECRET')!,
        refresh_token,
        grant_type: 'refresh_token',
      }),
    });

    const tokenData = await tokenRes.json().catch(() => ({}));
    const googleToken: string | undefined = tokenData?.access_token;
    const expiresIn: number | undefined = tokenData?.expires_in;

    if (!tokenRes.ok || !googleToken) {
      const errCode = tokenData?.error ?? '';
      const errDesc = tokenData?.error_description ?? tokenData?.error ?? 'Bad Request';

      console.error('Failed to refresh Google Fit access token:', tokenData);

      // If refresh token is invalid/revoked → self-heal: delete row & ask client to reconnect
      if (errCode === 'invalid_grant' || errCode === 'unauthorized_client' || errDesc?.includes('invalid_grant')) {
        await supabaseAdmin.from('google_fit_tokens').delete().eq('user_id', userId);
        return new Response(
          JSON.stringify({
            error: 'Google authorization expired or revoked.',
            code: 'RECONNECT_REQUIRED',
            details: errDesc,
          }),
          { headers: corsHeaders, status: 409 }
        );
      }

      return new Response(
        JSON.stringify({ error: 'Failed to refresh Google Fit access token.', details: errDesc }),
        { headers: corsHeaders, status: 401 }
      );
    }

    // Update access token metadata (keep existing refresh_token)
    const { error: updateTokenError } = await supabaseAdmin
      .from('google_fit_tokens')
      .update({
        access_token: googleToken,
        expires_in: expiresIn ?? null,
        expires_at: expiresIn ? new Date(Date.now() + expiresIn * 1000).toISOString() : null,
      })
      .eq('user_id', userId);
    if (updateTokenError) {
      console.error('Error updating access token in DB:', updateTokenError);
    }

    // 3) Fetch step data from Google Fit API (aggregate today)
    const now = new Date();
    const startTimeMillis = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const endTimeMillis = Date.now() - 60_000; // pad 1 min

    const fitResponse = await fetch(
      'https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${googleToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          aggregateBy: [
            {
              dataTypeName: 'com.google.step_count.delta',
              dataSourceId: 'derived:com.google.step_count.delta:com.google.android.gms:merge_step_deltas',
            },
          ],
          bucketByTime: { durationMillis: 86_400_000, timeZone: userTimeZone || 'UTC' },
          startTimeMillis,
          endTimeMillis,
          includeAllApps: true,
        }),
      }
    );

    const fitData = await fitResponse.json().catch(() => ({}));
    console.log('📦 Raw Google Fit API response:', JSON.stringify(fitData, null, 2));

    if (!fitResponse.ok) {
      console.error('Google Fit API error response:', fitData);
      const details = fitData?.error?.message ?? fitResponse.statusText;

      // If token just got invalid, ask for reconnect (rare race)
      if (fitData?.error?.code === 401) {
        return new Response(
          JSON.stringify({
            error: 'Google Fit access token invalid or expired.',
            code: 'RECONNECT_REQUIRED',
            details,
          }),
          { headers: corsHeaders, status: 409 }
        );
      }

      return new Response(
        JSON.stringify({ error: 'Failed to fetch from Google Fit API', details }),
        { headers: corsHeaders, status: fitResponse.status }
      );
    }

    // Sum steps
    let todaySteps = 0;
    const buckets = fitData?.bucket ?? [];
    for (const bucket of buckets) {
      for (const dataset of bucket?.dataset ?? []) {
        for (const point of dataset?.point ?? []) {
          for (const value of point?.value ?? []) {
            todaySteps += value?.intVal ?? 0;
          }
        }
      }
    }

    // 4) Update user_info
    const isoNow = new Date().toISOString();
    const { error: updateUserInfoError } = await supabaseAdmin
      .from('user_info')
      .update({
        steps_source: 'googlefit',
        googlefit_last_synced: isoNow,
        steps: todaySteps,
      })
      .eq('id', userId);

    if (updateUserInfoError) {
      console.error('Error updating user_info in DB:', updateUserInfoError);
      return new Response(
        JSON.stringify({ error: 'Failed to update user info in database.', details: updateUserInfoError.message }),
        { headers: corsHeaders, status: 500 }
      );
    }

    // Success
    return new Response(JSON.stringify({ stepsToday: todaySteps, lastSynced: isoNow }), {
      headers: corsHeaders,
      status: 200,
    });
  } catch (err) {
    console.error('❌ Unhandled Google Fit sync error in Edge Function:', err);
    return new Response(JSON.stringify({ error: 'Internal server error.', details: String(err?.message ?? err) }), {
      headers: {
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Content-Type': 'application/json',
      },
      status: 500,
    });
  }
});
