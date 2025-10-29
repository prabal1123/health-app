// // src/utils/refreshStravaToken.js
// import { supabase } from '../supabase'

// export const refreshStravaTokenIfNeeded = async (userId) => {
//   const { data: userInfo, error } = await supabase
//     .from('user_info')
//     .select('strava_access, strava_refresh, strava_token_expiry')
//     .eq('id', userId)
//     .single()

//   if (error || !userInfo?.strava_refresh) return null

//   const now = Date.now()
//   const expiry = new Date(userInfo.strava_token_expiry).getTime()

//   if (expiry > now) return userInfo.strava_access // still valid

//   // Token expired — refresh
//   try {
//     const res = await fetch('https://www.strava.com/oauth/token', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({
//         grant_type: 'refresh_token',
//         client_id: import.meta.env.VITE_STRAVA_CLIENT_ID,
//         client_secret: import.meta.env.VITE_STRAVA_CLIENT_SECRET,
//         refresh_token: userInfo.strava_refresh,
//       }),
//     })

//     const data = await res.json()

//     await supabase
//       .from('user_info')
//       .update({
//         strava_access: data.access_token,
//         strava_refresh: data.refresh_token,
//         strava_token_expiry: new Date(data.expires_at * 1000).toISOString(),
//       })
//       .eq('id', userId)

//     return data.access_token
//   } catch (e) {
//     console.error('Failed to refresh Strava token:', e)
//     return null
//   }
// }


import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { verifyFirebaseToken } from '../_shared/firebaseAdmin.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': '*',
  'Access-Control-Allow-Headers': '*',
  'Content-Type': 'application/json',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('authorization') ?? ''
    const token = authHeader.replace('Bearer ', '')
    const decoded = await verifyFirebaseToken(token)

    const { user_id } = await req.json()
    if (!user_id || user_id !== decoded.uid) {
      return new Response(JSON.stringify({ error: 'Invalid UID' }), {
        headers: corsHeaders,
        status: 403,
      })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const { data, error } = await supabase
      .from('strava_tokens')
      .select('access_token')
      .eq('user_id', user_id)
      .single()

    if (error || !data?.access_token) {
      return new Response(
        JSON.stringify({ error: 'No token found for this user' }),
        { headers: corsHeaders, status: 404 }
      )
    }

    return new Response(JSON.stringify({ access_token: data.access_token }), {
      headers: corsHeaders,
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Internal Error', detail: err.message }), {
      headers: corsHeaders,
      status: 500,
    })
  }
})
