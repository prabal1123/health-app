// // src/components/SideNav.jsx
// import React, { useEffect, useRef, useState } from 'react'
// import {
//   Box,
//   Divider,
//   IconButton,
//   List,
//   ListItemButton,
//   Tooltip,
//   Button,
//   Popover,
//   Typography,
//   Avatar,
//   CircularProgress,
// } from '@mui/material'
// import DashboardIcon from '@mui/icons-material/Dashboard'
// import GroupIcon from '@mui/icons-material/Group'
// import LeaderboardIcon from '@mui/icons-material/Leaderboard' // ADDED: Import the Leaderboard icon
// import FitnessCenterIcon from '@mui/icons-material/FitnessCenter'
// import LogoutIcon from '@mui/icons-material/Logout'
// import { useNavigate } from 'react-router-dom'
// import { supabase } from '../supabase'

// const navItems = [
//   { icon: <DashboardIcon />, label: 'Dashboard', path: '/dashboard' },
//   { icon: <GroupIcon />, label: 'Team', path: '/team' },
//   { icon: <LeaderboardIcon />, label: 'Leaderboard', path: '/leaderboard' }, // CHANGED: Replaced "Contact" with "Leaderboard"
//   { icon: <FitnessCenterIcon />, label: 'Tracker', path: '/tracker' },
// ]

// export default function SideNav() {
//   const navigate = useNavigate()
//   const [anchorEl, setAnchorEl] = useState(null)
//   const [profile, setProfile] = useState(null)
//   const [uploading, setUploading] = useState(false)
//   const fileInputRef = useRef(null)

//   useEffect(() => {
//     const fetchProfile = async () => {
//       const { data: { user } } = await supabase.auth.getUser()
//       if (!user) return

//       let { data, error } = await supabase
//         .from('user_info')
//         .select('*')
//         .eq('id', user.id)
//         .single()

//       if (error && error.code === 'PGRST116') {
//         await supabase.from('user_info').insert({
//           id: user.id,
//           full_name: user.user_metadata?.full_name || 'User',
//         })

//         const { data: newProfile } = await supabase
//           .from('user_info')
//           .select('*')
//           .eq('id', user.id)
//           .single()

//         setProfile({ ...newProfile, id: user.id })
//       } else {
//         setProfile({ ...data, id: user.id })
//       }
//     }

//     fetchProfile()
//   }, [])

//   const handleAvatarClick = (event) => setAnchorEl(event.currentTarget)
//   const handleClose = () => setAnchorEl(null)
//   const handleUploadClick = () => fileInputRef.current?.click()

//   const handleFileChange = async (e) => {
//     const file = e.target.files[0]
//     if (!file || !profile?.id) return

//     setUploading(true)
//     const fileExt = file.name.split('.').pop()
//     const fileName = `${profile.id}.${fileExt}`

//     const { error: uploadError } = await supabase.storage
//       .from('avatars')
//       .upload(fileName, file, { cacheControl: '3600', upsert: true })

//     if (uploadError) {
//       alert('Upload failed: ' + uploadError.message)
//       setUploading(false)
//       return
//     }

//     const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(fileName)
//     const publicUrl = urlData?.publicUrl

//     const { error: updateError } = await supabase
//       .from('user_info')
//       .update({ profile_url: publicUrl })
//       .eq('id', profile.id)

//     if (updateError) {
//       alert('Failed to save image URL: ' + updateError.message)
//     } else {
//       setProfile((prev) => ({ ...prev, profile_url: publicUrl }))
//     }

//     setUploading(false)
//   }

//   const open = Boolean(anchorEl)

//   return (
//     <Box
//       component="nav"
//       sx={{
//         width: 84,
//         flexShrink: 0,
//         bgcolor: 'primary.main',
//         color: 'white',
//         py: 2,
//         display: 'flex',
//         flexDirection: 'column',
//         alignItems: 'center',
//         gap: 2,
//         height: '100vh',
//       }}
//     >
//       <IconButton onClick={handleAvatarClick} sx={{ mb: 4 }}>
//         {uploading ? (
//           <CircularProgress size={48} sx={{ color: 'white' }} />
//         ) : (
//           <Avatar
//             src={profile?.profile_url || ''}
//             sx={{ width: 48, height: 48, bgcolor: '#fff', color: '#333' }}
//           >
//             {!profile?.profile_url && profile?.full_name?.[0]}
//           </Avatar>
//         )}
//       </IconButton>

//       <input
//         type="file"
//         accept="image/*"
//         ref={fileInputRef}
//         style={{ display: 'none' }}
//         onChange={handleFileChange}
//       />

