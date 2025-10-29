// import React, { useEffect, useRef, useState, useCallback, Fragment } from 'react';
// import {
//   Box,
//   Button,
//   Card,
//   CardContent,
//   TextField,
//   Typography,
//   MenuItem,
//   Grid,
//   Avatar,
//   List,
//   ListItem,
//   ListItemAvatar,
//   ListItemText,
//   CircularProgress,
//   IconButton,
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   Alert,
//   Divider,
//   AppBar, // New: AppBar for top bar
//   Toolbar, // New: Toolbar for AppBar content
//   Drawer, // New: Drawer for hamburger menu
//   CssBaseline, // New: For consistent baseline styles
// } from '@mui/material';
// import MenuIcon from '@mui/icons-material/Menu'; // New: Hamburger icon
// import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'; // New: Drawer close icon
// import DeleteIcon from '@mui/icons-material/DeleteOutlined';
// import CheckIcon from '@mui/icons-material/CheckOutlined';
// import CloseIcon from '@mui/icons-material/CloseOutlined';
// import LogoutIcon from '@mui/icons-material/Logout';
// import GroupsIcon from '@mui/icons-material/Groups';
// import PersonAddIcon from '@mui/icons-material/PersonAdd';
// import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
// import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings'; // Corrected import
// import AccountTreeIcon from '@mui/icons-material/AccountTree'; // Corrected import (SelectTeamIcon)

// import { supabase } from '../supabase';
// import { appTheme } from '../theme'; // Assuming appTheme is defined and provides dark green theme

// export default function TeamPage() {
//   const [user, setUser] = useState(null);
//   const [teams, setTeams] = useState([]);
//   const [selectedTeamToJoin, setSelectedTeamToJoin] = useState('');

//   const [userMemberships, setUserMemberships] = useState([]);
//   const [currentTeam, setCurrentTeam] = useState(null);

//   const [teamName, setTeamName] = useState('');
//   const [description, setDescription] = useState('');
//   const [messages, setMessages] = useState([]);
//   const [newMessage, setNewMessage] = useState('');
//   const [teamMembers, setTeamMembers] = useState([]);
//   const [joinRequests, setJoinRequests] = useState([]);
//   const [allUsers, setAllUsers] = useState([]); // All users for app admin to assign roles
//   const [selectedAdminUserId, setSelectedAdminUserId] = useState('');
//   const [isAppAdmin, setIsAppAdmin] = useState(false);

//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   const [dialogOpen, setDialogOpen] = useState(false);
//   const [dialogContent, setDialogContent] = useState('');

//   const [confirmDialogOpen, setConfirmDialogOpen] = useState(false); // New: For window.confirm replacement
//   const [confirmDialogAction, setConfirmDialogAction] = useState(null); // New: Callback for confirm action
//   const [confirmDialogTitle, setConfirmDialogTitle] = '';
//   const [confirmDialogMessage, setConfirmDialogMessage] = '';

//   const [drawerOpen, setDrawerOpen] = useState(false); // New: State for Drawer open/close


//   const messagesEndRef = useRef(null);

//   // Derived state to check if the current user is an admin of the active team
//   const isCurrentUserTeamAdmin = currentTeam ? teamMembers.some(
//     (member) => member.id === user?.id && member.role === 'admin'
//   ) : false;

//   const showNotification = useCallback((content) => {
//     setDialogContent(content);
//     setDialogOpen(true);
//   }, []);

//   // New: Function to replace window.confirm
//   const showConfirmDialog = useCallback((title, message, onConfirm) => {
//     setConfirmDialogTitle(title);
//     setConfirmDialogMessage(message);
//     setConfirmDialogAction(() => onConfirm); // Use a function to set the callback
//     setConfirmDialogOpen(true);
//   }, []);

//   const handleConfirmDialogClose = (confirmed) => {
//     setConfirmDialogOpen(false);
//     if (confirmed && confirmDialogAction) {
//       confirmDialogAction();
//     }
//     setConfirmDialogAction(null); // Clear the action
//   };

//   const handleDrawerToggle = () => {
//     setDrawerOpen(!drawerOpen);
//   };


//   // --- Data Fetching Functions ---

//   const fetchAllTeams = useCallback(async () => {
//     try {
//       const { data, error } = await supabase.from('teams').select('*');
//       if (error) throw error;
//       setTeams(data || []);
//       console.log('fetchAllTeams: Fetched teams:', data); // DEBUG
//     } catch (err) {
//       console.error('Error fetching all teams:', err);
//       setError(`Failed to load available teams: ${err.message}`);
//     }
//   }, []);

//   const fetchUserMemberships = useCallback(async (currentUser) => {
//     if (!currentUser) {
//       setUserMemberships([]);
//       setCurrentTeam(null);
//       return;
//     }
//     try {
//       const { data: memberships, error: memberError } = await supabase
//         .from('team_members')
//         // Ensure this foreign key name matches your Supabase relation.
//         // If it's just 'teams', simplify to 'teams(id, name, description, created_by)'.
//         .select('team_id, role, teams!fk_team_members_teams_on_delete_cascade_final(id, name, description, created_by)')
//         .eq('user_id', currentUser.id);

//       if (memberError) {
//         console.error("Error fetching user's team memberships:", memberError); // DEBUG
//         throw memberError;
//       }

//       const fetchedUserTeams = memberships?.map(m => ({
//         id: m.team_id,
//         role: m.role,
//         ...m.teams,
//       })) || [];

//       setUserMemberships(fetchedUserTeams);
//       console.log('fetchUserMemberships: User memberships:', fetchedUserTeams); // DEBUG

//       // Set the current team
//       if (fetchedUserTeams.length > 0) {
//         const lastSelectedTeamId = localStorage.getItem('lastSelectedTeamId');
//         const foundSavedTeam = fetchedUserTeams.find(team => team.id === lastSelectedTeamId);
//         setCurrentTeam(foundSavedTeam || fetchedUserTeams[0]);
//         console.log('fetchUserMemberships: Setting current team to:', foundSavedTeam || fetchedUserTeams[0]); // DEBUG
//       } else {
//         setCurrentTeam(null);
//         console.log('fetchUserMemberships: No teams joined for user.'); // DEBUG
//       }

//     } catch (err) {
//       console.error("Error fetching user's team memberships:", err);
//       setError(`Failed to load your team memberships: ${err.message}`);
//     }
//   }, []);

//   const fetchMessages = useCallback(async (teamId) => {
//     if (!teamId) {
//       setMessages([]);
//       return;
//     }
//     try {
//       const { data, error } = await supabase
//         .from('team_messages')
//         .select('*, user_info(full_name, profile_url)')
//         .eq('team_id', teamId)
//         .order('created_at');
//       if (error) console.error('Error fetching messages:', error);
//       setMessages(data || []);
//       console.log(`fetchMessages for team ${teamId}: Fetched and set messages:`, data); // DEBUG
//     } catch (e) {
//       console.error('Error fetching messages:', e);
//     }
//   }, []);

//   // Correct and single definition of fetchTeamMembers
//   const fetchTeamMembers = useCallback(async (teamId) => {
//     try {
//       // Step 1: Fetch team members data (user_id and role)
//       const { data: membersData, error: membersError } = await supabase
//         .from('team_members')
//         .select('user_id, role')
//         .eq('team_id', teamId)
//         .order('role', { ascending: false });

//       if (membersError) {
//         console.error('Error fetching membersData:', membersError); // DEBUG
//         throw membersError;
//       }

//       if (!membersData || membersData.length === 0) {
//         setTeamMembers([]);
//         console.log(`fetchTeamMembers for team ${teamId}: No members found.`); // DEBUG
//         return;
//       }

//       // Extract user IDs from the fetched members
//       const userIds = membersData.map(m => m.user_id);

//       // Step 2: Fetch user_info (profile details) for those user IDs
//       const { data: userInfoData, error: userInfoError } = await supabase
//         .from('user_info')
//         .select('id, full_name, profile_url')
//         .in('id', userIds); // Assuming user_info.id is the same as auth.users.id/user_id

//       if (userInfoError) {
//         console.error('Error fetching userInfoData for members:', userInfoError); // DEBUG
//         throw userInfoError;
//       }

//       // Create a map for quick lookup of user info by ID
//       const userInfoMap = new Map(userInfoData.map(u => [u.id, u]));

//       // Step 3: Combine the data
//       const combinedMembers = membersData.map(member => {
//         const userInfo = userInfoMap.get(member.user_id);
//         // Handle cases where userInfo might be missing (e.g., RLS, deleted user_info record)
//         return {
//           id: member.user_id,
//           role: member.role,
//           full_name: userInfo?.full_name || 'Unknown User', // Default for missing name
//           profile_url: userInfo?.profile_url || '',
//         };
//       });

//       setTeamMembers(combinedMembers);
//       console.log(`fetchTeamMembers for team ${teamId}: Combined members:`, combinedMembers); // DEBUG
//     } catch (err) {
//       console.error('Error fetching team members:', err);
//       setError(`Failed to load team members: ${err.message}`);
//     }
//   }, []); // End of fetchTeamMembers function

//   const fetchJoinRequests = useCallback(async (teamId) => {
//     // Only fetch if user is logged in and has admin permissions (checked after fetch)
//     if (!user || !currentTeam || (!isAppAdmin && !isCurrentUserTeamAdmin)) { // Added currentTeam check
//       setJoinRequests([]);
//       return;
//     }
//     try {
//       const { data, error } = await supabase
//         .from('team_join_requests_with_profiles') // Assumes this view exists and is correctly configured
//         .select('id, user_id, status, created_at, full_name, profile_url')
//         .eq('team_id', teamId)
//         .eq('status', 'pending')
//         .order('created_at');
//       if (error) console.error('Error fetching join requests:', error);
//       setJoinRequests(data || []);
//       console.log(`fetchJoinRequests for team ${teamId}:`, data); // DEBUG
//     } catch (err) {
//       console.error('Error fetching join requests:', err);
//       setError(`Failed to load join requests: ${err.message}`);
//     }
//   }, [user, currentTeam, isAppAdmin, isCurrentUserTeamAdmin]);

