// src/pages/ResetPassword.jsx
import React, { useEffect, useState } from "react"
import { supabase } from "../supabase"
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  CircularProgress,
} from "@mui/material"
import { useNavigate } from "react-router-dom"

export default function ResetPassword() {
  const [newPw, setNewPw] = useState("")
  const [stage, setStage] = useState("checking") // checking | ready | success | error
  const navigate = useNavigate()

  /* ───────── validate session ───────── */
  useEffect(() => {
    const checkRecovery = async () => {
      const { data } = await supabase.auth.getSession()
      if (data.session) {
        setStage("ready")
      } else {
        setStage("error")
      }
    }
    checkRecovery()
  }, [])

  /* ───────── update password ───────── */
  const handleUpdate = async (e) => {
    e.preventDefault()
    if (newPw.length < 6) {
      alert("Password must be at least 6 characters")
      return
    }
    const { error } = await supabase.auth.updateUser({ password: newPw })
    if (error) {
      alert("❌ " + error.message)
    } else {
      setStage("success")
      setTimeout(() => navigate("/login"), 1500)
    }
  }

  /* ───────── UI ───────── */
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
      }}
    >
      <Paper
        elevation={8}
        sx={{
          p: 4,
          width: "100%",
          maxWidth: 400,
          borderRadius: 4,
          backgroundColor: "#0f1d1c",
          color: "#fff",
          textAlign: "center",
        }}
      >
        {stage === "checking" && <CircularProgress />}
        {stage === "error" && (
          <Typography color="error">
            Link invalid or expired. Please try sending a new reset link.
          </Typography>
        )}

        {stage === "ready" && (
          <>
            <Typography variant="h5" fontWeight={600} gutterBottom>
              Reset Password
            </Typography>
            <Box component="form" onSubmit={handleUpdate}>
              <TextField
                label="New Password"
                type="password"
                value={newPw}
                onChange={(e) => setNewPw(e.target.value)}
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
              >
                Update Password
              </Button>
            </Box>
          </>
        )}

        {stage === "success" && (
          <Typography color="success.main">
            ✅ Password updated! Redirecting to login…
          </Typography>
        )}
      </Paper>
    </Box>
  )
}