//       <Popover
//         open={open}
//         anchorEl={anchorEl}
//         onClose={handleClose}
//         anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
//         transformOrigin={{ vertical: 'top', horizontal: 'right' }}
//         PaperProps={{ sx: { p: 2, minWidth: 240, borderRadius: 3 } }}
//       >
//         <Box textAlign="center">
//           {uploading ? (
//             <CircularProgress size={64} sx={{ mx: 'auto', my: 2 }} />
//           ) : (
//             <Avatar
//               src={profile?.profile_url || ''}
//               sx={{
//                 width: 64,
//                 height: 64,
//                 mx: 'auto',
//                 bgcolor: '#ccc',
//                 cursor: 'pointer',
//               }}
//               onClick={handleUploadClick}
//             >
//               {!profile?.profile_url && profile?.full_name?.[0]}
//             </Avatar>
//           )}

//           <Typography
//             variant="caption"
//             color="text.secondary"
//             align="center"
//             sx={{ cursor: 'pointer', mt: 0.5 }}
//             onClick={handleUploadClick}
//           >
//             Click here to upload image
//           </Typography>

//           <Typography fontWeight={600} sx={{ mt: 1 }}>
//             {profile?.full_name || 'User'}
//           </Typography>
//         </Box>

//         <Typography variant="body2" sx={{ mt: 1 }}>
//           Gender: {profile?.gender || '—'}
//         </Typography>
//         <Typography variant="body2">DOB: {profile?.dob || '—'}</Typography>
//         <Typography variant="body2">
//           Height: {profile?.height_cm} cm
//         </Typography>
//         <Typography variant="body2">
//           Weight: {profile?.weight_kg} kg
//         </Typography>

//         <Button
//           fullWidth
//           variant="outlined"
//           size="small"
//           sx={{ mt: 1 }}
//           onClick={() => {
//             handleClose()
//             navigate('/profile-setup')
//           }}
//         >
//           Edit Profile
//         </Button>

//         <Button
//           fullWidth
//           variant="text"
//           color="error"
//           size="small"
//           sx={{ mt: 1 }}
//           onClick={async () => {
//             await supabase.auth.signOut()
//             window.location.href = '/login'
//           }}
//         >
//           Logout
//         </Button>
//       </Popover>

//       <List sx={{ width: '100%' }}>
//         {navItems.map(({ icon, label, path }) => (
//           <Tooltip key={label} title={label} placement="right">
//             <ListItemButton
//               onClick={() => navigate(path)}
//               sx={{
//                 display: 'flex',
//                 justifyContent: 'center',
//                 py: 1.5,
//                 '&.Mui-selected, &:hover': {
//                   bgcolor: 'rgba(255,255,255,0.15)',
//                 },
//               }}
//             >
//               <IconButton disableRipple sx={{ color: 'inherit' }}>
//                 {icon}
//               </IconButton>
//             </ListItemButton>
//           </Tooltip>
//         ))}
//       </List>

//       <Divider
//         flexItem
//         sx={{ borderColor: 'rgba(255,255,255,0.3)', mt: 'auto', mb: 1 }}
//       />
//     </Box>
//   )
// }

// src/components/SideNav.jsx
import React, { useEffect, useRef, useState, useContext } from 'react'
import {
  Box,
  Divider,
  IconButton,
  List,
  ListItemButton,
  Tooltip,
  Button,
  Popover,
  Typography,
  Avatar,
  CircularProgress,
} from '@mui/material'
import DashboardIcon from '@mui/icons-material/Dashboard'
import GroupIcon from '@mui/icons-material/Group'
import LeaderboardIcon from '@mui/icons-material/Leaderboard' // ADDED: Import the Leaderboard icon
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter'
import LogoutIcon from '@mui/icons-material/Logout'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'
import { AuthContext } from '../AuthContext'


const navItems = [
  { icon: <DashboardIcon />, label: 'Dashboard', path: '/dashboard' },
  { icon: <GroupIcon />, label: 'Team', path: '/team' },
  { icon: <LeaderboardIcon />, label: 'Leaderboard', path: '/leaderboard' }, // CHANGED: Replaced "Contact" with "Leaderboard"
  { icon: <FitnessCenterIcon />, label: 'Tracker', path: '/tracker' },
]

