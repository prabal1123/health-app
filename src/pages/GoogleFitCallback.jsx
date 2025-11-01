// // GoogleFitCallback.jsx
// import React, { useEffect, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { supabase } from '../supabase';
// import { CircularProgress, Box, Typography } from '@mui/material';

// export default function GoogleFitCallback() {
//   const navigate = useNavigate();
//   const [error, setError] = useState(null);
//   const [hasExchangedCode, setHasExchangedCode] = useState(false);

//   useEffect(() => {
//     const runExchange = async () => {
//       try {
//         // 1️⃣ Get authorization code from URL
//         const code = new URLSearchParams(window.location.search).get('code');
//         if (!code) {
//           console.error('❌ Missing authorization code in URL');
//           setError('Missing authorization code.');
//           return;
//         }

//         // 2️⃣ Ensure Supabase session exists (user must be logged in already)
//         const { data: { session }, error: sessionError } = await supabase.auth.getSession();
//         if (sessionError || !session) {
//           console.error('❌ No valid Supabase session found:', sessionError);
//           setError('No valid Supabase session. Please log in again.');
//           return;
//         }

//         if (hasExchangedCode) return;

//         const siteUrl = import.meta.env.VITE_SITE_URL;
//         const redirectUri = `${siteUrl}/googlefit-callback`;

//         console.log('--- Exchanging Google Fit Code ---');
//         console.log('Redirect URI:', redirectUri);
//         console.log('Authorization Code:', code);
//         console.log('User ID:', session.user.id);
//         console.log('Supabase Access Token (first 10 chars):', session.access_token.substring(0, 10) + '...');
//         console.log('----------------------------------');

//         setHasExchangedCode(true);

//         // 3️⃣ Call Supabase Edge Function to exchange code → tokens
//         const res = await fetch(
//           `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/exchangeGoogleFitCode`,
//           {
//             method: 'POST',
//             headers: {
//               'Content-Type': 'application/json',
//               Authorization: `Bearer ${session.access_token}`,
//             },
//             body: JSON.stringify({
//               code,
//               redirect_uri: redirectUri,
//               user_id: session.user.id,
//             }),
//           }
//         );

//         const result = await res.json();
//         console.log('✅ Exchange response:', result);

//         if (!res.ok) {
//           throw new Error(result?.error || `Token exchange failed with status ${res.status}`);
//         }

//         // 4️⃣ Success → navigate to dashboard
//         navigate('/dashboard');
//       } catch (err) {
//         console.error('❌ Exchange failed:', err);
//         setError(err.message || 'Something went wrong.');
//       }
//     };

//     runExchange();
//   }, [navigate, hasExchangedCode]);

//   return (
//     <Box
//       sx={{
//         display: 'flex',
//         flexDirection: 'column',
//         alignItems: 'center',
//         justifyContent: 'center',
//         height: '80vh',
//         textAlign: 'center',
//       }}
//     >
//       <CircularProgress />
//       <Typography mt={2}>
//         {error ? `Error: ${error}` : 'Connecting Google Fit...'}
//       </Typography>
//     </Box>
//   );
// }


import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import { CircularProgress, Box, Typography } from '@mui/material';

export default function GoogleFitCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const ranRef = useRef(false);

  useEffect(() => {
    const runExchange = async () => {
      if (ranRef.current) return;
      ranRef.current = true;

      try {
        // 1️⃣ Read code and state from URL
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');
        const returnedState = params.get('state');

        if (!code) {
          setError('Missing authorization code.');
          return;
        }

        // 2️⃣ Validate CSRF state
        const expectedState = localStorage.getItem('googlefit_oauth_state');
        if (!returnedState || !expectedState || returnedState !== expectedState) {
          console.error('State mismatch:', { returnedState, expectedState });
          setError('Invalid OAuth state. Please try connecting again.');
          return;
        }

        // Clear stored state once validated
        localStorage.removeItem('googlefit_oauth_state');

        // 3️⃣ Ensure logged-in Supabase session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !session) {
          setError('No valid session. Please log in and try again.');
          return;
        }

        // 4️⃣ Build redirect URI (must match launch side exactly)
        const redirectUri = `${window.location.origin}/googlefit-callback`;

        // 5️⃣ Exchange the code for tokens via your Supabase Edge Function
        const EXCHANGE_URL = import.meta.env.VITE_EXCHANGE_GOOGLE_FIT_CODE_URL;
        if (!EXCHANGE_URL) {
          setError('Exchange URL not configured (VITE_EXCHANGE_GOOGLE_FIT_CODE_URL).');
          return;
        }

        const res = await fetch(EXCHANGE_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            code,
            redirect_uri: redirectUri,
            user_id: session.user.id,
          }),
        });

        const result = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(result?.error || `Token exchange failed (${res.status})`);
        }

        // 6️⃣ Success → navigate to dashboard
        navigate('/dashboard', { replace: true });
      } catch (err) {
        console.error('❌ Exchange failed:', err);
        setError(err.message || 'Something went wrong.');
      }
    };

    runExchange();
  }, [navigate]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '80vh',
        textAlign: 'center',
      }}
    >
      <CircularProgress />
      <Typography mt={2}>
        {error ? `Error: ${error}` : 'Connecting Google Fit...'}
      </Typography>
    </Box>
  );
}
