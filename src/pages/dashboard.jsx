// import React, { useEffect, useState, useCallback, useContext } from 'react';
// import {
//   Typography,
//   Box,
//   Grid,
//   Button,
//   CircularProgress,
//   Alert,
// } from '@mui/material';
// import { useNavigate } from 'react-router-dom';
// import ManualEntryForm from '../components/ManualEntryForm';
// import HealthCurveChart from '../components/HealthCurveChart';
// import { supabase } from '../supabase';
// import { fetchStravaSteps } from '../utils/stravaFetchSteps';
// import { fetchGoogleFitSteps as fetchGoogleFitStepsUtil } from '../utils/googleFitSteps.js';
// import { logoutFromGoogleFit } from '../utils/googleFitUtils.js';
// import { AuthContext } from '../AuthContext';
// import { useHealthLogs } from '../hooks/useHealthLogs';

// export default function Dashboard() {
//   const { user, profile, loading: authLoading } = useContext(AuthContext);

//   const [manualMetrics, setManualMetrics] = useState(null);
//   const [stepsToday, setStepsToday] = useState(0);
//   const [stepsLoading, setStepsLoading] = useState(false);
//   const [stepsError, setStepsError] = useState(null);
//   const [isStravaConnected, setIsStravaConnected] = useState(false);
//   const [isGoogleFitConnected, setIsGoogleFitConnected] = useState(false);
//   const [needsGoogleReconnect, setNeedsGoogleReconnect] = useState(false);
//   const [lastSynced, setLastSynced] = useState(null);
//   const [stepsSource, setStepsSource] = useState('manual');

//   const { logs, loading: healthLogsLoading } = useHealthLogs(user?.id);
//   const navigate = useNavigate();

//   const handleGoogleFitReconnect = useCallback(async () => {
//     setStepsLoading(true);
//     setStepsError(null);
//     try {
//       // Clean server-side token row so Google re-issues refresh_token reliably
//       await logoutFromGoogleFit(user.id);
//       setIsGoogleFitConnected(false);
//       setNeedsGoogleReconnect(false);
//       setStepsSource('manual');
//       setLastSynced(null);

//       const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
//       const redirectUri = import.meta.env.VITE_GOOGLE_REDIRECT_URI; // must be .../googlefit-callback
//       const scope =
//         'https://www.googleapis.com/auth/fitness.activity.read https://www.googleapis.com/auth/userinfo.profile';
//       window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&access_type=offline&prompt=consent`;
//     } catch (e) {
//       console.error('Google Fit reconnect failed:', e);
//       setStepsError('Failed to reconnect. Please try again.');
//     } finally {
//       setStepsLoading(false);
//     }
//   }, [user]);

//   const handleGoogleFitSync = useCallback(async () => {
//     setStepsLoading(true);
//     setStepsError(null);
//     try {
//       if (!user) {
//         setStepsError('User not authenticated for Google Fit sync.');
//         setStepsLoading(false);
//         return;
//       }

//       const { steps, lastSync } = await fetchGoogleFitStepsUtil(user.id);
//       const todayISO = new Date().toISOString().slice(0, 10);

//       setStepsToday(steps);
//       setStepsSource('googlefit');
//       setLastSynced(lastSync);

//       await supabase
//         .from('user_info')
//         .update({
//           steps_source: 'googlefit',
//           googlefit_last_synced: lastSync,
//           steps: steps,
//         })
//         .eq('id', user.id);

//       const { error: upsertError } = await supabase
//         .from('manual_metrics')
//         .upsert(
//           { user_id: user.id, date: todayISO, steps },
//           { onConflict: 'user_id,date' }
//         );

//       if (upsertError) {
//         console.error('Error upserting Google Fit steps to manual_metrics:', upsertError.message);
//         setStepsError(upsertError.message);
//       } else {
//         console.log('✅ Google Fit sync successful and steps saved to manual_metrics. Steps:', steps);
//       }
//     } catch (e) {
//       console.error('Google Fit sync failed:', e);
//       // Self-heal path from edge function
//       if (e?.code === 'RECONNECT_REQUIRED') {
//         setNeedsGoogleReconnect(true);
//         setIsGoogleFitConnected(false);
//         setStepsError('Google Fit connection expired. Please reconnect.');
//       } else {
//         setStepsError(e.message || 'Failed to sync Google Fit steps.');
//       }
//       setStepsToday(0);
//     } finally {
//       setStepsLoading(false);
//     }
//   }, [supabase, user]);

