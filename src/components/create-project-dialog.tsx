"use client";

import { useState } from "react";

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormLabel,
  Input,
} from "@mui/material";

import { getStoredAuthToken } from "@/lib/auth";

export type CreatedProject = {
  id: string;
  name: string;
  municipality: string;
  description?: string;
  teamCount: number;
  fileCount: number;
  lastUpdated?: string | null;
};

type CreateProjectDialogProps = {
  open: boolean;
  onClose: () => void;
  onCreated?: (project: CreatedProject) => void;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const EMPTY_FORM = { name: "", municipality: "", description: "" };

export default function CreateProjectDialog({ open, onClose, onCreated }: CreateProjectDialogProps) {
  const [newProject, setNewProject] = useState(EMPTY_FORM);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setNewProject(EMPTY_FORM);
    setError(null);
  };

  const handleClose = () => {
    if (creating) return;
    reset();
    onClose();
  };

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

      const created: CreatedProject = {
        id: data?.id || String(Date.now()),
        name: data?.name || newProject.name,
        municipality: data?.municipality || newProject.municipality,
        description: data?.description || newProject.description,
        teamCount: data?.teamCount || 0,
        fileCount: data?.fileCount || 0,
        lastUpdated: data?.lastUpdated || new Date().toISOString(),
      };

      reset();
      onCreated?.(created);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create project.");
    } finally {
      setCreating(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      slotProps={{
        backdrop: {
          className: "backdrop-blur-sm",
          timeout: 300,
        },
      }}
      className="animate-in fade-in zoom-in-95 duration-200"
    >
      <DialogTitle className="pb-2">Create Project</DialogTitle>
      <DialogContent className="flex flex-col gap-5 pt-5">
        {error && <p className="text-error text-sm">{error}</p>}
        <FormControl className="outlined" variant="standard" size="small">
          <FormLabel className="mb-1.5">Project name</FormLabel>
          <Input
            value={newProject.name}
            onChange={(e) => setNewProject((p) => ({ ...p, name: e.target.value }))}
            placeholder="e.g. Town of Strasburg"
            className="transition-all duration-200 focus-within:scale-[1.01]"
          />
        </FormControl>
        <FormControl className="outlined" variant="standard" size="small">
          <FormLabel className="mb-1.5">Municipality name</FormLabel>
          <Input
            value={newProject.municipality}
            onChange={(e) => setNewProject((p) => ({ ...p, municipality: e.target.value }))}
            placeholder="e.g. Strasburg"
            className="transition-all duration-200 focus-within:scale-[1.01]"
          />
        </FormControl>
        <FormControl className="outlined" variant="standard" size="small">
          <FormLabel className="mb-1.5">Description (optional)</FormLabel>
          <Input
            value={newProject.description}
            onChange={(e) => setNewProject((p) => ({ ...p, description: e.target.value }))}
            placeholder="Brief description of the engagement"
            className="transition-all duration-200 focus-within:scale-[1.01]"
          />
        </FormControl>
      </DialogContent>
      <DialogActions className="p-6 pt-4">
        <Button
          onClick={handleClose}
          color="grey"
          disabled={creating}
          className="transition-transform duration-200 hover:scale-105"
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={() => void handleCreate()}
          disabled={creating}
          className="transition-transform duration-200 hover:scale-105 disabled:scale-100"
        >
          {creating ? "Creating..." : "Create"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
