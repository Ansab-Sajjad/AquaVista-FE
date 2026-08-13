"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Box, Button, Card, CardContent, CircularProgress, Typography } from "@mui/material";
import { Grid } from "@mui/material";

import CreateProjectDialog from "@/components/create-project-dialog";
import ProjectPickerDialog from "@/components/project-picker-dialog";
import { useAskAvaNavigate } from "@/hooks/use-ask-ava-navigate";
import { useUploadDataNavigate } from "@/hooks/use-upload-data-navigate";
import { isAdminUser } from "@/lib/auth";
import NiDocumentChart from "@/icons/nexture/ni-document-chart";
import NiSparkle from "@/icons/nexture/ni-sparkle";
import NiUploadCloud from "@/icons/nexture/ni-upload-cloud";
import NiUserPlus from "@/icons/nexture/ni-user-plus";

export default function DashboardActions() {
  const { open, projects, loading, error, handleAskAvaClick, handleSelectProject, handleClose } = useAskAvaNavigate();
  const {
    open: uploadOpen,
    projects: uploadProjects,
    loading: uploadLoading,
    error: uploadError,
    handleUploadDataClick,
    handleSelectProject: handleUploadSelectProject,
    handleClose: handleUploadClose,
  } = useUploadDataNavigate();
  const isAdmin = isAdminUser();
  const router = useRouter();
  const [createProjectOpen, setCreateProjectOpen] = useState(false);

  const handleCreateProjectClick = () => {
    setCreateProjectOpen(true);
  };

  const handleCreateProjectClose = () => {
    setCreateProjectOpen(false);
  };

  const handleProjectCreated = () => {
    setCreateProjectOpen(false);
    router.push("/projects");
  };

  return (
    <>
      <Typography variant="h6" component="h6" className="mt-2 mb-3 lg:mt-0">
        Quick Actions
      </Typography>

      <Grid size={{ xs: 12 }} container spacing={2.5}>
        <Grid size={{ lg: 12, md: 6, xs: 12 }}>
          <Card
            onClick={handleCreateProjectClick}
            className="flex cursor-pointer flex-row p-1 transition-transform hover:scale-[1.02]"
          >
            <Box className="bg-primary-light/10 flex w-16 flex-none items-center justify-center rounded-2xl">
              <NiUserPlus className="text-primary" size={"large"} />
            </Box>
            <CardContent>
              <Typography variant="subtitle2" className="leading-5 transition-colors">
                Create a Project
              </Typography>
              <Typography variant="body1" className="text-text-secondary line-clamp-1 leading-5">
                Start a new municipal rate study
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {isAdmin && (
          <Grid size={{ lg: 12, md: 6, xs: 12 }}>
            <Card
              onClick={handleUploadDataClick}
              className="flex cursor-pointer flex-row p-1 transition-transform hover:scale-[1.02]"
            >
              <Box className="bg-secondary-light/10 flex w-16 flex-none items-center justify-center rounded-2xl">
                {uploadLoading ? (
                  <CircularProgress size={24} className="text-secondary" />
                ) : (
                  <NiUploadCloud className="text-secondary" size={"large"} />
                )}
              </Box>
              <CardContent>
                <Typography variant="subtitle2" className="leading-5 transition-colors">
                  Upload Data
                </Typography>
                <Typography variant="body1" className="text-text-secondary line-clamp-1 leading-5">
                  Add financial and billing files to a project
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        )}

        <Grid size={{ lg: 12, md: 6, xs: 12 }}>
          <Card
            onClick={handleAskAvaClick}
            className="flex cursor-pointer flex-row p-1 transition-transform hover:scale-[1.02]"
          >
            <Box className="bg-accent-1-light/10 flex w-16 flex-none items-center justify-center rounded-2xl">
              {loading ? (
                <CircularProgress size={24} className="text-accent-1" />
              ) : (
                <NiSparkle className="text-accent-1" size={"large"} />
              )}
            </Box>
            <CardContent>
              <Typography variant="subtitle2" className="leading-5 transition-colors">
                Ask AVA
              </Typography>
              <Typography variant="body1" className="text-text-secondary line-clamp-1 leading-5">
                Query your project data with AI
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ lg: 12, md: 6, xs: 12 }}>
          <Card component={Link} href="/reports" className="flex flex-row p-1 transition-transform hover:scale-[1.02]">
            <Box className="bg-accent-2-light/10 flex w-16 flex-none items-center justify-center rounded-2xl">
              <NiDocumentChart className="text-accent-2" size={"large"} />
            </Box>
            <CardContent className="flex w-full flex-row justify-between">
              <Box>
                <Typography variant="subtitle2" className="leading-5 transition-colors">
                  View Reports
                </Typography>
                <Typography variant="body1" className="text-text-secondary line-clamp-1 leading-5">
                  Pinned insights and dashboards
                </Typography>
              </Box>
              <Button className="pointer-events-none self-center" size="tiny" color="accent-2" variant="pastel">
                New
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <CreateProjectDialog
        open={createProjectOpen}
        onClose={handleCreateProjectClose}
        onCreated={handleProjectCreated}
      />

      <ProjectPickerDialog
        open={open}
        projects={projects}
        loading={loading}
        error={error}
        onSelect={handleSelectProject}
        onClose={handleClose}
      />

      <ProjectPickerDialog
        open={uploadOpen}
        projects={uploadProjects}
        loading={uploadLoading}
        error={uploadError}
        onSelect={handleUploadSelectProject}
        onClose={handleUploadClose}
        title="Select a Project to Upload Data"
        subtitle="Choose a project where you want to add financial and billing files."
      />
    </>
  );
}
