"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import {
  Alert,
  Avatar,
  Box,
  Breadcrumbs,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { ArrowBack, Business, Email, Forum, Person, Work } from "@mui/icons-material";

import { getStoredAuthToken, isAdminUser, normalizeAvatarUrl } from "@/lib/auth";

type Project = { id: string; name: string; municipality: string };
type UserDetail = {
  id: string;
  name: string;
  email: string;
  company?: string;
  role: string;
  status: string;
  lastActive?: string;
  createdAt: string;
  profileImage?: string | null;
  image?: string | null;
  projects: Project[];
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

function formatDate(value?: string) {
  if (!value) return "Never logged in";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Unknown" : date.toLocaleDateString();
}

function formatStatus(value?: string) {
  if (!value) return "Unknown";
  const normalized = value.trim();
  return normalized.charAt(0).toUpperCase() + normalized.slice(1).toLowerCase();
}

function getStatusColor(status: string) {
  const normalizedStatus = status.toLowerCase();

  if (normalizedStatus === "active") return "success";
  if (normalizedStatus === "pending") return "primary";
  return "warning";
}

export default function UserDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [user, setUser] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const userId = params?.id;

  useEffect(() => {
    if (!isAdminUser()) {
      router.replace("/projects");
      return;
    }

    if (!userId) {
      setError("User not found.");
      setLoading(false);
      return;
    }

    const loadUser = async () => {
      setLoading(true);
      setError(null);

      try {
        const token = getStoredAuthToken();
        const response = await fetch(`${API_BASE_URL}/api/projects/admin/users/${userId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const data = await response.json().catch(() => null);

        if (!response.ok) {
          throw new Error(data?.message || "Unable to load user details.");
        }

        setUser(data || null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load user details.");
      } finally {
        setLoading(false);
      }
    };

    void loadUser();
  }, [router, userId]);

  const detailItems = useMemo(
    () => [
      { label: "Email", value: user?.email || "-", icon: <Email fontSize="small" /> },
      { label: "Company", value: user?.company || "-", icon: <Business fontSize="small" /> },
      { label: "Role", value: user?.role === "admin" ? "Admin" : "Project user", icon: <Work fontSize="small" /> },
      { label: "Status", value: formatStatus(user?.status), icon: <Person fontSize="small" /> },
      { label: "Last active", value: formatDate(user?.lastActive), icon: <Person fontSize="small" /> },
      { label: "Joined", value: formatDate(user?.createdAt), icon: <Person fontSize="small" /> },
    ],
    [user],
  );

  if (!isAdminUser()) return null;

  return (
    <Box className="flex w-full flex-col gap-6">
      <Box className="flex flex-col gap-2">
        <Box className="flex items-center justify-between gap-3">
          <Breadcrumbs aria-label="breadcrumb">
            <Link href="/users" className="text-primary no-underline hover:underline">
              Users
            </Link>
            <Typography color="text.primary">User details</Typography>
          </Breadcrumbs>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => router.push("/users")}
            variant="outlined"
            className="w-fit"
            sx={{
              borderColor: "divider",
              color: "text.primary",
              px: 2,
              py: 0.8,
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 600,
              "&:hover": {
                borderColor: "primary.main",
                color: "primary.main",
                backgroundColor: "action.hover",
              },
            }}
          >
            Back to users
          </Button>
        </Box>
      </Box>

      {loading ? (
        <Box className="flex justify-center py-16">
          <CircularProgress size={28} />
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : !user ? (
        <Alert severity="warning">User not found.</Alert>
      ) : (
        <Grid container spacing={4}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Card variant="outlined" className="rounded-3xl border-divider bg-background-paper">
              <CardContent className="flex flex-col items-center gap-5 p-5 md:p-6">
                <Box className="self-start">
                  <Chip
                    label={formatStatus(user.status)}
                    color={getStatusColor(user.status)}
                    size="small"
                  />
                </Box>
                <Avatar
                  alt={user.name}
                  src={user.profileImage ? normalizeAvatarUrl(user.profileImage) : undefined}
                  className="h-24 w-24 rounded-4xl"
                >
                  {user.name?.charAt(0) ?? "U"}
                </Avatar>
                <Box className="text-center">
                  <Typography variant="h4">{user.name}</Typography>
                  <Typography variant="body2" className="text-text-secondary">
                    {user.role === "admin" ? "Admin" : "Project user"}
                  </Typography>
                </Box>

                <Divider />

                <Box className="overflow-hidden rounded-3xl bg-background-paper w-full">
                  <Box className="flex items-center gap-2 p-4 text-text-secondary">
                    <Email fontSize="small" />
                    <Typography variant="body2">Email</Typography>
                  </Box>
                  <Box className="px-4 pb-4 pt-0">
                    <Typography className="font-semibold break-words">{user.email}</Typography>
                  </Box>
                  <Divider className="mx-4" />
                  <Box className="flex items-center gap-2 p-4 text-text-secondary">
                    <Business fontSize="small" />
                    <Typography variant="body2">Company</Typography>
                  </Box>
                  <Box className="px-4 pb-4 pt-0">
                    <Typography className="font-semibold">{user.company || "-"}</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 8 }}>
            <Grid container spacing={4}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Card variant="outlined" className="rounded-3xl border-divider bg-background-paper">
                  <CardContent className="p-5 md:p-6">
                    <Typography variant="body2" className="text-text-secondary">
                      Last active
                    </Typography>
                    <Typography className="font-semibold">{formatDate(user.lastActive)}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Card variant="outlined" className="rounded-3xl border-divider bg-background-paper">
                  <CardContent className="p-5 md:p-6">
                    <Typography variant="body2" className="text-text-secondary">
                      Joined
                    </Typography>
                    <Typography className="font-semibold">{formatDate(user.createdAt)}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Card variant="outlined" className="rounded-3xl border-divider bg-background-paper">
                  <CardContent className="p-5 md:p-6">
                    <Typography variant="h6" className="mb-4">
                      Assigned projects
                    </Typography>
                    {user.projects.length ? (
                      <Box className="grid gap-3 md:grid-cols-2">
                        {user.projects.map((project) => (
                          <Box
                            key={project.id}
                            className="flex items-center justify-between rounded-3xl border border-divider p-4 transition hover:bg-primary/10"
                          >
                            <Link
                              href={`/projects/${project.id}/dashboard`}
                              className="flex-1 text-sm font-medium text-primary no-underline"
                            >
                              <Typography className="font-semibold">{project.name}</Typography>
                              <Typography variant="body2" className="text-text-secondary">
                                {project.municipality}
                              </Typography>
                            </Link>
                            {isAdminUser() && (
                              <Tooltip title="View Ask AVA chat">
                                <IconButton
                                  size="small"
                                  onClick={() =>
                                    router.push(
                                      `/projects/${project.id}/ask-ava?userId=${encodeURIComponent(user.id)}`,
                                    )
                                  }
                                  sx={{ color: "text.secondary", "&:hover": { color: "primary.main" } }}
                                >
                                  <Forum fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                          </Box>
                        ))}
                      </Box>
                    ) : (
                      <Typography className="text-text-secondary">No projects assigned.</Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      )}
    </Box>
  );
}
