// // src/utils/googleFitUtils.js
// import { supabase } from '../supabase';

// export async function logoutFromGoogleFit(userId) {
//   try {
//     const { data: { session } } = await supabase.auth.getSession();
//     const token = session?.access_token;
//     if (!token) throw new Error('Authentication required: No active session found.');

//     const FUNCTIONS_BASE = import.meta.env.VITE_SUPABASE_FUNCTIONS_URL;
//     if (!FUNCTIONS_BASE) throw new Error('Backend function URL is not configured.');

//     const response = await fetch(`${FUNCTIONS_BASE}/logoutGoogleFit`, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         'Authorization': `Bearer ${token}`,
//       },
//       body: JSON.stringify({ user_id: userId })
//     });

//     if (!response.ok) {
//       const data = await response.json();
//       throw new Error(data.error || 'Failed to log out from Google Fit.');
//     }

//     console.log('✅ Successfully logged out from Google Fit.');
//     return true;
//   } catch (error) {
//     console.error('❌ Error in logoutFromGoogleFit utility:', error.message);
//     throw error;
//   }
// }
// src/utils/googleFitUtils.js
import { supabase } from '../supabase';

export async function logoutFromGoogleFit(userId) {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const token = session?.access_token;
    if (!token) throw new Error('Authentication required: No active session found.');

    // ✅ Use the specific per-function URL you added in .env
    const LOGOUT_URL = import.meta.env.VITE_LOGOUT_GOOGLE_FIT_URL;
    if (!LOGOUT_URL)
      throw new Error('Backend function URL is not configured. (VITE_LOGOUT_GOOGLE_FIT_URL missing)');

    const response = await fetch(LOGOUT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ user_id: userId }),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error || `Failed to log out from Google Fit. Status: ${response.status}`);
    }

    console.log('✅ Successfully logged out from Google Fit.');
    return true;
  } catch (error) {
    console.error('❌ Error in logoutFromGoogleFit utility:', error.message);
    throw error;
  }
}
