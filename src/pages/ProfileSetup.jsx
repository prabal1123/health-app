
// import React, { useState, useContext, useEffect, useCallback } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { supabase } from '../supabase';
// import {
//   Box,
//   TextField,
//   Button,
//   Typography,
//   Container,
//   Paper,
//   Alert,
//   CircularProgress,
//   Fade,
//   InputAdornment,
//   MenuItem,
//   FormControlLabel,
//   Switch,
// } from '@mui/material';
// import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
// import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
// import SyncProblemIcon from '@mui/icons-material/SyncProblem';
// import VpnKeyIcon from '@mui/icons-material/VpnKey';
// import { AuthContext } from '../AuthContext';

// // --- DEMO AADHAAR VALIDATION & OTP ---
// const DEMO_VALID_AADHAAR = ['123456789012', '987654321098', '111122223333'];
// const AADHAAR_LENGTH = 12;
// const DEMO_OTP_CODE = '123456';

// const simulateAadhaarVerification = async (aadhaarNumber) => {
//   return new Promise((resolve) => {
//     setTimeout(() => {
//       if (aadhaarNumber.length !== AADHAAR_LENGTH || !/^\d+$/.test(aadhaarNumber)) {
//         resolve({ success: false, message: 'Invalid Aadhaar format. Must be 12 digits.' });
//       } else if (DEMO_VALID_AADHAAR.includes(aadhaarNumber)) {
//         resolve({ success: true, message: 'Aadhaar recognized. Please enter OTP.' });
//       } else {
//         resolve({ success: false, message: 'Aadhaar not recognized (Demo).' });
//       }
//     }, 1000);
//   });
// };

// const simulateOtpVerification = async (otp) => {
//   return new Promise((resolve) => {
//     setTimeout(() => {
//       if (otp === DEMO_OTP_CODE) {
//         resolve({ success: true, message: 'OTP Verified (Demo).' });
//       } else {
//         resolve({ success: false, message: 'Invalid OTP (Demo).' });
//       }
//     }, 500);
//   });
// };
// // --- END DEMO AADHAAR VALIDATION & OTP ---


// export default function ProfileSetup() {
//   const navigate = useNavigate();
//   const { user, profile, setProfile } = useContext(AuthContext);
//   const [loading, setLoading] = useState(true);
//   const [submitting, setSubmitting] = useState(false);

//   const [form, setForm] = useState({
//     full_name: '',
//     gender: '',
//     dob: '',
//     height_cm: '',
//     weight_kg: '',
//     aadhaar_number: '',
//   });

//   const [isAnonymous, setIsAnonymous] = useState(false);

//   const [aadhaarVerificationStatus, setAadhaarVerificationStatus] = useState('idle');
//   const [aadhaarVerificationMessage, setAadhaarVerificationMessage] = useState('');
//   const [otp, setOtp] = useState('');
//   const [otpSentMessage, setOtpSentMessage] = useState('');

//   const [error, setError] = useState(null);

//   useEffect(() => {
//     if (!user) {
//       setLoading(false);
//       return;
//     }
    
//     // Check if the profile is not yet loaded
//     if (!profile) {
//       return;
//     }

//     // Set the form with profile data once it's available
//     setForm({
//       full_name: profile.full_name || '',
//       gender: profile.gender || '',
//       dob: profile.dob || '',
//       height_cm: profile.height_cm || '',
//       weight_kg: profile.weight_kg || '',
//       aadhaar_number: profile.aadhaar_number || '',
//     });
//     setIsAnonymous(profile.is_anonymous || false);

//     if (profile.aadhaar_number) {
//       setAadhaarVerificationStatus('verified');
//       setAadhaarVerificationMessage('Aadhaar already registered.');
//     } else {
//       setAadhaarVerificationStatus('idle');
//     }

//     setLoading(false);
//   }, [user, profile]);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setForm((prev) => ({ ...prev, [name]: value }));

//     if (name === 'aadhaar_number') {
//       setAadhaarVerificationStatus('idle');
//       setAadhaarVerificationMessage('');
//       setOtp('');
//       setOtpSentMessage('');
//       setError(null);
//     }
//   };
  
//   const handleAnonymityChange = (e) => {
//     setIsAnonymous(e.target.checked);
//   };

