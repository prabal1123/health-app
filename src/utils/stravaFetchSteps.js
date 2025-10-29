// // ✅ src/utils/stravaFetchSteps.js
// import { supabase } from '../supabase'

// const FUNCTIONS_BASE = import.meta.env.VITE_SUPABASE_FUNCTIONS_URL;

// /* ───────────── 1. Refresh Token ───────────── */
// export async function refreshStravaToken(userId) {
//   const {
//     data: { session },
//   } = await supabase.auth.getSession();
//   const jwt = session?.access_token;

//   const res = await fetch(`${FUNCTIONS_BASE}/refreshStravaToken`, {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//       Authorization: `Bearer ${jwt}`,
//     },
//     body: JSON.stringify({ user_id: userId }),
//   });

//   if (!res.ok) {
//     const msg = await res.text();
//     console.error(`❌ Strava-token refresh failed (${res.status}): ${msg}`);
//     throw new Error(`Strava refresh failed: ${msg}`);
//   }

//   const refreshed = await res.json();
//   console.log('🔁 Refreshed Strava token:', refreshed);
//   return refreshed;
// }

// /* ───────────── 2. Fetch Strava Steps ───────────── */
// export async function fetchStravaSteps(userId) {
//   const tryFetch = async () => {
//     const { data, error } = await supabase
//       .from('strava_tokens')
//       .select('access_token')
//       .eq('user_id', userId)
//       .single();

//     if (error || !data?.access_token) {
//       console.error('❌ No access token found or DB error:', error || 'Missing token');
//       throw new Error(`No Strava token found for user ${userId}`);
//     }

//     console.log('🛡️ Using access token:', data.access_token);

//     const res = await fetch(
//       'https://www.strava.com/api/v3/athlete/activities?per_page=100',
//       {
//         headers: {
//           Authorization: `Bearer ${data.access_token}`,
//         },
//       }
//     );

//     const json = await res.json();
//     return { ok: res.ok, status: res.status, json };
//   };

//   let { ok, status, json } = await tryFetch();

//   if (status === 401) {
//     console.warn('🔒 Access token expired (401), attempting refresh…');
//     try {
//       await refreshStravaToken(userId);
//       ({ ok, status, json } = await tryFetch());
//     } catch (refreshErr) {
//       console.error('🚫 Token refresh failed:', refreshErr.message);
//       return []; // Return empty array to prevent UI crash
//     }
//   }

//   if (!ok) {
//     console.error(`❌ Strava API error ${status}:`, json);
//     throw new Error(`Strava API error ${status}: ${JSON.stringify(json)}`);
//   }

//   // 🔁 Step 1: Map activity distance to steps by date
//   const stepsByDate = {};

//   json.forEach((activity) => {
//     const date = activity.start_date_local?.split('T')[0];
//     const distance = activity.distance || 0; // meters
//     const estimatedSteps = Math.round(distance / 0.78); // avg step length in meters

//     if (date) {
//       stepsByDate[date] = (stepsByDate[date] || 0) + estimatedSteps;
//     }
//   });

//   const stepArray = Object.entries(stepsByDate).map(([date, steps]) => ({
//     date,
//     steps,
//   }));

//   if (!stepArray.length) {
//     console.warn('⚠️ No activity data returned by Strava for this user.');
//   }

//   console.log('✅ Strava step entries:', stepArray);
//   return stepArray;
// }

// src/utils/stravaFetchSteps.js
import { supabase } from '../supabase'

const FUNCTIONS_BASE = import.meta.env.VITE_SUPABASE_FUNCTIONS_URL

export async function fetchStravaSteps(userId) {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    const jwt = session?.access_token
    if (!jwt) throw new Error('Authentication required')

    // 🌐 Call the secure backend function
    const res = await fetch(`${FUNCTIONS_BASE}/getStravaActivities`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jwt}`,
      },
      body: JSON.stringify({ user_id: userId }),
    })

    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.error || 'Failed to fetch Strava activities')
    }

    const stepArray = await res.json()

    console.log('✅ Strava step entries:', stepArray)
    return stepArray
  } catch (err) {
    console.error('❌ Strava Fetch Error:', err)
    return []
  }
}