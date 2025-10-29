// // supabase/functions/exchangeGoogleFitCode/index.ts
// import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
// import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// const corsHeaders = {
//   'Access-Control-Allow-Origin': 'http://localhost:5173', // 🔥 Change when deploying
//   'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
//   'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
//   'Content-Type': 'application/json',
// };

// serve(async (req) => {
//   if (req.method === 'OPTIONS') {
//     return new Response('ok', { headers: corsHeaders });
//   }

//   try {
//     const { code, redirect_uri, user_id } = await req.json();

//     if (!code || !redirect_uri || !user_id) {
//       return new Response(
//         JSON.stringify({ error: 'Missing code, redirect_uri, or user_id' }),
//         { headers: corsHeaders, status: 400 },
//       );
//     }

//     const supabase = createClient(
//       Deno.env.get('SUPABASE_URL')!,
//       Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
//     );

//     const googleClientId = Deno.env.get('GOOGLE_CLIENT_ID')!;
//     const googleClientSecret = Deno.env.get('GOOGLE_CLIENT_SECRET')!;

//     // 🔑 Exchange auth code for tokens
//     const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
//       body: new URLSearchParams({
//         code,
//         client_id: googleClientId,
//         client_secret: googleClientSecret,
//         redirect_uri,
//         grant_type: 'authorization_code',
//       }),
//     });

//     const tokenData = await tokenRes.json();
//     if (!tokenRes.ok || !tokenData.access_token) {
//       return new Response(
//         JSON.stringify({ error: 'Failed to exchange code', details: tokenData }),
//         { headers: corsHeaders, status: 400 },
//       );
//     }

//     // Prepare record
//     const tokenRecord: any = {
//       access_token: tokenData.access_token,
//       refresh_token: tokenData.refresh_token,
//       expires_in: tokenData.expires_in,
//       expires_at: new Date(Date.now() + tokenData.expires_in * 1000).toISOString(),
//     };

//     // Insert or update tokens for this user
//     const { error: upsertError } = await supabase
//       .from('google_fit_tokens')
//       .upsert({ user_id, ...tokenRecord }, { onConflict: 'user_id' });

//     if (upsertError) {
//       return new Response(
//         JSON.stringify({ error: 'Failed to save tokens', details: upsertError }),
//         { headers: corsHeaders, status: 500 },
//       );
//     }

//     return new Response(
//       JSON.stringify({ success: true, ...tokenRecord }),
//       { headers: corsHeaders },
//     );
//   } catch (err: any) {
//     return new Response(
//       JSON.stringify({ error: err.message }),
//       { headers: corsHeaders, status: 500 },
//     );
//   }
// });

// supabase/functions/exchangeGoogleFitCode/index.ts
// @ts-nocheck
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  const origin = req.headers.get('origin') ?? '*';
  const corsHeaders = {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
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

    const { code, redirect_uri, user_id } = await req.json();
    if (!code || !redirect_uri || !user_id) {
      return new Response(
        JSON.stringify({ error: 'Missing code, redirect_uri, or user_id' }),
        { headers: corsHeaders, status: 400 },
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const googleClientId = Deno.env.get('GOOGLE_CLIENT_ID')!;
    const googleClientSecret = Deno.env.get('GOOGLE_CLIENT_SECRET')!;
    if (!googleClientId || !googleClientSecret) {
      return new Response(
        JSON.stringify({ error: 'Server misconfigured: missing Google credentials' }),
        { headers: corsHeaders, status: 500 },
      );
    }

    // 1) Exchange auth code → tokens
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: googleClientId,
        client_secret: googleClientSecret,
        redirect_uri,
        grant_type: 'authorization_code',
      }),
    });

    const tokenData = await tokenRes.json();
    if (!tokenRes.ok || !tokenData.access_token) {
      return new Response(
        JSON.stringify({
          error: 'Failed to exchange code',
          details: tokenData,
        }),
        { headers: corsHeaders, status: 400 },
      );
    }

    // 2) Build record, preserving existing refresh_token if Google didn’t send one
    let refreshToken: string | null = tokenData.refresh_token ?? null;
    if (!refreshToken) {
      const { data: existing, error: existingErr } = await supabase
        .from('google_fit_tokens')
        .select('refresh_token')
        .eq('user_id', user_id)
        .maybeSingle();

      if (!existingErr && existing?.refresh_token) {
        refreshToken = existing.refresh_token;
      }
    }

    const tokenRecord: Record<string, unknown> = {
      access_token: tokenData.access_token,
      refresh_token: refreshToken, // may still be null if truly first-time missing
      expires_in: tokenData.expires_in,
      expires_at: new Date(Date.now() + (tokenData.expires_in ?? 0) * 1000).toISOString(),
      scope: tokenData.scope ?? null,
      token_type: tokenData.token_type ?? null,
    };

    // 3) Upsert by user_id (ensure user_id is UNIQUE in table schema)
    const { error: upsertError } = await supabase
      .from('google_fit_tokens')
      .upsert({ user_id, ...tokenRecord }, { onConflict: 'user_id' });

    if (upsertError) {
      return new Response(
        JSON.stringify({ error: 'Failed to save tokens', details: upsertError }),
        { headers: corsHeaders, status: 500 },
      );
    }

    return new Response(JSON.stringify({ success: true, ...tokenRecord }), {
      headers: corsHeaders,
      status: 200,
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err?.message ?? 'Internal error' }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
      status: 500,
    });
  }
});
