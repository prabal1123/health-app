import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'

export default function StravaCallback() {
  const navigate = useNavigate()

  useEffect(() => {
    const fetchToken = async () => {
      const urlParams = new URLSearchParams(window.location.search)
      const code = urlParams.get('code')

      if (!code) {
        console.error('❌ No Strava code found in URL')
        return navigate('/dashboard')
      }

      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          console.error('❌ User not logged in')
          return navigate('/login')
        }

        // 🌐 Exchange code for tokens
        const res = await fetch('https://www.strava.com/oauth/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            client_id: import.meta.env.VITE_STRAVA_CLIENT_ID,
            client_secret: import.meta.env.VITE_STRAVA_CLIENT_SECRET,
            code,
            grant_type: 'authorization_code',
          }),
        })

        if (!res.ok) {
          const msg = await res.text()
          throw new Error(`Strava token fetch failed: ${msg}`)
        }

        const data = await res.json()
        console.log('✅ Strava token received:', data)

        // 💾 Save to Supabase
        const { error } = await supabase.from('strava_tokens').upsert({
          user_id: user.id,
          access_token: data.access_token,
          refresh_token: data.refresh_token,
          expires_at: data.expires_at,
        })

        if (error) {
          console.error('❌ Failed to store Strava token:', error)
        } else {
          console.log('✅ Strava token stored successfully')
        }

        // 📌 Update connection status
        const now = new Date()
        const syncedAt = isNaN(now.getTime()) ? null : now.toISOString()

        await supabase
          .from('user_info')
          .update({
            strava_connected: true,
            strava_last_synced: syncedAt,
            steps_source: 'strava',
          })
          .eq('id', user.id)

        navigate('/dashboard')
      } catch (err) {
        console.error('❌ Strava token fetch failed:', err)
        navigate('/dashboard')
      }
    }

    fetchToken()
  }, [navigate])

  return <p>Connecting to Strava...</p>
}
