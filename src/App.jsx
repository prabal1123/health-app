// // src/App.jsx
// import { BrowserRouter, Routes, Route } from 'react-router-dom';
// import { AuthProvider } from './AuthContext'; // Import your AuthProvider

// import LoginPage from './pages/LoginPage';
// import ResetPassword from './pages/ResetPassword';
// import Dashboard from './pages/dashboard';
// import ProfileSetup from './pages/ProfileSetup';
// import StravaCallback from './pages/StravaCallback';
// import GoogleFitCallback from './pages/GoogleFitCallback';
// import TeamPage from './pages/TeamPage';
// import OtpVerifyPage from './pages/OtpVerifyPage';
// import Leaderboard from './pages/Leaderboard'; // ADDED: Import the Leaderboard component
// import PrivateRoute from './components/PrivateRoute';

// export default function App() {
//   return (
//     <BrowserRouter>
//       <AuthProvider> {/* Wrap your Routes with AuthProvider */}
//         <Routes>
//           {/* 🔐 Auth pages (publicly accessible) */}
//           <Route path="/login" element={<LoginPage />} />
//           <Route path="/reset-password" element={<ResetPassword />} />
//           <Route path="/otp-verify" element={<OtpVerifyPage />} />
//           <Route path="/strava-callback" element={<StravaCallback />} />
//           <Route path="/googlefit-callback" element={<GoogleFitCallback />} />

//           {/* 🏠 Main app pages - PROTECTED BY PrivateRoute */}
//           {/* These pages require the user to be logged in */}
//           <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
//           <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
//           <Route path="/profile-setup" element={<PrivateRoute><ProfileSetup /></PrivateRoute>} />
//           <Route path="/team" element={<PrivateRoute><TeamPage /></PrivateRoute>} />
//           <Route path="/leaderboard" element={<PrivateRoute><Leaderboard /></PrivateRoute>} /> {/* ADDED: Route for the leaderboard */}


//           {/* ⚠️ Catch-all route for any undefined paths */}
//           {/* This will redirect to the dashboard if logged in, otherwise to login */}
//           <Route path="*" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
//         </Routes>
//       </AuthProvider>
//     </BrowserRouter>
//   );
// }
// src/App.jsx
// import { BrowserRouter, Routes, Route } from 'react-router-dom';
// import { AuthProvider } from './AuthContext'; // Import your AuthProvider
// import LoginPage from './pages/LoginPage';
// import ResetPassword from './pages/ResetPassword';
// import Dashboard from './pages/dashboard';
// import ProfileSetup from './pages/ProfileSetup';
// import StravaCallback from './pages/StravaCallback';
// import GoogleFitCallback from './pages/GoogleFitCallback';
// import TeamPage from './pages/TeamPage';
// import OtpVerifyPage from './pages/OtpVerifyPage';
// import Leaderboard from './pages/Leaderboard';
// import PrivateRoute from './components/PrivateRoute';
// import Layout from './components/Layout'; // ADDED: Import the Layout component

// export default function App() {
//   return (
//     <BrowserRouter>
//       <AuthProvider>
//         <Routes>
//           {/* Publicly accessible routes */}
//           <Route path="/login" element={<LoginPage />} />
//           <Route path="/reset-password" element={<ResetPassword />} />
//           <Route path="/otp-verify" element={<OtpVerifyPage />} />
//           <Route path="/strava-callback" element={<StravaCallback />} />
//           <Route path="/googlefit-callback" element={<GoogleFitCallback />} />

//           {/* Protected routes with a consistent layout */}
//           <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
//             <Route index element={<Dashboard />} />
//             <Route path="dashboard" element={<Dashboard />} />
//             <Route path="profile-setup" element={<ProfileSetup />} />
//             <Route path="team" element={<TeamPage />} />
//             <Route path="leaderboard" element={<Leaderboard />} />
//           </Route>
          
//           {/* Catch-all route to redirect to dashboard if logged in */}
//           <Route path="*" element={<PrivateRoute><Layout><Dashboard /></Layout></PrivateRoute>} />
//         </Routes>
//       </AuthProvider>
//     </BrowserRouter>
//   );
// }
// // src/App.jsx
// import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
// import { AuthProvider } from './AuthContext';
// import LoginPage from './pages/LoginPage';
// import ResetPassword from './pages/ResetPassword';
// import Dashboard from './pages/dashboard';
// import ProfileSetup from './pages/ProfileSetup';
// import StravaCallback from './pages/StravaCallback';
// import GoogleFitCallback from './pages/GoogleFitCallback';
// import TeamPage from './pages/TeamPage';
// import OtpVerifyPage from './pages/OtpVerifyPage';
// import Leaderboard from './pages/Leaderboard';
// import PrivateRoute from './components/PrivateRoute';
// import Layout from './components/Layout';

// export default function App() {
//   return (
//     <BrowserRouter>
//       <AuthProvider>
//         <Routes>
//           {/* Publicly accessible routes */}
//           <Route path="/login" element={<LoginPage />} />
//           <Route path="/reset-password" element={<ResetPassword />} />
//           <Route path="/otp-verify" element={<OtpVerifyPage />} />
//           <Route path="/strava-callback" element={<StravaCallback />} />
//           <Route path="/googlefit-callback" element={<GoogleFitCallback />} />
          
//           {/* Protected routes with a consistent layout */}
//           <Route element={<PrivateRoute><Layout /></PrivateRoute>}>
//             <Route path="/dashboard" element={<Dashboard />} />
//             <Route path="/profile-setup" element={<ProfileSetup />} />
//             <Route path="/team" element={<TeamPage />} />
//             <Route path="/leaderboard" element={<Leaderboard />} />
//           </Route>
          
//           {/* Redirect the root path to the dashboard if authenticated */}
//           <Route path="/" element={<Navigate to="/dashboard" replace />} />

//           {/* Fallback for any other path not matched */}
//           <Route path="*" element={<h1>404 - Not Found</h1>} />
//         </Routes>
//       </AuthProvider>
//     </BrowserRouter>
//   );
// }

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './AuthContext';
import LoginPage from './pages/LoginPage';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/dashboard';
import ProfileSetup from './pages/ProfileSetup';
import StravaCallback from './pages/StravaCallback';
import GoogleFitCallback from './pages/GoogleFitCallback';
import TeamPage from './pages/TeamPage';
import OtpVerifyPage from './pages/OtpVerifyPage';
import Leaderboard from './pages/Leaderboard';
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* NEW: Add a route for the root path to redirect to login */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          
          {/* Publicly accessible routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/otp-verify" element={<OtpVerifyPage />} />
          <Route path="/strava-callback" element={<StravaCallback />} />
          <Route path="/googlefit-callback" element={<GoogleFitCallback />} />
          
          {/* Protected routes with a consistent layout */}
          <Route element={<PrivateRoute><Layout /></PrivateRoute>}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile-setup" element={<ProfileSetup />} />
            <Route path="/team" element={<TeamPage />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
          </Route>
          
          {/* Fallback for any other path not matched */}
          <Route path="*" element={<h1>404 - Not Found</h1>} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}