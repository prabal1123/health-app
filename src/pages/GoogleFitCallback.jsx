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
        // --- parse params first
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');
        const returnedState = params.get('state');
        const expectedState = localStorage.getItem('googlefit_oauth_state');

        // --- DEBUG
        // console.group('🔎 Google Fit OAuth Callback (GoogleFitCallback.jsx)');
        // console.log('CALLBACK origin:', window.location.origin);
        // console.log('returnedState (from URL):', returnedState);
        // console.log('expectedState (from localStorage):', expectedState);
        // console.log('Full query string:', window.location.search);
        // console.groupEnd();

        if (!code) {
          console.error('❌ Missing authorization code in callback.');
          setError('Missing authorization code.');
          return;
        }

        // --- strict state validation
        if (!returnedState || !expectedState || returnedState !== expectedState) {
          console.error('❌ State mismatch:', { returnedState, expectedState });
          setError('Invalid OAuth state. Please try connecting again.');
          return;
        }

        // --- clear state once validated
        localStorage.removeItem('googlefit_oauth_state');

        // --- ensure logged-in user
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !session) {
          console.error('❌ No valid Supabase session found:', sessionError);
          setError('No valid session. Please log in and try again.');
          return;
        }

        // --- redirect_uri must match the launch side
        const redirectUri = `${window.location.origin}/googlefit-callback`;

        // --- backend exchange
        const EXCHANGE_URL = import.meta.env.VITE_EXCHANGE_GOOGLE_FIT_CODE_URL;
        if (!EXCHANGE_URL) {
          console.error('❌ Missing VITE_EXCHANGE_GOOGLE_FIT_CODE_URL');
          setError('Exchange URL not configured.');
          return;
        }

        console.log('➡️ Exchanging code with backend:', {
          EXCHANGE_URL,
          redirectUri,
          user: session.user.id,
        });

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
        if (!res.ok) throw new Error(result?.error || `Token exchange failed (${res.status})`);

        console.log('✅ Exchange result:', result);
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
