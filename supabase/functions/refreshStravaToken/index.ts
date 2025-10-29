
// // supabase/functions/exchangeGoogleFitCode/index.ts
// import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
// import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// // ──────────────────────────────────────────
// //  0.  CORS helpers
// // ──────────────────────────────────────────
// const ALLOWED_ORIGINS = ['http://localhost:5175'] // + add prod URL when ready

// function cors(origin: string | null) {
//   return {
//     'Access-Control-Allow-Origin': ALLOWED_ORIGINS.includes(origin ?? '')
//       ? origin!
//       : '',
//     'Access-Control-Allow-Methods': 'POST, OPTIONS',
//     'Access-Control-Allow-Headers':
//       'authorization, x-client-info, apikey, content-type',
//     'Access-Control-Max-Age': '86400',
//     'Content-Type': 'application/json',
//   } as const
// }

// // ──────────────────────────────────────────
// //  1.  Supabase admin client (service-role key)
// // ──────────────────────────────────────────
// const supabase = createClient(
//   Deno.env.get('SUPABASE_URL')!,
//   Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
// )

// // ──────────────────────────────────────────
// serve(async (req) => {
//   const headers = cors(req.headers.get('origin'))

//   // Pre-flight
//   if (req.method === 'OPTIONS') return new Response('ok', { headers })

//   try {
//     // 2. ─── Validate JWT coming from the browser ──────
//     const jwt = (req.headers.get('authorization') || '').replace('Bearer ', '')
//     if (!jwt) return new Response(JSON.stringify({ error: 'No auth token' }), { status: 401, headers })

//     // Supabase JWT payload is just base64 JSON
//     const user_id = JSON.parse(atob(jwt.split('.')[1]))?.sub
//     if (!user_id) return new Response(JSON.stringify({ error: 'Invalid token' }), { status: 401, headers })

//     // 3. ─── Read POST body ────────────────────────────
//     const { code, redirect_uri } = await req.json()
//     if (!code || !redirect_uri) {
//       return new Response(JSON.stringify({ error: 'Missing code or redirect_uri' }), { status: 400, headers })
//     }

//     // 4. ─── Exchange code for tokens with Google ──────
//     const googleRes = await fetch('https://oauth2.googleapis.com/token', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
//       body: new URLSearchParams({
//         code,
//         client_id: Deno.env.get('GOOGLE_CLIENT_ID')!,        // <-- from .env.functions
//         client_secret: Deno.env.get('GOOGLE_CLIENT_SECRET')!,
//         redirect_uri,
//         grant_type: 'authorization_code',
//       }).toString(),
//     })

//     const googleJson = await googleRes.json()
//     console.log('GOOGLE RESPONSE', googleJson)

//     if (!googleRes.ok || !googleJson.access_token) {
//       return new Response(JSON.stringify(googleJson), { status: 400, headers })
//     }

//     // 5. ─── Upsert token row in googlefit_tokens table ─
//     const { error } = await supabase
//       .from('googlefit_tokens')
//       .upsert(
//         {
//           user_id,
//           access_token: googleJson.access_token,
//           refresh_token: googleJson.refresh_token,
//           expires_in: googleJson.expires_in,
//           scope: googleJson.scope,
//           token_type: googleJson.token_type,
//         },
//         { onConflict: 'user_id' }
//       )

//     if (error) throw error

//     return new Response(JSON.stringify({ success: true }), { headers })
//   } catch (err) {
//     console.error('🔥 Function error:', err)
//     return new Response(JSON.stringify({ error: err.message || 'Internal error' }), { status: 500, headers })
//   }
// })

// import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
// import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// const corsHeaders = {
//   'Access-Control-Allow-Origin': '*',
//   'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
//   'Access-Control-Allow-Headers': '*',
//   'Content-Type': 'application/json',
// }

// serve(async (req) => {
//   // ✅ 1. Handle CORS preflight
//   if (req.method === 'OPTIONS') {
//     return new Response('ok', {
//       status: 200,
//       headers: corsHeaders,
//     })
//   }

//   try {
//     const body = await req.json()
//     const user_id = body.user_id?.trim()
//     if (!user_id) throw new Error('Missing user_id')

//     const supabase = createClient(
//       Deno.env.get('PROJECT_URL')!,
//       Deno.env.get('SERVICE_ROLE_KEY')!
//     )

//     const { data: tokenRow } = await supabase
//       .from('strava_tokens')
//       .select('refresh_token')
//       .eq('user_id', user_id)
//       .single()

//     if (!tokenRow?.refresh_token) {
//       throw new Error('No refresh token found')
//     }

//     const refreshRes = await fetch('https://www.strava.com/oauth/token', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({
//         client_id: Deno.env.get('STRAVA_CLIENT_ID'),
//         client_secret: Deno.env.get('STRAVA_CLIENT_SECRET'),
//         grant_type: 'refresh_token',
//         refresh_token: tokenRow.refresh_token,
//       }),
//     })

//     const newTokens = await refreshRes.json()
//     if (!refreshRes.ok) {
//       throw new Error(`Strava refresh failed: ${JSON.stringify(newTokens)}`)
//     }

//     await supabase
//       .from('strava_tokens')
//       .update({
//         access_token: newTokens.access_token,
//         refresh_token: newTokens.refresh_token,
//       })
//       .eq('user_id', user_id)

//     return new Response(
//       JSON.stringify({ success: true }),
//       { status: 200, headers: corsHeaders }
//     )
//   } catch (err) {
//     console.error('❌ Error:', err)
//     return new Response(
//       JSON.stringify({ error: err.message || 'Unexpected error' }),
//       { status: 500, headers: corsHeaders }
//     )
//   }
// })

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': '*',
  'Content-Type': 'application/json',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      status: 200,
      headers: corsHeaders,
    })
  }

  try {
    const supabase = createClient(
      Deno.env.get('PROJECT_URL')!,
      Deno.env.get('SERVICE_ROLE_KEY')!
    )
    
    // ✅ SECURITY FIX: Get the user from the authentication token
    const authHeader = req.headers.get('authorization')
    const { data: { user } } = await supabase.auth.getUser(authHeader)

    if (!user) {
      throw new Error('User not authenticated')
    }
    
    const user_id = user.id

    const { data: tokenRow } = await supabase
      .from('strava_tokens')
      .select('refresh_token')
      .eq('user_id', user_id)
      .single()

    if (!tokenRow?.refresh_token) {
      throw new Error('No refresh token found for this user')
    }

    const refreshRes = await fetch('https://www.strava.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: Deno.env.get('STRAVA_CLIENT_ID'),
        client_secret: Deno.env.get('STRAVA_CLIENT_SECRET'),
        grant_type: 'refresh_token',
        refresh_token: tokenRow.refresh_token,
      }),
    })

    const newTokens = await refreshRes.json()
    if (!refreshRes.ok) {
      throw new Error(`Strava refresh failed: ${JSON.stringify(newTokens)}`)
    }

    await supabase
      .from('strava_tokens')
      .update({
        access_token: newTokens.access_token,
        refresh_token: newTokens.refresh_token,
      })
      .eq('user_id', user_id)

    return new Response(
      JSON.stringify({ success: true, access_token: newTokens.access_token }),
      { status: 200, headers: corsHeaders }
    )
  } catch (err) {
    console.error('❌ Error:', err)
    return new Response(
      JSON.stringify({ error: err.message || 'Unexpected error' }),
      { status: 500, headers: corsHeaders }
    )
  }
})
