// // src/pages/Leaderboard.jsx
// import React, { useState, useEffect, useContext, useCallback } from 'react';
// import {
//   Box,
//   Typography,
//   CircularProgress,
//   Grid,
//   Button,
//   ButtonGroup,
//   Paper,
//   Avatar,
// } from '@mui/material';
// import { supabase } from '../supabase';
// import { AuthContext } from '../AuthContext';

// // We'll create these components later
// import LeaderboardChart from '../components/LeaderboardChart';
// import SideNav from '../components/SideNav';
// import { appTheme } from '../theme';
// import { ThemeProvider, CssBaseline } from '@mui/material';

// // Function to get the full name or a fallback
// const getDisplayName = (profile) => profile?.full_name || 'Anonymous';

// export default function Leaderboard() {
//   const { user, profile, loading: authLoading } = useContext(AuthContext);
//   const [leaderboardData, setLeaderboardData] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [view, setView] = useState('individual'); // 'individual', 'team', 'department'
//   const [departmentId, setDepartmentId] = useState(null);
//   const [teamId, setTeamId] = useState(null);

//   // Function to fetch leaderboard data based on the current view
//   const fetchLeaderboard = useCallback(async () => {
//     if (!user || !profile) return;

//     setLoading(true);
//     setError(null);

//     let query;

//     // Build the query based on the selected view
//     if (view === 'individual') {
//       // For individual view, get all users and sort by total steps
//       // Note: This is an expensive query. For a large app, consider a pre-aggregated view.
//       query = supabase
//         .from('user_info')
//         .select(`
//           id,
//           full_name,
//           profile_image_url,
//           is_anonymous,
//           steps
//         `)
//         .order('steps', { ascending: false });
//     } else if (view === 'team' && teamId) {
//       // For team view, get all team members and sort by total steps
//       // Note: This requires a JOIN or a pre-aggregated table for efficiency
//       query = supabase
//         .from('user_info')
//         .select(`
//           id,
//           full_name,
//           profile_image_url,
//           is_anonymous,
//           steps
//         `)
//         .eq('team_id', teamId)
//         .order('steps', { ascending: false });
//     } else if (view === 'department' && departmentId) {
//       // For department view, get all department members and sort by total steps
//       // Note: This requires a JOIN or a pre-aggregated table for efficiency
//       query = supabase
//         .from('user_info')
//         .select(`
//           id,
//           full_name,
//           profile_image_url,
//           is_anonymous,
//           steps
//         `)
//         .eq('department_id', departmentId)
//         .order('steps', { ascending: false });
//     }

//     try {
//       if (query) {
//         const { data, error: fetchError } = await query;
//         if (fetchError) throw fetchError;

//         // Map data to match the expected format
//         const formattedData = data.map(item => ({
//           id: item.id,
//           name: item.is_anonymous ? 'Anonymous User' : item.full_name,
//           steps: item.steps || 0,
//           avatar: item.is_anonymous ? 'https://placehold.co/100x100' : (item.profile_image_url || 'https://placehold.co/100x100'),
//         }));
        
//         setLeaderboardData(formattedData);
//       } else {
//         setLeaderboardData([]);
//       }
//     } catch (err) {
//       console.error('Error fetching leaderboard:', err);
//       setError('Failed to fetch leaderboard data.');
//     } finally {
//       setLoading(false);
//     }
//   }, [user, profile, view, teamId, departmentId]); // Dependencies for useCallback

//   // useEffect to trigger data fetching when view or user/profile changes
//   useEffect(() => {
//     if (authLoading || !user) return;
    
//     // Fetch user's department and team to set initial filters
//     if (profile) {
//       setDepartmentId(profile.department_id);
//       setTeamId(profile.team_id);
//     } else {
//       // Fallback if profile not immediately available
//       const fetchProfile = async () => {
//         const { data } = await supabase.from('user_info').select('department_id, team_id').eq('id', user.id).single();
//         if (data) {
//           setDepartmentId(data.department_id);
//           setTeamId(data.team_id);
//         }
//       };
//       fetchProfile();
//     }
    
//     fetchLeaderboard();

//     // Set up a scheduled refresh for the leaderboard data every 5 minutes (300000ms)
//     // In a real production app, this would be handled by a Supabase cron job.
//     const interval = setInterval(() => {
//       console.log("Refreshing leaderboard data...");
//       fetchLeaderboard();
//     }, 300000); // 5 minutes

