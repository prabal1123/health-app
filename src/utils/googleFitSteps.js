// // src/utils/googleFitSteps.js
// import { supabase } from '../supabase';

// export async function fetchGoogleFitSteps(userId) {
//   try {
//     const { data: { session } } = await supabase.auth.getSession();
//     const token = session?.access_token;
//     if (!token) throw new Error('Authentication required: No active session found.');

//     const FUNCTIONS_BASE = import.meta.env.VITE_SUPABASE_FUNCTIONS_URL;
//     if (!FUNCTIONS_BASE) throw new Error('Backend function URL is not configured.');

//     const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

//     const response = await fetch(`${FUNCTIONS_BASE}/syncGoogleFitSteps`, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         'Authorization': `Bearer ${token}`,
//       },
//       body: JSON.stringify({ user_id: userId, userTimeZone: userTimeZone })
//     });

//     const data = await response.json();

//     if (!response.ok) {
//       console.error('Error from Supabase syncGoogleFitSteps function:', data);
//       throw new Error(data.error || `Failed to fetch Google Fit steps from backend (Status: ${response.status}).`);
//     }

//     console.log('✅ Google Fit steps fetched successfully:', data.stepsToday, 'Last synced:', data.lastSynced);
    
//     return {
//       steps: data.stepsToday || 0,
//       lastSync: data.lastSynced || new Date().toISOString()
//     };

//   } catch (error) {
//     console.error('❌ Error in fetchGoogleFitSteps utility:', error.message);
//     throw error;
//   }
// }


// // src/utils/googleFitSteps.js
// import { supabase } from '../supabase';

// export async function fetchGoogleFitSteps(userId) {
//   try {
//     const { data: { session } } = await supabase.auth.getSession();
//     const token = session?.access_token;
//     if (!token) throw new Error('Authentication required: No active session found.');

//     const FUNCTIONS_BASE = import.meta.env.VITE_SUPABASE_FUNCTIONS_URL;
//     if (!FUNCTIONS_BASE) throw new Error('Backend function URL is not configured.');

//     const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

//     const response = await fetch(`${FUNCTIONS_BASE}/syncGoogleFitSteps`, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         'Authorization': `Bearer ${token}`,
//       },
//       body: JSON.stringify({ user_id: userId, userTimeZone: userTimeZone })
//     });

//     const data = await response.json();

//     if (!response.ok) {
//       console.error('Error from Supabase syncGoogleFitSteps function:', data);
//       throw new Error(data.error || `Failed to fetch Google Fit steps from backend (Status: ${response.status}).`);
//     }

//     console.log('✅ Google Fit steps fetched successfully:', data.stepsToday, 'Last synced:', data.lastSynced);
    
//     return {
//       steps: data.stepsToday || 0,
//       lastSync: data.lastSynced || new Date().toISOString()
//     };

//   } catch (error) {
//     console.error('❌ Error in fetchGoogleFitSteps utility:', error.message);
//     throw error;
//   }
// }
import { supabase } from '../supabase';

export async function fetchGoogleFitSteps(userId) {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    if (!token) throw new Error('Authentication required: No active session found.');

    const FUNCTIONS_BASE = import.meta.env.VITE_SUPABASE_FUNCTIONS_URL;
    if (!FUNCTIONS_BASE) throw new Error('Backend function URL is not configured.');

    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    const response = await fetch(`${FUNCTIONS_BASE}/syncGoogleFitSteps`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ user_id: userId, userTimeZone })
    });

    const data = await response.json().catch(() => ({}));

    // Handle self-heal signal from edge function
    if (response.status === 409 && data?.code === 'RECONNECT_REQUIRED') {
      const err = new Error('Google Fit connection expired. Reconnect required.');
      err.code = 'RECONNECT_REQUIRED';
      throw err;
    }

    if (!response.ok) {
      console.error('Error from Supabase syncGoogleFitSteps function:', data);
      throw new Error(data.error || `Failed to fetch Google Fit steps from backend (Status: ${response.status}).`);
    }

    console.log('✅ Google Fit steps fetched successfully:', data.stepsToday, 'Last synced:', data.lastSynced);

    return {
      steps: data.stepsToday || 0,
      lastSync: data.lastSynced || new Date().toISOString(),
    };
  } catch (error) {
    console.error('❌ Error in fetchGoogleFitSteps utility:', error.message);
    throw error;
  }
}
