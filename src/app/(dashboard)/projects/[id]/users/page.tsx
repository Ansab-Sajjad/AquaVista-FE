"use client";

import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormLabel,
  Input,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

import { getStoredAuthToken, isAdminUser } from "@/lib/auth";

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  lastActive?: string | null;
  addedAt?: string;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function UsersPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = (params?.id as string) || "";
  const [users, setUsers] = useState<User[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [newUser, setNewUser] = useState({ email: "" });

  // Redirect non-admins away — tab is hidden but guard direct URL access too
  useEffect(() => {
    if (!isAdminUser()) {
      router.replace(`/projects/${projectId}/dashboard`);
    }
  }, [projectId, router]);

  const loadUsers = useCallback(async () => {
    if (!projectId || !isAdminUser()) return;

    setLoading(true);
    setError(null);

    try {
      const token = getStoredAuthToken();
      const response = await fetch(`${API_BASE_URL}/api/projects/${projectId}/users`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          "Content-Type": "application/json",
        },
      });

      const data = await response.json().catch(() => []);
      if (!response.ok) {
        throw new Error(data?.message || "Unable to load project users.");
      }

      setUsers(
        Array.isArray(data)
          ? data.map((item: any) => ({
              id: item.id || item._id,
              name: item.name || item.email?.split("@")?.[0] || "",
              email: item.email,
              role: item.role === "admin" ? "Super Admin" : "Project User",
              status: item.status === "active" ? "Active" : "Pending",
              lastActive: item.lastActive,
              addedAt: item.addedAt,
            }))
          : [],
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load project users.");
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  const handleInvite = async () => {
    if (!newUser.email.trim() || !projectId) return;

    setSubmitting(true);
    setError(null);

    try {
      const token = getStoredAuthToken();
      const response = await fetch(`${API_BASE_URL}/api/projects/${projectId}/users`, {
        method: "POST",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: newUser.email }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data?.message || "Unable to invite user.");
      }

      setNewUser({ email: "" });
      setOpen(false);
      await loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to invite user.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemove = async (id: string) => {
    if (!projectId) return;

    setError(null);

    try {
      const token = getStoredAuthToken();
      const response = await fetch(`${API_BASE_URL}/api/projects/${projectId}/users/${id}`, {
        method: "DELETE",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          "Content-Type": "application/json",
        },
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data?.message || "Unable to remove user.");
      }

      await loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to remove user.");
    }
  };

  return (
    <Box className="flex w-full flex-col gap-6">
      <Box className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <Box>
          <Typography variant="h4" component="h2">
            Users
          </Typography>
          <Typography variant="body1" className="text-text-secondary">
            Manage who can access this project.
          </Typography>
        </Box>
        <Button variant="contained" onClick={() => setOpen(true)}>
          Invite User
        </Button>
      </Box>

      {error && (
        <Alert severity="error" className="bg-background-paper/70">
          {error}
        </Alert>
      )}

      <Card className="bg-background-paper shadow-darker-xs rounded-3xl">
        <CardContent className="p-0">
          {loading ? (
            <Box className="flex items-center justify-center py-16">
              <CircularProgress size={28} />
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center" className="text-text-secondary py-8">
                        No users have been added to this project yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="text-text-primary font-semibold">{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Chip
                            label={user.role}
                            size="small"
                            color={user.role === "Super Admin" ? "primary" : "default"}
                            variant={user.role === "Super Admin" ? "filled" : "outlined"}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={user.status}
                            size="small"
                            color={user.status === "Active" ? "success" : "warning"}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Button size="small" color="error" onClick={() => void handleRemove(user.id)}>
                            Remove
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Invite User</DialogTitle>
        <DialogContent className="flex flex-col gap-4">
          <FormControl className="outlined" variant="standard" size="small">
            <FormLabel>Email address</FormLabel>
            <Input
              value={newUser.email}
              onChange={(e) => setNewUser({ email: e.target.value })}
              placeholder="jane.smith@example.com"
            />
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} color="grey">
            Cancel
          </Button>
          <Button variant="contained" onClick={() => void handleInvite()} disabled={submitting}>
            {submitting ? "Inviting..." : "Send Invite"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
