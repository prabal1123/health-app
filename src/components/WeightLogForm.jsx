import { useState } from 'react'
import { supabase } from '../supabase'
import { Box, Button, TextField, Typography } from '@mui/material'

export default function WeightLogForm() {
  const [weight, setWeight] = useState('')
  const [message, setMessage] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()

    const user = await supabase.auth.getUser()
    const user_id = user.data?.user?.id

    if (!user_id) {
      setMessage('You must be logged in.')
      return
    }

    const { error } = await supabase.from('weight_logs').insert([
      { weight_kg: parseFloat(weight), user_id }
    ])

    if (error) {
      setMessage(`Error: ${error.message}`)
    } else {
      setMessage('Weight log saved successfully!')
      setWeight('')
    }
  }

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ p: 2 }}>
      <Typography variant="h6">Log Your Weight</Typography>
      <TextField
        label="Weight (kg)"
        value={weight}
        onChange={(e) => setWeight(e.target.value)}
        type="number"
        fullWidth
        required
        sx={{ mt: 2 }}
      />
      <Button type="submit" variant="contained" sx={{ mt: 2 }}>
        Save
      </Button>
      {message && (
        <Typography sx={{ mt: 1 }} color="secondary">
          {message}
        </Typography>
      )}
    </Box>
  )
}
