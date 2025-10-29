// import React, { useState } from 'react'
// import {
//   Box,
//   Button,
//   Grid,
//   Paper,
//   TextField,
//   Typography,
// } from '@mui/material'
// import { supabase } from '../supabase'

// export default function ManualEntryForm() {
//   const [form, setForm] = useState({
//     date: '',
//     steps: '',
//     bp_systolic: '',
//     bp_diastolic: '',
//     glucose: '',
//     heart_rate: '',
//   })

//   const [submitting, setSubmitting] = useState(false)
//   const [message, setMessage] = useState('')

//   const handleChange = (e) => {
//     setForm((prev) => ({
//       ...prev,
//       [e.target.name]: e.target.value,
//     }))
//   }

//   const handleSubmit = async (e) => {
//     e.preventDefault()
//     setSubmitting(true)
//     setMessage('')

//     const {
//       data: { user },
//     } = await supabase.auth.getUser()

//     if (!user) {
//       setMessage('You must be logged in.')
//       setSubmitting(false)
//       return
//     }

//     // Convert date to ISO format to ensure it's compatible with the database
//     const formattedDate = form.date ? new Date(form.date).toISOString().slice(0, 10) : null;

//     const { error } = await supabase.from('manual_metrics').insert([
//       {
//         ...form,
//         user_id: user.id,
//         date: formattedDate, // UPDATED: Use the formatted date
//         steps: parseInt(form.steps) || null,
//         bp_systolic: parseInt(form.bp_systolic) || null,
//         bp_diastolic: parseInt(form.bp_diastolic) || null,
//         glucose: parseInt(form.glucose) || null,
//         heart_rate: parseInt(form.heart_rate) || null,
//       },
//     ])

//     if (error) {
//       setMessage('Error: ' + error.message)
//     } else {
//       setMessage('✅ Entry saved successfully!')
//       setForm({
//         date: '',
//         steps: '',
//         bp_systolic: '',
//         bp_diastolic: '',
//         glucose: '',
//         heart_rate: '',
//       })
//     }

//     setSubmitting(false)
//   }

//   return (
//     <Paper
//       sx={{
//         mt: 5,
//         p: 3,
//         borderRadius: 4,
//         boxShadow: 2,
//         bgcolor: 'background.paper',
//       }}
//     >
//       <Typography variant="h6" gutterBottom>
//         Add Health Log Manually
//       </Typography>

//       <form onSubmit={handleSubmit}>
//         <Grid container spacing={2}>
//           <Grid item xs={6} md={3}>
//             <TextField
//               label="Date"
//               name="date"
//               type="date"
//               fullWidth
//               value={form.date}
//               onChange={handleChange}
//               InputLabelProps={{ shrink: true }}
//               required
//             />
//           </Grid>

//           <Grid item xs={6} md={3}>
//             <TextField
//               label="Steps"
//               name="steps"
//               type="number"
//               fullWidth
//               value={form.steps}
//               onChange={handleChange}
//             />
//           </Grid>

//           <Grid item xs={6} md={3}>
//             <TextField
//               label="BP Systolic"
//               name="bp_systolic"
//               type="number"
//               fullWidth
//               value={form.bp_systolic}
//               onChange={handleChange}
//             />
//           </Grid>

//           <Grid item xs={6} md={3}>
//             <TextField
//               label="BP Diastolic"
//               name="bp_diastolic"
//               type="number"
//               fullWidth
//               value={form.bp_diastolic}
//               onChange={handleChange}
//             />
//           </Grid>

//           <Grid item xs={6} md={3}>
//             <TextField
//               label="Glucose (mg/dL)"
//               name="glucose"
//               type="number"
//               fullWidth
//               value={form.glucose}
//               onChange={handleChange}
//             />
//           </Grid>

//           <Grid item xs={6} md={3}>
//             <TextField
//               label="Heart Rate (bpm)"
//               name="heart_rate"
//               type="number"
//               fullWidth
//               value={form.heart_rate}
//               onChange={handleChange}
//             />
//           </Grid>