//   const handleStravaSync = useCallback(async () => {
//     setStepsLoading(true);
//     setStepsError(null);
//     try {
//       if (!user) {
//         setStepsError('User not authenticated for Strava sync.');
//         setStepsLoading(false);
//         return;
//       }

//       const stepsArray = await fetchStravaSteps(user.id);
//       const todayISO = new Date().toISOString().slice(0, 10);
//       const todayEntry = stepsArray.find((s) => s.date === todayISO);
//       const steps = todayEntry ? todayEntry.steps : 0;

//       setStepsToday(steps);
//       setStepsSource('strava');
//       const now = new Date().toISOString();
//       setLastSynced(now);

//       await supabase
//         .from('user_info')
//         .update({
//           steps_source: 'strava',
//           strava_last_synced: now,
//           steps,
//         })
//         .eq('id', user.id);

//       const { error: upsertError } = await supabase
//         .from('manual_metrics')
//         .upsert(
//           { user_id: user.id, date: todayISO, steps },
//           { onConflict: 'user_id,date' }
//         );

//       if (upsertError) {
//         console.error('Error upserting Strava steps to manual_metrics:', upsertError.message);
//         setStepsError(upsertError.message);
//       } else {
//         console.log('✅ Strava sync successful and steps saved to manual_metrics. Steps:', steps);
//       }
//     } catch (e) {
//       console.error('Strava sync failed:', e);
//       setStepsError(e.message || 'Failed to sync Strava steps.');
//       setStepsToday(0);
//     } finally {
//       setStepsLoading(false);
//     }
//   }, [supabase, user]);

//   const fetchManualMetrics = useCallback(async () => {
//     if (!user) return;
//     const { data: metric, error: metricsError } = await supabase
//       .from('manual_metrics')
//       .select('*')
//       .eq('user_id', user.id)
//       .order('date', { ascending: false })
//       .limit(1)
//       .single();
//     if (metricsError && metricsError.code !== 'PGRST116') {
//       console.error('Dashboard: Error fetching manual metrics:', metricsError);
//       setManualMetrics(null);
//     } else {
//       setManualMetrics(metric);
//     }
//   }, [user, supabase]);

//   useEffect(() => {
//     const loadDashboardData = async () => {
//       if (authLoading) return;
//       if (!user) {
//         console.warn('🚨 Dashboard: No user session, AuthContext should redirect.');
//         return;
//       }

//       if (profile) {
//         setStepsToday(profile.steps || 0);
//         setLastSynced(profile.strava_last_synced || profile.googlefit_last_synced || null);
//         setStepsSource(profile.steps_source || 'manual');
//       } else {
//         const { data: profileRow, error: profileError } = await supabase
//           .from('user_info')
//           .select('*')
//           .eq('id', user.id)
//           .maybeSingle();
//         if (profileRow) {
//           setStepsToday(profileRow.steps || 0);
//           setLastSynced(profileRow.strava_last_synced || profileRow.googlefit_last_synced || null);
//           setStepsSource(profileRow.steps_source || 'manual');
//         } else if (profileError) {
//           console.error('Error fetching profile in Dashboard fallback:', profileError);
//         }
//       }

//       await fetchManualMetrics();

//       const { data: stravaToken, error: stravaTokenError } = await supabase
//         .from('strava_tokens')
//         .select('access_token')
//         .eq('user_id', user.id)
//         .maybeSingle();
//       if (stravaTokenError) console.error('Dashboard: Error fetching Strava token:', stravaTokenError);
//       setIsStravaConnected(!!stravaToken?.access_token);

//       // ✅ Connected if (and only if) we have a refresh_token
//       const { data: fitToken, error: fitTokenError } = await supabase
//         .from('google_fit_tokens')
//         .select('refresh_token')
//         .eq('user_id', user.id)
//         .maybeSingle();
//       if (fitTokenError) console.error('Dashboard: Error fetching Google Fit token:', fitTokenError);
//       setIsGoogleFitConnected(!!fitToken?.refresh_token);
//       setNeedsGoogleReconnect(!fitToken?.refresh_token ? false : needsGoogleReconnect);
//     };