//     // Clean up the interval when the component unmounts
//     return () => clearInterval(interval);

//   }, [authLoading, user, profile, fetchLeaderboard]); // fetchLeaderboard is a dependency

//   if (authLoading) {
//     return (
//       <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
//         <CircularProgress />
//       </Box>
//     );
//   }

//   return (
//     <ThemeProvider theme={appTheme}>
//       <CssBaseline />
//       <Box sx={{ display: 'flex', minHeight: '100vh' }}>
//         <SideNav />
//         <Box
//           component="main"
//           sx={{
//             flexGrow: 1,
//             px: { xs: 2, md: 4 },
//             py: { xs: 3, md: 5 },
//             bgcolor: 'background.default',
//           }}
//         >
//           <Typography variant="h4" fontWeight={600} gutterBottom>
//             Team Leaderboard
//           </Typography>

//           {/* Leaderboard View Buttons */}
//           <Box sx={{ mb: 3 }}>
//             <ButtonGroup variant="contained" aria-label="outlined primary button group">
//               <Button
//                 onClick={() => setView('individual')}
//                 color={view === 'individual' ? 'primary' : 'inherit'}
//               >
//                 Individual
//               </Button>
//               <Button
//                 onClick={() => setView('team')}
//                 color={view === 'team' ? 'primary' : 'inherit'}
//               >
//                 Team
//               </Button>
//               <Button
//                 onClick={() => setView('department')}
//                 color={view === 'department' ? 'primary' : 'inherit'}
//               >
//                 Department
//               </Button>
//             </ButtonGroup>
//           </Box>

//           {loading ? (
//             <CircularProgress />
//           ) : error ? (
//             <Typography color="error">{error}</Typography>
//           ) : (
//             <Grid container spacing={2}>
//               {leaderboardData.map((item, index) => (
//                 <Grid item xs={12} key={item.id}>
//                   <Paper sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
//                     <Typography variant="h6" sx={{ mr: 2 }}>
//                       #{index + 1}
//                     </Typography>
//                     <Avatar src={item.avatar} sx={{ width: 48, height: 48, mr: 2 }} />
//                     <Box sx={{ flexGrow: 1 }}>
//                       <Typography variant="subtitle1" fontWeight="bold">{item.name}</Typography>
//                       <Typography variant="body2" color="text.secondary">
//                         Steps: {item.steps}
//                       </Typography>
//                     </Box>
//                   </Paper>
//                 </Grid>
//               ))}
//             </Grid>
//           )}

//           {/* Chart placeholder */}
//           <Box mt={4}>
//             <Typography variant="h5" fontWeight={600} gutterBottom>
//               Performance Over Time
//             </Typography>
//             <LeaderboardChart data={leaderboardData} />
//           </Box>

//         </Box>
//       </Box>
//     </ThemeProvider>
//   );
// }




// // src/pages/Leaderboard.jsx
// import React, { useState, useEffect, useContext, useCallback } from 'react';
// import {
//   Box,
//   Typography,
//   CircularProgress,
//   Grid,
//   Button,
//   ButtonGroup,
//   Paper,
//   Avatar,
// } from '@mui/material';
// import { supabase } from '../supabase';
// import { AuthContext } from '../AuthContext';
// import LeaderboardChart from '../components/LeaderboardChart';
// // REMOVED: SideNav, ThemeProvider, and CssBaseline are now in Layout.jsx


// // Helper function to process data for the leaderboard list
// const processLeaderboardList = (data) => {
//   const aggregatedData = data.reduce((acc, current) => {
//     const user = acc[current.user_id] || { steps: 0, user_info: current.user_info };
//     user.steps += current.steps || 0;
//     acc[current.user_id] = user;
//     return acc;
//   }, {});

//   return Object.values(aggregatedData)
//     .map(item => ({
//       id: item.user_info.id,
//       name: item.user_info.is_anonymous ? 'Anonymous User' : item.user_info.full_name,
//       steps: item.steps,
//       avatar: item.user_info.is_anonymous ? 'https://placehold.co/100x100' : (item.user_info.profile_image_url || 'https://placehold.co/100x100'),
//     }))
//     .sort((a, b) => b.steps - a.steps);
// };

