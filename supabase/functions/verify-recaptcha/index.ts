import "https://deno.land/x/dotenv@v3.2.2/load.ts";
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

// Access the reCAPTCHA secret key from Supabase secrets
const RECAPTCHA_SECRET_KEY = Deno.env.get("RECAPTCHA_SECRET_KEY");

serve(async (req) => {
  // ✅ FIX: Handling CORS preflight requests to prevent browser from blocking the call
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  // Only allow POST requests to this function
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const { token } = await req.json();

    if (!token) {
      return new Response(JSON.stringify({ success: false, error: "Missing reCAPTCHA token" }), {
        headers: { "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Make a secure request to Google's reCAPTCHA API
    const response = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `secret=${RECAPTCHA_SECRET_KEY}&response=${token}`,
    });

    const result = await response.json();
    
    // This is a small change to force redeployment.
    
    // Check if Google's response indicates a successful verification
    if (result.success) {
      return new Response(JSON.stringify({ success: true }), {
        headers: { 
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*", // ✅ FIX: Add CORS header
        },
      });
    } else {
      // If verification fails, return the error codes from Google
      console.error("reCAPTCHA verification failed:", result["error-codes"]);
      return new Response(JSON.stringify({ success: false, error: result["error-codes"] }), {
        headers: { 
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*", // ✅ FIX: Add CORS header
        },
        status: 400,
      });
    }
  } catch (error) {
    console.error("Server error:", error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      headers: { 
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*", // ✅ FIX: Add CORS header
      },
      status: 500,
    });
  }
});