//   const fetchAllUsersForAdminDropdown = useCallback(async () => {
//     console.log('fetchAllUsersForAdminDropdown: Attempting to fetch all users...'); // DEBUG
//     try {
//       const { data: users, error: usersError } = await supabase
//         .from('user_info')
//         .select('id, full_name')
//         .order('full_name');
//       if (usersError) {
//         console.error("Error fetching all users for admin dropdown:", usersError); // DEBUG
//         // Do NOT throw here, just log, so the app doesn't crash if this fetch fails due to RLS
//         // setError(`Failed to load user list for admin: ${usersError.message}`);
//       }
//       setAllUsers(users || []);
//       console.log("fetchAllUsersForAdminDropdown: Fetched users:", users); // DEBUG
//     } catch (err) {
//       console.error("Caught unexpected error in fetchAllUsersForAdminDropdown:", err); // DEBUG
//       // setError(`Caught unexpected error fetching user list: ${err.message}`);
//     }
//   }, []);

//   // --- Initial Data Load Effect ---
//   // This function was correctly defined here, but might have been corrupted/deleted in previous attempts
//   const loadInitialData = useCallback(async () => {
//     setLoading(true);
//     setError(null);
//     try {
//       const { data: { user: currentUser }, error: authError } = await supabase.auth.getUser();
//       if (authError || !currentUser) {
//         setError('User not authenticated. Please log in.');
//         setLoading(false);
//         return;
//       }
//       setUser(currentUser);
//       console.log('loadInitialData: Current User ID:', currentUser.id); // DEBUG

//       // TWEAK: Use .maybeSingle() to prevent error if user_info row doesn't exist
//       const { data: profile, error: profileError } = await supabase
//         .from('user_info')
//         .select('is_admin')
//         .eq('id', currentUser.id)
//         .maybeSingle(); // Use .maybeSingle()

//       if (profileError && profileError.code !== 'PGRST116') { // PGRST116 means 'No rows found'
//         console.error("Error fetching user profile for admin check:", profileError); // DEBUG
//       }
//       const isAdmin = profile?.is_admin === true; // Explicitly check for true
//       setIsAppAdmin(isAdmin);
//       console.log('loadInitialData: Is App Admin status (from DB):', isAdmin); // DEBUG

//       if (isAdmin) {
//         await fetchAllUsersForAdminDropdown();
//       } else {
//         setAllUsers([]);
//         console.log('loadInitialData: Not App Admin, allUsers cleared.'); // DEBUG
//       }

//       await fetchUserMemberships(currentUser); // This sets currentTeam internally
//       await fetchAllTeams();

//     } catch (err) {
//       console.error('Initial data load error:', err);
//       setError(`Failed to load initial data: ${err.message}`);
//     } finally {
//       setLoading(false);
//     }
//   }, [fetchAllUsersForAdminDropdown, fetchUserMemberships, fetchAllTeams]);

//   useEffect(() => {
//     loadInitialData();
//   }, [loadInitialData]);


//   // --- Function to handle active team selection ---
//   // This function was likely missing or corrupted in your previous file
//   const handleActiveTeamSelection = useCallback(async (event) => {
//     const selectedId = event.target.value;
//     const teamToActivate = userMemberships.find(m => m.id === selectedId);
//     if (teamToActivate) {
//       setLoading(true); // Start loading state for the new team data
//       setMessages([]);
//       setTeamMembers([]);
//       setJoinRequests([]); // Clear previous team's data

//       setCurrentTeam(teamToActivate);
//       localStorage.setItem('lastSelectedTeamId', selectedId);

//       try {
//         await fetchMessages(teamToActivate.id);
//         await fetchTeamMembers(teamToActivate.id);
//         // Only fetch join requests if the user is an admin of the selected team or an app admin
//         const isSelectedTeamAdmin = teamToActivate.role === 'admin' || isAppAdmin;
//         if (user && isSelectedTeamAdmin) {
//           await fetchJoinRequests(teamToActivate.id);
//         } else {
//           setJoinRequests([]); // Clear if no admin rights
//         }
//       } catch (e) {
//         console.error("Error refreshing team data on selection:", e);
//         setError(`Failed to refresh team data: ${e.message}`);
//       } finally {
//         setLoading(false);
//       }
//     }
//   }, [userMemberships, user, isAppAdmin, fetchMessages, fetchTeamMembers, fetchJoinRequests]); // Added all dependencies for stability

//   // --- Effect for Current Team Data and Real-time Subscriptions ---
//   useEffect(() => {
//     // TWEAK: Add currentTeam check to prevent calling fetch functions with null teamId
//     if (!currentTeam?.id || !user) {
//       setMessages([]);
//       setTeamMembers([]);
//       setJoinRequests([]);
//       return () => {}; // Return empty cleanup
//     }

//     const setupSubscriptions = async () => {
//       // Fetch initial data for the current team (redundant if called via handleActiveTeamSelection, but safe for direct loads)
//       await fetchMessages(currentTeam.id);
//       await fetchTeamMembers(currentTeam.id);

//       // Re-evaluate permission for join requests based on latest state.
//       // isCurrentUserTeamAdmin is a derived state, so it will reflect updates from fetchTeamMembers.
//       if (isAppAdmin || isCurrentUserTeamAdmin) {
//         await fetchJoinRequests(currentTeam.id);
//       } else {
//         setJoinRequests([]);
//       }

//       // Setup Supabase Realtime Subscriptions
//       const chatChannel = supabase
//         .channel(`team_chat_${currentTeam.id}`)
//         .on(
//           'postgres_changes',
//           { event: 'INSERT', schema: 'public', table: 'team_messages', filter: `team_id=eq.${currentTeam.id}` },
//           () => fetchMessages(currentTeam.id)
//         )
//         .subscribe();

//       const membersChannel = supabase
//         .channel(`team_members_${currentTeam.id}`)
//         .on(
//           'postgres_changes',
//           { event: '*', schema: 'public', table: 'team_members', filter: `team_id=eq.${currentTeam.id}` },
//           async () => {
//             await fetchTeamMembers(currentTeam.id);
//             // After team members are fetched, re-evaluate user memberships to update roles
//             await fetchUserMemberships(user);
//           }
//         )
//         .subscribe();

//       const joinRequestsChannel = supabase
//         .channel(`team_join_requests_${currentTeam.id}`)
//         .on(
//           'postgres_changes',
//           { event: '*', schema: 'public', table: 'team_join_requests', filter: `team_id=eq.${currentTeam.id}` },
//           () => {
//             if (isAppAdmin || isCurrentUserTeamAdmin) {
//               fetchJoinRequests(currentTeam.id);
//             }
//           }
//         )
//         .subscribe();

//       // Cleanup function
//       return () => {
//         supabase.removeChannel(chatChannel);
//         supabase.removeChannel(membersChannel);
//         supabase.removeChannel(joinRequestsChannel);
//       };
//     };

//     const cleanupPromise = setupSubscriptions();
//     return () => {
//         cleanupPromise.then(cleanupFn => cleanupFn && cleanupFn());
//     };

//   }, [currentTeam?.id, user, isAppAdmin, isCurrentUserTeamAdmin, fetchMessages, fetchTeamMembers, fetchJoinRequests, fetchUserMemberships]);

//   // Effect to scroll chat messages to the bottom
//   useEffect(() => {
//     scrollToBottom();
//   }, [messages]);

//   const scrollToBottom = () => {
//     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//   };

//   // --- Event Handlers ---

//   const sendMessage = async () => {
//     if (!newMessage.trim() || !currentTeam?.id || !user?.id) return;

//     setLoading(true);
//     try {
//       const { error } = await supabase.from('team_messages').insert({
//         team_id: currentTeam.id,
//         user_id: user.id,
//         message: newMessage,
//       });

//       if (error) throw error;
//       setNewMessage('');
//       console.log('Message sent successfully to Supabase!'); // ADDED LOG
//     } catch (e) {
//       console.error('❌ Failed to send message:', e);
//       showNotification(`Failed to send message: ${e.message}`);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleCreateTeam = async () => {
//     if (!teamName.trim() || !user) {
//       showNotification('Team name and user are required.');
//       return;
//     }

//     if (!isAppAdmin) {
//       showNotification("🚫 You're not allowed to create a team. App Admins only.");
//       return;
//     }

//     setLoading(true);
//     setError(null);
//     try {
//       const { data, error } = await supabase
//         .from('teams')
//         .insert({ name: teamName, description, created_by: user.id })
//         .select()
//         .single();

//       if (error) throw error;

//       await supabase.from('team_members').insert({
//         team_id: data.id,
//         user_id: user.id,
//         role: 'admin',
//       });

//       setTeamName('');
//       setDescription('');
//       showNotification("✅ Team created successfully!");
//       await loadInitialData();
//     } catch (e) {
//       console.error("❌ Failed to create team:", e);
//       setError(`Failed to create team: ${e.message}`);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const requestToJoinTeam = async () => {
//     if (!selectedTeamToJoin || !user?.id) {
//       showNotification('Please select a team and ensure you are logged in.');
//       return;
//     }

//     setLoading(true);
//     setError(null);

//     try {
//       const { data: existingMembership, error: memberError } = await supabase
//         .from('team_members')
//         .select('team_id, role, teams!fk_team_members_teams_on_delete_cascade_final(id, name, description, created_by)')
//         .eq('team_id', selectedTeamToJoin)
//         .eq('user_id', user.id)
//         .limit(1);

//       if (memberError) throw memberError;

//       if (existingMembership.length > 0) {
//         setCurrentTeam({
//           id: existingMembership[0].team_id,
//           role: existingMembership[0].role,
//           ...existingMembership[0].teams,
//         });
//         showNotification("You are already a member of this team. Setting it as your active team.");
//         setSelectedTeamToJoin('');
//         setLoading(false);
//         return;
//       }

//       const { data: existingRequest, error: requestError } = await supabase
//         .from('team_join_requests')
//         .select('id')
//         .eq('team_id', selectedTeamToJoin)
//         .eq('user_id', user.id)
//         .eq('status', 'pending')
//         .limit(1);

//       if (requestError) throw requestError;

//       if (existingRequest.length > 0) {
//         showNotification("You have already sent a join request to this team. Please wait for approval.");
//         setSelectedTeamToJoin('');
//         setLoading(false);
//         return;
//       }

//       const { error } = await supabase.from('team_join_requests').insert({
//         team_id: selectedTeamToJoin,
//         user_id: user.id,
//         status: 'pending',
//       });
//       if (error) throw error;

//       showNotification("✅ Your join request has been sent successfully! Please wait for a team admin to approve it.");
//       setSelectedTeamToJoin('');
//     } catch (e) {
//       console.error("❌ Failed to send join request:", e);
//       setError(`Failed to send join request: ${e.message}`);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const approveRequest = async (requestId, requestingUserId) => {
//     setLoading(true);
//     setError(null);
//     try {
//       if (!isAppAdmin && !isCurrentUserTeamAdmin) {
//         showNotification("🚫 You do not have permission to approve requests.");
//         setLoading(false);
//         return;
//       }

