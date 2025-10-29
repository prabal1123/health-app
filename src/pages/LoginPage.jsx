import React, { useState } from "react";
import { supabase } from "../supabase";
import { Alert, CircularProgress, TextField } from "@mui/material";
import "../styles/login.css";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSent, setIsSent] = useState(false);

  const handleChange = (e) => {
    setEmail(e.target.value.trim());
    setMessage("");
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    if (!email) {
      setError("Please enter your email address.");
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

      const { error: signInError } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${window.location.origin}/otp-verify` },
      });
      if (signInError) throw signInError;

      setMessage(`An OTP has been sent to ${email}. Please check your email.`);
      setIsSent(true);
    } catch (err) {
      console.error("Authentication error:", err);
      setError("❌ " + (err?.message || "Something went wrong."));
    } finally {
      setLoading(false);
    }
  };

  if (isSent) {
    return (
      <div className="login-screen">
        <div className="login-card">
          <h2 className="login-title">Check your email</h2>
          <p className="login-subtitle">
            A sign-in link has been sent to <strong>{email}</strong>.
          </p>

          <button className="btn-ghost" onClick={() => setIsSent(false)}>
            Back to Sign In
          </button>

          <button
            className="btn-primary"
            onClick={() => (window.location.href = "/")}
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="login-screen">
      <div className="login-card">
        <h2 className="login-title">Sign in with Email</h2>
        <p className="login-subtitle">
          Enter your email and we'll send a login link.
        </p>

        {message && (
          <div className="alert">
            <Alert severity="info">{message}</Alert>
          </div>
        )}
        {error && (
          <div className="alert">
            <Alert severity="error">{error}</Alert>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
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
          />

          <button
            type="submit"
            className="btn-primary"
            disabled={loading || !email}
          >
            {loading ? <CircularProgress size={22} color="inherit" /> : "SEND OTP / LOG IN"}
          </button>
        </form>

        <p className="login-note" style={{ marginTop: "18px" }}>
          After you click the link in your email, this app will receive the
          session and redirect you back.
        </p>
      </div>
    </div>
  );
}