//           <Grid item xs={12}>
//             <Button
//               type="submit"
//               variant="contained"
//               disabled={submitting}
//               sx={{ mt: 2 }}
//             >
//               {submitting ? 'Saving...' : 'Save Log'}
//             </Button>
//             {message && (
//               <Typography mt={2} color="text.secondary">
//                 {message}
//               </Typography>
//             )}
//           </Grid>
//         </Grid>
//       </form>
//     </Paper>
//   )
// }

import React, { useState } from 'react'
import {
  Box,
  Button,
  Grid,
  Paper,
  TextField,
  Typography,
} from '@mui/material'
import { supabase } from '../supabase'

export default function ManualEntryForm() {
  const [form, setForm] = useState({
    date: '',
    steps: '',
    bp_systolic: '',
    bp_diastolic: '',
    glucose: '',
    heart_rate: '',
  })

  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setMessage('')

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setMessage('You must be logged in.')
      setSubmitting(false)
      return
    }

    // Convert date to ISO format to ensure it's compatible with the database
    const formattedDate = form.date ? new Date(form.date).toISOString().slice(0, 10) : null;

    // ✅ FIXED: Use upsert instead of insert to avoid "duplicate key" error
    const { error } = await supabase.from('manual_metrics').upsert(
      {
        ...form,
        user_id: user.id,
        date: formattedDate,
        steps: form.steps !== '' ? parseInt(form.steps) : null,
        bp_systolic: form.bp_systolic !== '' ? parseInt(form.bp_systolic) : null,
        bp_diastolic: form.bp_diastolic !== '' ? parseInt(form.bp_diastolic) : null,
        glucose: form.glucose !== '' ? parseInt(form.glucose) : null,
        heart_rate: form.heart_rate !== '' ? parseInt(form.heart_rate) : null,
      },
      {
        // This is the key part of upsert. It specifies the unique column(s)
        // that determine if a row should be updated instead of inserted.
        onConflict: 'user_id,date',
      }
    )

    if (error) {
      setMessage('Error: ' + error.message)
    } else {
      setMessage('✅ Entry saved successfully!')
      setForm({
        date: '',
        steps: '',
        bp_systolic: '',
        bp_diastolic: '',
        glucose: '',
        heart_rate: '',
      })
    }

    setSubmitting(false)
  }

  return (
    <Paper
      sx={{
        mt: 5,
        p: 3,
        borderRadius: 4,
        boxShadow: 2,
        bgcolor: 'background.paper',
      }}
    >
      <Typography variant="h6" gutterBottom>
        Add Health Log Manually
      </Typography>

      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={6} md={3}>
            <TextField
              label="Date"
              name="date"
              type="date"
              fullWidth
              value={form.date}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              required
            />
          </Grid>

          <Grid item xs={6} md={3}>
            <TextField
              label="Steps"
              name="steps"
              type="number"
              fullWidth
              value={form.steps}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={6} md={3}>
            <TextField
              label="BP Systolic"
              name="bp_systolic"
              type="number"
              fullWidth
              value={form.bp_systolic}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={6} md={3}>
            <TextField
              label="BP Diastolic"
              name="bp_diastolic"
              type="number"
              fullWidth
              value={form.bp_diastolic}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={6} md={3}>
            <TextField
              label="Glucose (mg/dL)"
              name="glucose"
              type="number"
              fullWidth
              value={form.glucose}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={6} md={3}>
            <TextField
              label="Heart Rate (bpm)"
              name="heart_rate"
              type="number"
              fullWidth
              value={form.heart_rate}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={12}>
            <Button
              type="submit"
              variant="contained"
              disabled={submitting}
              sx={{ mt: 2 }}
            >
              {submitting ? 'Saving...' : 'Save Log'}
            </Button>
            {message && (
              <Typography mt={2} color="text.secondary">
                {message}
              </Typography>
            )}
          </Grid>
        </Grid>
      </form>
    </Paper>
  )
}