//       // Replaced window.confirm with custom dialog
//       showConfirmDialog("Approve Request", "Are you sure you want to approve this request?", async () => {
//         const { data: existingMember, error: checkError } = await supabase
//           .from('team_members')
//           .select('id, role')
//           .eq('team_id', currentTeam.id)
//           .eq('user_id', requestingUserId)
//           .single();

//         if (checkError && checkError.code === 'PGRST116') {
//           const { error: memberInsertError } = await supabase.from('team_members').insert({
//             team_id: currentTeam.id,
//             user_id: requestingUserId,
//             role: 'member',
//           });
//           if (memberInsertError) throw memberInsertError;
//         } else if (checkError) {
//           throw checkError;
//         } else {
//           console.log("User is already a member, skipping insert in approveRequest.");
//         }

//         const { error: requestUpdateError } = await supabase.from('team_join_requests')
//           .update({ status: 'approved' })
//           .eq('id', requestId);
//         if (requestUpdateError) throw requestUpdateError;

//         showNotification("✅ Join request approved!");
//         fetchTeamMembers(currentTeam.id);
//         fetchJoinRequests(currentTeam.id);
//       });
//     } catch (e) {
//       console.error("❌ Failed to approve request:", e);
//       setError(`Failed to approve request: ${e.message}`);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const rejectRequest = async (requestId) => {
//     setLoading(true);
//     setError(null);
//     try {
//       if (!isAppAdmin && !isCurrentUserTeamAdmin) {
//         showNotification("🚫 You do not have permission to reject requests.");
//         setLoading(false);
//         return;
//       }

//       // Replaced window.confirm with custom dialog
//       showConfirmDialog("Reject Request", "Are you sure you want to reject this request?", async () => {
//         const { error } = await supabase.from('team_join_requests')
//           .update({ status: 'rejected' })
//           .eq('id', requestId);
//         if (error) throw error;

//         showNotification("❌ Join request rejected.");
//         fetchJoinRequests(currentTeam.id);
//       });
//     } catch (e) {
//       console.error("❌ Failed to reject request:", e);
//       setError(`Failed to reject request: ${e.message}`);
//     } finally {
//       setLoading(false);
//     }
//   };


//   const assignTeamAdmin = async () => {
//     if (!currentTeam?.id || !selectedAdminUserId) {
//       showNotification("Please select a team and a user to assign admin role.");
//       return;
//     }
//     if (!isAppAdmin && !isCurrentUserTeamAdmin) {
//       showNotification("🚫 You do not have permission to assign team admins.");
//       return;
//     }

//     setLoading(true);
//     setError(null);
//     try {
//       const { data: existingMember, error: checkError } = await supabase
//         .from('team_members')
//         .select('id, role')
//         .eq('team_id', currentTeam.id)
//         .eq('user_id', selectedAdminUserId)
//         .single();

//       if (checkError && checkError.code === 'PGRST116') {
//         showNotification("Selected user is not yet a member of this team. Please add them to the team first (e.g., by approving their join request).");
//         setLoading(false);
//         return;
//       } else if (checkError) {
//         throw checkError;
//       }

//       if (existingMember.role === 'admin') {
//         showNotification("Selected user is already an admin of this team.");
//         setLoading(false);
//         return;
//       }

//       const { error: updateError } = await supabase.from('team_members')
//         .update({ role: 'admin' })
//         .eq('team_id', currentTeam.id)
//         .eq('user_id', selectedAdminUserId);

//       if (updateError) throw updateError;

//       showNotification("✅ Team admin assigned!");
//       await loadInitialData();
//       setSelectedAdminUserId('');
//     } catch (e) {
//       console.error("❌ Failed to assign admin:", e);
//       setError(`Failed to assign admin: ${e.message}`);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const removeMember = async (memberIdToRemove) => {
//     if (!currentTeam?.id || !memberIdToRemove) return;
//     if (memberIdToRemove === user?.id) {
//       showNotification("You cannot remove yourself using this action. Please use 'Leave Team'.");
//       return;
//     }

//     const targetMember = teamMembers.find(m => m.id === memberIdToRemove);
//     const otherAdmins = teamMembers.filter(m => m.role === 'admin' && m.id !== memberIdToRemove);

//     if (targetMember && targetMember.role === 'admin' && !isAppAdmin && otherAdmins.length === 0) {
//       showNotification("Cannot remove the last team admin directly. Please assign another admin first, or delete the team.");
//       return;
//     }

//     if (!isAppAdmin && !isCurrentUserTeamAdmin) {
//       showNotification("🚫 You do not have permission to remove members.");
//       return;
//     }

//     setLoading(true);
//     setError(null);
//     showConfirmDialog("Remove Member", "Are you sure you want to remove this member?", async () => {
//       try {
//         const { error } = await supabase
//           .from('team_members')
//           .delete()
//           .eq('team_id', currentTeam.id)
//           .eq('user_id', memberIdToRemove);

//         if (error) throw error;

//         showNotification("✅ Member removed successfully!");
//         fetchTeamMembers(currentTeam.id);
//         if (memberIdToRemove === user?.id) {
//           await fetchUserMemberships(user);
//         }
//       } catch (e) {
//         console.error("❌ Failed to remove member:", e);
//         setError(`Failed to remove member: ${e.message}`);
//       } finally {
//         setLoading(false);
//       }
//     });
//   };

//   const leaveTeam = async () => {
//     if (!currentTeam?.id || !user?.id) return;
//     setLoading(true);
//     setError(null);
//     try {
//       const currentUserMembership = userMemberships.find(m => m.id === currentTeam.id && m.user_id === user.id);
//       const otherAdmins = teamMembers.filter(m => m.role === 'admin' && m.id !== user.id);

//       if (currentUserMembership?.role === 'admin' && otherAdmins.length === 0) {
//         showNotification("You are the only admin of this team. Please assign another admin before leaving, or delete the team.");
//         setLoading(false);
//         return;
//       }

//       showConfirmDialog("Leave Team", "Are you sure you want to leave the team?", async () => {
//         const { error } = await supabase.from('team_members')
//           .delete()
//           .eq('team_id', currentTeam.id)
//           .eq('user_id', user.id);

//         if (error) throw error;

//         showNotification("✅ You have left the team.");
//         setCurrentTeam(null);
//         setUserMemberships(prev => prev.filter(m => m.id !== currentTeam.id));
//         localStorage.removeItem('lastSelectedTeamId');
//         setMessages([]);
//         setTeamMembers([]);
//         setJoinRequests([]);
//         fetchAllTeams();
//       });
//     } catch (e) {
//       console.error("❌ Failed to leave team:", e);
//       setError(`Failed to leave team: ${e.message}`);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const deleteTeam = async () => {
//     if (!currentTeam?.id) return;
//     if (currentTeam.created_by !== user?.id && !isAppAdmin) {
//       showNotification("🚫 You do not have permission to delete this team.");
//       return;
//     }

//     setLoading(true);
//     setError(null);
//     showConfirmDialog("Delete Team", "⚠️ Are you sure you want to delete this team? This action cannot be undone.", async () => {
//       try {
//         const deletedTeamId = currentTeam.id;

//         const { error } = await supabase.from('teams').delete().eq('id', deletedTeamId);
//         if (error) throw error;

//         showNotification("✅ Team deleted successfully!");

//         await loadInitialData();
//         localStorage.removeItem('lastSelectedTeamId');
//         setMessages([]);
//         setTeamMembers([]);
//         setJoinRequests([]);
//       } catch (e) {
//         console.error("❌ Failed to delete team:", e);
//         setError(`Failed to delete team: ${e.message}`);
//       } finally {
//         setLoading(false);
//       }
//     });
//   };


//   // --- UI Rendering ---
//   if (loading && !user) {
//     return (
//       <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
//         <CircularProgress />
//         <Typography variant="h6" sx={{ ml: 2 }}>Loading user data...</Typography>
//       </Box>
//     );
//   }

//   if (error) {
//     return (
//       <Box sx={{ p: 4, textAlign: 'center' }}>
//         <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
//         <Button variant="contained" onClick={() => window.location.reload()}>Retry</Button>
//       </Box>
//     );
//   }

//   return (
//     <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: appTheme.palette.background.default }}>
//       <CssBaseline />
//       <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, bgcolor: appTheme.palette.primary.main }}>
//         <Toolbar>
//           <IconButton
//             color="inherit"
//             aria-label="open drawer"
//             onClick={handleDrawerToggle}
//             edge="start"
//             sx={{ mr: 2 }}
//           >
//             <MenuIcon />
//           </IconButton>
//           <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
//             Team Management
//             {userMemberships.length > 0 && (
//               <Typography component="span" variant="h6" color="inherit" sx={{ ml: 2 }}>
//                 ({userMemberships.length} team{userMemberships.length !== 1 ? 's' : ''} joined)
//               </Typography>
//             )}
//           </Typography>
//           {currentTeam && (
//             <Typography variant="body1" sx={{ ml: 2, color: 'white' }}>
//               Active Team: {currentTeam.name}
//             </Typography>
//           )}
//         </Toolbar>
//       </AppBar>

//       <Drawer
//         variant="temporary"
//         open={drawerOpen}
//         onClose={handleDrawerToggle}
//         ModalProps={{
//           keepMounted: true, // Better open performance on mobile.
//         }}
//         sx={{
//           width: 280,
//           flexShrink: 0,
//           [`& .MuiDrawer-paper`]: { width: 280, boxSizing: 'border-box', bgcolor: appTheme.palette.secondary.dark, color: appTheme.palette.text.primary },
//         }}
//       >
//         <Toolbar sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', px: 1 }}>
//           <IconButton onClick={handleDrawerToggle} sx={{ color: appTheme.palette.text.primary }}>
//             <ChevronLeftIcon />
//           </IconButton>
//         </Toolbar>
//         <Divider sx={{ bgcolor: appTheme.palette.primary.light }} />
//         <Box sx={{ p: 2 }}>
//           {/* Section: Select Active Team */}
//           {userMemberships.length > 0 && (
//             <Card sx={{ mb: 2, bgcolor: appTheme.palette.background.paper }}>
//               <CardContent>
//                 <Typography variant="subtitle1" gutterBottom>
//                   <AccountTreeIcon sx={{ verticalAlign: 'middle', mr: 1 }} /> Select Your Active Team
//                 </Typography>
//                 <TextField
//                   select
//                   label="My Teams"
//                   fullWidth
//                   value={currentTeam?.id || ''}
//                   onChange={handleActiveTeamSelection}
//                   margin="normal"
//                   size="small"
//                   disabled={loading}
//                   InputLabelProps={{ sx: { color: appTheme.palette.text.secondary } }}
//                   InputProps={{ sx: { color: appTheme.palette.text.primary } }}
//                   SelectProps={{ MenuProps: { PaperProps: { sx: { bgcolor: appTheme.palette.background.paper } } } }}
//                 >
//                   {userMemberships.map((team) => (
//                     <MenuItem key={team.id} value={team.id} sx={{ color: appTheme.palette.text.primary }}>
//                       {team.name} ({team.role === 'admin' ? 'Admin' : 'Member'})
//                     </MenuItem>
//                   ))}
//                 </TextField>
//               </CardContent>
//             </Card>
//           )}

