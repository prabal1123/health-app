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

// import React, { useState } from 'react';

// const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
// const SCOPES = [
//   'https://www.googleapis.com/auth/fitness.activity.read',
//   'https://www.googleapis.com/auth/fitness.location.read',
//   'https://www.googleapis.com/auth/userinfo.email',
// ].join(' ');

// export default function ConnectGoogleFit() {
//   const [busy, setBusy] = useState(false);

//   const handleConnect = () => {
//     if (busy) return;
//     setBusy(true);

//     // 1️⃣ Build redirect URI from runtime (always matches current origin)
//     const redirectUri = `${window.location.origin}/googlefit-callback`;

//     // 2️⃣ Generate a cryptographically secure state
//     const bytes = crypto.getRandomValues(new Uint8Array(32));
//     const state = btoa(String.fromCharCode(...bytes))
//       .replace(/\+/g, '-')
//       .replace(/\//g, '_')
//       .replace(/=+$/, '');

//     // 3️⃣ Save state to localStorage (same key used in callback)
//     localStorage.setItem('googlefit_oauth_state', state);

//     // 4️⃣ Build OAuth URL
//     const params = new URLSearchParams({
//       response_type: 'code',
//       client_id: CLIENT_ID,
//       redirect_uri: redirectUri,
//       scope: SCOPES,
//       access_type: 'offline',
//       prompt: 'consent',
//       include_granted_scopes: 'true',
//       state,
//     });

//     // 5️⃣ Redirect user to Google OAuth
//     window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
//   };

//   return (
//     <button
//       onClick={handleConnect}
//       disabled={busy}
//       style={{
//         background: busy ? '#ccc' : '#4285F4',
//         color: 'white',
//         padding: '10px 16px',
//         borderRadius: '8px',
//         border: 'none',
//         cursor: busy ? 'not-allowed' : 'pointer',
//       }}
//     >
//       {busy ? 'Redirecting...' : 'Connect Google Fit'}
//     </button>
//   );
// }
// src/components/ConnectGoogleFit.jsx
import React, { useState } from 'react';

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const SCOPES = [
  'https://www.googleapis.com/auth/fitness.activity.read',
  'https://www.googleapis.com/auth/fitness.location.read',
  'https://www.googleapis.com/auth/userinfo.email',
].join(' ');

export default function ConnectGoogleFit() {
  const [busy, setBusy] = useState(false);

  const handleConnect = () => {
    if (busy) return;
    setBusy(true);

    const redirectUri = `${window.location.origin}/googlefit-callback`;
    if (!CLIENT_ID) { alert('VITE_GOOGLE_CLIENT_ID missing'); setBusy(false); return; }

    const bytes = crypto.getRandomValues(new Uint8Array(32));
    const state = btoa(String.fromCharCode(...bytes)).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');

    localStorage.setItem('googlefit_oauth_state', state);

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: CLIENT_ID,
      redirect_uri: redirectUri,
      scope: SCOPES,
      access_type: 'offline',
      prompt: 'consent',
      include_granted_scopes: 'true',
      state,
      // tracer to prove this is OUR flow (Google will ignore unknown params,
      // but it will stay visible in the URL you’re redirected to):
      xsrc: 'gf-connect-v1'
    });

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;

    console.group('🔎 Google Fit OAuth Launch (ConnectGoogleFit.jsx)');
    console.trace('Launching GF OAuth from ConnectGoogleFit.jsx');
    console.log('CLIENT_ID:', CLIENT_ID);
    console.log('redirectUri:', redirectUri);
    console.log('STATE (saved):', state);
    console.log('SCOPES:', SCOPES);
    console.log('AUTH URL:', authUrl);
    console.groupEnd();

    window.location.href = authUrl;
  };

  return (
    <button onClick={handleConnect} disabled={busy}>
      {busy ? 'Redirecting…' : 'Connect Google Fit (GF v1)'}
    </button>
  );
}