//   const handleAadhaarChange = (e) => {
//     const value = e.target.value.replace(/\D/g, '');
//     setForm((prev) => ({ ...prev, aadhaar_number: value }));
//     setAadhaarVerificationStatus('idle');
//     setAadhaarVerificationMessage('');
//     setOtp('');
//     setOtpSentMessage('');
//     setError(null);
//   };

//   const handleOtpChange = (e) => {
//     const value = e.target.value.replace(/\D/g, '');
//     setOtp(value);
//     setError(null);
//   };

//   const handleVerifyAadhaar = useCallback(async () => {
//     setError(null);
//     if (!form.aadhaar_number) {
//       setAadhaarVerificationStatus('failed');
//       setAadhaarVerificationMessage('Please enter your Aadhaar number.');
//       return;
//     }
//     if (form.aadhaar_number.length !== AADHAAR_LENGTH) {
//       setAadhaarVerificationStatus('failed');
//       setAadhaarVerificationMessage(`Aadhaar number must be ${AADHAAR_LENGTH} digits long.`);
//       return;
//     }

//     setAadhaarVerificationStatus('verifying_aadhaar');
//     setAadhaarVerificationMessage('Verifying Aadhaar...');

//     const result = await simulateAadhaarVerification(form.aadhaar_number);

//     if (result.success) {
//       setAadhaarVerificationStatus('aadhaar_verified_awaiting_otp');
//       setAadhaarVerificationMessage(result.message);
//       setOtpSentMessage(`(Demo: Enter OTP: ${DEMO_OTP_CODE})`);
//       setOtp('');
//     } else {
//       setAadhaarVerificationStatus('failed');
//       setAadhaarVerificationMessage(result.message);
//       setError(result.message);
//     }
//   }, [form.aadhaar_number]);

//   const handleOtpSubmit = useCallback(async () => {
//     setError(null);
//     if (!otp) {
//       setError('Please enter the OTP.');
//       return;
//     }

//     setAadhaarVerificationStatus('verifying_otp');
//     setAadhaarVerificationMessage('Verifying OTP...');

//     const result = await simulateOtpVerification(otp);

//     if (result.success) {
//       setAadhaarVerificationStatus('verified');
//       setAadhaarVerificationMessage(result.message);
//       setOtpSentMessage('');
//     } else {
//       setAadhaarVerificationStatus('aadhaar_verified_awaiting_otp');
//       setAadhaarVerificationMessage('Aadhaar recognized. Invalid OTP. Please try again.');
//       setError(result.message);
//     }
//   }, [otp]);


//   const handleSubmit = async (event) => {
//     event.preventDefault();
//     setSubmitting(true);
//     setError(null);

//     if (!form.full_name || !form.gender || !form.dob || !form.height_cm || !form.weight_kg || !form.aadhaar_number || aadhaarVerificationStatus !== 'verified') {
//       setError('Please fill in all mandatory fields and ensure your Aadhaar number is fully verified.');
//       setSubmitting(false);
//       return;
//     }

//     if (!user) {
//       setError('User not authenticated.');
//       setSubmitting(false);
//       return;
//     }

//     try {
//       const updates = {
//         id: user.id,
//         email: user.email,
//         full_name: form.full_name,
//         gender: form.gender,
//         dob: form.dob,
//         height_cm: Number(form.height_cm),
//         weight_kg: Number(form.weight_kg),
//         aadhaar_number: form.aadhaar_number,
//         is_anonymous: isAnonymous,
//         updated_at: new Date().toISOString(),
//         is_profile_complete: true,
//       };

//       const { data, error: dbError } = await supabase
//         .from('user_info')
//         .upsert(updates, { onConflict: 'id' })
//         .select();

//       if (dbError) {
//         throw dbError;
//       } else {
//         console.log('ProfileSetup upsert returned data:', data[0]);
//         setProfile(data[0]);
//         navigate('/dashboard');
//       }
//     } catch (error) {
//       console.error('Error updating profile:', error.message);
//       setError('Failed to update profile: ' + error.message);
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   const isAadhaarFieldDisabled = aadhaarVerificationStatus === 'verified' ||
//                                  aadhaarVerificationStatus === 'verifying_aadhaar' ||
//                                  aadhaarVerificationStatus === 'verifying_otp';

//   const showOtpInput = aadhaarVerificationStatus === 'aadhaar_verified_awaiting_otp' ||
//                        aadhaarVerificationStatus === 'verifying_otp';

