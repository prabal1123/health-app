// // src/components/PrivateRoute.jsx

import React, { useContext } from 'react';
import { AuthContext } from '../AuthContext';
import { Navigate, useLocation } from 'react-router-dom';
import { CircularProgress, Box, Typography } from '@mui/material';

export default function PrivateRoute({ children }) {
  const { user, loading, profile } = useContext(AuthContext);
  const location = useLocation();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', flexDirection: 'column' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>Loading session...</Typography>
      </Box>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check if the user is logged in, but the profile is incomplete.
  // We add a check to ensure we are not already on the profile-setup page to prevent a redirect loop.
  if ((!profile || !profile.is_profile_complete) && location.pathname !== '/profile-setup') {
    return <Navigate to="/profile-setup" replace />;
  }

  // If the user is logged in and the profile is complete, render the children.
  return children;
}