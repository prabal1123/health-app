// // src/pages/OtpVerifyPage.jsx
// import React, { useState, useEffect, useContext } from 'react';
// import { supabase } from '../supabase'; // Your Supabase client
// import { useNavigate, useSearchParams } from 'react-router-dom';
// import {
//   Box,
//   TextField,
//   Button,
//   Typography,
//   Paper,
//   Fade,
//   CircularProgress,
//   Alert,
// } from '@mui/material';
// import { AuthContext } from '../AuthContext'; // Import AuthContext

// export default function OtpVerifyPage() {
//   const [otp, setOtp] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [message, setMessage] = useState('');

//   const navigate = useNavigate();
//   const [searchParams] = useSearchParams();
//   const email = searchParams.get('email'); // Get email from query parameter if passed from LoginPage

//   const { user, profile, loading: authLoading } = useContext(AuthContext); // Get user and profile from AuthContext

//   // Effect to handle redirection if user is already authenticated or profile is complete
//   useEffect(() => {
//     if (!authLoading && user) {
//       // If AuthContext has finished loading and a user is present
//       if (profile && profile.is_profile_complete) {
//         navigate('/dashboard'); // Profile complete, go to dashboard
//       } else {
//         navigate('/profile-setup'); // Profile incomplete, go to profile setup
//       }
//     }
//     // If no email is provided in query params, prompt user to go back to login
//     if (!email) {
//       setError('Email address is missing. Please return to the login page to receive an OTP.');
//     } else {
//       setMessage(`An OTP has been sent to ${email}. Please check your inbox.`);
//     }
//   }, [authLoading, user, profile, email, navigate]);

//   const handleOtpVerification = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError(null);
//     setMessage('');

//     if (!email) {
//       setError('Cannot verify OTP: Email address is missing.');
//       setLoading(false);
//       return;
//     }
//     if (!otp) {
//       setError('Please enter the OTP.');
//       setLoading(false);
//       return;
//     }

//     try {
//       // Use supabase.auth.verifyOtp to verify the email and OTP
//       const { data: { user: verifiedUser, session }, error: otpError } = await supabase.auth.verifyOtp({
//         email,
//         token: otp,
//         type: 'email', // Specify the type as 'email' for email OTP verification
//       });

//       if (otpError) {
//         setError(otpError.message);
//       } else if (verifiedUser && session) {
//         // OTP successfully verified. AuthContext will now detect the SIGNED_IN event
//         // and handle the redirection based on profile completion.
//         setMessage('OTP verified successfully! Redirecting...');
//         // The useEffect above, listening to authLoading/user/profile, will handle the navigation.
//       } else {
//         setError('OTP verification failed. Please try again.');
//       }
//     } catch (err) {
//       console.error('Error during OTP verification:', err);
//       setError('An unexpected error occurred during OTP verification.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (authLoading) {
//     return (
//       <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
//         <CircularProgress />
//         <Typography variant="h6" sx={{ ml: 2 }}>Loading session...</Typography>
//       </Box>
//     );
//   }

//   return (
//     <Box
//       sx={{
//         height: "100vh",
//         width: "100vw",
//         backgroundColor: "#1b2b2a",
//         display: "flex",
//         justifyContent: "center",
//         alignItems: "center",
//         px: 2,
//         backgroundImage:
//           "radial-gradient(circle at 30% 20%, rgba(255,255,255,0.03), rgba(0,0,0,0) 60%)",
//       }}
//     >
//       <Fade in timeout={300}>
//         <Paper
//           elevation={8}
//           sx={{
//             p: 4,
//             width: "100%",
//             maxWidth: 400,
//             borderRadius: 4,
//             backgroundColor: "#0f1d1c",
//             color: "#fff",
//           }}
//         >
//           <Typography variant="h5" align="center" fontWeight={600} gutterBottom>
//             Email Verification
//           </Typography>

//           <Typography
//             variant="body2"
//             align="center"
//             sx={{ mb: 2, color: "#ccc" }}
//           >
//             Please enter the One-Time Password sent to your email.
//           </Typography>

//           {message && <Alert severity="info" sx={{ mb: 2 }}>{message}</Alert>}
//           {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

//           <Box component="form" onSubmit={handleOtpVerification}>
//             <TextField
//               label="One-Time Password (OTP)"
//               name="otp"
//               type="text"
//               value={otp}
//               onChange={(e) => setOtp(e.target.value)}
//               fullWidth
//               required
//               margin="normal"
//               InputProps={{ sx: { color: "#fff" } }}
//               InputLabelProps={{ sx: { color: "#aaa" } }}
//             />

//             <Button
//               type="submit"
//               fullWidth
//               variant="contained"
//               sx={{
//                 mt: 3,
//                 bgcolor: "#94bfa2",
//                 color: "#000",
//                 "&:hover": { bgcolor: "#a2cdb0" },
//               }}
//               disabled={loading}
//             >
//               {loading ? 'Verifying...' : 'Verify OTP'}
//             </Button>
//           </Box>

//           <Typography
//             variant="body2"
//             align="center"
//             sx={{ mt: 3, color: "#80cbc4", cursor: "pointer" }}
//             onClick={() => navigate('/login')}
//           >
//             Go back to Login
//           </Typography>
//         </Paper>
//       </Fade>
//     </Box>
//   );
// }

