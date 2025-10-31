// import React, { useEffect, useState } from 'react';
// import { Box, Typography, Button, CircularProgress } from '@mui/material';
// import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
// import { supabase } from '../supabase';

// export default function GoogleFitSyncBox({ 
//     user, 
//     onSync, 
//     onLogout, 
//     stepsToday, 
//     lastSynced, 
//     stepsSource, 
//     stepsLoading, 
//     stepsError 
// }) {
//   const [isConnected, setIsConnected] = useState(false);

//   useEffect(() => {
//     const checkConnection = async () => {
//       if (!user?.id) return;
      
//       const { data, error } = await supabase
//         .from('google_fit_tokens')
//         .select('*')
//         .eq('user_id', user.id)
//         .single();

//       if (data && !error) {
//         setIsConnected(true);
//       } else {
//         setIsConnected(false);
//       }
//     };
//     checkConnection();
//   }, [user]);

//   const handleGoogleFitConnect = () => {
//     const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
//     const siteUrl = import.meta.env.VITE_SITE_URL; // ✅ NEW: Use dynamic SITE_URL
//     const redirectUri = `${siteUrl}/googlefit-callback`;
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

//       {/* ✅ NEW LOGIC: Conditionally render buttons */}
//       <Box sx={{ mt: 1 }}>
//         {isConnected ? (
//           <>
//             <Button
//               variant="contained"
//               onClick={onSync}
//               sx={{ mt: 1 }}
//               disabled={stepsLoading}
//             >
//               SYNC NOW
//             </Button>
//             <Button
//               variant="text"
//               onClick={onLogout}
//               sx={{ mt: 1, color: 'text.secondary' }}
//             >
//               Logout
//             </Button>
//           </>
//         ) : (
//           <Button variant="outlined" onClick={handleGoogleFitConnect}>
//             CONNECT GOOGLE FIT
//           </Button>
//         )}
//       </Box>
//     </Box>
//   );
// }
import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, CircularProgress } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { supabase } from '../supabase';

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const SITE_URL = import.meta.env.VITE_SITE_URL || (typeof window !== 'undefined' ? window.location.origin : '');
const REDIRECT_URI = `${SITE_URL}/googlefit-callback`;
const SCOPES = [
  'https://www.googleapis.com/auth/fitness.activity.read',
  'https://www.googleapis.com/auth/fitness.location.read',
  'https://www.googleapis.com/auth/userinfo.email',
].join(' ');

export default function GoogleFitSyncBox({
  user,
  onSync,
  onLogout,
  stepsToday,
  lastSynced,
  stepsSource,
  stepsLoading,
  stepsError,
}) {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const checkConnection = async () => {
      if (!user?.id) return;
      const { data, error } = await supabase
        .from('google_fit_tokens')
        .select('user_id')
        .eq('user_id', user.id)
        .maybeSingle();
      setIsConnected(Boolean(data && !error));
    };
    checkConnection();
  }, [user?.id]);

  const handleGoogleFitConnect = () => {
    const state = Math.random().toString(36).slice(2);
    localStorage.setItem('googlefit_oauth_state', state);

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

  return (
    <Box sx={{ border: '1px solid #ddd', borderRadius: 4, p: 2, boxShadow: 2, minWidth: 220, textAlign: 'center', bgcolor: '#fff' }}>
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

      <Box sx={{ mt: 1 }}>
        {isConnected ? (
          <>
            <Button variant="contained" onClick={onSync} sx={{ mt: 1 }} disabled={stepsLoading}>
              SYNC NOW
            </Button>
            <Button variant="text" onClick={onLogout} sx={{ mt: 1, color: 'text.secondary' }}>
              Logout
            </Button>
          </>
        ) : (
          <Button variant="outlined" onClick={handleGoogleFitConnect}>
            CONNECT GOOGLE FIT
          </Button>
        )}
      </Box>

      {lastSynced && (
        <Typography variant="caption" sx={{ display: 'block', mt: 1 }}>
          Last synced: {new Date(lastSynced).toLocaleString()}
        </Typography>
      )}
      {stepsSource && (
        <Typography variant="caption" sx={{ display: 'block' }}>
          Source: {stepsSource}
        </Typography>
      )}
    </Box>
  );
}