// // Helper function to process data for the Recharts chart
// const processLeaderboardChart = (data, userIds) => {
//   const chartData = {};
//   const today = new Date();
//   const dateOptions = { month: 'short', day: 'numeric' };

//   for (let i = 6; i >= 0; i--) {
//     const date = new Date(today);
//     date.setDate(today.getDate() - i);
//     const dateKey = date.toISOString().slice(0, 10);
//     const dateLabel = date.toLocaleDateString('en-US', dateOptions);
//     chartData[dateKey] = { name: dateLabel };
//   }

//   userIds.forEach(userId => {
//     const userHistory = data.filter(item => item.user_id === userId);
//     let cumulativeSteps = 0;
//     for (let i = 6; i >= 0; i--) {
//       const date = new Date(today);
//       date.setDate(today.getDate() - i);
//       const dateKey = date.toISOString().slice(0, 10);
//       const dayData = userHistory.find(item => item.date === dateKey);
//       cumulativeSteps += dayData ? (dayData.steps || 0) : 0;
//       chartData[dateKey][userId] = cumulativeSteps;
//     }
//   });

//   return Object.values(chartData);
// };

// export default function Leaderboard() {
//   const { user, profile, loading: authLoading } = useContext(AuthContext);
//   const [leaderboardData, setLeaderboardData] = useState([]);
//   const [chartData, setChartData] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [view, setView] = useState('individual');
//   const [departmentId, setDepartmentId] = useState(null);
//   const [teamId, setTeamId] = useState(null);

//   const fetchLeaderboard = useCallback(async () => {
//     if (!user || !profile) return;

//     setLoading(true);
//     setError(null);

//     const today = new Date();
//     const lastSevenDays = new Date(today);
//     lastSevenDays.setDate(today.getDate() - 6);
//     const lastSevenDaysISO = lastSevenDays.toISOString().slice(0, 10);

//     let userIdsToFetch = [];
//     let userData = [];

//     try {
//         if (view === 'individual') {
//             const { data: allUsers, error: userError } = await supabase
//                 .from('user_info')
//                 .select('id, full_name, profile_image_url, is_anonymous, steps')
//                 .order('steps', { ascending: false });
//             if (userError) throw userError;
//             userData = allUsers;
//             userIdsToFetch = allUsers.map(u => u.id);
//         } else if (view === 'team' && profile.team_id) {
//             const { data: teamMembers, error: userError } = await supabase
//                 .from('user_info')
//                 .select('id, full_name, profile_image_url, is_anonymous, steps')
//                 .eq('team_id', profile.team_id)
//                 .order('steps', { ascending: false });
//             if (userError) throw userError;
//             userData = teamMembers;
//             userIdsToFetch = teamMembers.map(u => u.id);
//         } else if (view === 'department' && profile.department_id) {
//             const { data: departmentMembers, error: userError } = await supabase
//                 .from('user_info')
//                 .select('id, full_name, profile_image_url, is_anonymous, steps')
//                 .eq('department_id', profile.department_id)
//                 .order('steps', { ascending: false });
//             if (userError) throw userError;
//             userData = departmentMembers;
//             userIdsToFetch = departmentMembers.map(u => u.id);
//         }

//         if (userIdsToFetch.length > 0) {
//             const { data: metricsData, error: metricsError } = await supabase
//                 .from('manual_metrics')
//                 .select(`
//                     date,
//                     steps,
//                     user_id
//                 `)
//                 .in('user_id', userIdsToFetch)
//                 .gte('date', lastSevenDaysISO)
//                 .order('date', { ascending: true });

//             if (metricsError) throw metricsError;

//             // Combine metrics and user info on the client side
//             const combinedData = metricsData.map(metric => {
//               const userInfo = userData.find(u => u.id === metric.user_id);
//               return {
//                 ...metric,
//                 user_info: userInfo
//               };
//             });
            
//             const leaderboardList = processLeaderboardList(combinedData);
//             const userIds = leaderboardList.map(item => item.id);
//             const chartData = processLeaderboardChart(combinedData, userIds);

//             setLeaderboardData(leaderboardList);
//             setChartData(chartData);
//         } else {
//             setLeaderboardData([]);
//             setChartData([]);
//         }
//     } catch (err) {
//       console.error('Error fetching leaderboard:', err);
//       setError('Failed to fetch leaderboard data.');
//     } finally {
//       setLoading(false);
//     }
//   }, [user, profile, view]);

