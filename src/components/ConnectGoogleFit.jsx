// // src/components/ConnectGoogleFit.jsx
// import React from 'react'

// const CLIENT_ID = '336466095485-b8g4njok3knul6vs3grc787so7a5csnv.apps.googleusercontent.com'
// const REDIRECT_URI = 'http://localhost:5173/googlefit-callback'
// const SCOPES = [
//   'https://www.googleapis.com/auth/fitness.activity.read',
//   'https://www.googleapis.com/auth/userinfo.email',
// ].join(' ')

// export default function ConnectGoogleFit() {
//   const handleConnect = () => {
//     const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=${encodeURIComponent(SCOPES)}&access_type=offline&prompt=consent`
//     window.location.href = authUrl
//   }

//   return (
//     <button onClick={handleConnect}>
//       Connect Google Fit
//     </button>
//   )
// }


// src/components/ConnectGoogleFit.jsx
import React from 'react';

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const SITE_URL = import.meta.env.VITE_SITE_URL;
const REDIRECT_URI = `${SITE_URL}/googlefit-callback`; 

const SCOPES = [
  'https://www.googleapis.com/auth/fitness.activity.read',
  'https://www.googleapis.com/auth/userinfo.email',
].join(' ');

export default function ConnectGoogleFit() {
  const handleConnect = () => {
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=${encodeURIComponent(SCOPES)}&access_type=offline&prompt=consent`;
    window.location.href = authUrl;
  };

  return (
    <button onClick={handleConnect}>
      Connect Google Fit
    </button>
  );
}