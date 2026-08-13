"use client";

import Link from "next/link";

import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";

import type { ProjectOption } from "@/hooks/use-ask-ava-navigate";
import NiSearch from "@/icons/nexture/ni-search";

type ProjectPickerDialogProps = {
  open: boolean;
  projects: ProjectOption[];
  loading: boolean;
  error: string | null;
  onSelect: (projectId: string) => void;
  onClose: () => void;
  title?: string;
  subtitle?: string;
};

export default function ProjectPickerDialog({
  open,
  projects,
  loading,
  error,
  onSelect,
  onClose,
  title = "Select a Project",
  subtitle = "Choose a project to start asking AVA questions about its data.",
}: ProjectPickerDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
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
      <DialogTitle className="pb-2">{title}</DialogTitle>
      <DialogContent className="flex flex-col gap-3 pt-2">
        <Typography variant="body2" className="text-text-secondary">
          {subtitle}
        </Typography>

        {loading ? (
          <Box className="flex items-center justify-center py-8">
            <CircularProgress size={28} />
          </Box>
        ) : error ? (
          <Typography variant="body2" className="text-error">
            {error}
          </Typography>
        ) : projects.length === 0 ? (
          <Box className="flex flex-col items-center justify-center gap-3 py-8 text-center">
            <NiSearch className="text-text-disabled" size="large" />
            <Typography variant="body2" className="text-text-secondary">
              No projects found.
            </Typography>
            <Button component={Link} href="/projects" variant="contained" size="small">
              Browse Projects
            </Button>
          </Box>
        ) : (
          <Box className="flex max-h-80 flex-col gap-2 overflow-y-auto">
            {projects.map((project) => (
              <Card
                key={project.id}
                onClick={() => onSelect(project.id)}
                className="cursor-pointer rounded-2xl transition-all duration-200 hover:scale-[1.01] hover:shadow-md"
              >
                <CardContent className="flex flex-col gap-1.5 p-4">
                  <Typography variant="subtitle1" className="text-text-primary font-semibold">
                    {project.name}
                  </Typography>
                  {project.description ? (
                    <Typography
                      variant="body2"
                      className="text-text-secondary line-clamp-2 leading-5"
                      sx={{
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {project.description}
                    </Typography>
                  ) : null}
                  <Box className="mt-1">
                    <Chip label={project.municipality} size="small" color="primary" />
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}
