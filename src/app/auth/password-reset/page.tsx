"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Divider,
  FormControl,
  FormLabel,
  Input,
  Paper,
  Typography,
} from "@mui/material";

import Logo from "@/components/logo/logo";
import { THEME_OPTIONS } from "@/constants";
import { useThemeContext } from "@/theme/theme-provider";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function Page() {
  const router = useRouter();
  const { setTheme } = useThemeContext();
  const [data, setData] = useState({
    email: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    setTheme(THEME_OPTIONS.ORANGE);
  }, [setTheme]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: data.email }),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result?.message || "Unable to send the reset email. Please try again.");
      }

      setSuccessMessage(result?.message || "If an account exists for this email, you'll receive a reset link shortly.");
      setData({ email: "" });
      setTimeout(() => router.push("/auth/sign-in"), 1200);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to send the reset email. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box className="bg-waves flex min-h-screen w-full items-center justify-center bg-cover bg-fixed bg-center p-4">
      <Paper elevation={3} className="bg-background-paper shadow-darker-xs w-lg max-w-full rounded-4xl py-14">
        <Box className="flex flex-col gap-4 px-8 sm:px-14">
          <Box className="flex flex-col">
            <Box className="mb-14 flex justify-center">
              <Logo classNameMobile="hidden" />
            </Box>

            <Box className="flex flex-col gap-10">
              <Box className="flex flex-col">
                <Typography variant="h1" component="h1" className="mb-2">
                  Reset Password
                </Typography>
                <Typography variant="body1" className="text-text-primary">
                  Get an email about how to reset your password securely.
                </Typography>
              </Box>

              <Box className="flex flex-col gap-5">
                <Box component={"form"} onSubmit={handleSubmit} className="flex flex-col">
                  <FormControl className="outlined" variant="standard" size="small">
                    <FormLabel component="label">Email</FormLabel>
                    <Input
                      placeholder=""
                      value={data.email}
                      onChange={(e) => setData({ ...data, email: e.target.value })}
                    />
                  </FormControl>

                  {errorMessage && (
                    <Alert severity="error" className="neutral bg-background-paper/60! mb-4">
                      <AlertTitle variant="subtitle2">Reset request failed</AlertTitle>
                      <Typography variant="body2" className="text-text-primary">
                        {errorMessage}
                      </Typography>
                    </Alert>
                  )}

                  {successMessage && (
                    <Alert severity="success" className="neutral bg-background-paper/60! mb-4">
                      <AlertTitle variant="subtitle2">Check your inbox</AlertTitle>
                      <Typography variant="body2" className="text-text-primary">
                        {successMessage}
                      </Typography>
                    </Alert>
                  )}

                  <Box className="flex flex-col gap-2">
                    <Button type="submit" variant="contained" className="mb-4" disabled={isSubmitting}>
                      {isSubmitting ? "Sending..." : "Continue"}
                    </Button>
                  </Box>

                  <Typography variant="body2" className="text-text-secondary">
                    By clicking Continue, Sign in with Google, or Sign in with GitHub, you agree to the{" "}
                    <Link
                      target="_blank"
                      href="/auth/terms-and-conditions"
                      className="link-primary link-underline-hover"
                    >
                      Terms and Conditions
                    </Link>{" "}
                    and{" "}
                    <Link target="_blank" href="/auth/privacy-policy" className="link-primary link-underline-hover">
                      Privacy Policy
                    </Link>
                    .
                  </Typography>
                </Box>
              </Box>
              <Divider className="text-text-secondary my-0 text-sm"></Divider>
              <Box className="flex flex-col">
                <Typography variant="h6" component="h6">
                  Sign in
                </Typography>
                <Typography variant="body1" className="text-text-secondary">
                  If you already have an account, please{" "}
                  <Link href="/auth/sign-in" className="link-primary link-underline-hover">
                    sign in
                  </Link>
                  .
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}
