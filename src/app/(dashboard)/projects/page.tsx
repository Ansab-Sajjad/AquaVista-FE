"use client";

import Link from "next/link";
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
  Grid,
  Input,
  Typography,
} from "@mui/material";

const MOCK_PROJECTS = [
  {
    id: "1",
    name: "Town of Strasburg",
    municipality: "Strasburg",
    description: "Water and sewer rate study for FY2026.",
    teamCount: 4,
    lastUpdated: "2026-06-28",
  },
  {
    id: "2",
    name: "City of Thornton",
    municipality: "Thornton",
    description: "Multi-utility rate adequacy review.",
    teamCount: 3,
    lastUpdated: "2026-06-25",
  },
];

export default function ProjectsPage() {
  const [open, setOpen] = useState(false);
  const [projects, setProjects] = useState(MOCK_PROJECTS);
  const [newProject, setNewProject] = useState({
    name: "",
    municipality: "",
    description: "",
  });

  const handleCreate = () => {
    if (!newProject.name.trim() || !newProject.municipality.trim()) return;
    setProjects((prev) => [
      ...prev,
      {
        id: String(prev.length + 1),
        name: newProject.name,
        municipality: newProject.municipality,
        description: newProject.description,
        teamCount: 0,
        lastUpdated: new Date().toISOString().split("T")[0],
      },
    ]);
    setNewProject({ name: "", municipality: "", description: "" });
    setOpen(false);
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
        <Button variant="contained" onClick={() => setOpen(true)}>
          Create Project
        </Button>
      </Box>

      {projects.length === 0 ? (
        <Box className="flex flex-col items-center justify-center gap-4 rounded-4xl bg-background-paper p-12 text-center shadow-darker-xs">
          <Typography variant="h4">No projects yet</Typography>
          <Typography variant="body1" className="text-text-secondary">
            Create a project to start a municipal rate study.
          </Typography>
          <Button variant="contained" onClick={() => setOpen(true)}>
            Create Project
          </Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {projects.map((project) => (
            <Grid key={project.id} size={{ xs: 12, md: 6, lg: 4 }}>
              <Card
                component={Link}
                href={`/projects/${project.id}/dashboard`}
                className="bg-background-paper shadow-darker-xs h-full cursor-pointer rounded-3xl no-underline transition-shadow hover:shadow-lg"
              >
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
                      label={`Updated ${project.lastUpdated}`}
                      size="small"
                      variant="outlined"
                      className="text-text-secondary"
                    />
                  </Box>
                </CardContent>
              </Card>
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
          <Button variant="contained" onClick={handleCreate}>
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
