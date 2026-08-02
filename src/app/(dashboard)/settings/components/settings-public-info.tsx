"use client";

import { useEffect, useState } from "react";

import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  FormControl,
  FormLabel,
  Grid,
  Input,
  MenuItem,
  Select,
  TextareaAutosize,
  Typography,
} from "@mui/material";
import { CameraAlt } from "@mui/icons-material";

import NiChevronDownSmall from "@/icons/nexture/ni-chevron-down-small";
import { getStoredAuthToken, getStoredAuthUser, normalizeAvatarUrl, setAuthCookies } from "@/lib/auth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const GENDER_OPTIONS = ["Female", "Male", "Other", "Not Specified"];
const MAX_AVATAR_SIZE_BYTES = 5 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/jpg"];

interface ProfileData {
  name: string;
  email: string;
  username: string;
  company: string;
  location: string;
  birthday: string;
  gender: string;
  bio: string;
  phone: string;
  jobTitle: string;
  profileImage: string;
}

export default function SettingsPublicInfo() {
  const [profile, setProfile] = useState<ProfileData>({
    name: "",
    email: "",
    username: "",
    company: "",
    location: "",
    birthday: "",
    gender: "",
    bio: "",
    phone: "",
    jobTitle: "",
    profileImage: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = getStoredAuthToken();
        const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.message || "Failed to load profile.");
        setProfile({
          name: data.name ?? "",
          email: data.email ?? "",
          username: data.username ?? "",
          company: data.company ?? "",
          location: data.location ?? "",
          birthday: data.birthday ?? "",
          gender: data.gender ?? "",
          bio: data.bio ?? "",
          phone: data.phone ?? "",
          jobTitle: data.jobTitle ?? "",
          profileImage: normalizeAvatarUrl(data.image ?? ""),
        });
      } catch (err) {
        const stored = getStoredAuthUser();
        if (stored) {
          setProfile((p) => ({
            ...p,
            name: stored.name ?? "",
            email: stored.email ?? "",
            company: stored.company ?? "",
            profileImage: stored.image ?? "",
          }));
        }
        setError(err instanceof Error ? err.message : "Failed to load profile.");
      } finally {
        setLoading(false);
      }
    };

    void fetchProfile();
  }, []);

  const set = (field: keyof ProfileData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setProfile((p) => ({ ...p, [field]: e.target.value }));

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setUploadError(null);
    setSuccess(false);
    try {
      const token = getStoredAuthToken();

      const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          name: profile.name,
          username: profile.username,
          company: profile.company,
          location: profile.location,
          birthday: profile.birthday,
          gender: profile.gender,
          bio: profile.bio,
          phone: profile.phone,
          jobTitle: profile.jobTitle,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Failed to update profile.");

      let updatedProfile = {
        ...profile,
        ...data,
        profileImage: normalizeAvatarUrl(data.image ?? profile.profileImage),
        image: normalizeAvatarUrl(data.image ?? profile.profileImage),
      };

      if (selectedAvatar) {
        const avatarForm = new FormData();
        avatarForm.append("avatar", selectedAvatar);

        const avatarRes = await fetch(`${API_BASE_URL}/api/auth/me/avatar`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: avatarForm,
        });

        const avatarData = await avatarRes.json();
        if (!avatarRes.ok) throw new Error(avatarData?.message || "Failed to upload profile image.");

        const imageUrl = normalizeAvatarUrl(avatarData?.image ?? updatedProfile.profileImage);
        updatedProfile = {
          ...updatedProfile,
          ...avatarData,
          profileImage: imageUrl,
          image: imageUrl,
        };

        setSelectedAvatar(null);
        setAvatarPreview("");
      }

      setProfile(updatedProfile as ProfileData);
      if (token) {
        const currentUser = getStoredAuthUser() ?? {};
        setAuthCookies(token, {
          ...currentUser,
          ...updatedProfile,
          image: updatedProfile.image ?? updatedProfile.profileImage,
        });
      }
      setSuccess(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update profile.";
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    const file = event.target.files?.[0];
    if (!file) return;

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      setUploadError("Please select a PNG or JPG image.");
      return;
    }

    if (file.size > MAX_AVATAR_SIZE_BYTES) {
      setUploadError("File size should not be greater than 5MB.");
      return;
    }

    const preview = URL.createObjectURL(file);
    setSelectedAvatar(file);
    setAvatarPreview(preview);
  };

  if (loading) {
    return (
      <Grid size={12}>
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <CircularProgress size={28} />
          </CardContent>
        </Card>
      </Grid>
    );
  }

  return (
    <Grid size={12}>
      <Card>
        <CardContent>
          <Typography variant="h6" component="h6" className="card-title">
            Public Information
          </Typography>

          {error && <Alert severity="error" className="mb-4">{error}</Alert>}
          {success && <Alert severity="success" className="mb-4">Profile updated successfully.</Alert>}

          {/* Picture */}
          <FormControl className="outlined lg:flex-row lg:gap-2.5 relative items-start" variant="standard" size="small" fullWidth>
            <FormLabel component="label" className="min-w-60">Picture</FormLabel>
            <Box className="relative flex items-center gap-4">
              <Box className="relative">
                <Avatar
                  alt={profile.name || "avatar"}
                  src={avatarPreview || profile.profileImage || undefined}
                  className="h-20 w-20 rounded-4xl"
                >
                  {profile.name?.charAt(0) ?? "U"}
                </Avatar>
                <Button
                  component="label"
                  className="absolute right-0 bottom-0 rounded-full border border-white bg-background-paper p-1 shadow-sm"
                  size="small"
                >
                  <CameraAlt fontSize="small" />
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/jpg"
                    hidden
                    onChange={handleAvatarSelect}
                  />
                </Button>
              </Box>
            </Box>
          </FormControl>
          {uploadError && <Typography variant="body2" className="text-danger mb-4">{uploadError}</Typography>}

          {/* Name */}
          <FormControl className="outlined lg:flex-row lg:gap-2.5" variant="standard" size="small" fullWidth>
            <FormLabel component="label" className="min-w-60">Name</FormLabel>
            <Input value={profile.name} onChange={set("name")} placeholder="Your full name" className="w-full" />
          </FormControl>

          {/* Username */}
          <FormControl className="outlined lg:flex-row lg:gap-2.5" variant="standard" size="small" fullWidth>
            <FormLabel component="label" className="min-w-60">Username</FormLabel>
            <Input value={profile.username} onChange={set("username")} placeholder="e.g. johndoe" className="w-full" />
          </FormControl>

          {/* Email — read only */}
          <FormControl className="outlined lg:flex-row lg:gap-2.5" variant="standard" size="small" fullWidth>
            <FormLabel component="label" className="min-w-60">Email</FormLabel>
            <Input value={profile.email} disabled className="w-full" />
          </FormControl>

          {/* Municipality / Organization */}
          <FormControl className="outlined lg:flex-row lg:gap-2.5" variant="standard" size="small" fullWidth>
            <FormLabel component="label" className="min-w-60">Municipality / Organization</FormLabel>
            <Input value={profile.company} onChange={set("company")} placeholder="e.g. Town of Strasburg" className="w-full" />
          </FormControl>

          {/* Job Title */}
          <FormControl className="outlined lg:flex-row lg:gap-2.5" variant="standard" size="small" fullWidth>
            <FormLabel component="label" className="min-w-60">Job Title</FormLabel>
            <Input value={profile.jobTitle} onChange={set("jobTitle")} placeholder="e.g. Finance Director" className="w-full" />
          </FormControl>

          {/* Location */}
          <FormControl className="outlined lg:flex-row lg:gap-2.5" variant="standard" size="small" fullWidth>
            <FormLabel component="label" className="min-w-60">Location</FormLabel>
            <Input value={profile.location} onChange={set("location")} placeholder="e.g. Springfield, IL" className="w-full" />
          </FormControl>

          {/* Phone */}
          <FormControl className="outlined lg:flex-row lg:gap-2.5" variant="standard" size="small" fullWidth>
            <FormLabel component="label" className="min-w-60">Phone</FormLabel>
            <Input value={profile.phone} onChange={set("phone")} placeholder="e.g. +1 555 000 0000" className="w-full" />
          </FormControl>

          {/* Birthday */}
          <FormControl className="outlined lg:flex-row lg:gap-2.5" variant="standard" size="small" fullWidth>
            <FormLabel component="label" className="min-w-60">Birthday</FormLabel>
            <Input value={profile.birthday} onChange={set("birthday")} placeholder="MM/DD/YYYY" className="w-full" />
          </FormControl>

          {/* Gender */}
          <FormControl fullWidth size="small" variant="standard" className="outlined lg:flex-row lg:gap-2.5">
            <FormLabel component="label" className="min-w-60">Gender</FormLabel>
            <Select
              className="w-full"
              value={profile.gender}
              displayEmpty
              onChange={(e) => setProfile((p) => ({ ...p, gender: e.target.value }))}
              IconComponent={NiChevronDownSmall}
              MenuProps={{ className: "outlined" }}
            >
              <MenuItem value="" disabled>Select gender</MenuItem>
              {GENDER_OPTIONS.map((g) => (
                <MenuItem key={g} value={g}>{g}</MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Bio */}
          <FormControl className="MuiTextField-root outlined lg:flex-row lg:gap-2.5" fullWidth>
            <FormLabel component="label" className="min-w-60">Bio</FormLabel>
            <TextareaAutosize
              minRows={2}
              maxRows={4}
              className="MuiInputBase-root MuiInput-root MuiInputBase-formControl outlined autosize w-full"
              placeholder="A short description about yourself"
              value={profile.bio}
              onChange={set("bio")}
            />
          </FormControl>

          <Button size="medium" color="primary" variant="outlined" onClick={() => void handleSave()} disabled={saving}>
            {saving ? "Saving..." : "Update"}
          </Button>
        </CardContent>
      </Card>
    </Grid>
  );
}