//     loadDashboardData();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [authLoading, user, profile, supabase, fetchManualMetrics]);

//   useEffect(() => {
//     if (!user) return;
//     const manualMetricsSubscription = supabase
//       .channel(`manual_metrics_channel_${user.id}`)
//       .on(
//         'postgres_changes',
//         { event: '*', schema: 'public', table: 'manual_metrics', filter: `user_id=eq.${user.id}` },
//         (payload) => {
//           if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
//             setManualMetrics(payload.new);
//           } else if (payload.eventType === 'DELETE') {
//             fetchManualMetrics();
//           }
//         }
//       )
//       .subscribe();

//     return () => {
//       supabase.removeChannel(manualMetricsSubscription);
//     };
//   }, [user, supabase, fetchManualMetrics]);

//   useEffect(() => {
//     if (profile && !stepsLoading) {
//       if (isGoogleFitConnected && stepsSource === 'googlefit' && (profile.googlefit_last_synced === null || stepsToday === 0)) {
//         handleGoogleFitSync();
//       } else if (isStravaConnected && stepsSource === 'strava' && (profile.strava_last_synced === null || stepsToday === 0)) {
//         handleStravaSync();
//       }
//     }
//   }, [profile, isGoogleFitConnected, isStravaConnected, stepsSource, handleGoogleFitSync, handleStravaSync, stepsLoading, stepsToday]);

//   const handleStravaConnect = () => {
//     const clientId = import.meta.env.VITE_STRAVA_CLIENT_ID;
//     const redirectUri = import.meta.env.VITE_STRAVA_REDIRECT_URI;
//     window.location.href = `https://www.strava.com/oauth/authorize?client_id=${clientId}&response_type=code&redirect_uri=${redirectUri}&scope=activity:read_all`;
//   };

//   const handleGoogleFitConnect = () => {
//     const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
//     const redirectUri = import.meta.env.VITE_GOOGLE_REDIRECT_URI;
//     const scope =
//       'https://www.googleapis.com/auth/fitness.activity.read https://www.googleapis.com/auth/userinfo.profile';
//     window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&access_type=offline&prompt=consent`;
//   };

//   const handleGoogleFitLogout = async () => {
//     setStepsLoading(true);
//     setStepsError(null);
//     try {
//       await logoutFromGoogleFit(user.id);
//       setIsGoogleFitConnected(false);
//       setNeedsGoogleReconnect(false);
//       setStepsSource('manual');
//       setLastSynced(null);
//       // Optional: don’t nuke Auth here; just disconnect Google Fit
//       // await supabase.auth.signOut();
//       // navigate('/');
//     } catch (e) {
//       console.error('Google Fit logout failed:', e);
//       setStepsError('Failed to logout from Google Fit. Please try again.');
//     } finally {
//       setStepsLoading(false);
//     }
//   };

//   const metricCards = [
//     {
//       label: 'Steps Today',
//       value: stepsLoading ? 'Loading...' : stepsToday,
//       loading: stepsLoading,
//       connected: isStravaConnected || isGoogleFitConnected,
//       meta:
//         (isStravaConnected && isGoogleFitConnected)
//           ? '✅ STRAVA + GOOGLE FIT'
//           : (isStravaConnected ? '✅ STRAVA' : (isGoogleFitConnected ? '✅ GOOGLE FIT' : 'No data source connected')),
//       lastSyncDisplay: lastSynced ? new Date(lastSynced).toLocaleString() : 'Never',
//       actions: [
//         (needsGoogleReconnect && {
//           label: 'Reconnect Google Fit',
//           onClick: handleGoogleFitReconnect,
//           variant: 'contained',
//         }),
//         (isGoogleFitConnected && {
//           label: 'Logout Google Fit',
//           onClick: handleGoogleFitLogout,
//         }),
//         (isGoogleFitConnected && !needsGoogleReconnect && {
//           label: '🔄 Sync Google Fit',
//           onClick: handleGoogleFitSync,
//           disabled: stepsLoading || (stepsSource !== 'googlefit' && (isStravaConnected && stepsSource === 'strava')),
//         }),
//         (!isStravaConnected && {
//           label: 'Connect Strava',
//           onClick: handleStravaConnect,
//         }),
//         (!isGoogleFitConnected && !needsGoogleReconnect && {
//           label: 'Connect Google Fit',
//           onClick: handleGoogleFitConnect,
//         }),
//         (isStravaConnected && {
//           label: '🔄 Sync Strava',
//           onClick: handleStravaSync,
//           disabled: stepsLoading || (stepsSource !== 'strava' && (isGoogleFitConnected && stepsSource === 'strava')),
//         }),
//       ].filter(Boolean),
//       error: stepsError,
//     },
//     {
//       label: 'Blood Pressure',
//       value:
//         manualMetrics?.bp_systolic && manualMetrics?.bp_diastolic
//           ? `${manualMetrics.bp_systolic}/${manualMetrics.bp_diastolic} mmHg`
//           : '—',
//     },
//     {
//       label: 'Glucose',
//       value: manualMetrics?.glucose ? `${manualMetrics.glucose} mg/dL` : '—',
//     },
//     {
//       label: 'Heart Rate',
//       value: manualMetrics?.heart_rate ? `${manualMetrics.heart_rate} bpm` : '—',
//     },
//   ];

