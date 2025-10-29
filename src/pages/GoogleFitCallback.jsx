// import React, { useEffect, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react';
// import { CircularProgress, Box, Typography } from '@mui/material';

// export default function GoogleFitCallback() {
//   const navigate = useNavigate();
//   const supabase = useSupabaseClient();
//   const session = useSession(); 
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     // Add a guard clause to ensure session and user data are loaded
//     if (!session || !session.user) {
//       return; 
//     }

//     const code = new URLSearchParams(window.location.search).get('code');
//     const redirectUri = 'http://localhost:5173/googlefit-callback';

//     if (!code) {
//       setError('Missing authorization code.');
//       return;
//     }

//     const exchangeCode = async () => {
//       try {
//         const res = await fetch(
//           'https://xzpyaylnaakhtfqshhmv.functions.supabase.co/exchangeGoogleFitCode',
//           {
//             method: 'POST',
//             headers: {
//               'Content-Type': 'application/json',
//               Authorization: `Bearer ${session.access_token}`,
//             },
//             body: JSON.stringify({
//               code,
//               redirect_uri: redirectUri,
//               user_id: session.user.id, // Now guaranteed to be available
//             }),
//           }
//         );

//         const result = await res.json();
//         if (!res.ok) throw new Error(result?.error || 'Token exchange failed.');

//         console.log('✅ Google Fit tokens saved:', result);
//         navigate('/dashboard');
//       } catch (err) {
//         console.error('❌ Exchange failed:', err);
//         setError(err.message || 'Something went wrong.');
//       }
//     };

//     exchangeCode();
//   }, [session, navigate]);

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
// src/pages/GoogleFitCallback.jsx
// import React, { useEffect, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react';
// import { CircularProgress, Box, Typography } from '@mui/material';

// export default function GoogleFitCallback() {
//   const navigate = useNavigate();
//   const supabase = useSupabaseClient();
//   const session = useSession();
//   const [error, setError] = useState(null);
//   const [hasExchangedCode, setHasExchangedCode] = useState(false); // <-- Add this state

//   useEffect(() => {
//     // Add a guard clause to ensure the session is loaded and we haven't already exchanged the code.
//     if (!session || !session.user || hasExchangedCode) {
//       return; 
//     }

//     const code = new URLSearchParams(window.location.search).get('code');
//     const redirectUri = 'http://localhost:5173/googlefit-callback';

//     if (!code) {
//       setError('Missing authorization code.');
//       return;
//     }

//     setHasExchangedCode(true); // <-- Set state to prevent future calls

//     const exchangeCode = async () => {
//       try {
//         const res = await fetch(
//           'https://xzpyaylnaakhtfqshhmv.functions.supabase.co/exchangeGoogleFitCode',
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
//         if (!res.ok) throw new Error(result?.error || 'Token exchange failed.');

//         console.log('✅ Google Fit tokens saved:', result);
//         navigate('/dashboard');
//       } catch (err) {
//         console.error('❌ Exchange failed:', err);
//         setError(err.message || 'Something went wrong.');
//       }
//     };

//     exchangeCode();
//   }, [session, navigate, hasExchangedCode]); // <-- Add hasExchangedCode to the dependency array

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

// // src/pages/GoogleFitCallback.jsx
// import React, { useEffect, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { useSession } from '@supabase/auth-helpers-react';
// import { CircularProgress, Box, Typography } from '@mui/material';

// export default function GoogleFitCallback() {
//   const navigate = useNavigate();
//   const session = useSession();
//   const [error, setError] = useState(null);
//   const [hasExchangedCode, setHasExchangedCode] = useState(false);

//   useEffect(() => {
//     if (!session || !session.user || hasExchangedCode) {
//       return;
//     }

//     const code = new URLSearchParams(window.location.search).get('code');
//     const siteUrl = import.meta.env.VITE_SITE_URL;
//     const redirectUri = `${siteUrl}/googlefit-callback`;

//     if (!code) {
//       setError('Missing authorization code.');
//       return;
//     }

//     setHasExchangedCode(true);

//     const exchangeCode = async () => {
//       try {
//         const res = await fetch(
//           // ✅ Using the correct URL from your previous code
//           'https://xzpyaylnaakhtfqshhmv.functions.supabase.co/exchangeGoogleFitCode',
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
//         if (!res.ok) throw new Error(result?.error || 'Token exchange failed.');

//         console.log('✅ Google Fit tokens saved:', result);
//         navigate('/dashboard');
//       } catch (err) {
//         console.error('❌ Exchange failed:', err);
//         setError(err.message || 'Something went wrong.');
//       }
//     };

//     exchangeCode();
//   }, [session, navigate, hasExchangedCode]);

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
// src/pages/GoogleFitCallback.jsx
// This component now calls the correct Supabase function for the initial token exchange.

