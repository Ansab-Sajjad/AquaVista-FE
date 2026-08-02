"use client";

import Link from "next/link";
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
  Grid,
  Input,
  Typography,
} from "@mui/material";

import { getStoredAuthToken, isAdminUser } from "@/lib/auth";

type Project = {
  id: string;
  name: string;
  municipality: string;
  description?: string;
  teamCount: number;
  lastUpdated?: string | null;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function ProjectsPage() {
  const [open, setOpen] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newProject, setNewProject] = useState({
    name: "",
    municipality: "",
    description: "",
  });
  const isAdmin = isAdminUser();

  const loadProjects = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const token = getStoredAuthToken();
      const response = await fetch(`${API_BASE_URL}/api/projects`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          "Content-Type": "application/json",
        },
      });

      const data = await response.json().catch(() => []);
      if (!response.ok) {
        throw new Error(data?.message || "Unable to load projects.");
      }

      setProjects(
        Array.isArray(data)
          ? data.map((item: any) => ({
              id: item.id || item._id,
              name: item.name,
              municipality: item.municipality,
              description: item.description,
              teamCount: item.teamCount ?? 0,
              lastUpdated: item.lastUpdated || item.updatedAt,
            }))
          : [],
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load projects.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProjects();
  }, [loadProjects]);

  const handleCreate = async () => {
    if (!newProject.name.trim() || !newProject.municipality.trim()) return;

    setCreating(true);
    setError(null);

    try {
      const token = getStoredAuthToken();
      const response = await fetch(`${API_BASE_URL}/api/projects`, {
        method: "POST",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newProject.name,
          municipality: newProject.municipality,
          description: newProject.description,
        }),
      });

      const data = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(data?.message || "Unable to create project.");
      }

      setProjects((prev) => [
        {
          id: data?.id || String(Date.now()),
          name: data?.name || newProject.name,
          municipality: data?.municipality || newProject.municipality,
          description: data?.description || newProject.description,
          teamCount: data?.teamCount || 0,
          lastUpdated: data?.lastUpdated || new Date().toISOString(),
        },
        ...prev,
      ]);
      setNewProject({ name: "", municipality: "", description: "" });
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create project.");
    } finally {
      setCreating(false);
    }
  };

  const formatDate = (value?: string | null) => {
    if (!value) return "Recently updated";

    const parsedDate = new Date(value);
    if (Number.isNaN(parsedDate.getTime())) return "Recently updated";

    return parsedDate.toLocaleDateString();
  };

  return (
    <Box className="flex w-full flex-col gap-6">
      <Box className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <Box>
          <Typography variant="h2" component="h1">
            Projects
          </Typography>
          <Typography variant="body1" className="text-text-secondary">
            Select a municipal rate study project to open its workspace.
          </Typography>
        </Box>
        {isAdmin && (
          <Button variant="contained" onClick={() => setOpen(true)}>
            Create Project
          </Button>
        )}
      </Box>

      {error && (
        <Alert severity="error" className="bg-background-paper/70">
          {error}
        </Alert>
      )}

      {loading ? (
        <Box className="bg-background-paper shadow-darker-xs flex items-center justify-center rounded-4xl p-12">
          <CircularProgress size={28} />
        </Box>
      ) : projects.length === 0 ? (
        <Box className="bg-background-paper shadow-darker-xs flex flex-col items-center justify-center gap-4 rounded-4xl p-12 text-center">
          <Typography variant="h4">No projects yet</Typography>
          <Typography variant="body1" className="text-text-secondary">
            {isAdmin ? "Create a project to start a municipal rate study." : "You have not been added to any projects yet. Contact your AquaVista consultant."}
          </Typography>
          {isAdmin && (
            <Button variant="contained" onClick={() => setOpen(true)}>
              Create Project
            </Button>
          )}
        </Box>
      ) : (
        <Grid container spacing={3}>
          {projects.map((project) => (
            <Grid key={project.id} size={{ xs: 12, md: 6, lg: 4 }}>
              <Link
                href={`/projects/${project.id}/dashboard`}
                className="block h-full no-underline"
              >
                <Card className="bg-background-paper shadow-darker-xs h-full w-full cursor-pointer rounded-3xl transition-shadow hover:shadow-lg">
                  <CardContent className="flex h-full flex-col gap-3 p-6">
                    <Typography variant="h5" component="h3" className="text-text-primary">
                      {project.name}
                    </Typography>
                    <Typography variant="body2" className="text-text-secondary">
                      {project.description || "No description provided."}
                    </Typography>
                    <Box className="mt-auto flex flex-wrap items-center gap-2 pt-4">
                      <Chip label={project.municipality} size="small" color="primary" />
                      <Chip label={`${project.teamCount} members`} size="small" variant="outlined" />
                      <Chip
                        label={`Updated ${formatDate(project.lastUpdated)}`}
                        size="small"
                        variant="outlined"
                        className="text-text-secondary"
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Link>
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create Project</DialogTitle>
        <DialogContent className="flex flex-col gap-4">
          <FormControl className="outlined" variant="standard" size="small">
            <FormLabel>Project name</FormLabel>
            <Input
              value={newProject.name}
              onChange={(e) => setNewProject((p) => ({ ...p, name: e.target.value }))}
              placeholder="e.g. Town of Strasburg"
            />
          </FormControl>
          <FormControl className="outlined" variant="standard" size="small">
            <FormLabel>Municipality name</FormLabel>
            <Input
              value={newProject.municipality}
              onChange={(e) => setNewProject((p) => ({ ...p, municipality: e.target.value }))}
              placeholder="e.g. Strasburg"
            />
          </FormControl>
          <FormControl className="outlined" variant="standard" size="small">
            <FormLabel>Description (optional)</FormLabel>
            <Input
              value={newProject.description}
              onChange={(e) => setNewProject((p) => ({ ...p, description: e.target.value }))}
              placeholder="Brief description of the engagement"
            />
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} color="grey">
            Cancel
          </Button>
          <Button variant="contained" onClick={() => void handleCreate()} disabled={creating}>
            {creating ? "Creating..." : "Create"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