//   if (loading) {
//     return (
//       <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
//         <CircularProgress />
//         <Typography variant="h6" sx={{ ml: 2 }}>Loading profile...</Typography>
//       </Box>
//     );
//   }

//   return (
//     <Container component="main" maxWidth="sm" sx={{ py: 4 }}>
//       <Paper elevation={3} sx={{ p: { xs: 2, md: 4 }, borderRadius: 2 }}>
//         <Typography component="h1" variant="h5" align="center" gutterBottom>
//           Complete Your Profile
//         </Typography>
//         <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
//           Please provide your details to get started with the app.
//         </Typography>
//         {error && (
//           <Alert severity="error" sx={{ mb: 2 }}>
//             {error}
//           </Alert>
//         )}
//         <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
//           <TextField
//             margin="normal"
//             required
//             fullWidth
//             id="fullName"
//             label="Full Name"
//             name="full_name"
//             autoComplete="name"
//             autoFocus
//             value={form.full_name}
//             onChange={handleChange}
//             disabled={submitting}
//           />
//           <TextField
//             margin="normal"
//             required
//             fullWidth
//             id="gender"
//             label="Gender"
//             name="gender"
//             select
//             value={form.gender}
//             onChange={handleChange}
//             disabled={submitting}
//           >
//             <MenuItem value="">Select Gender</MenuItem>
//             <MenuItem value="male">Male</MenuItem>
//             <MenuItem value="female">Female</MenuItem>
//             <MenuItem value="other">Other</MenuItem>
//           </TextField>
//           <TextField
//             margin="normal"
//             required
//             fullWidth
//             id="dob"
//             label="Date of Birth"
//             name="dob"
//             type="date"
//             InputLabelProps={{ shrink: true }}
//             value={form.dob}
//             onChange={handleChange}
//             disabled={submitting}
//           />
//           <TextField
//             name="height_cm"
//             label="Height (cm)"
//             type="number"
//             fullWidth
//             required
//             margin="normal"
//             value={form.height_cm}
//             onChange={handleChange}
//           />
//           <TextField
//             name="weight_kg"
//             label="Weight (kg)"
//             type="number"
//             fullWidth
//             required
//             margin="normal"
//             value={form.weight_kg}
//             onChange={handleChange}
//           />
          
//           <FormControlLabel
//             control={
//               <Switch
//                 checked={isAnonymous}
//                 onChange={handleAnonymityChange}
//                 color="primary"
//               />
//             }
//             label="Appear anonymously on the leaderboard"
//             sx={{ mt: 2 }}
//           />

//           <TextField
//             margin="normal"
//             required
//             fullWidth
//             id="aadhaarNumber"
//             label="Aadhaar Number"
//             name="aadhaar_number"
//             inputProps={{ maxLength: AADHAAR_LENGTH, pattern: '\\d*' }}
//             value={form.aadhaar_number}
//             onChange={handleAadhaarChange}
//             disabled={isAadhaarFieldDisabled}
//             error={aadhaarVerificationStatus === 'failed'}
//             helperText={aadhaarVerificationMessage || (form.aadhaar_number && aadhaarVerificationStatus === 'idle' && 'Enter 12 digits and verify')}
//             InputProps={{
//               endAdornment: (
//                 <InputAdornment position="end">
//                   {aadhaarVerificationStatus === 'verifying_aadhaar' && <CircularProgress size={20} />}
//                   {(aadhaarVerificationStatus === 'idle' || aadhaarVerificationStatus === 'failed') &&
//                    form.aadhaar_number.length === AADHAAR_LENGTH &&
//                    !isAadhaarFieldDisabled && (
//                     <Button
//                       variant="outlined"
//                       size="small"
//                       onClick={handleVerifyAadhaar}
//                       disabled={submitting}
//                     >
//                       Verify
//                     </Button>
//                   )}
//                 </InputAdornment>
//               ),
//             }}
//           />

