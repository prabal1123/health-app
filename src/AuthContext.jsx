// import React, { createContext, useState, useEffect } from 'react';
// import { supabase } from './supabase';
// import { useNavigate } from 'react-router-dom';

// export const AuthContext = createContext();

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const [profile, setProfile] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const navigate = useNavigate();

//   // --- Effect 1: Handles fetching user & profile on auth state change ---
//   useEffect(() => {
//     const fetchUserAndProfile = async (currentUser) => {
//       if (!currentUser) {
//         setUser(null);
//         setProfile(null);
//         setLoading(false);
//         return;
//       }

//       setUser(currentUser);

//       const { data: profileData, error } = await supabase
//         .from('user_info')
//         .select('*')
//         .eq('id', currentUser.id)
//         .maybeSingle();

//       if (error) {
//         console.error('AuthContext: Error fetching user profile:', error.message);
//       }

//       setProfile(profileData);
//       setLoading(false);
//     };

//     const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
//       fetchUserAndProfile(session?.user || null);
//     });

//     supabase.auth.getUser().then(({ data: { user: initialUser } }) => {
//       fetchUserAndProfile(initialUser);
//     });

//     return () => {
//       authListener.subscription.unsubscribe();
//     };
//   }, []);

//   // --- Effect 2: Handles Redirection logic ---
//   useEffect(() => {
//     if (loading) {
//       return;
//     }

//     const currentPath = window.location.pathname;

//     // User is NOT logged in, redirect to login page
//     if (!user) {
//       if (currentPath !== '/login' && currentPath !== '/reset-password' && currentPath !== '/otp-verify') {
//         navigate('/login', { replace: true });
//       }
//       return;
//     }

//     // User is logged in, but profile is incomplete
//     if (user && (!profile || !profile.is_profile_complete)) {
//       if (currentPath !== '/profile-setup') {
//         navigate('/profile-setup', { replace: true });
//       }
//       return;
//     }

//     // User is logged in AND profile is complete
//     if (user && profile?.is_profile_complete) {
//       if (currentPath === '/login' || currentPath === '/reset-password' || currentPath === '/profile-setup') {
//         navigate('/dashboard', { replace: true });
//       }
//     }
//   }, [loading, user, profile, navigate]);

//   const signOut = async () => {
//     setLoading(true);
//     const { error } = await supabase.auth.signOut();
//     if (error) {
//       console.error('AuthContext: Error signing out:', error);
//       setLoading(false);
//     }
//   };

//   return (
//     <AuthContext.Provider value={{ user, profile, setProfile, loading, signOut }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };


// import React, { createContext, useState, useEffect, useRef } from 'react';
// import { supabase } from './supabase';
// import { useNavigate } from 'react-router-dom';

// export const AuthContext = createContext();

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const [profile, setProfile] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const navigate = useNavigate();

//   // ADDED: A ref to track if the listener has been set up
//   const listenerRef = useRef(false);

//   // --- Effect 1: Handles fetching user & profile on auth state change ---
//   useEffect(() => {
//     // Only set up the listener once per page load
//     if (listenerRef.current) {
//       return;
//     }

//     const fetchUserAndProfile = async (currentUser) => {
//       if (!currentUser) {
//         setUser(null);
//         setProfile(null);
//         setLoading(false);
//         return;
//       }

//       setUser(currentUser);

//       const { data: profileData, error } = await supabase
//         .from('user_info')
//         .select('*')
//         .eq('id', currentUser.id)
//         .maybeSingle();

//       if (error) {
//         console.error('AuthContext: Error fetching user profile:', error.message);
//       }

//       setProfile(profileData);
//       setLoading(false);
//     };

//     const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
//       fetchUserAndProfile(session?.user || null);
//     });

//     supabase.auth.getUser().then(({ data: { user: initialUser } }) => {
//       fetchUserAndProfile(initialUser);
//     });

//     // Mark the listener as set up
//     listenerRef.current = true;

//     return () => {
//       authListener.subscription.unsubscribe();
//     };
//   }, []); // Run only once

//   // --- Effect 2: Handles Redirection logic ---
//   useEffect(() => {
//     if (loading) {
//       return;
//     }

//     const currentPath = window.location.pathname;

//     if (!user) {
//       if (currentPath !== '/login' && currentPath !== '/reset-password' && currentPath !== '/otp-verify') {
//         navigate('/login', { replace: true });
//       }
//       return;
//     }

//     if (user && (!profile || !profile.is_profile_complete)) {
//       if (currentPath !== '/profile-setup') {
//         navigate('/profile-setup', { replace: true });
//       }
//       return;
//     }

//     if (user && profile?.is_profile_complete) {
//       if (currentPath === '/login' || currentPath === '/reset-password' || currentPath === '/profile-setup') {
//         navigate('/dashboard', { replace: true });
//       }
//     }
//   }, [loading, user, profile, navigate]);

//   const signOut = async () => {
//     setLoading(true);
//     const { error } = await supabase.auth.signOut();
//     if (error) {
//       console.error('AuthContext: Error signing out:', error);
//       setLoading(false);
//     }
//   };

//   return (
//     <AuthContext.Provider value={{ user, profile, setProfile, loading, signOut }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// src/AuthContext.js
import React, { createContext, useState, useEffect, useRef } from 'react';
import { supabase } from './supabase';
import { useNavigate } from 'react-router-dom';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // ADDED: A ref to track if the listener has been set up
  const listenerRef = useRef(false);

  // --- Effect 1: Handles fetching user & profile on auth state change ---
  useEffect(() => {
    // Only set up the listener once per page load
    if (listenerRef.current) {
      return;
    }

    const fetchUserAndProfile = async (currentUser) => {
      if (!currentUser) {
        setUser(null);
        setProfile(null);
        setLoading(false);
        return;
      }

      setUser(currentUser);

      const { data: profileData, error } = await supabase
        .from('user_info')
        .select('*')
        .eq('id', currentUser.id)
        .maybeSingle();

      if (error) {
        console.error('AuthContext: Error fetching user profile:', error.message);
      }

      setProfile(profileData);
      setLoading(false);
    };

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      fetchUserAndProfile(session?.user || null);
    });

    supabase.auth.getUser().then(({ data: { user: initialUser } }) => {
      fetchUserAndProfile(initialUser);
    });

    // Mark the listener as set up
    listenerRef.current = true;

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []); // Run only once

  // --- Effect 2: Handles Redirection logic ---
  useEffect(() => {
    if (loading) {
      return;
    }

    const currentPath = window.location.pathname;

    if (!user) {
      if (currentPath !== '/login' && currentPath !== '/reset-password' && currentPath !== '/otp-verify') {
        navigate('/login', { replace: true });
      }
      return;
    }

    if (user && (!profile || !profile.is_profile_complete)) {
      if (currentPath !== '/profile-setup') {
        navigate('/profile-setup', { replace: true });
      }
      return;
    }

    // ✅ FIXED: Changed the redirection logic. This prevents the user from being redirected
    // if they are already on the profile-setup page.
    if (user && profile?.is_profile_complete) {
      if (currentPath === '/login' || currentPath === '/reset-password') {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [loading, user, profile, navigate]);

  const signOut = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('AuthContext: Error signing out:', error);
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, setProfile, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
