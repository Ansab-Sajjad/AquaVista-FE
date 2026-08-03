"use client";
import { useEffect, useState } from "react";

import { Box, Typography } from "@mui/material";

import Logo from "@/components/logo/logo";

/**
 * GitHub OAuth popup callback.
 *
 * GitHub redirects here with `?code=...` (or `?error=...`) inside the small
 * popup window opened by `useGitHubAuth`. This page forwards the result to the
 * opener window via `postMessage` and then closes itself, exactly like the
 * Google sign-in popup flow does.
 */
export default function GitHubCallbackPage() {
  const [status, setStatus] = useState("Completing GitHub sign in...");

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");
    const error = urlParams.get("error");
    const errorDescription = urlParams.get("error_description");

    if (window.opener && !window.opener.closed) {
      window.opener.postMessage(
        {
          type: "github-oauth-code",
          code: code || null,
          error: error || null,
          errorDescription: errorDescription || null,
        },
        window.location.origin,
      );
    }

    setStatus(code ? "Success! You can close this window." : "Sign-in was not completed.");
    // Give the opener a moment to receive the message before closing.
    const timer = setTimeout(() => {
      window.close();
    }, 400);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Box className="flex min-h-screen w-full flex-col items-center justify-center gap-6 p-6">
      <Logo />
      <Typography variant="body1" className="text-text-primary">
        {status}
      </Typography>
    </Box>
  );
}
