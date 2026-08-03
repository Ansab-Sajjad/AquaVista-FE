"use client";

import SettingsMenu from "../components/settings-menu";
import Link from "next/link";
import { useState } from "react";

import {
  Alert,
  Box,
  Breadcrumbs,
  Button,
  Card,
  CardContent,
  Drawer,
  FormControl,
  FormLabel,
  IconButton,
  Input,
  InputAdornment,
  Tooltip,
  Typography,
} from "@mui/material";
import { Grid } from "@mui/material";

import NiListCircle from "@/icons/nexture/ni-list-circle";
import NiEyeOpen from "@/icons/nexture/ni-eye-open";
import NiEyeClose from "@/icons/nexture/ni-eye-close";
import NiCheckSquare from "@/icons/nexture/ni-check-square";
import { getStoredAuthToken } from "@/lib/auth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const rules = [
  { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
  { label: "At least one uppercase and lowercase letter", test: (p: string) => /[A-Z]/.test(p) && /[a-z]/.test(p) },
  { label: "At least one number", test: (p: string) => /[0-9]/.test(p) },
];

function PasswordStrength({ password }: { password: string }) {
  if (!password) return null;
  return (
    <Box className="mt-2 flex flex-col gap-1">
      {rules.map((rule) => {
        const passed = rule.test(password);
        return (
          <Box key={rule.label} className="flex items-center gap-1.5">
            <NiCheckSquare
              size="small"
              className={passed ? "text-success" : "text-text-disabled"}
            />
            <Typography variant="body2" className={passed ? "text-success" : "text-text-disabled"}>
              {rule.label}
            </Typography>
          </Box>
        );
      })}
    </Box>
  );
}

function PasswordInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <Input
      type={show ? "text" : "password"}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full"
      endAdornment={
        <InputAdornment position="end">
          <IconButton size="small" onClick={() => setShow((s) => !s)} edge="end" tabIndex={-1}>
            {show ? <NiEyeOpen size="small" /> : <NiEyeClose size="small" />}
          </IconButton>
        </InputAdornment>
      }
    />
  );
}

export default function PasswordPage() {
  const [openDrawer, setOpenDrawer] = useState(false);
  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const set = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSave = async () => {
    setError(null);
    setSuccess(false);

    if (!form.currentPassword || !form.newPassword || !form.confirmPassword) {
      setError("All fields are required.");
      return;
    }
    const failedRule = rules.find((r) => !r.test(form.newPassword));
    if (failedRule) {
      setError(`Password requirement not met: ${failedRule.label}`);
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    setSaving(true);
    try {
      const token = getStoredAuthToken();
      const res = await fetch(`${API_BASE_URL}/api/auth/me/password`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: form.currentPassword, newPassword: form.newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Failed to update password.");
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update password.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Grid container spacing={5} className="items-start">
      <Grid size={"auto"} className="hidden pe-8 lg:flex">
        <SettingsMenu />
      </Grid>

      <Grid size={"grow"} spacing={5} container>
        <Grid size={12} spacing={2.5} container>
          <Grid size={{ xs: 12, md: "grow" }}>
            <Typography variant="h1" component="h1" className="mb-0">
              Password
            </Typography>
            <Breadcrumbs>
              <Link color="inherit" href="/overview">Overview</Link>
              <Link color="inherit" href="/settings">Settings</Link>
              <Typography variant="body2">Password</Typography>
            </Breadcrumbs>
          </Grid>
          <Grid size={{ xs: 12, md: "auto" }} className="lg:hidden">
            <Tooltip title="Table of Contents">
              <Button
                className="icon-only surface-standard"
                color="grey"
                variant="surface"
                onClick={() => setOpenDrawer(true)}
              >
                <NiListCircle size={"medium"} />
              </Button>
            </Tooltip>
          </Grid>
        </Grid>

        <Grid size={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" component="h6" className="card-title">
                Change Password
              </Typography>

              {error && <Alert severity="error" className="mb-4">{error}</Alert>}
              {success && <Alert severity="success" className="mb-4">Password updated successfully.</Alert>}

              <FormControl className="outlined lg:flex-row lg:gap-2.5" variant="standard" size="small" fullWidth>
                <FormLabel component="label" className="min-w-60">Current Password</FormLabel>
                <PasswordInput
                  value={form.currentPassword}
                  onChange={set("currentPassword")}
                  placeholder="Enter current password"
                />
              </FormControl>

              <FormControl className="outlined lg:flex-row lg:gap-2.5" variant="standard" size="small" fullWidth>
                <FormLabel component="label" className="min-w-60">New Password</FormLabel>
                <Box className="flex w-full flex-col">
                  <PasswordInput
                    value={form.newPassword}
                    onChange={set("newPassword")}
                    placeholder="At least 8 characters"
                  />
                  <PasswordStrength password={form.newPassword} />
                </Box>
              </FormControl>

              <FormControl className="outlined lg:flex-row lg:gap-2.5" variant="standard" size="small" fullWidth>
                <FormLabel component="label" className="min-w-60">Confirm New Password</FormLabel>
                <PasswordInput
                  value={form.confirmPassword}
                  onChange={set("confirmPassword")}
                  placeholder="Repeat new password"
                />
              </FormControl>

              <Button
                size="medium"
                color="primary"
                variant="outlined"
                onClick={() => void handleSave()}
                disabled={saving}
              >
                {saving ? "Saving..." : "Update Password"}
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Drawer
        open={openDrawer}
        anchor="right"
        onClose={() => setOpenDrawer(false)}
        slotProps={{ paper: { className: "MuiDrawer-paperAnchorRight" } }}
      >
        <Box className="min-w-80 p-7">
          <SettingsMenu />
        </Box>
      </Drawer>
    </Grid>
  );
}