//   useEffect(() => {
//     if (authLoading || !user) return;
//     fetchLeaderboard();

//     const interval = setInterval(() => {
//       console.log("Refreshing leaderboard data...");
//       fetchLeaderboard();
//     }, 300000);

//     return () => clearInterval(interval);

//   }, [authLoading, user, profile, fetchLeaderboard]);

//   if (authLoading) {
//     return (
//       <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
//         <CircularProgress />
//       </Box>
//     );
//   }

//   return (
//     <Box>
//       <Typography variant="h4" fontWeight={600} gutterBottom>
//         Team Leaderboard
//       </Typography>
//       <Box sx={{ mb: 3 }}>
//         <ButtonGroup variant="contained" aria-label="outlined primary button group">
//           <Button
//             onClick={() => setView('individual')}
//             color={view === 'individual' ? 'primary' : 'inherit'}
//           >
//             Individual
//           </Button>
//           <Button
//             onClick={() => setView('team')}
//             color={view === 'team' ? 'primary' : 'inherit'}
//             disabled={!profile?.team_id}
//           >
//             Team
//           </Button>
//           <Button
//             onClick={() => setView('department')}
//             color={view === 'department' ? 'primary' : 'inherit'}
//             disabled={!profile?.department_id}
//           >
//             Department
//           </Button>
//         </ButtonGroup>
//       </Box>
//       {loading ? (
//         <CircularProgress />
//       ) : error ? (
//         <Typography color="error">{error}</Typography>
//       ) : (
//         <Grid container spacing={2}>
//           {leaderboardData.map((item, index) => (
//             <Grid item xs={12} key={item.id}>
//               <Paper sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
//                 <Typography variant="h6" sx={{ mr: 2 }}>
//                   #{index + 1}
//                 </Typography>
//                 <Avatar src={item.avatar} sx={{ width: 48, height: 48, mr: 2 }} />
//                 <Box sx={{ flexGrow: 1 }}>
//                   <Typography variant="subtitle1" fontWeight="bold">{item.name}</Typography>
//                   <Typography variant="body2" color="text.secondary">
//                     Steps: {item.steps}
//                   </Typography>
//                 </Box>
//               </Paper>
//             </Grid>
//           ))}
//         </Grid>
//       )}
//       <Box mt={4}>
//         <Typography variant="h5" fontWeight={600} gutterBottom>
//           Performance Over Time
//         </Typography>
//         <LeaderboardChart data={chartData} userIds={leaderboardData.map(d => d.id)} userNames={leaderboardData.map(d => d.name)} />
//       </Box>
//     </Box>
//   );
// }




// src/pages/Leaderboard.jsx
import React, { useState, useEffect, useContext, useCallback } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Grid,
  Button,
  ButtonGroup,
  Paper,
  Avatar,
} from '@mui/material';
import { supabase } from '../supabase';
import { AuthContext } from '../AuthContext';

// We'll create these components later
import LeaderboardChart from '../components/LeaderboardChart';
// import SideNav from '../components/SideNav'; <-- REMOVED
import { appTheme } from '../theme';
import { ThemeProvider, CssBaseline } from '@mui/material';

// Function to get the full name or a fallback
const getDisplayName = (profile) => profile?.full_name || 'Anonymous';

