import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase";
import ReCAPTCHA from "react-google-recaptcha";
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Fade,
  Alert,
  CircularProgress,
} from "@mui/material";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSent, setIsSent] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState(null);

  const recaptchaRef = useRef(null);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setEmail(e.target.value);
    setMessage("");
    setError("");
  };

  const handleRecaptchaChange = (token) => {
    setRecaptchaToken(token);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    if (!recaptchaToken) {
      setError("Please complete the reCAPTCHA.");
      setLoading(false);
      return;
    }

    try {
      const { data: existingUserInfo, error: userCheckError } = await supabase
        .from("user_info")
        .select("id")
        .eq("email", email)
        .maybeSingle();

      if (userCheckError && userCheckError.code !== "PGRST116") {
        throw userCheckError;
      }

      if (!existingUserInfo) {
        setError(
          "This email is not registered for access. Please contact your client admin for assistance."
        );
        setLoading(false);
        return;
      }

      // Here you would send the reCAPTCHA token to your backend to be verified
      // For now, we'll assume it's valid and proceed
      const { error: signInError } = await supabase.auth.signInWithOtp({
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/otp-verify`,
        },
      });
      if (signInError) throw signInError;
      
      setMessage(`An OTP has been sent to ${email}. Please check your email.`);
      setIsSent(true);

    } catch (err) {
      console.error("Authentication error:", err);
      setError("❌ " + err.message);
    } finally {
      setLoading(false);
      // Reset reCAPTCHA after submission
      if (recaptchaRef.current) {
        recaptchaRef.current.reset();
      }
      setRecaptchaToken(null);
    }
  };
  
  if (isSent) {
    return (
      <Box sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        bgcolor: '#1b2b2a'
      }}>
        <Paper elevation={8} sx={{
          p: 4,
          borderRadius: 4,
          bgcolor: '#0f1d1c',
          width: '100%',
          maxWidth: '400px',
          color: '#fff'
        }}>
          <Typography variant="h4" component="h2" align="center" gutterBottom>
            Check Your Email
          </Typography>
          <Typography variant="body1" align="center" color="text.secondary">
            A sign-in link has been sent to your email address.
          </Typography>
        </Paper>
      </Box>
    );
  }

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
          <Typography
            variant="h4"
            component="h2"
            align="center"
            gutterBottom
            sx={{ fontWeight: "bold" }}
          >
            Sign In
          </Typography>

          <Typography
            variant="body1"
            align="center"
            color="text.secondary"
            sx={{ mb: 3 }}
          >
            Sign in to access your activities and wellness data.
          </Typography>

          {message && <Alert severity="info" sx={{ mb: 2 }}>{message}</Alert>}
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <TextField
              label="Email"
              name="email"
              type="email"
              variant="outlined"
              value={email}
              onChange={handleChange}
              fullWidth
              required
              margin="normal"
              InputProps={{ sx: { color: "#fff" } }}
              InputLabelProps={{ sx: { color: "#aaa" } }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  "& fieldset": { borderColor: "#aaa" },
                  "&:hover fieldset": { borderColor: "#94bfa2" },
                  "&.Mui-focused fieldset": { borderColor: "#94bfa2" },
                },
              }}
            />
            
            <Box sx={{ my: 2 }}>
              <ReCAPTCHA
                ref={recaptchaRef}
                sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
                onChange={handleRecaptchaChange}
              />
            </Box>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading || !recaptchaToken}
              sx={{
                mt: 3,
                py: 1.5,
                fontWeight: "bold",
                bgcolor: "#94bfa2",
                color: "#000",
                "&:hover": { bgcolor: "#a2cdb0" },
              }}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "SEND OTP / LOG IN"
              )}
            </Button>
          </Box>
        </Paper>
      </Fade>
    </Box>
  );
}

// import React, { useState, useRef } from "react";
// import { useNavigate } from "react-router-dom";
// import { supabase } from "../supabase";
// import ReCAPTCHA from "react-google-recaptcha";
// import {
//   Box,
//   TextField,
//   Button,
//   Typography,
//   Paper,
//   Fade,
//   Alert,
//   CircularProgress,
// } from "@mui/material";

// export default function LoginPage() {
//   const [email, setEmail] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [message, setMessage] = useState("");
//   const [error, setError] = useState("");
//   const [isSent, setIsSent] = useState(false);
//   const [recaptchaToken, setRecaptchaToken] = useState(null);

//   const recaptchaRef = useRef(null);

//   const navigate = useNavigate();

//   const handleChange = (e) => {
//     setEmail(e.target.value);
//     setMessage("");
//     setError("");
//   };

//   const handleRecaptchaChange = (token) => {
//     setRecaptchaToken(token);
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setMessage("");
//     setError("");

//     if (!recaptchaToken) {
//       setError("Please complete the reCAPTCHA.");
//       setLoading(false);
//       return;
//     }

//     try {
//       const { data: existingUserInfo, error: userCheckError } = await supabase
//         .from("user_info")
//         .select("id")
//         .eq("email", email)
//         .maybeSingle();

//       if (userCheckError && userCheckError.code !== "PGRST116") {
//         throw userCheckError;
//       }

//       if (!existingUserInfo) {
//         setError(
//           "This email is not registered for access. Please contact your client admin for assistance."
//         );
//         setLoading(false);
//         return;
//       }

//       // ✅ FIX: Use the correct URL for the Supabase Edge Function
//       const res = await fetch(
//         `http://localhost:54321/functions/v1/verify-recaptcha`,
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({ token: recaptchaToken }),
//         }
//       );

//       const recaptchaResult = await res.json();

//       if (!recaptchaResult.success) {
//         setError("reCAPTCHA verification failed. Please try again.");
//         setLoading(false);
//         if (recaptchaRef.current) {
//             recaptchaRef.current.reset();
//         }
//         return;
//       }

//       // If reCAPTCHA is successful, proceed with the login
//       const { error: signInError } = await supabase.auth.signInWithOtp({
//         email: email,
//         options: {
//           emailRedirectTo: `${window.location.origin}/otp-verify`,
//         },
//       });
//       if (signInError) throw signInError;
      
//       setMessage(`An OTP has been sent to ${email}. Please check your email.`);
//       setIsSent(true);

//     } catch (err) {
//       console.error("Authentication error:", err);
//       setError("❌ " + err.message);
//     } finally {
//       setLoading(false);
//       // Reset reCAPTCHA after submission
//       if (recaptchaRef.current) {
//         recaptchaRef.current.reset();
//       }
//       setRecaptchaToken(null);
//     }
//   };
  
//   if (isSent) {
//     return (
//       <Box sx={{
//         display: 'flex',
//         justifyContent: 'center',
//         alignItems: 'center',
//         minHeight: '100vh',
//         bgcolor: '#1b2b2a'
//       }}>
//         <Paper elevation={8} sx={{
//           p: 4,
//           borderRadius: 4,
//           bgcolor: '#0f1d1c',
//           width: '100%',
//           maxWidth: '400px',
//           color: '#fff'
//         }}>
//           <Typography variant="h4" component="h2" align="center" gutterBottom>
//             Check Your Email
//           </Typography>
//           <Typography variant="body1" align="center" color="text.secondary">
//             A sign-in link has been sent to your email address.
//           </Typography>
//         </Paper>
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
//           <Typography
//             variant="h4"
//             component="h2"
//             align="center"
//             gutterBottom
//             sx={{ fontWeight: "bold" }}
//           >
//             Sign In
//           </Typography>

//           <Typography
//             variant="body1"
//             align="center"
//             color="text.secondary"
//             sx={{ mb: 3 }}
//           >
//             Sign in to access your activities and wellness data.
//           </Typography>

//           {message && <Alert severity="info" sx={{ mb: 2 }}>{message}</Alert>}
//           {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

//           <Box component="form" onSubmit={handleSubmit} noValidate>
//             <TextField
//               label="Email"
//               name="email"
//               type="email"
//               variant="outlined"
//               value={email}
//               onChange={handleChange}
//               fullWidth
//               required
//               margin="normal"
//               InputProps={{ sx: { color: "#fff" } }}
//               InputLabelProps={{ sx: { color: "#aaa" } }}
//               sx={{
//                 "& .MuiOutlinedInput-root": {
//                   "& fieldset": { borderColor: "#aaa" },
//                   "&:hover fieldset": { borderColor: "#94bfa2" },
//                   "&.Mui-focused fieldset": { borderColor: "#94bfa2" },
//                 },
//               }}
//             />
            
//             <Box sx={{ my: 2 }}>
//               <ReCAPTCHA
//                 ref={recaptchaRef}
//                 sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
//                 onChange={handleRecaptchaChange}
//               />
//             </Box>

//             <Button
//               type="submit"
//               fullWidth
//               variant="contained"
//               disabled={loading || !recaptchaToken}
//               sx={{
//                 mt: 3,
//                 py: 1.5,
//                 fontWeight: "bold",
//                 bgcolor: "#94bfa2",
//                 color: "#000",
//                 "&:hover": { bgcolor: "#a2cdb0" },
//               }}
//             >
//               {loading ? (
//                 <CircularProgress size={24} color="inherit" />
//               ) : (
//                 "SEND OTP / LOG IN"
//               )}
//             </Button>
//           </Box>
//         </Paper>
//       </Fade>
//     </Box>
//   );
// }