//   if (authLoading) {
//     return (
//       <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
//         <CircularProgress />
//         <Typography variant="h6" sx={{ ml: 2 }}>Loading dashboard...</Typography>
//       </Box>
//     );
//   }

//   const isProfileIncomplete = user && (!profile || !profile.is_profile_complete);

//   return (
//     <Box
//       sx={{
//         position: 'relative',
//         minHeight: '100vh',
//         bgcolor: '#f0f2f5',
//         overflow: 'hidden',
//         '&::before': {
//           content: '""',
//           position: 'absolute',
//           top: 0,
//           left: 0,
//           width: '100%',
//           height: '100%',
//           backgroundImage:
//             'radial-gradient(circle at 10% 20%, rgba(204, 219, 238, 0.7) 0%, rgba(204, 219, 238, 0.1) 80%), radial-gradient(circle at 90% 80%, rgba(204, 219, 238, 0.5) 0%, rgba(204, 219, 238, 0.1) 80%)',
//           backdropFilter: 'blur(10px)',
//           WebkitBackdropFilter: 'blur(10px)',
//           zIndex: -1,
//         },
//       }}
//     >
//       <Box sx={{ p: 3 }}>
//         <Typography variant="h5" fontWeight={600} gutterBottom>
//           Welcome back, {profile?.full_name || 'User'}!
//         </Typography>

//         {isProfileIncomplete && (
//           <Alert
//             severity="warning"
//             action={
//               <Button color="inherit" size="small" onClick={() => navigate('/profile-setup')}>
//                 Complete Profile
//               </Button>
//             }
//             sx={{ mb: 3 }}
//           >
//             Your profile is incomplete. Please complete it to unlock all features and ensure accurate tracking.
//           </Alert>
//         )}

//         <Grid container spacing={3}>
//           <Grid item xs={12}>
//             <Grid container spacing={2}>
//               {metricCards.map((m) => (
//                 <Grid item xs={12} sm={6} md={4} lg={3} key={m.label}>
//                   <Box
//                     sx={{
//                       bgcolor: 'background.paper',
//                       p: 2.5,
//                       borderRadius: 3,
//                       boxShadow: 1,
//                       height: '100%',
//                       display: 'flex',
//                       flexDirection: 'column',
//                       justifyContent: 'space-between',
//                     }}
//                   >
//                     <Typography variant="subtitle2" color="text.secondary" gutterBottom>
//                       {m.label}
//                     </Typography>

//                     {m.loading ? (
//                       <CircularProgress size={20} />
//                     ) : (
//                       <Typography variant="h6" fontWeight={600}>
//                         {m.value}
//                       </Typography>
//                     )}

//                     {m.meta && (
//                       <Typography variant="caption" sx={{ color: 'success.main', mt: 0.5 }}>
//                         {m.meta} {m.lastSyncDisplay && `| Last synced: ${m.lastSyncDisplay}`}
//                       </Typography>
//                     )}

//                     {m.error && (
//                       <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
//                         Error: {m.error}
//                       </Typography>
//                     )}