//           {/* Section: Create New Team (App Admin Only) */}
//           {isAppAdmin && (
//             <Card sx={{ mb: 2, bgcolor: appTheme.palette.background.paper }}>
//               <CardContent>
//                 <Typography variant="subtitle1" gutterBottom>
//                   <GroupsIcon sx={{ verticalAlign: 'middle', mr: 1 }} /> Create New Team
//                 </Typography>
//                 <TextField
//                   fullWidth
//                   label="Team Name"
//                   value={teamName}
//                   onChange={(e) => setTeamName(e.target.value)}
//                   margin="normal"
//                   size="small"
//                   disabled={loading}
//                   InputLabelProps={{ sx: { color: appTheme.palette.text.secondary } }}
//                   InputProps={{ sx: { color: appTheme.palette.text.primary } }}
//                 />
//                 <TextField
//                   fullWidth
//                   label="Description"
//                   value={description}
//                   onChange={(e) => setDescription(e.target.value)}
//                   margin="normal"
//                   multiline
//                   rows={2}
//                   size="small"
//                   disabled={loading}
//                   InputLabelProps={{ sx: { color: appTheme.palette.text.secondary } }}
//                   InputProps={{ sx: { color: appTheme.palette.text.primary } }}
//                 />
//               </CardContent>
//               <Box sx={{ p: 2, pt: 0 }}>
//                 <Button variant="contained" fullWidth onClick={handleCreateTeam} disabled={loading || !teamName.trim()}
//                   sx={{ bgcolor: appTheme.palette.success.main, '&:hover': { bgcolor: appTheme.palette.success.dark } }}>
//                   Create Team {loading && <CircularProgress size={20} sx={{ ml: 1, color: 'white' }} />}
//                 </Button>
//               </Box>
//             </Card>
//           )}

//           {/* Section: Join Existing Team */}
//           {(!currentTeam || userMemberships.length === 0) && (
//             <Card sx={{ mb: 2, bgcolor: appTheme.palette.background.paper }}>
//               <CardContent>
//                 <Typography variant="subtitle1" gutterBottom>
//                   <PersonAddIcon sx={{ verticalAlign: 'middle', mr: 1 }} /> Join an Existing Team
//                 </Typography>
//                 <TextField
//                   select
//                   label="Select a team"
//                   fullWidth
//                   value={selectedTeamToJoin}
//                   onChange={(e) => setSelectedTeamToJoin(e.target.value)}
//                   margin="normal"
//                   size="small"
//                   disabled={loading}
//                   InputLabelProps={{ sx: { color: appTheme.palette.text.secondary } }}
//                   InputProps={{ sx: { color: appTheme.palette.text.primary } }}
//                   SelectProps={{ MenuProps: { PaperProps: { sx: { bgcolor: appTheme.palette.background.paper } } } }}
//                 >
//                   {teams.length === 0 ? (
//                     <MenuItem disabled value="" sx={{ color: appTheme.palette.text.primary }}>No teams available</MenuItem>
//                   ) : (
//                     teams.map((team) => (
//                       <MenuItem key={team.id} value={team.id} sx={{ color: appTheme.palette.text.primary }}>
//                         {team.name}
//                       </MenuItem>
//                     ))
//                   )}
//                 </TextField>
//               </CardContent>
//               <Box sx={{ p: 2, pt: 0 }}>
//                 <Button variant="contained" fullWidth onClick={requestToJoinTeam} disabled={!selectedTeamToJoin || loading}
//                   sx={{ bgcolor: appTheme.palette.info.main, '&:hover': { bgcolor: appTheme.palette.info.dark } }}>
//                   Request to Join {loading && <CircularProgress size={20} sx={{ ml: 1, color: 'white' }} />}
//                 </Button>
//               </Box>
//             </Card>
//           )}

//           {/* Section: Pending Join Requests */}
//           {currentTeam && (isAppAdmin || isCurrentUserTeamAdmin) && (
//             <Card sx={{ bgcolor: appTheme.palette.background.paper }}>
//               <CardContent>
//                 <Typography variant="subtitle1" gutterBottom>
//                   <PersonAddIcon sx={{ verticalAlign: 'middle', mr: 1 }} /> Pending Join Requests
//                 </Typography>
//                 {joinRequests.length === 0 ? (
//                   <Typography variant="body2" color="text.secondary">No pending requests.</Typography>
//                 ) : (
//                   <List dense>
//                     {joinRequests.map((req) => (
//                       <ListItem key={req.id} secondaryAction={
//                         <Box>
//                           <IconButton edge="end" aria-label="approve" onClick={() => approveRequest(req.id, req.user_id)} disabled={loading}>
//                             <CheckIcon color="success" />
//                           </IconButton>
//                           <IconButton edge="end" aria-label="reject" onClick={() => rejectRequest(req.id)} disabled={loading}>
//                             <CloseIcon color="error" />
//                           </IconButton>
//                         </Box>
//                       }>
//                         <ListItemAvatar>
//                           <Avatar src={req.profile_url || ''} alt={req.full_name?.charAt(0) || 'U'} />
//                         </ListItemAvatar>
//                         <ListItemText
//                           primary={req.full_name}
//                           secondary={`Requested on: ${new Date(req.created_at).toLocaleDateString()}`}
//                           sx={{ color: appTheme.palette.text.primary }}
//                         />
//                       </ListItem>
//                     ))}
//                   </List>
//                 )}
//               </CardContent>
//             </Card>
//           )}
//         </Box>
//       </Drawer>

//       <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8 }}> {/* mt for AppBar height */}
//         <Toolbar /> {/* To push content below AppBar */}
//         {/* Main Content: Chat, Team Members, Assign Team Admin */}
//         <Grid container spacing={4}>
//           {/* Team Chat */}
//           {currentTeam && (
//             <Grid item xs={12} md={8}>
//               <Card sx={{ bgcolor: appTheme.palette.background.paper }}>
//                 <CardContent>
//                   <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
//                     <Typography variant="h6" component="div">
//                       <ChatBubbleOutlineIcon sx={{ verticalAlign: 'middle', mr: 1 }} /> Team Chat: <strong>{currentTeam.name}</strong>
//                       <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 1 }}>
//                         (Your Role: {currentTeam.role === 'admin' ? 'Admin' : 'Member'})
//                       </Typography>
//                     </Typography>
//                     <Box sx={{ display: 'flex', gap: 1 }}>
//                       <Button variant="outlined" color="warning" startIcon={<LogoutIcon />} onClick={leaveTeam} disabled={loading}>
//                         Leave Team
//                       </Button>
//                       {(isAppAdmin || currentTeam.created_by === user?.id) && (
//                         <Button variant="outlined" color="error" startIcon={<DeleteIcon />} onClick={deleteTeam} disabled={loading}>
//                           Delete Team
//                         </Button>
//                       )}
//                     </Box>
//                   </Box>
//                   <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
//                     {currentTeam.description}
//                   </Typography>

//                   <Divider sx={{ mb: 2, bgcolor: appTheme.palette.divider }} />

//                   <Box
//                     sx={{
//                       maxHeight: 300,
//                       minHeight: 150,
//                       overflowY: 'auto',
//                       border: '1px solid',
//                       borderColor: appTheme.palette.divider,
//                       borderRadius: 2,
//                       p: 1.5,
//                       display: 'flex',
//                       flexDirection: 'column',
//                       bgcolor: appTheme.palette.background.default, // Chat background
//                     }}
//                   >
//                     {messages.length === 0 && (
//                       <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
//                         No messages yet. Start the conversation!
//                       </Typography>
//                     )}
//                     {messages.map((msg) => (
//                       <Box
//                         key={msg.id}
//                         sx={{
//                           display: 'flex',
//                           flexDirection: msg.user_id === user?.id ? 'row-reverse' : 'row',
//                           alignItems: 'flex-start',
//                           gap: 1,
//                           mb: 1.5,
//                         }}
//                       >
//                         <Avatar
//                           src={msg.user_info?.profile_url || ''}
//                           alt={msg.user_info?.full_name?.charAt(0) || 'U'}
//                           sx={{ mt: 0.5 }}
//                         />
//                         <Box
//                           sx={{
//                             p: 1.2,
//                             borderRadius: 2,
//                             bgcolor: msg.user_id === user?.id ? appTheme.palette.primary.dark : appTheme.palette.grey[800], // Darker chat bubbles
//                             color: 'white', // Ensure text is visible on dark bubbles
//                             maxWidth: '75%',
//                             wordBreak: 'break-word',
//                           }}
//                         >
//                           <Typography variant="caption" fontWeight="bold" sx={{ display: 'block', mb: 0.5 }}>
//                             {msg.user_info?.full_name || 'Anonymous'}
//                           </Typography>
//                           <Typography variant="body2">
//                             {msg.message}
//                           </Typography>
//                           <Typography variant="caption" sx={{ display: 'block', mt: 0.5, color: appTheme.palette.grey[400], textAlign: msg.user_id === user?.id ? 'left' : 'right' }}>
//                             {new Date(msg.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
//                           </Typography>
//                         </Box>
//                       </Box>
//                     ))}
//                     <div ref={messagesEndRef} />
//                   </Box>
//                   <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
//                     <TextField
//                       fullWidth
//                       placeholder="Type a message..."
//                       value={newMessage}
//                       onChange={(e) => setNewMessage(e.target.value)}
//                       onKeyPress={(e) => {
//                         if (e.key === 'Enter') {
//                           sendMessage();
//                           e.preventDefault();
//                         }
//                       }}
//                       disabled={loading}
//                       InputProps={{ sx: { color: appTheme.palette.text.primary } }}
//                       InputLabelProps={{ sx: { color: appTheme.palette.text.secondary } }}
//                     />
//                     <Button variant="contained" onClick={sendMessage} disabled={loading || !newMessage.trim()}
//                       sx={{ bgcolor: appTheme.palette.success.main, '&:hover': { bgcolor: appTheme.palette.success.dark } }}>
//                       Send
//                     </Button>
//                   </Box>
//                 </CardContent>
//               </Card>
//             </Grid>
//           )}