export default function SideNav() {
  const { user, profile: authProfile, loading: authLoading } = useContext(AuthContext); // Use AuthContext
  const navigate = useNavigate()
  const [anchorEl, setAnchorEl] = useState(null)
  const [profile, setProfile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef(null)

  useEffect(() => {
    // Wait for the AuthContext to finish loading and a user to be present
    if (!authLoading && user) {
      // Use the profile from AuthContext if available, otherwise fetch it.
      // This reduces redundant fetches.
      if (authProfile) {
        setProfile(authProfile);
      } else {
        const fetchProfile = async () => {
          let { data, error } = await supabase
            .from('user_info')
            .select('*')
            .eq('id', user.id)
            .single()
  
          if (error && error.code === 'PGRST116') {
            await supabase.from('user_info').insert({
              id: user.id,
              full_name: user.user_metadata?.full_name || 'User',
            })
            const { data: newProfile } = await supabase
              .from('user_info')
              .select('*')
              .eq('id', user.id)
              .single()
            setProfile({ ...newProfile, id: user.id })
          } else {
            setProfile({ ...data, id: user.id })
          }
        }
        fetchProfile()
      }
    }
  }, [authLoading, user, authProfile])

  const handleAvatarClick = (event) => setAnchorEl(event.currentTarget)
  const handleClose = () => setAnchorEl(null)
  const handleUploadClick = () => fileInputRef.current?.click()

  const handleFileChange = async (e) => {
    const file = e.target.files[0]
    if (!file || !profile?.id) return

    setUploading(true)
    const fileExt = file.name.split('.').pop()
    const fileName = `${profile.id}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, file, { cacheControl: '3600', upsert: true })

    if (uploadError) {
      alert('Upload failed: ' + uploadError.message)
      setUploading(false)
      return
    }

    const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(fileName)
    const publicUrl = urlData?.publicUrl

    const { error: updateError } = await supabase
      .from('user_info')
      .update({ profile_url: publicUrl })
      .eq('id', profile.id)

    if (updateError) {
      alert('Failed to save image URL: ' + updateError.message)
    } else {
      setProfile((prev) => ({ ...prev, profile_url: publicUrl }))
    }

    setUploading(false)
  }

  const open = Boolean(anchorEl)

  return (
    <Box
      component="nav"
      sx={{
        width: 84,
        flexShrink: 0,
        bgcolor: 'primary.main',
        color: 'white',
        py: 2,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2,
        height: '100vh',
      }}
    >
      <IconButton onClick={handleAvatarClick} sx={{ mb: 4 }}>
        {uploading ? (
          <CircularProgress size={48} sx={{ color: 'white' }} />
        ) : (
          <Avatar
            src={profile?.profile_url || ''}
            sx={{ width: 48, height: 48, bgcolor: '#fff', color: '#333' }}
          >
            {!profile?.profile_url && profile?.full_name?.[0]}
          </Avatar>
        )}
      </IconButton>

      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{ sx: { p: 2, minWidth: 240, borderRadius: 3 } }}
      >
        <Box textAlign="center">
          {uploading ? (
            <CircularProgress size={64} sx={{ mx: 'auto', my: 2 }} />
          ) : (
            <Avatar
              src={profile?.profile_url || ''}
              sx={{
                width: 64,
                height: 64,
                mx: 'auto',
                bgcolor: '#ccc',
                cursor: 'pointer',
              }}
              onClick={handleUploadClick}
            >
              {!profile?.profile_url && profile?.full_name?.[0]}
            </Avatar>
          )}

          <Typography
            variant="caption"
            color="text.secondary"
            align="center"
            sx={{ cursor: 'pointer', mt: 0.5 }}
            onClick={handleUploadClick}
          >
            Click here to upload image
          </Typography>

          <Typography fontWeight={600} sx={{ mt: 1 }}>
            {profile?.full_name || 'User'}
          </Typography>
        </Box>

        <Typography variant="body2" sx={{ mt: 1 }}>
          Gender: {profile?.gender || '—'}
        </Typography>
        <Typography variant="body2">DOB: {profile?.dob || '—'}</Typography>
        <Typography variant="body2">
          Height: {profile?.height_cm} cm
        </Typography>
        <Typography variant="body2">
          Weight: {profile?.weight_kg} kg
        </Typography>

        <Button
          fullWidth
          variant="outlined"
          size="small"
          sx={{ mt: 1 }}
          onClick={() => {
            handleClose()
            navigate('/profile-setup')
          }}
        >
          Edit Profile
        </Button>

        <Button
          fullWidth
          variant="text"
          color="error"
          size="small"
          sx={{ mt: 1 }}
          onClick={async () => {
            await supabase.auth.signOut()
            window.location.href = '/login'
          }}
        >
          Logout
        </Button>
      </Popover>

      <List sx={{ width: '100%' }}>
        {navItems.map(({ icon, label, path }) => (
          <Tooltip key={label} title={label} placement="right">
            <ListItemButton
              onClick={() => navigate(path)}
              sx={{
                display: 'flex',
                justifyContent: 'center',
                py: 1.5,
                '&.Mui-selected, &:hover': {
                  bgcolor: 'rgba(255,255,255,0.15)',
                },
              }}
            >
              <IconButton disableRipple sx={{ color: 'inherit' }}>
                {icon}
              </IconButton>
            </ListItemButton>
          </Tooltip>
        ))}
      </List>

      <Divider
        flexItem
        sx={{ borderColor: 'rgba(255,255,255,0.3)', mt: 'auto', mb: 1 }}
      />
    </Box>
  )
}