//                     {m.actions?.map((a, idx) => (
//                       <Box mt={1} key={idx}>
//                         <Button
//                           variant={a.variant || 'outlined'}
//                           size="small"
//                           onClick={a.onClick}
//                           fullWidth
//                           disabled={a.disabled}
//                         >
//                           {a.label}
//                         </Button>
//                       </Box>
//                     ))}
//                   </Box>
//                 </Grid>
//               ))}
//             </Grid>
//           </Grid>
//         </Grid>

//         <Box mt={5}>
//           <ManualEntryForm />
//         </Box>

//         <Box mt={6}>
//           <HealthCurveChart logs={logs} loading={healthLogsLoading} />
//         </Box>
//       </Box>
//     </Box>
//   );
// }

import React, { useEffect, useState, useCallback, useContext } from 'react';
import {
  Typography,
  Box,
  Grid,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ManualEntryForm from '../components/ManualEntryForm';
import HealthCurveChart from '../components/HealthCurveChart';
import { supabase } from '../supabase';
import { fetchStravaSteps } from '../utils/stravaFetchSteps';
import { fetchGoogleFitSteps as fetchGoogleFitStepsUtil } from '../utils/googleFitSteps.js';
import { logoutFromGoogleFit } from '../utils/googleFitUtils.js';
import { AuthContext } from '../AuthContext';
import { useHealthLogs } from '../hooks/useHealthLogs';

export default function Dashboard() {
  const { user, profile, loading: authLoading } = useContext(AuthContext);

  const [manualMetrics, setManualMetrics] = useState(null);
  const [stepsToday, setStepsToday] = useState(0);
  const [stepsLoading, setStepsLoading] = useState(false);
  const [stepsError, setStepsError] = useState(null);
  const [isStravaConnected, setIsStravaConnected] = useState(false);
  const [isGoogleFitConnected, setIsGoogleFitConnected] = useState(false);
  const [needsGoogleReconnect, setNeedsGoogleReconnect] = useState(false);
  const [lastSynced, setLastSynced] = useState(null);
  const [stepsSource, setStepsSource] = useState('manual');

  const { logs, loading: healthLogsLoading } = useHealthLogs(user?.id);
  const navigate = useNavigate();

  // ===== Google Fit OAuth (unified) =====
  const GF_SCOPES = [
    'https://www.googleapis.com/auth/fitness.activity.read',
    'https://www.googleapis.com/auth/fitness.location.read',
    'https://www.googleapis.com/auth/userinfo.email',
  ].join(' ');

  const startGoogleFitOAuth = useCallback(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) {
      alert('VITE_GOOGLE_CLIENT_ID is missing');
      console.error('❌ VITE_GOOGLE_CLIENT_ID is missing');
      return;
    }

    // Build redirect from runtime origin so it matches the page that stored state
    const redirectUri = `${window.location.origin}/googlefit-callback`;

    // Secure URL-safe state
    const bytes = crypto.getRandomValues(new Uint8Array(32));
    const state = btoa(String.fromCharCode(...bytes))
      .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/,'');

    // Persist for callback (must match there)
    localStorage.setItem('googlefit_oauth_state', state);

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: clientId,
      redirect_uri: redirectUri,
      scope: GF_SCOPES,
      access_type: 'offline',
      prompt: 'consent',
      include_granted_scopes: 'true',
      state,
      // tracer to confirm this is OUR launcher
      xsrc: 'gf-dashboard-v1',
    });

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;

    console.group('🔎 GF Launch from Dashboard');
    console.log('CLIENT_ID:', clientId);
    console.log('ORIGIN:', window.location.origin);
    console.log('redirectUri:', redirectUri);
    console.log('STATE (saved):', state);
    console.log('SCOPES:', GF_SCOPES);
    console.log('AUTH URL:', authUrl);
    console.groupEnd();

    window.location.href = authUrl;
  }, []);

  const handleGoogleFitReconnect = useCallback(async () => {
    setStepsLoading(true);
    setStepsError(null);
    try {
      // Clean server-side token row so Google re-issues refresh_token reliably
      await logoutFromGoogleFit(user.id);
      setIsGoogleFitConnected(false);
      setNeedsGoogleReconnect(false);
      setStepsSource('manual');
      setLastSynced(null);

      // Launch the SAME OAuth flow (now with state + correct scopes)
      startGoogleFitOAuth();
    } catch (e) {
      console.error('Google Fit reconnect failed:', e);
      setStepsError('Failed to reconnect. Please try again.');
    } finally {
      setStepsLoading(false);
    }
  }, [user, startGoogleFitOAuth]);

  const handleGoogleFitConnect = useCallback(() => {
    startGoogleFitOAuth();
  }, [startGoogleFitOAuth]);

  // ===== Sync handlers =====
  const handleGoogleFitSync = useCallback(async () => {
    setStepsLoading(true);
    setStepsError(null);
    try {
      if (!user) {
        setStepsError('User not authenticated for Google Fit sync.');
        setStepsLoading(false);
        return;
      }

      const { steps, lastSync } = await fetchGoogleFitStepsUtil(user.id);
      const todayISO = new Date().toISOString().slice(0, 10);

      setStepsToday(steps);
      setStepsSource('googlefit');
      setLastSynced(lastSync);

      await supabase
        .from('user_info')
        .update({
          steps_source: 'googlefit',
          googlefit_last_synced: lastSync,
          steps: steps,
        })
        .eq('id', user.id);

      const { error: upsertError } = await supabase
        .from('manual_metrics')
        .upsert(
          { user_id: user.id, date: todayISO, steps },
          { onConflict: 'user_id,date' }
        );

      if (upsertError) {
        console.error('Error upserting Google Fit steps to manual_metrics:', upsertError.message);
        setStepsError(upsertError.message);
      } else {
        console.log('✅ Google Fit sync successful and steps saved to manual_metrics. Steps:', steps);
      }
    } catch (e) {
      console.error('Google Fit sync failed:', e);
      if (e?.code === 'RECONNECT_REQUIRED') {
        setNeedsGoogleReconnect(true);
        setIsGoogleFitConnected(false);
        setStepsError('Google Fit connection expired. Please reconnect.');
      } else {
        setStepsError(e.message || 'Failed to sync Google Fit steps.');
      }
      setStepsToday(0);
    } finally {
      setStepsLoading(false);
    }
  }, [supabase, user]);

  const handleStravaSync = useCallback(async () => {
    setStepsLoading(true);
    setStepsError(null);
    try {
      if (!user) {
        setStepsError('User not authenticated for Strava sync.');
        setStepsLoading(false);
        return;
      }

      const stepsArray = await fetchStravaSteps(user.id);
      const todayISO = new Date().toISOString().slice(0, 10);
      const todayEntry = stepsArray.find((s) => s.date === todayISO);
      const steps = todayEntry ? todayEntry.steps : 0;

      setStepsToday(steps);
      setStepsSource('strava');
      const now = new Date().toISOString();
      setLastSynced(now);

      await supabase
        .from('user_info')
        .update({
          steps_source: 'strava',
          strava_last_synced: now,
          steps,
        })
        .eq('id', user.id);

      const { error: upsertError } = await supabase
        .from('manual_metrics')
        .upsert(
          { user_id: user.id, date: todayISO, steps },
          { onConflict: 'user_id,date' }
        );

      if (upsertError) {
        console.error('Error upserting Strava steps to manual_metrics:', upsertError.message);
        setStepsError(upsertError.message);
      } else {
        console.log('✅ Strava sync successful and steps saved to manual_metrics. Steps:', steps);
      }
    } catch (e) {
      console.error('Strava sync failed:', e);
      setStepsError(e.message || 'Failed to sync Strava steps.');
      setStepsToday(0);
    } finally {
      setStepsLoading(false);
    }
  }, [supabase, user]);

  // ===== Manual metrics fetch =====
  const fetchManualMetrics = useCallback(async () => {
    if (!user) return;
    const { data: metric, error: metricsError } = await supabase
      .from('manual_metrics')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .limit(1)
      .single();
    if (metricsError && metricsError.code !== 'PGRST116') {
      console.error('Dashboard: Error fetching manual metrics:', metricsError);
      setManualMetrics(null);
    } else {
      setManualMetrics(metric);
    }
  }, [user, supabase]);

  // ===== Initial load =====
  useEffect(() => {
    const loadDashboardData = async () => {
      if (authLoading) return;
      if (!user) {
        console.warn('🚨 Dashboard: No user session, AuthContext should redirect.');
        return;
      }

      if (profile) {
        setStepsToday(profile.steps || 0);
        setLastSynced(profile.strava_last_synced || profile.googlefit_last_synced || null);
        setStepsSource(profile.steps_source || 'manual');
      } else {
        const { data: profileRow, error: profileError } = await supabase
          .from('user_info')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();
        if (profileRow) {
          setStepsToday(profileRow.steps || 0);
          setLastSynced(profileRow.strava_last_synced || profileRow.googlefit_last_synced || null);
          setStepsSource(profileRow.steps_source || 'manual');
        } else if (profileError) {
          console.error('Error fetching profile in Dashboard fallback:', profileError);
        }
      }

      await fetchManualMetrics();

      const { data: stravaToken, error: stravaTokenError } = await supabase
        .from('strava_tokens')
        .select('access_token')
        .eq('user_id', user.id)
        .maybeSingle();
      if (stravaTokenError) console.error('Dashboard: Error fetching Strava token:', stravaTokenError);
      setIsStravaConnected(!!stravaToken?.access_token);

      // Connected if (and only if) we have a refresh_token
      const { data: fitToken, error: fitTokenError } = await supabase
        .from('google_fit_tokens')
        .select('refresh_token')
        .eq('user_id', user.id)
        .maybeSingle();
      if (fitTokenError) console.error('Dashboard: Error fetching Google Fit token:', fitTokenError);
      setIsGoogleFitConnected(!!fitToken?.refresh_token);
      setNeedsGoogleReconnect(!fitToken?.refresh_token ? false : needsGoogleReconnect);
    };

    loadDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, user, profile, supabase, fetchManualMetrics]);

  // live updates on manual_metrics
  useEffect(() => {
    if (!user) return;
    const manualMetricsSubscription = supabase
      .channel(`manual_metrics_channel_${user.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'manual_metrics', filter: `user_id=eq.${user.id}` },
        (payload) => {
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            setManualMetrics(payload.new);
          } else if (payload.eventType === 'DELETE') {
            fetchManualMetrics();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(manualMetricsSubscription);
    };
  }, [user, supabase, fetchManualMetrics]);

  // auto-sync based on profile flags
  useEffect(() => {
    if (profile && !stepsLoading) {
      if (isGoogleFitConnected && stepsSource === 'googlefit' && (profile.googlefit_last_synced === null || stepsToday === 0)) {
        handleGoogleFitSync();
      } else if (isStravaConnected && stepsSource === 'strava' && (profile.strava_last_synced === null || stepsToday === 0)) {
        handleStravaSync();
      }
    }
  }, [profile, isGoogleFitConnected, isStravaConnected, stepsSource, handleGoogleFitSync, handleStravaSync, stepsLoading, stepsToday]);

  const handleStravaConnect = () => {
    const clientId = import.meta.env.VITE_STRAVA_CLIENT_ID;
    const redirectUri = import.meta.env.VITE_STRAVA_REDIRECT_URI;
    window.location.href = `https://www.strava.com/oauth/authorize?client_id=${clientId}&response_type=code&redirect_uri=${redirectUri}&scope=activity:read_all`;
  };

  const handleGoogleFitLogout = async () => {
    setStepsLoading(true);
    setStepsError(null);
    try {
      await logoutFromGoogleFit(user.id);
      setIsGoogleFitConnected(false);
      setNeedsGoogleReconnect(false);
      setStepsSource('manual');
      setLastSynced(null);
    } catch (e) {
      console.error('Google Fit logout failed:', e);
      setStepsError('Failed to logout from Google Fit. Please try again.');
    } finally {
      setStepsLoading(false);
    }
  };

  const metricCards = [
    {
      label: 'Steps Today',
      value: stepsLoading ? 'Loading...' : stepsToday,
      loading: stepsLoading,
      connected: isStravaConnected || isGoogleFitConnected,
      meta:
        (isStravaConnected && isGoogleFitConnected)
          ? '✅ STRAVA + GOOGLE FIT'
          : (isStravaConnected ? '✅ STRAVA' : (isGoogleFitConnected ? '✅ GOOGLE FIT' : 'No data source connected')),
      lastSyncDisplay: lastSynced ? new Date(lastSynced).toLocaleString() : 'Never',
      actions: [
        (needsGoogleReconnect && {
          label: 'Reconnect Google Fit',
          onClick: handleGoogleFitReconnect,
          variant: 'contained',
        }),
        (isGoogleFitConnected && {
          label: 'Logout Google Fit',
          onClick: handleGoogleFitLogout,
        }),
        (isGoogleFitConnected && !needsGoogleReconnect && {
          label: '🔄 Sync Google Fit',
          onClick: handleGoogleFitSync,
          disabled: stepsLoading || (stepsSource !== 'googlefit' && (isStravaConnected && stepsSource === 'strava')),
        }),
        (!isStravaConnected && {
          label: 'Connect Strava',
          onClick: handleStravaConnect,
        }),
        (!isGoogleFitConnected && !needsGoogleReconnect && {
          label: 'Connect Google Fit',
          onClick: handleGoogleFitConnect,
        }),
        (isStravaConnected && {
          label: '🔄 Sync Strava',
          onClick: handleStravaSync,
          disabled: stepsLoading || (stepsSource !== 'strava' && (isGoogleFitConnected && stepsSource === 'strava')),
        }),
      ].filter(Boolean),
      error: stepsError,
    },
    {
      label: 'Blood Pressure',
      value:
        manualMetrics?.bp_systolic && manualMetrics?.bp_diastolic
          ? `${manualMetrics.bp_systolic}/${manualMetrics.bp_diastolic} mmHg`
          : '—',
    },
    {
      label: 'Glucose',
      value: manualMetrics?.glucose ? `${manualMetrics.glucose} mg/dL` : '—',
    },
    {
      label: 'Heart Rate',
      value: manualMetrics?.heart_rate ? `${manualMetrics.heart_rate} bpm` : '—',
    },
  ];

  if (authLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>Loading dashboard...</Typography>
      </Box>
    );
  }

  const isProfileIncomplete = user && (!profile || !profile.is_profile_complete);

  return (
    <Box
      sx={{
        position: 'relative',
        minHeight: '100vh',
        bgcolor: '#f0f2f5',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundImage:
            'radial-gradient(circle at 10% 20%, rgba(204, 219, 238, 0.7) 0%, rgba(204, 219, 238, 0.1) 80%), radial-gradient(circle at 90% 80%, rgba(204, 219, 238, 0.5) 0%, rgba(204, 219, 238, 0.1) 80%)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          zIndex: -1,
        },
      }}
    >
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" fontWeight={600} gutterBottom>
          Welcome back, {profile?.full_name || 'User'}!
        </Typography>

        {isProfileIncomplete && (
          <Alert
            severity="warning"
            action={
              <Button color="inherit" size="small" onClick={() => navigate('/profile-setup')}>
                Complete Profile
              </Button>
            }
            sx={{ mb: 3 }}
          >
            Your profile is incomplete. Please complete it to unlock all features and ensure accurate tracking.
          </Alert>
        )}

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Grid container spacing={2}>
              {metricCards.map((m) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={m.label}>
                  <Box
                    sx={{
                      bgcolor: 'background.paper',
                      p: 2.5,
                      borderRadius: 3,
                      boxShadow: 1,
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      {m.label}
                    </Typography>

                    {m.loading ? (
                      <CircularProgress size={20} />
                    ) : (
                      <Typography variant="h6" fontWeight={600}>
                        {m.value}
                      </Typography>
                    )}

                    {m.meta && (
                      <Typography variant="caption" sx={{ color: 'success.main', mt: 0.5 }}>
                        {m.meta} {m.lastSyncDisplay && `| Last synced: ${m.lastSyncDisplay}`}
                      </Typography>
                    )}

                    {m.error && (
                      <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                        Error: {m.error}
                      </Typography>
                    )}

                    {m.actions?.map((a, idx) => (
                      <Box mt={1} key={idx}>
                        <Button
                          variant={a.variant || 'outlined'}
                          size="small"
                          onClick={a.onClick}
                          fullWidth
                          disabled={a.disabled}
                        >
                          {a.label}
                        </Button>
                      </Box>
                    ))}
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>

        <Box mt={5}>
          <ManualEntryForm />
        </Box>

        <Box mt={6}>
          <HealthCurveChart logs={logs} loading={healthLogsLoading} />
        </Box>
      </Box>
    </Box>
  );
}