//           {/* Team Members & Assign Team Admin */}
//           {currentTeam && (
//             <Grid item xs={12} md={4}>
//               <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: appTheme.palette.background.paper }}>
//                 <CardContent sx={{ flexGrow: 1 }}>
//                   <Typography variant="h6" gutterBottom>
//                     👥 Team Members
//                   </Typography>
//                   <List dense>
//                     {teamMembers.length === 0 ? (
//                       <ListItem><ListItemText primary="No members yet." sx={{ color: appTheme.palette.text.secondary }} /></ListItem>
//                     ) : (
//                       teamMembers.map((member) => (
//                         <ListItem key={member.id} secondaryAction={
//                           (isAppAdmin || isCurrentUserTeamAdmin) && member.id !== user?.id && (
//                             <IconButton edge="end" aria-label="remove" onClick={() => removeMember(member.id)} disabled={loading}>
//                               <DeleteIcon color="error" />
//                             </IconButton>
//                           )
//                         }>
//                           <ListItemAvatar>
//                             <Avatar src={member.profile_url || ''} alt={member.full_name?.charAt(0) || 'U'} />
//                           </ListItemAvatar>
//                           <ListItemText
//                             primary={
//                               <Box sx={{ display: 'flex', alignItems: 'center' }}>
//                                 <Typography variant="body1" component="span" fontWeight={member.role === 'admin' ? 'bold' : 'normal'} sx={{ color: appTheme.palette.text.primary }}>
//                                   {member.full_name}
//                                 </Typography>
//                                 {member.role === 'admin' && (
//                                   <Typography component="span" variant="caption" sx={{ ml: 1, px: 1, py: 0.5, borderRadius: '4px', bgcolor: appTheme.palette.primary.dark, color: 'white' }}>
//                                     Admin
//                                   </Typography>
//                                 )}
//                               </Box>
//                             }
//                           />
//                         </ListItem>
//                       ))
//                     )}
//                   </List>

//                   {/* Assign Team Admin Section */}
//                   {(isAppAdmin || isCurrentUserTeamAdmin) && (
//                     <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid', borderColor: appTheme.palette.divider }}>
//                       <Typography variant="h6" gutterBottom>
//                         <AdminPanelSettingsIcon sx={{ verticalAlign: 'middle', mr: 1 }} /> Assign Team Admin
//                       </Typography>
//                       <TextField
//                         select
//                         fullWidth
//                         label="Select user to make team admin"
//                         value={selectedAdminUserId}
//                         onChange={(e) => setSelectedAdminUserId(e.target.value)}
//                         margin="normal"
//                         size="small"
//                         disabled={loading}
//                         InputLabelProps={{ sx: { color: appTheme.palette.text.secondary } }}
//                         InputProps={{ sx: { color: appTheme.palette.text.primary } }}
//                         SelectProps={{ MenuProps: { PaperProps: { sx: { bgcolor: appTheme.palette.background.paper } } } }}
//                       >
//                         {allUsers.length === 0 ? (
//                           <MenuItem disabled value="" sx={{ color: appTheme.palette.text.primary }}>No users available</MenuItem>
//                         ) : (
//                           allUsers.map((appUser) => (
//                             <MenuItem key={appUser.id} value={appUser.id} sx={{ color: appTheme.palette.text.primary }}>
//                               {appUser.full_name}
//                             </MenuItem>
//                           ))
//                         )}
//                       </TextField>
//                       <Button
//                         variant="contained"
//                         fullWidth
//                         sx={{ mt: 1, bgcolor: appTheme.palette.primary.main, '&:hover': { bgcolor: appTheme.palette.primary.dark } }}
//                         onClick={assignTeamAdmin}
//                         disabled={!selectedAdminUserId || loading}
//                       >
//                         Assign as Admin {loading && <CircularProgress size={20} sx={{ ml: 1, color: 'white' }} />}
//                       </Button>
//                     </Box>
//                   )}
//                 </CardContent>
//               </Card>
//             </Grid>
//           )}
//         </Grid>
//       </Box>

//       {/* General Purpose Notification Dialog */}
//       <Dialog
//         open={dialogOpen}
//         onClose={() => setDialogOpen(false)}
//         aria-labelledby="notification-dialog-title"
//         aria-describedby="notification-dialog-description"
//       >
//         <DialogTitle id="notification-dialog-title">{"Notification"}</DialogTitle>
//         <DialogContent>
//           <Typography id="notification-dialog-description">
//             {dialogContent}
//           </Typography>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={() => setDialogOpen(false)} autoFocus>
//             Close
//           </Button>
//         </DialogActions>
//       </Dialog>

//       {/* Confirmation Dialog */}
//       <Dialog
//         open={confirmDialogOpen}
//         onClose={() => handleConfirmDialogClose(false)}
//         aria-labelledby="confirm-dialog-title"
//         aria-describedby="confirm-dialog-description"
//       >
//         <DialogTitle id="confirm-dialog-title">{confirmDialogTitle}</DialogTitle>
//         <DialogContent>
//           <Typography id="confirm-dialog-description">
//             {confirmDialogMessage}
//           </Typography>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={() => handleConfirmDialogClose(false)}>Cancel</Button>
//           <Button onClick={() => handleConfirmDialogClose(true)} autoFocus color="primary">
//             Confirm
//           </Button>
//         </DialogActions>
//       </Dialog>
//     </Box>
//   );
// }

import React, { useEffect, useRef, useState, useCallback, Fragment } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  MenuItem,
  Grid,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  CircularProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Divider,
  AppBar,
  Toolbar,
  Drawer,
  CssBaseline,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import CheckIcon from '@mui/icons-material/CheckOutlined';
import CloseIcon from '@mui/icons-material/CloseOutlined';
import LogoutIcon from '@mui/icons-material/Logout';
import GroupsIcon from '@mui/icons-material/Groups';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import AccountTreeIcon from '@mui/icons-material/AccountTree';

import { supabase } from '../supabase';
import { appTheme } from '../theme';

