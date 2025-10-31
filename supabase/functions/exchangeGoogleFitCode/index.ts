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
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.44.0';

const allowedOrigins = [
  'http://localhost:5173',
  'https://health-app-8ulh.vercel.app',
];

Deno.serve(async (req) => {
  const origin = req.headers.get('origin') ?? '';
  const corsHeaders = {
    'Access-Control-Allow-Origin': allowedOrigins.includes(origin)
      ? origin
      : allowedOrigins[0],
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers':
      'authorization, x-client-info, apikey, content-type',
    'Content-Type': 'application/json',
  };

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
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

    const tokenData = await tokenRes.json().catch(() => ({}));
    if (!tokenRes.ok || !tokenData.access_token) {
      return new Response(
        JSON.stringify({ error: 'Failed to exchange code', details: tokenData }),
        { headers: corsHeaders, status: 400 },
      );
    }

    let refreshToken = tokenData.refresh_token ?? null;
    if (!refreshToken) {
      const { data: existing } = await supabase
        .from('google_fit_tokens')
        .select('refresh_token')
        .eq('user_id', user_id)
        .maybeSingle();
      if (existing?.refresh_token) refreshToken = existing.refresh_token;
    }

    const tokenRecord = {
      access_token: tokenData.access_token,
      refresh_token: refreshToken,
      expires_in: tokenData.expires_in,
      expires_at: new Date(
        Date.now() + (tokenData.expires_in ?? 0) * 1000,
      ).toISOString(),
      scope: tokenData.scope ?? null,
      token_type: tokenData.token_type ?? null,
    };

    const { error } = await supabase
      .from('google_fit_tokens')
      .upsert({ user_id, ...tokenRecord }, { onConflict: 'user_id' });

    if (error) {
      return new Response(
        JSON.stringify({ error: 'Failed to save tokens', details: error }),
        { headers: corsHeaders, status: 500 },
      );
    }

    return new Response(JSON.stringify({ success: true, ...tokenRecord }), {
      headers: corsHeaders,
      status: 200,
    });
  } catch (err) {
    console.error('Exchange error:', err);
    return new Response(
      JSON.stringify({ error: err?.message ?? 'Internal error' }),
      { headers: corsHeaders, status: 500 },
    );
  }
});