export default function Leaderboard() {
  const { user, profile, loading: authLoading } = useContext(AuthContext);
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [view, setView] = useState('individual'); // 'individual', 'team', 'department'
  const [departmentId, setDepartmentId] = useState(null);
  const [teamId, setTeamId] = useState(null);

  // Function to fetch leaderboard data based on the current view
  const fetchLeaderboard = useCallback(async () => {
    if (!user || !profile) return;

    setLoading(true);
    setError(null);

    let query;

    // Build the query based on the selected view
    if (view === 'individual') {
      // For individual view, get all users and sort by total steps
      // Note: This is an expensive query. For a large app, consider a pre-aggregated view.
      query = supabase
        .from('user_info')
        .select(`
          id,
          full_name,
          profile_image_url,
          is_anonymous,
          steps
        `)
        .order('steps', { ascending: false });
    } else if (view === 'team' && teamId) {
      // For team view, get all team members and sort by total steps
      // Note: This requires a JOIN or a pre-aggregated table for efficiency
      query = supabase
        .from('user_info')
        .select(`
          id,
          full_name,
          profile_image_url,
          is_anonymous,
          steps
        `)
        .eq('team_id', teamId)
        .order('steps', { ascending: false });
    } else if (view === 'department' && departmentId) {
      // For department view, get all department members and sort by total steps
      // Note: This requires a JOIN or a pre-aggregated table for efficiency
      query = supabase
        .from('user_info')
        .select(`
          id,
          full_name,
          profile_image_url,
          is_anonymous,
          steps
        `)
        .eq('department_id', departmentId)
        .order('steps', { ascending: false });
    }

    try {
      if (query) {
        const { data, error: fetchError } = await query;
        if (fetchError) throw fetchError;

        // Map data to match the expected format
        const formattedData = data.map(item => ({
          id: item.id,
          name: item.is_anonymous ? 'Anonymous User' : item.full_name,
          steps: item.steps || 0,
          avatar: item.is_anonymous ? 'https://placehold.co/100x100' : (item.profile_image_url || 'https://placehold.co/100x100'),
        }));
        
        setLeaderboardData(formattedData);
      } else {
        setLeaderboardData([]);
      }
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
      setError('Failed to fetch leaderboard data.');
    } finally {
      setLoading(false);
    }
  }, [user, profile, view, teamId, departmentId]); // Dependencies for useCallback

  // useEffect to trigger data fetching when view or user/profile changes
  useEffect(() => {
    if (authLoading || !user) return;
    
    // Fetch user's department and team to set initial filters
    if (profile) {
      setDepartmentId(profile.department_id);
      setTeamId(profile.team_id);
    } else {
      // Fallback if profile not immediately available
      const fetchProfile = async () => {
        const { data } = await supabase.from('user_info').select('department_id, team_id').eq('id', user.id).single();
        if (data) {
          setDepartmentId(data.department_id);
          setTeamId(data.team_id);
        }
      };
      fetchProfile();
    }
    
    fetchLeaderboard();

    // Set up a scheduled refresh for the leaderboard data every 5 minutes (300000ms)
    // In a real production app, this would be handled by a Supabase cron job.
    const interval = setInterval(() => {
      console.log("Refreshing leaderboard data...");
      fetchLeaderboard();
    }, 300000); // 5 minutes

    // Clean up the interval when the component unmounts
    return () => clearInterval(interval);

  }, [authLoading, user, profile, fetchLeaderboard]); // fetchLeaderboard is a dependency

  if (authLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <ThemeProvider theme={appTheme}>
      <CssBaseline />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          px: { xs: 2, md: 4 },
          py: { xs: 3, md: 5 },
          bgcolor: 'background.default',
        }}
      >
        <Typography variant="h4" fontWeight={600} gutterBottom>
          Team Leaderboard
        </Typography>

        {/* Leaderboard View Buttons */}
        <Box sx={{ mb: 3 }}>
          <ButtonGroup variant="contained" aria-label="outlined primary button group">
            <Button
              onClick={() => setView('individual')}
              color={view === 'individual' ? 'primary' : 'inherit'}
            >
              Individual
            </Button>
            <Button
              onClick={() => setView('team')}
              color={view === 'team' ? 'primary' : 'inherit'}
            >
              Team
            </Button>
            <Button
              onClick={() => setView('department')}
              color={view === 'department' ? 'primary' : 'inherit'}
            >
              Department
            </Button>
          </ButtonGroup>
        </Box>

        {loading ? (
          <CircularProgress />
        ) : error ? (
          <Typography color="error">{error}</Typography>
        ) : (
          <Grid container spacing={2}>
            {leaderboardData.map((item, index) => (
              <Grid item xs={12} key={item.id}>
                <Paper sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
                  <Typography variant="h6" sx={{ mr: 2 }}>
                    #{index + 1}
                  </Typography>
                  <Avatar src={item.avatar} sx={{ width: 48, height: 48, mr: 2 }} />
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="subtitle1" fontWeight="bold">{item.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Steps: {item.steps}
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Chart placeholder */}
        <Box mt={4}>
          <Typography variant="h5" fontWeight={600} gutterBottom>
            Performance Over Time
          </Typography>
          <LeaderboardChart data={leaderboardData} />
        </Box>

      </Box>
    </ThemeProvider>
  );
}