// src/pages/GoogleFitCallback.jsx
// This component handles the redirect from Google's OAuth flow and initiates the
// token exchange with the Supabase backend.

// src/pages/GoogleFitCallback.jsx
// This component now logs critical variables before making the fetch call.

// import React, { useEffect, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { useSession } from '@supabase/auth-helpers-react';
// import { supabase } from '../supabase';
// import { CircularProgress, Box, Typography } from '@mui/material';

// export default function GoogleFitCallback() {
//   const navigate = useNavigate();
//   const sessionFromHook = useSession();
//   const [error, setError] = useState(null);
//   const [hasExchangedCode, setHasExchangedCode] = useState(false);

//   useEffect(() => {
//     const runExchange = async () => {
//       try {
//         if (!sessionFromHook?.user || hasExchangedCode) {
//           console.log('Frontend Check: Session or user is missing, or code already exchanged. Aborting.');
//           return;
//         }

//         console.log('Frontend Check: Supabase session is available.');

//         const { data: { session }, error: sessionError } = await supabase.auth.getSession();
//         if (sessionError || !session) {
//           console.error('Frontend Error: No valid Supabase session found. Error:', sessionError);
//           throw new Error('No valid Supabase session found.');
//         }

//         console.log('Frontend Check: Fetched latest Supabase session successfully.');

//         const code = new URLSearchParams(window.location.search).get('code');
//         if (!code) {
//           console.error('Frontend Error: Missing authorization code in URL.');
//           throw new Error('Missing authorization code.');
//         }
        
//         const siteUrl = import.meta.env.VITE_SITE_URL;
//         const redirectUri = `${siteUrl}/googlefit-callback`;

//         // Log the variables before making the fetch call.
//         console.log('--- Data to be sent to Supabase Function ---');
//         console.log('Redirect URI:', redirectUri);
//         console.log('Authorization Code:', code);
//         console.log('User ID:', session.user.id);
//         console.log('Supabase Access Token (first 10 chars):', session.access_token.substring(0, 10) + '...');
//         console.log('-------------------------------------------');

//         setHasExchangedCode(true);

//         const res = await fetch(
//           'https://xzpyaylnaakhtfqshhmv.supabase.co/functions/v1/exchangeGoogleFitCode',
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
//         console.log('Frontend Response: Exchange response JSON:', result);

//         if (!res.ok) {
//           console.error('Frontend Error: Token exchange failed with status', res.status);
//           throw new Error(result?.error || `Token exchange failed with status ${res.status}.`);
//         }

//         console.log('✅ Google Fit tokens saved:', result);
//         navigate('/dashboard');
//       } catch (err) {
//         console.error('❌ Exchange failed:', err);
//         setError(err.message || 'Something went wrong.');
//       }
//     };

//     runExchange();
//   }, [sessionFromHook, navigate, hasExchangedCode]);

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
// src/pages/GoogleFitCallback.jsx
// This component now waits for the Supabase session to be fully authenticated
// before attempting the token exchange.

// GoogleFitCallback.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import { CircularProgress, Box, Typography } from '@mui/material';

export default function GoogleFitCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [hasExchangedCode, setHasExchangedCode] = useState(false);

  useEffect(() => {
    const runExchange = async () => {
      try {
        // 1️⃣ Get authorization code from URL
        const code = new URLSearchParams(window.location.search).get('code');
        if (!code) {
          console.error('❌ Missing authorization code in URL');
          setError('Missing authorization code.');
          return;
        }

        // 2️⃣ Ensure Supabase session exists (user must be logged in already)
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !session) {
          console.error('❌ No valid Supabase session found:', sessionError);
          setError('No valid Supabase session. Please log in again.');
          return;
        }

        if (hasExchangedCode) return;

        const siteUrl = import.meta.env.VITE_SITE_URL;
        const redirectUri = `${siteUrl}/googlefit-callback`;

        console.log('--- Exchanging Google Fit Code ---');
        console.log('Redirect URI:', redirectUri);
        console.log('Authorization Code:', code);
        console.log('User ID:', session.user.id);
        console.log('Supabase Access Token (first 10 chars):', session.access_token.substring(0, 10) + '...');
        console.log('----------------------------------');

        setHasExchangedCode(true);

        // 3️⃣ Call Supabase Edge Function to exchange code → tokens
        const res = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/exchangeGoogleFitCode`,
          {
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
          }
        );

        const result = await res.json();
        console.log('✅ Exchange response:', result);

        if (!res.ok) {
          throw new Error(result?.error || `Token exchange failed with status ${res.status}`);
        }

        // 4️⃣ Success → navigate to dashboard
        navigate('/dashboard');
      } catch (err) {
        console.error('❌ Exchange failed:', err);
        setError(err.message || 'Something went wrong.');
      }
    };

    runExchange();
  }, [navigate, hasExchangedCode]);

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