// src/pages/OtpVerifyPage.jsx
import React, { useState, useEffect, useContext } from 'react';
import { supabase } from '../supabase';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Fade,
  CircularProgress,
  Alert,
} from '@mui/material';
import { AuthContext } from '../AuthContext';

export default function OtpVerifyPage() {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email'); // Get email from query parameter if passed from LoginPage

  const { user, profile, loading: authLoading } = useContext(AuthContext); // Get user and profile from AuthContext

  // Effect to handle redirection if user is already authenticated (e.g., via Magic Link)
  useEffect(() => {
    if (!authLoading) { // Ensure AuthContext has finished its initial loading
      if (user) {
        // User is already authenticated (likely by Magic Link).
        // AuthContext already handles redirection based on profile completion.
        // We just need to make sure this page doesn't hang.
        console.log("OtpVerifyPage: User already authenticated. Redirecting via AuthContext.");
        // AuthContext's useEffect will handle the actual navigation to /dashboard or /profile-setup
        // based on profile.is_profile_complete.
        // We can add a small delay or just let AuthContext take over.
        // For immediate feedback, we can directly navigate if AuthContext hasn't yet.
        if (profile && profile.is_profile_complete) {
          navigate('/dashboard');
        } else if (profile) { // Profile exists but is incomplete
          navigate('/profile-setup');
        } else { // User exists but profile not yet fetched/created (should be handled by trigger)
          // Wait for AuthContext to fetch profile, then it will redirect.
          // Or, as a fallback, navigate to profile setup if no profile yet.
          navigate('/profile-setup');
        }
      } else {
        // User is not authenticated. This page is expecting an OTP or a Magic Link redirect.
        if (!email) {
          setError('Email address is missing. Please return to the login page to receive an OTP/Magic Link.');
        } else {
          setMessage(`Please enter the OTP sent to ${email}. (Note: If you received a Magic Link, clicking it will log you in directly.)`);
        }
      }
    }
  }, [authLoading, user, profile, email, navigate]);


  const handleOtpVerification = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage('');

    if (!email) {
      setError('Cannot verify OTP: Email address is missing.');
      setLoading(false);
      return;
    }
    if (!otp) {
      setError('Please enter the OTP.');
      setLoading(false);
      return;
    }

    try {
      const { data: { user: verifiedUser, session }, error: otpError } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'email',
      });

      if (otpError) {
        setError(otpError.message);
      } else if (verifiedUser && session) {
        setMessage('OTP verified successfully! Redirecting...');
        // AuthContext will now detect the SIGNED_IN event and handle the redirection.
      } else {
        setError('OTP verification failed. Please try again.');
      }
    } catch (err) {
      console.error('Error during OTP verification:', err);
      setError('An unexpected error occurred during OTP verification.');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>Loading session...</Typography>
      </Box>
    );
  }

  // Only show OTP input if user is NOT authenticated and email is present
  const showOtpInputForm = !user && email;

  return (
    <Box
      sx={{
        height: "100vh",
        width: "100vw",
        backgroundColor: "#1b2b2a",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        px: 2,
        backgroundImage:
          "radial-gradient(circle at 30% 20%, rgba(255,255,255,0.03), rgba(0,0,0,0) 60%)",
      }}
    >
      <Fade in timeout={300}>
        <Paper
          elevation={8}
          sx={{
            p: 4,
            width: "100%",
            maxWidth: 400,
            borderRadius: 4,
            backgroundColor: "#0f1d1c",
            color: "#fff",
          }}
        >
          <Typography variant="h5" align="center" fontWeight={600} gutterBottom>
            Email Verification
          </Typography>

          <Typography
            variant="body2"
            align="center"
            sx={{ mb: 2, color: "#ccc" }}
          >
            {user ? "You are already logged in." : "Please enter the One-Time Password sent to your email."}
          </Typography>

          {message && <Alert severity="info" sx={{ mb: 2 }}>{message}</Alert>}
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          {showOtpInputForm ? (
            <Box component="form" onSubmit={handleOtpVerification}>
              <TextField
                label="One-Time Password (OTP)"
                name="otp"
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                fullWidth
                required
                margin="normal"
                InputProps={{ sx: { color: "#fff" } }}
                InputLabelProps={{ sx: { color: "#aaa" } }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{
                  mt: 3,
                  bgcolor: "#94bfa2",
                  color: "#000",
                  "&:hover": { bgcolor: "#a2cdb0" },
                }}
                disabled={loading}
              >
                {loading ? 'Verifying...' : 'Verify OTP'}
              </Button>
            </Box>
          ) : (
            // Display a message and button to go to dashboard/login if form is not shown
            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Typography variant="body1" sx={{ color: '#ccc', mb: 2 }}>
                {user ? "You are already logged in. Redirecting..." : "Please return to the login page."}
              </Typography>
              <Button
                variant="outlined"
                onClick={() => user ? navigate('/dashboard') : navigate('/login')}
                fullWidth
              >
                {user ? "Go to Dashboard" : "Go to Login"}
              </Button>
            </Box>
          )}

          <Typography
            variant="body2"
            align="center"
            sx={{ mt: 3, color: "#80cbc4", cursor: "pointer" }}
            onClick={() => navigate('/login')}
          >
            Go back to Login
          </Typography>
        </Paper>
      </Fade>
    </Box>
  );
}
