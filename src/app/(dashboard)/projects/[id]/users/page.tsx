"use client";

import { useParams } from "next/navigation";
import { useState } from "react";

import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormLabel,
  Input,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

type User = {
  id: string;
  name: string;
  email: string;
  role: "Super Admin" | "Project User";
  status: "Active" | "Pending";
};

const MOCK_USERS: User[] = [
  { id: "1", name: "Admin User", email: "admin@Aquavista.dev", role: "Super Admin", status: "Active" },
  { id: "2", name: "Analyst One", email: "analyst@example.com", role: "Project User", status: "Active" },
];

export default function UsersPage() {
  const params = useParams();
  const projectId = (params?.id as string) || "";
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [open, setOpen] = useState(false);
  const [newUser, setNewUser] = useState({ name: "", email: "", role: "Project User" as User["role"] });

  const handleInvite = () => {
    if (!newUser.name.trim() || !newUser.email.trim()) return;
    setUsers((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        status: "Pending",
      },
    ]);
    setNewUser({ name: "", email: "", role: "Project User" });
    setOpen(false);
  };

  const handleRemove = (id: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== id));
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

      <Card className="bg-background-paper shadow-darker-xs rounded-3xl">
        <CardContent className="p-0">
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
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-semibold text-text-primary">{user.name}</TableCell>
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
                      <Button size="small" color="error" onClick={() => handleRemove(user.id)}>
                        Remove
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Invite User</DialogTitle>
        <DialogContent className="flex flex-col gap-4">
          <FormControl className="outlined" variant="standard" size="small">
            <FormLabel>Full name</FormLabel>
            <Input
              value={newUser.name}
              onChange={(e) => setNewUser((p) => ({ ...p, name: e.target.value }))}
              placeholder="e.g. Jane Smith"
            />
          </FormControl>
          <FormControl className="outlined" variant="standard" size="small">
            <FormLabel>Email address</FormLabel>
            <Input
              value={newUser.email}
              onChange={(e) => setNewUser((p) => ({ ...p, email: e.target.value }))}
              placeholder="jane.smith@example.com"
            />
          </FormControl>
          <FormControl className="outlined" variant="standard" size="small">
            <FormLabel>Project role</FormLabel>
            <Select
              value={newUser.role}
              onChange={(e) => setNewUser((p) => ({ ...p, role: e.target.value as User["role"] }))}
            >
              <MenuItem value="Project User">Project User</MenuItem>
              <MenuItem value="Super Admin">Super Admin</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} color="grey">
            Cancel
          </Button>
          <Button variant="contained" onClick={handleInvite}>
            Send Invite
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
