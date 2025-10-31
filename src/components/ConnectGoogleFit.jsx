// // src/components/ConnectGoogleFit.jsx
// import React from 'react';

// const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
// const SITE_URL = import.meta.env.VITE_SITE_URL;
// const REDIRECT_URI = `${SITE_URL}/googlefit-callback`; 

// const SCOPES = [
//   'https://www.googleapis.com/auth/fitness.activity.read',
//   'https://www.googleapis.com/auth/userinfo.email',
// ].join(' ');

// export default function ConnectGoogleFit() {
//   const handleConnect = () => {
//     const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=${encodeURIComponent(SCOPES)}&access_type=offline&prompt=consent`;
//     window.location.href = authUrl;
//   };

//   return (
//     <button onClick={handleConnect}>
//       Connect Google Fit
//     </button>
//   );
// }
import React from 'react';

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const SITE_URL =
  import.meta.env.VITE_SITE_URL || (typeof window !== 'undefined' ? window.location.origin : '');
const REDIRECT_URI = `${SITE_URL}/googlefit-callback`;

const SCOPES = [
  'https://www.googleapis.com/auth/fitness.activity.read',
  'https://www.googleapis.com/auth/fitness.location.read',
  'https://www.googleapis.com/auth/userinfo.email',
].join(' ');

export default function ConnectGoogleFit() {
  const handleConnect = () => {
    // CSRF state (per-tab)
    const state = Math.random().toString(36).slice(2);
    sessionStorage.setItem('gf_oauth_state_v1', state);

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: CLIENT_ID,
      redirect_uri: REDIRECT_URI,
      scope: SCOPES,
      access_type: 'offline',
      prompt: 'consent',
      include_granted_scopes: 'true',
      state,
    });

    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  };

  return <button onClick={handleConnect}>Connect Google Fit</button>;
}
