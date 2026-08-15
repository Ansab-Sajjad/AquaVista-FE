"use client";

import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormLabel,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";

import { apiClient } from "@/lib/api-client";
import { isAdminUser } from "@/lib/auth";
import { CheckboxMediumChecked, CheckboxMediumEmptyOutlined } from "@/icons/form/mui-checkbox";
import { Chat, Delete, MoreVert, Visibility } from "@mui/icons-material";

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  lastActive?: string | null;
  addedAt?: string;
};

export default function UsersPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = (params?.id as string) || "";
  const [users, setUsers] = useState<User[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<{ el: HTMLElement; userId: string } | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loadingAllUsers, setLoadingAllUsers] = useState(false);
  const [selectedToInvite, setSelectedToInvite] = useState<(User | string)[]>([]);

  const activeUsers = useMemo(() => {
    const projectUserIds = new Set(users.map((u) => u.id));
    return allUsers.filter(
      (u) => u.status?.toLowerCase() === "active" && !projectUserIds.has(u.id),
    );
  }, [allUsers, users]);

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
      const data = await apiClient.get<any[]>(`/api/projects/${projectId}/users`);

      setUsers(
        Array.isArray(data)
          ? data.map((item: any) => ({
              id: String(item.id || item._id || ""),
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

  useEffect(() => {
    if (!open || !isAdminUser()) return;
    let cancelled = false;
    const loadAllUsers = async () => {
      setLoadingAllUsers(true);
      setInviteError(null);
      try {
        const data = await apiClient.get<any[]>(`/api/projects/admin/users`);
        if (!cancelled) {
          setAllUsers(
            Array.isArray(data)
              ? data.map((item: any) => ({
                  id: String(item.id || item._id || ""),
                  name: item.name || item.email?.split("@")?.[0] || "",
                  email: item.email || "",
                  role: item.role || "project_user",
                  status: item.status || "pending",
                  lastActive: item.lastActive,
                }))
              : [],
          );
        }
      } catch (err) {
        if (!cancelled) setInviteError(err instanceof Error ? err.message : "Unable to load users.");
      } finally {
        if (!cancelled) setLoadingAllUsers(false);
      }
    };
    void loadAllUsers();
    return () => {
      cancelled = true;
    };
  }, [open]);

  const handleInvite = async () => {
    if (!projectId) return;

    const emails = [
      ...new Set(
        selectedToInvite
          .map((item) => (typeof item === "string" ? item : item.email))
          .filter(Boolean),
      ),
    ];

    if (emails.length === 0) {
      setInviteError("Please enter at least one email or select a user.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const invalid = emails.filter((email) => !emailRegex.test(email));
    if (invalid.length > 0) {
      setInviteError(`Invalid email address(es): ${invalid.join(", ")}`);
      return;
    }

    setSubmitting(true);
    setInviteError(null);

    const failed: string[] = [];
    const alreadyMember: string[] = [];
    let invitedCount = 0;

    for (const email of emails) {
      try {
        await apiClient.post(`/api/projects/${projectId}/users`, { email });
        invitedCount++;
      } catch (err: any) {
        if (err?.status === 409) {
          alreadyMember.push(email);
        } else {
          failed.push(`${email} — ${err?.message || "Unable to invite"}`);
        }
      }
    }

    if (invitedCount > 0) {
      await loadUsers();
    }

    if (failed.length === 0 && alreadyMember.length === 0) {
      setSelectedToInvite([]);
      setOpen(false);
    } else {
      const messages: string[] = [];
      if (alreadyMember.length > 0) {
        messages.push(`${alreadyMember.length} already in project: ${alreadyMember.join(", ")}`);
      }
      if (failed.length > 0) {
        messages.push(`Failed: ${failed.join("; ")}`);
      }
      setInviteError(messages.join(" | "));
    }

    setSubmitting(false);
  };

  const handleRemove = async (id: string) => {
    if (!projectId) return;

    setError(null);

    try {
      await apiClient.delete(`/api/projects/${projectId}/users/${id}`);
      await loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to remove user.");
    }
  };

  return (
    <Box className="flex w-full flex-col gap-6">
      <Box className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between animate-in fade-in slide-in-from-top-2 duration-500">
        <Box className="space-y-1">
          <Typography variant="h4" component="h2">
            Users
          </Typography>
          <Typography variant="body1" className="text-text-secondary">
            Manage who can access this project.
          </Typography>
        </Box>
        <Button
          variant="contained"
          onClick={() => setOpen(true)}
          className="transition-transform duration-200 hover:scale-105"
        >
          Invite User
        </Button>
      </Box>

      {error && (
        <Alert severity="error" className="bg-background-paper/70 animate-in fade-in slide-in-from-top-2 duration-300">
          {error}
        </Alert>
      )}

      <Card className="bg-background-paper shadow-darker-xs rounded-3xl overflow-hidden transition-all duration-300 hover:shadow-md animate-in fade-in slide-in-from-bottom-3 duration-500 delay-100">
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
                    <TableCell className="font-semibold">Name</TableCell>
                    <TableCell className="font-semibold">Email</TableCell>
                    <TableCell className="font-semibold">Role</TableCell>
                    <TableCell className="font-semibold">Status</TableCell>
                    <TableCell className="font-semibold">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
{users.length === 0 ? (
  <TableRow>
    <TableCell colSpan={5} align="left" className="text-text-secondary py-12 text-center">
      No users have been added to this project yet.
    </TableCell>
  </TableRow>
) : (
  users.map((user, index) => (
    <TableRow
      key={user.id}
      className="transition-colors duration-200 hover:bg-grey-25 animate-in fade-in slide-in-from-left-2"
      style={{ animationDelay: `${index * 50}ms`, animationDuration: "400ms" }}
    >
      <TableCell className="text-text-primary font-semibold">{user.name}</TableCell>
      <TableCell className="text-text-secondary">{user.email}</TableCell>
      <TableCell>
        <Chip
          label={user.role}
          size="small"
          color={user.role === "Super Admin" ? "primary" : "default"}
          variant={user.role === "Super Admin" ? "filled" : "outlined"}
          className="transition-transform duration-200 hover:scale-105"
        />
      </TableCell>
      <TableCell>
        <Chip
          label={user.status}
          size="small"
          color={user.status === "Active" ? "success" : "warning"}
          className="transition-transform duration-200 hover:scale-105"
        />
      </TableCell>
      <TableCell>
        <IconButton
          size="small"
          aria-label={`Actions for ${user.name}`}
          onClick={(e) => setMenuAnchor({ el: e.currentTarget, userId: user.id })}
          className="transition-transform duration-200 hover:scale-110"
        >
          <MoreVert fontSize="small" />
        </IconButton>
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

      <Menu
        anchorEl={menuAnchor?.el}
        open={Boolean(menuAnchor)}
        onClose={() => setMenuAnchor(null)}
        slotProps={{ paper: { elevation: 2, sx: { minWidth: 180, borderRadius: 2 } } }}
      >
        <MenuItem
          onClick={() => {
            router.push(`/users/${menuAnchor!.userId}`);
            setMenuAnchor(null);
          }}
        >
          <ListItemIcon><Visibility fontSize="small" /></ListItemIcon>
          <ListItemText>View User</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            router.push(`/projects/${projectId}/ask-ava?userId=${encodeURIComponent(menuAnchor!.userId)}`);
            setMenuAnchor(null);
          }}
        >
          <ListItemIcon><Chat fontSize="small" /></ListItemIcon>
          <ListItemText>View Chat</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem
          onClick={() => {
            void handleRemove(menuAnchor!.userId);
            setMenuAnchor(null);
          }}
          sx={{ color: "error.main" }}
        >
          <ListItemIcon><Delete fontSize="small" color="error" /></ListItemIcon>
          <ListItemText>Remove</ListItemText>
        </MenuItem>
      </Menu>

      <Dialog
        open={open}
        onClose={() => {
          setOpen(false);
          setSelectedToInvite([]);
          setInviteError(null);
        }}
        maxWidth="sm"
        fullWidth
        slotProps={{ paper: { sx: { overflow: "visible" } } }}
      >
        <DialogTitle>Invite Users</DialogTitle>
        <DialogContent className="flex flex-col gap-4" sx={{ overflow: "visible" }}>
          {inviteError && (
            <Alert severity="error" className="bg-background-paper/70">
              {inviteError}
            </Alert>
          )}
          <FormControl className="outlined" variant="standard" size="small" fullWidth>
            <FormLabel>Users or email addresses</FormLabel>
            <Autocomplete
              multiple
              freeSolo
              disableCloseOnSelect
              loading={loadingAllUsers}
              options={activeUsers}
              value={selectedToInvite}
              onChange={(_event, value) => setSelectedToInvite(value)}
              filterSelectedOptions
              disablePortal
              slotProps={{
                popper: { sx: { zIndex: (theme) => theme.zIndex.modal + 1 } },
                listbox: { sx: { maxHeight: 240 } },
              }}
              getOptionLabel={(option) =>
                typeof option === "string" ? option : option.name || option.email
              }
              isOptionEqualToValue={(option, value) => {
                if (typeof option === "string" || typeof value === "string") return option === value;
                return option.id === value.id;
              }}
              getOptionKey={(option) =>
                typeof option === "string" ? option : option.id || option.email
              }
              renderOption={(props, option, { selected }) => {
                const { key, ...optionProps } = props;
                const label = typeof option === "string" ? option : option.name;
                const email = typeof option === "string" ? option : option.email;
                return (
                  <Box component="li" key={key} {...optionProps} className="flex items-center gap-2">
                    <Checkbox
                      checked={selected}
                      icon={<CheckboxMediumEmptyOutlined />}
                      checkedIcon={<CheckboxMediumChecked />}
                      sx={{ p: 0.5 }}
                    />
                    <Box className="flex flex-col">
                      <Typography variant="body2" className="font-medium">{label}</Typography>
                      {email && email !== label && (
                        <Typography variant="caption" className="text-text-secondary">{email}</Typography>
                      )}
                    </Box>
                  </Box>
                );
              }}
              noOptionsText={
                loadingAllUsers
                  ? "Loading users..."
                  : activeUsers.length === 0
                    ? "No active users available to invite"
                    : "No matches found"
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant="standard"
                  className="outlined"
                  placeholder="Type an email or select active users"
                  slotProps={{
                    htmlInput: {
                      ...params.slotProps.htmlInput,
                      autoComplete: "new-password",
                    },
                    input: {
                      ...params.slotProps.input,
                      endAdornment: (
                        <>
                          {loadingAllUsers && <CircularProgress size={16} sx={{ mr: 2 }} />}
                          {params.slotProps.input?.endAdornment}
                        </>
                      ),
                    },
                  }}
                />
              )}
            />
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setOpen(false);
              setSelectedToInvite([]);
              setInviteError(null);
            }}
            color="grey"
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={() => void handleInvite()}
            disabled={submitting || selectedToInvite.length === 0}
          >
            {submitting ? "Inviting..." : "Send Invites"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
