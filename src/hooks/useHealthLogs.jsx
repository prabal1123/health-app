// import { useEffect, useState } from 'react';
// import { supabase } from '../supabase';

// export function useHealthLogs(userId) {
//   const [logs, setLogs] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     if (!userId) {
//       setLoading(false);
//       return;
//     }

//     const fetchLogs = async () => {
//       setLoading(true);
//       setError(null);

//       try {
//         const { data, error } = await supabase
//           .from('manual_metrics')
//           .select('*')
//           .eq('user_id', userId)
//           .order('date', { ascending: true });

//         if (error) {
//           throw new Error(error.message);
//         }

//         setLogs(data || []);

//       } catch (e) {
//         console.error('Error fetching logs:', e);
//         setError(e);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchLogs();
//   }, [userId]);

//   return { logs, loading, error };
// }

import { useEffect, useState } from 'react';
import { supabase } from '../supabase';

export function useHealthLogs(userId) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    // Function to fetch logs from the database
    const fetchLogs = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase
          .from('manual_metrics')
          .select('*')
          .eq('user_id', userId)
          .order('date', { ascending: true });

        if (error) {
          throw new Error(error.message);
        }
        setLogs(data || []);
      } catch (e) {
        console.error('Error fetching logs:', e);
        setError(e);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();

    // ✅ NEW: Real-time subscription to the manual_metrics table
    // This channel listens for all changes (INSERT, UPDATE, DELETE) for the current user.
    const channel = supabase
      .channel(`manual_metrics_channel_${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*', // Listen for all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'manual_metrics',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          // When a change is detected, re-fetch all the logs to get the most current state.
          fetchLogs();
        }
      )
      .subscribe();

    // Clean up the subscription when the component unmounts
    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  return { logs, loading, error };
}