//           <Fade in={showOtpInput} timeout={300}>
//             {showOtpInput ? (
//               <Box sx={{ mt: 2 }}>
//                 <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
//                   {otpSentMessage}
//                 </Typography>
//                 <TextField
//                   margin="normal"
//                   required
//                   fullWidth
//                   id="otp"
//                   label="Enter OTP"
//                   name="otp"
//                   inputProps={{ maxLength: 6, pattern: '\\d*' }}
//                   value={otp}
//                   onChange={handleOtpChange}
//                   disabled={submitting || aadhaarVerificationStatus === 'verifying_otp'}
//                   InputProps={{
//                     endAdornment: (
//                       <InputAdornment position="end">
//                         {aadhaarVerificationStatus === 'verifying_otp' && <CircularProgress size={20} />}
//                         {(aadhaarVerificationStatus === 'aadhaar_verified_awaiting_otp' || aadhaarVerificationStatus === 'failed') && (
//                           <Button
//                             variant="outlined"
//                             size="small"
//                             onClick={handleOtpSubmit}
//                             disabled={submitting || otp.length !== 6}
//                           >
//                             Submit OTP
//                           </Button>
//                         )}
//                       </InputAdornment>
//                     ),
//                     startAdornment: (
//                       <InputAdornment position="start">
//                         <VpnKeyIcon sx={{ color: 'text.secondary' }} />
//                       </InputAdornment>
//                     ),
//                   }}
//                 />
//               </Box>
//             ) : (
//               <Box />
//             )}
//           </Fade>

//           <Button
//             type="submit"
//             fullWidth
//             variant="contained"
//             sx={{ mt: 3, mb: 2 }}
//             disabled={submitting || aadhaarVerificationStatus !== 'verified'}
//           >
//             {submitting ? <CircularProgress size={24} color="inherit" /> : 'Save Profile'}
//           </Button>
//           <Button
//             variant="outlined"
//             onClick={() => navigate('/dashboard')}
//             disabled={submitting}
//             fullWidth
//             sx={{ mb: 2 }}
//           >
//             Continue to Dashboard (Skip for now)
//           </Button>
//         </Box>
//       </Paper>
//     </Container>
//   );
// }


// src/pages/ProfileSetup.jsx
import React, { useState, useContext, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import {
  Box,
  TextField,
  Button,
  Typography,
  Container,
  Paper,
  Alert,
  CircularProgress,
  Fade,
  InputAdornment,
  MenuItem,
  FormControlLabel,
  Switch,
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import SyncProblemIcon from '@mui/icons-material/SyncProblem';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import { AuthContext } from '../AuthContext';

// --- DEMO AADHAAR VALIDATION & OTP ---
const DEMO_VALID_AADHAAR = ['123456789012', '987654321098', '111122223333'];
const AADHAAR_LENGTH = 12;
const DEMO_OTP_CODE = '123456';

const simulateAadhaarVerification = async (aadhaarNumber) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (aadhaarNumber.length !== AADHAAR_LENGTH || !/^\d+$/.test(aadhaarNumber)) {
        resolve({ success: false, message: 'Invalid Aadhaar format. Must be 12 digits.' });
      } else if (DEMO_VALID_AADHAAR.includes(aadhaarNumber)) {
        resolve({ success: true, message: 'Aadhaar recognized. Please enter OTP.' });
      } else {
        resolve({ success: false, message: 'Aadhaar not recognized (Demo).' });
      }
    }, 1000);
  });
};

const simulateOtpVerification = async (otp) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (otp === DEMO_OTP_CODE) {
        resolve({ success: true, message: 'OTP Verified (Demo).' });
      } else {
        resolve({ success: false, message: 'Invalid OTP (Demo).' });
      }
    }, 500);
  });
};
// --- END DEMO AADHAAR VALIDATION & OTP ---


