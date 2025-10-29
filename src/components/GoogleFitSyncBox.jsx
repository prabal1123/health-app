// // src/components/GoogleFitSyncBox.jsx
// import React, { useEffect, useState } from 'react';
// import { Box, Typography, Button, CircularProgress } from '@mui/material';
// import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
// import { supabase } from '../supabase';

// export default function GoogleFitSyncBox({ user, onSync, stepsToday, lastSynced, stepsSource, stepsLoading, stepsError }) {
//   const [isConnected, setIsConnected] = useState(false);

//   useEffect(() => {
//     const checkConnection = async () => {
//       const { data, error } = await supabase
//         .from('google_fit_tokens')
//         .select('*')
//         .eq('user_id', user.id)
//         .single();
//       if (data && !error) {
//         setIsConnected(true);
//       }
//     };
//     if (user?.id) checkConnection();
//   }, [user]);

//   const handleGoogleFitConnect = () => {
//     const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
//     const redirectUri = `${window.location.origin}/googlefit-callback`;
//     const scope = [
//       'https://www.googleapis.com/auth/fitness.activity.read',
//       'https://www.googleapis.com/auth/fitness.location.read'
//     ].join(' ');

//     const authUrl =
//       `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&` +
//       `client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&access_type=offline` +
//       `&prompt=consent`;

//     window.location.href = authUrl;
//   };

//   return (
//     <Box
//       sx={{
//         border: '1px solid #ddd',
//         borderRadius: 4,
//         p: 2,
//         boxShadow: 2,
//         minWidth: 220,
//         textAlign: 'center',
//         bgcolor: '#fff'
//       }}
//     >
//       <Typography variant="h6">Steps Today</Typography>
//       <Typography variant="h4" sx={{ mb: 1 }}>
//         {stepsLoading ? 'Loading...' : (stepsToday ?? '—')}
//       </Typography>

//       {stepsLoading && <CircularProgress size={20} />}

//       {!stepsLoading && isConnected && (
//         <Typography
//           variant="body2"
//           color="success.main"
//           sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1 }}
//         >
//           <CheckCircleOutlineIcon fontSize="small" /> Connected via Google Fit
//         </Typography>
//       )}

//       {stepsError && (
//         <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
//           Error: {stepsError}
//         </Typography>
//       )}

//       {!stepsLoading && !isConnected && (
//         <Button variant="outlined" onClick={handleGoogleFitConnect} sx={{ mt: 1 }}>
//           CONNECT GOOGLE FIT
//         </Button>
//       )}

//       <Button
//         variant="contained"
//         onClick={onSync}
//         sx={{ mt: 2 }}
//         disabled={stepsLoading || !isConnected}
//       >
//         SYNC NOW
//       </Button>
//     </Box>
//   );
// }

import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, CircularProgress } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { supabase } from '../supabase';

export default function GoogleFitSyncBox({ 
    user, 
    onSync, 
    onLogout, 
    stepsToday, 
    lastSynced, 
    stepsSource, 
    stepsLoading, 
    stepsError 
}) {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const checkConnection = async () => {
      if (!user?.id) return;
      
      const { data, error } = await supabase
        .from('google_fit_tokens')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (data && !error) {
        setIsConnected(true);
      } else {
        setIsConnected(false);
      }
    };
    checkConnection();
  }, [user]);

  const handleGoogleFitConnect = () => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    const siteUrl = import.meta.env.VITE_SITE_URL; // ✅ NEW: Use dynamic SITE_URL
    const redirectUri = `${siteUrl}/googlefit-callback`;
    const scope = [
      'https://www.googleapis.com/auth/fitness.activity.read',
      'https://www.googleapis.com/auth/fitness.location.read'
    ].join(' ');

    const authUrl =
      `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&` +
      `client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&access_type=offline` +
      `&prompt=consent`;

    window.location.href = authUrl;
  };

  return (
    <Box
      sx={{
        border: '1px solid #ddd',
        borderRadius: 4,
        p: 2,
        boxShadow: 2,
        minWidth: 220,
        textAlign: 'center',
        bgcolor: '#fff'
      }}
    >
      <Typography variant="h6">Steps Today</Typography>
      <Typography variant="h4" sx={{ mb: 1 }}>
        {stepsLoading ? 'Loading...' : (stepsToday ?? '—')}
      </Typography>

      {stepsLoading && <CircularProgress size={20} />}

      {!stepsLoading && isConnected && (
        <Typography
          variant="body2"
          color="success.main"
          sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1 }}
        >
          <CheckCircleOutlineIcon fontSize="small" /> Connected via Google Fit
        </Typography>
      )}

      {stepsError && (
        <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
          Error: {stepsError}
        </Typography>
      )}

      {/* ✅ NEW LOGIC: Conditionally render buttons */}
      <Box sx={{ mt: 1 }}>
        {isConnected ? (
          <>
            <Button
              variant="contained"
              onClick={onSync}
              sx={{ mt: 1 }}
              disabled={stepsLoading}
            >
              SYNC NOW
            </Button>
            <Button
              variant="text"
              onClick={onLogout}
              sx={{ mt: 1, color: 'text.secondary' }}
            >
              Logout
            </Button>
          </>
        ) : (
          <Button variant="outlined" onClick={handleGoogleFitConnect}>
            CONNECT GOOGLE FIT
          </Button>
        )}
      </Box>
    </Box>
  );
}