export default function TeamPage() {
  const [user, setUser] = useState(null);
  const [teams, setTeams] = useState([]);
  const [selectedTeamToJoin, setSelectedTeamToJoin] = useState('');
  const [userMemberships, setUserMemberships] = useState([]);
  const [currentTeam, setCurrentTeam] = useState(null);
  const [teamName, setTeamName] = useState('');
  const [description, setDescription] = useState('');
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [teamMembers, setTeamMembers] = useState([]);
  const [joinRequests, setJoinRequests] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [selectedAdminUserId, setSelectedAdminUserId] = useState('');
  const [isAppAdmin, setIsAppAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogContent, setDialogContent] = useState('');
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [confirmDialogAction, setConfirmDialogAction] = useState(null);
  const [confirmDialogTitle, setConfirmDialogTitle] = useState('');
  const [confirmDialogMessage, setConfirmDialogMessage] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);

  const messagesEndRef = useRef(null);
  const isCurrentUserTeamAdmin = currentTeam ? teamMembers.some(
    (member) => member.id === user?.id && member.role === 'admin'
  ) : false;

  const showNotification = useCallback((content) => {
    setDialogContent(content);
    setDialogOpen(true);
  }, []);

  const showConfirmDialog = useCallback((title, message, onConfirm) => {
    setConfirmDialogTitle(title);
    setConfirmDialogMessage(message);
    setConfirmDialogAction(() => onConfirm);
    setConfirmDialogOpen(true);
  }, []);

  const handleConfirmDialogClose = (confirmed) => {
    setConfirmDialogOpen(false);
    if (confirmed && confirmDialogAction) {
      confirmDialogAction();
    }
    setConfirmDialogAction(null);
  };
  
  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const fetchAllTeams = useCallback(async () => {
    try {
      const { data, error } = await supabase.from('teams').select('*');
      if (error) throw error;
      setTeams(data || []);
      console.log('fetchAllTeams: Fetched teams:', data);
    } catch (err) {
      console.error('Error fetching all teams:', err);
      setError(`Failed to load available teams: ${err.message}`);
    }
  }, []);

  const fetchUserMemberships = useCallback(async (currentUser) => {
    if (!currentUser) {
      setUserMemberships([]);
      setCurrentTeam(null);
      return;
    }
    try {
      const { data: memberships, error: memberError } = await supabase
        .from('team_members')
        .select('team_id, role, teams!fk_team_members_teams_on_delete_cascade_final(id, name, description, created_by)')
        .eq('user_id', currentUser.id);

      if (memberError) {
        console.error("Error fetching user's team memberships:", memberError);
        throw memberError;
      }

      const fetchedUserTeams = memberships?.map(m => ({
        id: m.team_id,
        role: m.role,
        ...m.teams,
      })) || [];

      setUserMemberships(fetchedUserTeams);
      console.log('fetchUserMemberships: User memberships:', fetchedUserTeams);

      if (fetchedUserTeams.length > 0) {
        const lastSelectedTeamId = localStorage.getItem('lastSelectedTeamId');
        const foundSavedTeam = fetchedUserTeams.find(team => team.id === lastSelectedTeamId);
        setCurrentTeam(foundSavedTeam || fetchedUserTeams[0]);
        console.log('fetchUserMemberships: Setting current team to:', foundSavedTeam || fetchedUserTeams[0]);
      } else {
        setCurrentTeam(null);
        console.log('fetchUserMemberships: No teams joined for user.');
      }
    } catch (err) {
      console.error("Error fetching user's team memberships:", err);
      setError(`Failed to load your team memberships: ${err.message}`);
    }
  }, []);

  const fetchMessages = useCallback(async (teamId) => {
    if (!teamId) {
      setMessages([]);
      return;
    }
    try {
      const { data, error } = await supabase
        .from('team_messages')
        .select('*, user_info(full_name, profile_url)')
        .eq('team_id', teamId)
        .order('created_at');
      if (error) console.error('Error fetching messages:', error);
      setMessages(data || []);
      console.log(`fetchMessages for team ${teamId}: Fetched and set messages:`, data);
    } catch (e) {
      console.error('Error fetching messages:', e);
    }
  }, []);

  const fetchTeamMembers = useCallback(async (teamId) => {
    try {
      const { data: membersData, error: membersError } = await supabase
        .from('team_members')
        .select('user_id, role')
        .eq('team_id', teamId)
        .order('role', { ascending: false });

      if (membersError) {
        console.error('Error fetching membersData:', membersError);
        throw membersError;
      }

      if (!membersData || membersData.length === 0) {
        setTeamMembers([]);
        console.log(`fetchTeamMembers for team ${teamId}: No members found.`);
        return;
      }

      const userIds = membersData.map(m => m.user_id);
      const { data: userInfoData, error: userInfoError } = await supabase
        .from('user_info')
        .select('id, full_name, profile_url')
        .in('id', userIds);

      if (userInfoError) {
        console.error('Error fetching userInfoData for members:', userInfoError);
        throw userInfoError;
      }

      const userInfoMap = new Map(userInfoData.map(u => [u.id, u]));

      const combinedMembers = membersData.map(member => {
        const userInfo = userInfoMap.get(member.user_id);
        return {
          id: member.user_id,
          role: member.role,
          full_name: userInfo?.full_name || 'Unknown User',
          profile_url: userInfo?.profile_url || '',
        };
      });

      setTeamMembers(combinedMembers);
      console.log(`fetchTeamMembers for team ${teamId}: Combined members:`, combinedMembers);
    } catch (err) {
      console.error('Error fetching team members:', err);
      setError(`Failed to load team members: ${err.message}`);
    }
  }, []);

  const fetchJoinRequests = useCallback(async (teamId) => {
    if (!user || !currentTeam || (!isAppAdmin && !isCurrentUserTeamAdmin)) {
      setJoinRequests([]);
      return;
    }
    try {
      const { data, error } = await supabase
        .from('team_join_requests_with_profiles')
        .select('id, user_id, status, created_at, full_name, profile_url')
        .eq('team_id', teamId)
        .eq('status', 'pending')
        .order('created_at');
      if (error) console.error('Error fetching join requests:', error);
      setJoinRequests(data || []);
      console.log(`fetchJoinRequests for team ${teamId}:`, data);
    } catch (err) {
      console.error('Error fetching join requests:', err);
      setError(`Failed to load join requests: ${err.message}`);
    }
  }, [user, currentTeam, isAppAdmin, isCurrentUserTeamAdmin]);

  const fetchAllUsersForAdminDropdown = useCallback(async () => {
    console.log('fetchAllUsersForAdminDropdown: Attempting to fetch all users...');
    try {
      const { data: users, error: usersError } = await supabase
        .from('user_info')
        .select('id, full_name')
        .order('full_name');
      if (usersError) {
        console.error("Error fetching all users for admin dropdown:", usersError);
      }
      setAllUsers(users || []);
      console.log("fetchAllUsersForAdminDropdown: Fetched users:", users);
    } catch (err) {
      console.error("Caught unexpected error in fetchAllUsersForAdminDropdown:", err);
    }
  }, []);

  const loadInitialData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: { user: currentUser }, error: authError } = await supabase.auth.getUser();
      if (authError || !currentUser) {
        setError('User not authenticated. Please log in.');
        setLoading(false);
        return;
      }
      setUser(currentUser);
      console.log('loadInitialData: Current User ID:', currentUser.id);

      const { data: profile, error: profileError } = await supabase
        .from('user_info')
        .select('is_admin')
        .eq('id', currentUser.id)
        .maybeSingle();

      if (profileError && profileError.code !== 'PGRST116') {
        console.error("Error fetching user profile for admin check:", profileError);
      }
      const isAdmin = profile?.is_admin === true;
      setIsAppAdmin(isAdmin);
      console.log('loadInitialData: Is App Admin status (from DB):', isAdmin);

      if (isAdmin) {
        await fetchAllUsersForAdminDropdown();
      } else {
        setAllUsers([]);
        console.log('loadInitialData: Not App Admin, allUsers cleared.');
      }

      await fetchUserMemberships(currentUser);
      await fetchAllTeams();
    } catch (err) {
      console.error('Initial data load error:', err);
      setError(`Failed to load initial data: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [fetchAllUsersForAdminDropdown, fetchUserMemberships, fetchAllTeams]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  const handleActiveTeamSelection = useCallback(async (event) => {
    const selectedId = event.target.value;
    const teamToActivate = userMemberships.find(m => m.id === selectedId);
    if (teamToActivate) {
      setLoading(true);
      setMessages([]);
      setTeamMembers([]);
      setJoinRequests([]);

      setCurrentTeam(teamToActivate);
      localStorage.setItem('lastSelectedTeamId', selectedId);

      try {
        await fetchMessages(teamToActivate.id);
        await fetchTeamMembers(teamToActivate.id);
        const isSelectedTeamAdmin = teamToActivate.role === 'admin' || isAppAdmin;
        if (user && isSelectedTeamAdmin) {
          await fetchJoinRequests(teamToActivate.id);
        } else {
          setJoinRequests([]);
        }
      } catch (e) {
        console.error("Error refreshing team data on selection:", e);
        setError(`Failed to refresh team data: ${e.message}`);
      } finally {
        setLoading(false);
      }
    }
  }, [userMemberships, user, isAppAdmin, fetchMessages, fetchTeamMembers, fetchJoinRequests]);

  useEffect(() => {
    if (!currentTeam?.id || !user) {
      setMessages([]);
      setTeamMembers([]);
      setJoinRequests([]);
      return () => {};
    }

    const setupSubscriptions = async () => {
      await fetchMessages(currentTeam.id);
      await fetchTeamMembers(currentTeam.id);

      if (isAppAdmin || isCurrentUserTeamAdmin) {
        await fetchJoinRequests(currentTeam.id);
      } else {
        setJoinRequests([]);
      }

      const chatChannel = supabase
        .channel(`team_chat_${currentTeam.id}`)
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'team_messages', filter: `team_id=eq.${currentTeam.id}` },
          () => fetchMessages(currentTeam.id)
        )
        .subscribe();

      const membersChannel = supabase
        .channel(`team_members_${currentTeam.id}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'team_members', filter: `team_id=eq.${currentTeam.id}` },
          async () => {
            await fetchTeamMembers(currentTeam.id);
            await fetchUserMemberships(user);
          }
        )
        .subscribe();

      const joinRequestsChannel = supabase
        .channel(`team_join_requests_${currentTeam.id}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'team_join_requests', filter: `team_id=eq.${currentTeam.id}` },
          () => {
            if (isAppAdmin || isCurrentUserTeamAdmin) {
              fetchJoinRequests(currentTeam.id);
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(chatChannel);
        supabase.removeChannel(membersChannel);
        supabase.removeChannel(joinRequestsChannel);
      };
    };

    const cleanupPromise = setupSubscriptions();
    return () => {
        cleanupPromise.then(cleanupFn => cleanupFn && cleanupFn());
    };
  }, [currentTeam?.id, user, isAppAdmin, isCurrentUserTeamAdmin, fetchMessages, fetchTeamMembers, fetchJoinRequests, fetchUserMemberships]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !currentTeam?.id || !user?.id) return;

    setLoading(true);
    try {
      const { error } = await supabase.from('team_messages').insert({
        team_id: currentTeam.id,
        user_id: user.id,
        message: newMessage,
      });

      if (error) throw error;
      setNewMessage('');
    } catch (e) {
      console.error('❌ Failed to send message:', e);
      showNotification(`Failed to send message: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTeam = async () => {
    if (!teamName.trim() || !user) {
      showNotification('Team name and user are required.');
      return;
    }

    if (!isAppAdmin) {
      showNotification("🚫 You're not allowed to create a team. App Admins only.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('teams')
        .insert({ name: teamName, description, created_by: user.id })
        .select()
        .single();

      if (error) throw error;

      await supabase.from('team_members').insert({
        team_id: data.id,
        user_id: user.id,
        role: 'admin',
      });

      setTeamName('');
      setDescription('');
      showNotification("✅ Team created successfully!");
      await loadInitialData();
    } catch (e) {
      console.error("❌ Failed to create team:", e);
      setError(`Failed to create team: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const requestToJoinTeam = async () => {
    if (!selectedTeamToJoin || !user?.id) {
      showNotification('Please select a team and ensure you are logged in.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data: existingMembership, error: memberError } = await supabase
        .from('team_members')
        .select('team_id, role, teams!fk_team_members_teams_on_delete_cascade_final(id, name, description, created_by)')
        .eq('team_id', selectedTeamToJoin)
        .eq('user_id', user.id)
        .limit(1);

      if (memberError) throw memberError;

      if (existingMembership.length > 0) {
        setCurrentTeam({
          id: existingMembership[0].team_id,
          role: existingMembership[0].role,
          ...existingMembership[0].teams,
        });
        showNotification("You are already a member of this team. Setting it as your active team.");
        setSelectedTeamToJoin('');
        setLoading(false);
        return;
      }

      const { data: existingRequest, error: requestError } = await supabase
        .from('team_join_requests')
        .select('id')
        .eq('team_id', selectedTeamToJoin)
        .eq('user_id', user.id)
        .eq('status', 'pending')
        .limit(1);

      if (requestError) throw requestError;

      if (existingRequest.length > 0) {
        showNotification("You have already sent a join request to this team. Please wait for approval.");
        setSelectedTeamToJoin('');
        setLoading(false);
        return;
      }

      const { error } = await supabase.from('team_join_requests').insert({
        team_id: selectedTeamToJoin,
        user_id: user.id,
        status: 'pending',
      });
      if (error) throw error;

      showNotification("✅ Your join request has been sent successfully! Please wait for a team admin to approve it.");
      setSelectedTeamToJoin('');
    } catch (e) {
      console.error("❌ Failed to send join request:", e);
      setError(`Failed to send join request: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const approveRequest = async (requestId, requestingUserId) => {
    setLoading(true);
    setError(null);
    try {
      if (!isAppAdmin && !isCurrentUserTeamAdmin) {
        showNotification("🚫 You do not have permission to approve requests.");
        setLoading(false);
        return;
      }

      showConfirmDialog("Approve Request", "Are you sure you want to approve this request?", async () => {
        const { data: existingMember, error: checkError } = await supabase
          .from('team_members')
          .select('id, role')
          .eq('team_id', currentTeam.id)
          .eq('user_id', requestingUserId)
          .single();

        if (checkError && checkError.code === 'PGRST116') {
          const { error: memberInsertError } = await supabase.from('team_members').insert({
            team_id: currentTeam.id,
            user_id: requestingUserId,
            role: 'member',
          });
          if (memberInsertError) throw memberInsertError;
        } else if (checkError) {
          throw checkError;
        } else {
          console.log("User is already a member, skipping insert in approveRequest.");
        }

        const { error: requestUpdateError } = await supabase.from('team_join_requests')
          .update({ status: 'approved' })
          .eq('id', requestId);
        if (requestUpdateError) throw requestUpdateError;

        showNotification("✅ Join request approved!");
        fetchTeamMembers(currentTeam.id);
        fetchJoinRequests(currentTeam.id);
      });
    } catch (e) {
      console.error("❌ Failed to approve request:", e);
      setError(`Failed to approve request: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const rejectRequest = async (requestId) => {
    setLoading(true);
    setError(null);
    try {
      if (!isAppAdmin && !isCurrentUserTeamAdmin) {
        showNotification("🚫 You do not have permission to reject requests.");
        setLoading(false);
        return;
      }

      showConfirmDialog("Reject Request", "Are you sure you want to reject this request?", async () => {
        const { error } = await supabase.from('team_join_requests')
          .update({ status: 'rejected' })
          .eq('id', requestId);
        if (error) throw error;

        showNotification("❌ Join request rejected.");
        fetchJoinRequests(currentTeam.id);
      });
    } catch (e) {
      console.error("❌ Failed to reject request:", e);
      setError(`Failed to reject request: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const assignTeamAdmin = async () => {
    if (!currentTeam?.id || !selectedAdminUserId) {
      showNotification("Please select a team and a user to assign admin role.");
      return;
    }
    if (!isAppAdmin && !isCurrentUserTeamAdmin) {
      showNotification("🚫 You do not have permission to assign team admins.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const { data: existingMember, error: checkError } = await supabase
        .from('team_members')
        .select('id, role')
        .eq('team_id', currentTeam.id)
        .eq('user_id', selectedAdminUserId)
        .single();

      if (checkError && checkError.code === 'PGRST116') {
        showNotification("Selected user is not yet a member of this team. Please add them to the team first (e.g., by approving their join request).");
        setLoading(false);
        return;
      } else if (checkError) {
        throw checkError;
      }

      if (existingMember.role === 'admin') {
        showNotification("Selected user is already an admin of this team.");
        setLoading(false);
        return;
      }

      const { error: updateError } = await supabase.from('team_members')
        .update({ role: 'admin' })
        .eq('team_id', currentTeam.id)
        .eq('user_id', selectedAdminUserId);

      if (updateError) throw updateError;

      showNotification("✅ Team admin assigned!");
      await loadInitialData();
      setSelectedAdminUserId('');
    } catch (e) {
      console.error("❌ Failed to assign admin:", e);
      setError(`Failed to assign admin: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const removeMember = async (memberIdToRemove) => {
    if (!currentTeam?.id || !memberIdToRemove) return;
    if (memberIdToRemove === user?.id) {
      showNotification("You cannot remove yourself using this action. Please use 'Leave Team'.");
      return;
    }

    const targetMember = teamMembers.find(m => m.id === memberIdToRemove);
    const otherAdmins = teamMembers.filter(m => m.role === 'admin' && m.id !== memberIdToRemove);

    if (targetMember && targetMember.role === 'admin' && !isAppAdmin && otherAdmins.length === 0) {
      showNotification("Cannot remove the last team admin directly. Please assign another admin first, or delete the team.");
      return;
    }

    if (!isAppAdmin && !isCurrentUserTeamAdmin) {
      showNotification("🚫 You do not have permission to remove members.");
      return;
    }

    setLoading(true);
    setError(null);
    showConfirmDialog("Remove Member", "Are you sure you want to remove this member?", async () => {
      try {
        const { error } = await supabase
          .from('team_members')
          .delete()
          .eq('team_id', currentTeam.id)
          .eq('user_id', memberIdToRemove);

        if (error) throw error;

        showNotification("✅ Member removed successfully!");
        fetchTeamMembers(currentTeam.id);
        if (memberIdToRemove === user?.id) {
          await fetchUserMemberships(user);
        }
      } catch (e) {
        console.error("❌ Failed to remove member:", e);
        setError(`Failed to remove member: ${e.message}`);
      } finally {
        setLoading(false);
      }
    });
  };

  const leaveTeam = async () => {
    if (!currentTeam?.id || !user?.id) return;
    setLoading(true);
    setError(null);
    try {
      const currentUserMembership = userMemberships.find(m => m.id === currentTeam.id && m.user_id === user.id);
      const otherAdmins = teamMembers.filter(m => m.role === 'admin' && m.id !== user.id);

      if (currentUserMembership?.role === 'admin' && otherAdmins.length === 0) {
        showNotification("You are the only admin of this team. Please assign another admin before leaving, or delete the team.");
        setLoading(false);
        return;
      }

      showConfirmDialog("Leave Team", "Are you sure you want to leave the team?", async () => {
        const { error } = await supabase.from('team_members')
          .delete()
          .eq('team_id', currentTeam.id)
          .eq('user_id', user.id);

        if (error) throw error;

        showNotification("✅ You have left the team.");
        setCurrentTeam(null);
        setUserMemberships(prev => prev.filter(m => m.id !== currentTeam.id));
        localStorage.removeItem('lastSelectedTeamId');
        setMessages([]);
        setTeamMembers([]);
        setJoinRequests([]);
        fetchAllTeams();
      });
    } catch (e) {
      console.error("❌ Failed to leave team:", e);
      setError(`Failed to leave team: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const deleteTeam = async () => {
    if (!currentTeam?.id) return;
    if (currentTeam.created_by !== user?.id && !isAppAdmin) {
      showNotification("🚫 You do not have permission to delete this team.");
      return;
    }

    setLoading(true);
    setError(null);
    showConfirmDialog("Delete Team", "⚠️ Are you sure you want to delete this team? This action cannot be undone.", async () => {
      try {
        const deletedTeamId = currentTeam.id;

        const { error } = await supabase.from('teams').delete().eq('id', deletedTeamId);
        if (error) throw error;

        showNotification("✅ Team deleted successfully!");

        await loadInitialData();
        localStorage.removeItem('lastSelectedTeamId');
        setMessages([]);
        setTeamMembers([]);
        setJoinRequests([]);
      } catch (e) {
        console.error("❌ Failed to delete team:", e);
        setError(`Failed to delete team: ${e.message}`);
      } finally {
        setLoading(false);
      }
    });
  };

  // --- UI Rendering ---
  if (loading && !user) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>Loading user data...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        <Button variant="contained" onClick={() => window.location.reload()}>Retry</Button>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: appTheme.palette.background.default }}>
      <CssBaseline />
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, bgcolor: appTheme.palette.primary.main }}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerToggle}
            edge="start"
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Team Management
            {userMemberships.length > 0 && (
              <Typography component="span" variant="h6" color="inherit" sx={{ ml: 2 }}>
                ({userMemberships.length} team{userMemberships.length !== 1 ? 's' : ''} joined)
              </Typography>
            )}
          </Typography>
          {currentTeam && (
            <Typography variant="body1" sx={{ ml: 2, color: 'white' }}>
              Active Team: {currentTeam.name}
            </Typography>
          )}
        </Toolbar>
      </AppBar>

      <Drawer
        variant="temporary"
        open={drawerOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          width: 280,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: 280, boxSizing: 'border-box', bgcolor: appTheme.palette.secondary.dark, color: appTheme.palette.text.primary },
        }}
      >
        <Toolbar sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', px: 1 }}>
          <IconButton onClick={handleDrawerToggle} sx={{ color: appTheme.palette.text.primary }}>
            <ChevronLeftIcon />
          </IconButton>
        </Toolbar>
        <Divider sx={{ bgcolor: appTheme.palette.primary.light }} />
        <Box sx={{ p: 2 }}>
          {/* Section: Select Active Team */}
          {userMemberships.length > 0 && (
            <Card sx={{ mb: 2, bgcolor: appTheme.palette.background.paper }}>
              <CardContent>
                <Typography variant="subtitle1" gutterBottom>
                  <AccountTreeIcon sx={{ verticalAlign: 'middle', mr: 1 }} /> Select Your Active Team
                </Typography>
                <TextField
                  select
                  label="My Teams"
                  fullWidth
                  value={currentTeam?.id || ''}
                  onChange={handleActiveTeamSelection}
                  margin="normal"
                  size="small"
                  disabled={loading}
                  InputLabelProps={{ sx: { color: appTheme.palette.text.secondary } }}
                  InputProps={{ sx: { color: appTheme.palette.text.primary } }}
                  SelectProps={{ MenuProps: { PaperProps: { sx: { bgcolor: appTheme.palette.background.paper } } } }}
                >
                  {userMemberships.map((team) => (
                    <MenuItem key={team.id} value={team.id} sx={{ color: appTheme.palette.text.primary }}>
                      {team.name} ({team.role === 'admin' ? 'Admin' : 'Member'})
                    </MenuItem>
                  ))}
                </TextField>
              </CardContent>
            </Card>
          )}

          {/* Section: Create New Team (App Admin Only) */}
          {isAppAdmin && (
            <Card sx={{ mb: 2, bgcolor: appTheme.palette.background.paper }}>
              <CardContent>
                <Typography variant="subtitle1" gutterBottom>
                  <GroupsIcon sx={{ verticalAlign: 'middle', mr: 1 }} /> Create New Team
                </Typography>
                <TextField
                  fullWidth
                  label="Team Name"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  margin="normal"
                  size="small"
                  disabled={loading}
                  InputLabelProps={{ sx: { color: appTheme.palette.text.secondary } }}
                  InputProps={{ sx: { color: appTheme.palette.text.primary } }}
                />
                <TextField
                  fullWidth
                  label="Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  margin="normal"
                  multiline
                  rows={2}
                  size="small"
                  disabled={loading}
                  InputLabelProps={{ sx: { color: appTheme.palette.text.secondary } }}
                  InputProps={{ sx: { color: appTheme.palette.text.primary } }}
                />
              </CardContent>
              <Box sx={{ p: 2, pt: 0 }}>
                <Button variant="contained" fullWidth onClick={handleCreateTeam} disabled={loading || !teamName.trim()}
                  sx={{ bgcolor: appTheme.palette.success.main, '&:hover': { bgcolor: appTheme.palette.success.dark } }}>
                  Create Team {loading && <CircularProgress size={20} sx={{ ml: 1, color: 'white' }} />}
                </Button>
              </Box>
            </Card>
          )}

          {/* Section: Join Existing Team */}
          {(!currentTeam || userMemberships.length === 0) && (
            <Card sx={{ mb: 2, bgcolor: appTheme.palette.background.paper }}>
              <CardContent>
                <Typography variant="subtitle1" gutterBottom>
                  <PersonAddIcon sx={{ verticalAlign: 'middle', mr: 1 }} /> Join an Existing Team
                </Typography>
                <TextField
                  select
                  label="Select a team"
                  fullWidth
                  value={selectedTeamToJoin}
                  onChange={(e) => setSelectedTeamToJoin(e.target.value)}
                  margin="normal"
                  size="small"
                  disabled={loading}
                  InputLabelProps={{ sx: { color: appTheme.palette.text.secondary } }}
                  InputProps={{ sx: { color: appTheme.palette.text.primary } }}
                  SelectProps={{ MenuProps: { PaperProps: { sx: { bgcolor: appTheme.palette.background.paper } } } }}
                >
                  {teams.length === 0 ? (
                    <MenuItem disabled value="" sx={{ color: appTheme.palette.text.primary }}>No teams available</MenuItem>
                  ) : (
                    teams.map((team) => (
                      <MenuItem key={team.id} value={team.id} sx={{ color: appTheme.palette.text.primary }}>
                        {team.name}
                      </MenuItem>
                    ))
                  )}
                </TextField>
              </CardContent>
              <Box sx={{ p: 2, pt: 0 }}>
                <Button variant="contained" fullWidth onClick={requestToJoinTeam} disabled={!selectedTeamToJoin || loading}
                  sx={{ bgcolor: appTheme.palette.info.main, '&:hover': { bgcolor: appTheme.palette.info.dark } }}>
                  Request to Join {loading && <CircularProgress size={20} sx={{ ml: 1, color: 'white' }} />}
                </Button>
              </Box>
            </Card>
          )}

          {/* Section: Pending Join Requests */}
          {currentTeam && (isAppAdmin || isCurrentUserTeamAdmin) && (
            <Card sx={{ bgcolor: appTheme.palette.background.paper }}>
              <CardContent>
                <Typography variant="subtitle1" gutterBottom>
                  <PersonAddIcon sx={{ verticalAlign: 'middle', mr: 1 }} /> Pending Join Requests
                </Typography>
                {joinRequests.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">No pending requests.</Typography>
                ) : (
                  <List dense>
                    {joinRequests.map((req) => (
                      <ListItem key={req.id} secondaryAction={
                        <Box>
                          <IconButton edge="end" aria-label="approve" onClick={() => approveRequest(req.id, req.user_id)} disabled={loading}>
                            <CheckIcon color="success" />
                          </IconButton>
                          <IconButton edge="end" aria-label="reject" onClick={() => rejectRequest(req.id)} disabled={loading}>
                            <CloseIcon color="error" />
                          </IconButton>
                        </Box>
                      }>
                        <ListItemAvatar>
                          <Avatar src={req.profile_url || ''} alt={req.full_name?.charAt(0) || 'U'} />
                        </ListItemAvatar>
                        <ListItemText
                          primary={req.full_name}
                          secondary={`Requested on: ${new Date(req.created_at).toLocaleDateString()}`}
                          sx={{ color: appTheme.palette.text.primary }}
                        />
                      </ListItem>
                    ))}
                  </List>
                )}
              </CardContent>
            </Card>
          )}
        </Box>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8 }}>
        <Toolbar />
        <Grid container spacing={4}>
          {/* Team Chat */}
          {currentTeam && (
            <Grid item xs={12} md={8}>
              <Card sx={{ bgcolor: appTheme.palette.background.paper }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
                    <Typography variant="h6" component="div">
                      <ChatBubbleOutlineIcon sx={{ verticalAlign: 'middle', mr: 1 }} /> Team Chat: <strong>{currentTeam.name}</strong>
                      <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                        (Your Role: {currentTeam.role === 'admin' ? 'Admin' : 'Member'})
                      </Typography>
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button variant="outlined" color="warning" startIcon={<LogoutIcon />} onClick={leaveTeam} disabled={loading}>
                        Leave Team
                      </Button>
                      {(isAppAdmin || currentTeam.created_by === user?.id) && (
                        <Button variant="outlined" color="error" startIcon={<DeleteIcon />} onClick={deleteTeam} disabled={loading}>
                          Delete Team
                        </Button>
                      )}
                    </Box>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {currentTeam.description}
                  </Typography>

                  <Divider sx={{ mb: 2, bgcolor: appTheme.palette.divider }} />

                  <Box
                    sx={{
                      maxHeight: 300,
                      minHeight: 150,
                      overflowY: 'auto',
                      border: '1px solid',
                      borderColor: appTheme.palette.divider,
                      borderRadius: 2,
                      p: 1.5,
                      display: 'flex',
                      flexDirection: 'column',
                      bgcolor: appTheme.palette.background.default,
                    }}
                  >
                    {messages.length === 0 && (
                      <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                        No messages yet. Start the conversation!
                      </Typography>
                    )}
                    {messages.map((msg) => (
                      <Box
                        key={msg.id}
                        sx={{
                          display: 'flex',
                          flexDirection: msg.user_id === user?.id ? 'row-reverse' : 'row',
                          alignItems: 'flex-start',
                          gap: 1,
                          mb: 1.5,
                        }}
                      >
                        <Avatar
                          src={msg.user_info?.profile_url || ''}
                          alt={msg.user_info?.full_name?.charAt(0) || 'U'}
                        />
                        <Box
                          sx={{
                            p: 1.2,
                            borderRadius: 2,
                            bgcolor: msg.user_id === user?.id ? appTheme.palette.primary.dark : appTheme.palette.grey[800],
                            color: 'white',
                            maxWidth: '75%',
                            wordBreak: 'break-word',
                          }}
                        >
                          <Typography variant="caption" fontWeight="bold" sx={{ display: 'block', mb: 0.5 }}>
                            {msg.user_info?.full_name || 'Anonymous'}
                          </Typography>
                          <Typography variant="body2">
                            {msg.message}
                          </Typography>
                          <Typography variant="caption" sx={{ display: 'block', mt: 0.5, color: appTheme.palette.grey[400], textAlign: msg.user_id === user?.id ? 'left' : 'right' }}>
                            {new Date(msg.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                    <div ref={messagesEndRef} />
                  </Box>
                  <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                    <TextField
                      fullWidth
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          sendMessage();
                          e.preventDefault();
                        }
                      }}
                      disabled={loading}
                      InputProps={{ sx: { color: appTheme.palette.text.primary } }}
                      InputLabelProps={{ sx: { color: appTheme.palette.text.secondary } }}
                    />
                    <Button variant="contained" onClick={sendMessage} disabled={loading || !newMessage.trim()}
                      sx={{ bgcolor: appTheme.palette.success.main, '&:hover': { bgcolor: appTheme.palette.success.dark } }}>
                      Send
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          )}

          {currentTeam && (
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: appTheme.palette.background.paper }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" gutterBottom>
                    👥 Team Members
                  </Typography>
                  <List dense>
                    {teamMembers.length === 0 ? (
                      <ListItem><ListItemText primary="No members yet." sx={{ color: appTheme.palette.text.secondary }} /></ListItem>
                    ) : (
                      teamMembers.map((member) => (
                        <ListItem key={member.id} secondaryAction={
                          (isAppAdmin || isCurrentUserTeamAdmin) && member.id !== user?.id && (
                            <IconButton edge="end" aria-label="remove" onClick={() => removeMember(member.id)} disabled={loading}>
                              <DeleteIcon color="error" />
                            </IconButton>
                          )
                        }>
                          <ListItemAvatar>
                            <Avatar src={member.profile_url || ''} alt={member.full_name?.charAt(0) || 'U'} />
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Typography variant="body1" component="span" fontWeight={member.role === 'admin' ? 'bold' : 'normal'} sx={{ color: appTheme.palette.text.primary }}>
                                  {member.full_name}
                                </Typography>
                                {member.role === 'admin' && (
                                  <Typography component="span" variant="caption" sx={{ ml: 1, px: 1, py: 0.5, borderRadius: '4px', bgcolor: appTheme.palette.primary.dark, color: 'white' }}>
                                    Admin
                                  </Typography>
                                )}
                              </Box>
                            }
                          />
                        </ListItem>
                      ))
                    )}
                  </List>

                  {(isAppAdmin || isCurrentUserTeamAdmin) && (
                    <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid', borderColor: appTheme.palette.divider }}>
                      <Typography variant="h6" gutterBottom>
                        <AdminPanelSettingsIcon sx={{ verticalAlign: 'middle', mr: 1 }} /> Assign Team Admin
                      </Typography>
                      <TextField
                        select
                        fullWidth
                        label="Select user to make team admin"
                        value={selectedAdminUserId}
                        onChange={(e) => setSelectedAdminUserId(e.target.value)}
                        margin="normal"
                        size="small"
                        disabled={loading}
                        InputLabelProps={{ sx: { color: appTheme.palette.text.secondary } }}
                        InputProps={{ sx: { color: appTheme.palette.text.primary } }}
                        SelectProps={{ MenuProps: { PaperProps: { sx: { bgcolor: appTheme.palette.background.paper } } } }}
                      >
                        {allUsers.length === 0 ? (
                          <MenuItem disabled value="" sx={{ color: appTheme.palette.text.primary }}>No users available</MenuItem>
                        ) : (
                          allUsers.map((appUser) => (
                            <MenuItem key={appUser.id} value={appUser.id} sx={{ color: appTheme.palette.text.primary }}>
                              {appUser.full_name}
                            </MenuItem>
                          ))
                        )}
                      </TextField>
                      <Button
                        variant="contained"
                        fullWidth
                        sx={{ mt: 1, bgcolor: appTheme.palette.primary.main, '&:hover': { bgcolor: appTheme.palette.primary.dark } }}
                        onClick={assignTeamAdmin}
                        disabled={!selectedAdminUserId || loading}
                      >
                        Assign as Admin {loading && <CircularProgress size={20} sx={{ ml: 1, color: 'white' }} />}
                      </Button>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>
      </Box>

      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        aria-labelledby="notification-dialog-title"
        aria-describedby="notification-dialog-description"
      >
        <DialogTitle id="notification-dialog-title">{"Notification"}</DialogTitle>
        <DialogContent>
          <Typography id="notification-dialog-description">
            {dialogContent}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} autoFocus>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={confirmDialogOpen}
        onClose={() => handleConfirmDialogClose(false)}
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-description"
      >
        <DialogTitle id="confirm-dialog-title">{confirmDialogTitle}</DialogTitle>
        <DialogContent>
          <Typography id="confirm-dialog-description">
            {confirmDialogMessage}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => handleConfirmDialogClose(false)}>Cancel</Button>
          <Button onClick={() => handleConfirmDialogClose(true)} autoFocus color="primary">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}