export default function ProfileSetup() {
  const navigate = useNavigate();
  const { user, profile, setProfile } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    full_name: '',
    gender: '',
    dob: '',
    height_cm: '',
    weight_kg: '',
    aadhaar_number: '',
  });

  const [isAnonymous, setIsAnonymous] = useState(false);

  const [aadhaarVerificationStatus, setAadhaarVerificationStatus] = useState('idle');
  const [aadhaarVerificationMessage, setAadhaarVerificationMessage] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSentMessage, setOtpSentMessage] = useState('');

  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      // ✅ ADDED: Navigate back to the login page if there's no user
      navigate('/login');
      return;
    }
    
    // ✅ CHANGED: The loading state should be managed here
    if (profile) {
      setForm({
        full_name: profile.full_name || '',
        gender: profile.gender || '',
        dob: profile.dob || '',
        height_cm: profile.height_cm || '',
        weight_kg: profile.weight_kg || '',
        aadhaar_number: profile.aadhaar_number || '',
      });
      setIsAnonymous(profile.is_anonymous || false);

      if (profile.aadhaar_number) {
        setAadhaarVerificationStatus('verified');
        setAadhaarVerificationMessage('Aadhaar already registered.');
      } else {
        setAadhaarVerificationStatus('idle');
      }
      setLoading(false);
    } else {
      // ✅ ADDED: Show a loading state if the profile is not yet available
      setLoading(true);
    }
  }, [user, profile, navigate]); 

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    if (name === 'aadhaar_number') {
      setAadhaarVerificationStatus('idle');
      setAadhaarVerificationMessage('');
      setOtp('');
      setOtpSentMessage('');
      setError(null);
    }
  };
  
  const handleAnonymityChange = (e) => {
    setIsAnonymous(e.target.checked);
  };

  const handleAadhaarChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    setForm((prev) => ({ ...prev, aadhaar_number: value }));
    setAadhaarVerificationStatus('idle');
    setAadhaarVerificationMessage('');
    setOtp('');
    setOtpSentMessage('');
    setError(null);
  };

  const handleOtpChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    setOtp(value);
    setError(null);
  };

  const handleVerifyAadhaar = useCallback(async () => {
    setError(null);
    if (!form.aadhaar_number) {
      setAadhaarVerificationStatus('failed');
      setAadhaarVerificationMessage('Please enter your Aadhaar number.');
      return;
    }
    if (form.aadhaar_number.length !== AADHAAR_LENGTH) {
      setAadhaarVerificationStatus('failed');
      setAadhaarVerificationMessage(`Aadhaar number must be ${AADHAAR_LENGTH} digits long.`);
      return;
    }

    setAadhaarVerificationStatus('verifying_aadhaar');
    setAadhaarVerificationMessage('Verifying Aadhaar...');

    const result = await simulateAadhaarVerification(form.aadhaar_number);

    if (result.success) {
      setAadhaarVerificationStatus('aadhaar_verified_awaiting_otp');
      setAadhaarVerificationMessage(result.message);
      setOtpSentMessage(`(Demo: Enter OTP: ${DEMO_OTP_CODE})`);
      setOtp('');
    } else {
      setAadhaarVerificationStatus('failed');
      setAadhaarVerificationMessage(result.message);
      setError(result.message);
    }
  }, [form.aadhaar_number]);

  const handleOtpSubmit = useCallback(async () => {
    setError(null);
    if (!otp) {
      setError('Please enter the OTP.');
      return;
    }

    setAadhaarVerificationStatus('verifying_otp');
    setAadhaarVerificationMessage('Verifying OTP...');

    const result = await simulateOtpVerification(otp);

    if (result.success) {
      setAadhaarVerificationStatus('verified');
      setAadhaarVerificationMessage(result.message);
      setOtpSentMessage('');
    } else {
      setAadhaarVerificationStatus('aadhaar_verified_awaiting_otp');
      setAadhaarVerificationMessage('Aadhaar recognized. Invalid OTP. Please try again.');
      setError(result.message);
    }
  }, [otp]);


  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    if (!form.full_name || !form.gender || !form.dob || !form.height_cm || !form.weight_kg || !form.aadhaar_number || aadhaarVerificationStatus !== 'verified') {
      setError('Please fill in all mandatory fields and ensure your Aadhaar number is fully verified.');
      setSubmitting(false);
      return;
    }

    if (!user) {
      setError('User not authenticated.');
      setSubmitting(false);
      return;
    }

    try {
      const updates = {
        id: user.id,
        email: user.email,
        full_name: form.full_name,
        gender: form.gender,
        dob: form.dob,
        height_cm: Number(form.height_cm),
        weight_kg: Number(form.weight_kg),
        aadhaar_number: form.aadhaar_number,
        is_anonymous: isAnonymous,
        updated_at: new Date().toISOString(),
        is_profile_complete: true,
      };

      const { data, error: dbError } = await supabase
        .from('user_info')
        .upsert(updates, { onConflict: 'id' })
        .select();

      if (dbError) {
        throw dbError;
      } else {
        console.log('ProfileSetup upsert returned data:', data[0]);
        setProfile(data[0]);
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Error updating profile:', error.message);
      setError('Failed to update profile: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const isAadhaarFieldDisabled = aadhaarVerificationStatus === 'verified' ||
                                 aadhaarVerificationStatus === 'verifying_aadhaar' ||
                                 aadhaarVerificationStatus === 'verifying_otp';

  const showOtpInput = aadhaarVerificationStatus === 'aadhaar_verified_awaiting_otp' ||
                       aadhaarVerificationStatus === 'verifying_otp';

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>Loading profile...</Typography>
      </Box>
    );
  }

  return (
    <Container component="main" maxWidth="sm" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: { xs: 2, md: 4 }, borderRadius: 2 }}>
        <Typography component="h1" variant="h5" align="center" gutterBottom>
          Complete Your Profile
        </Typography>
        <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
          Please provide your details to get started with the app.
        </Typography>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="fullName"
            label="Full Name"
            name="full_name"
            autoComplete="name"
            autoFocus
            value={form.full_name}
            onChange={handleChange}
            disabled={submitting}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            id="gender"
            label="Gender"
            name="gender"
            select
            value={form.gender}
            onChange={handleChange}
            disabled={submitting}
          >
            <MenuItem value="">Select Gender</MenuItem>
            <MenuItem value="male">Male</MenuItem>
            <MenuItem value="female">Female</MenuItem>
            <MenuItem value="other">Other</MenuItem>
          </TextField>
          <TextField
            margin="normal"
            required
            fullWidth
            id="dob"
            label="Date of Birth"
            name="dob"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={form.dob}
            onChange={handleChange}
            disabled={submitting}
          />
          <TextField
            name="height_cm"
            label="Height (cm)"
            type="number"
            fullWidth
            required
            margin="normal"
            value={form.height_cm}
            onChange={handleChange}
          />
          <TextField
            name="weight_kg"
            label="Weight (kg)"
            type="number"
            fullWidth
            required
            margin="normal"
            value={form.weight_kg}
            onChange={handleChange}
          />
          
          <FormControlLabel
            control={
              <Switch
                checked={isAnonymous}
                onChange={handleAnonymityChange}
                color="primary"
              />
            }
            label="Appear anonymously on the leaderboard"
            sx={{ mt: 2 }}
          />

          <TextField
            margin="normal"
            required
            fullWidth
            id="aadhaarNumber"
            label="Aadhaar Number"
            name="aadhaar_number"
            inputProps={{ maxLength: AADHAAR_LENGTH, pattern: '\\d*' }}
            value={form.aadhaar_number}
            onChange={handleAadhaarChange}
            disabled={isAadhaarFieldDisabled}
            error={aadhaarVerificationStatus === 'failed'}
            helperText={aadhaarVerificationMessage || (form.aadhaar_number && aadhaarVerificationStatus === 'idle' && 'Enter 12 digits and verify')}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  {aadhaarVerificationStatus === 'verifying_aadhaar' && <CircularProgress size={20} />}
                  {(aadhaarVerificationStatus === 'idle' || aadhaarVerificationStatus === 'failed') &&
                   form.aadhaar_number.length === AADHAAR_LENGTH &&
                   !isAadhaarFieldDisabled && (
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={handleVerifyAadhaar}
                      disabled={submitting}
                    >
                      Verify
                    </Button>
                  )}
                </InputAdornment>
              ),
            }}
          />

          <Fade in={showOtpInput} timeout={300}>
            {showOtpInput ? (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {otpSentMessage}
                </Typography>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="otp"
                  label="Enter OTP"
                  name="otp"
                  inputProps={{ maxLength: 6, pattern: '\\d*' }}
                  value={otp}
                  onChange={handleOtpChange}
                  disabled={submitting || aadhaarVerificationStatus === 'verifying_otp'}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        {aadhaarVerificationStatus === 'verifying_otp' && <CircularProgress size={20} />}
                        {(aadhaarVerificationStatus === 'aadhaar_verified_awaiting_otp' || aadhaarVerificationStatus === 'failed') && (
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={handleOtpSubmit}
                            disabled={submitting || otp.length !== 6}
                          >
                            Submit OTP
                          </Button>
                        )}
                      </InputAdornment>
                    ),
                    startAdornment: (
                      <InputAdornment position="start">
                        <VpnKeyIcon sx={{ color: 'text.secondary' }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>
            ) : (
              <Box />
            )}
          </Fade>

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={submitting || aadhaarVerificationStatus !== 'verified'}
          >
            {submitting ? <CircularProgress size={24} color="inherit" /> : 'Save Profile'}
          </Button>
          <Button
            variant="outlined"
            onClick={() => navigate('/dashboard')}
            disabled={submitting}
            fullWidth
            sx={{ mb: 2 }}
          >
            Continue to Dashboard (Skip for now)
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}
