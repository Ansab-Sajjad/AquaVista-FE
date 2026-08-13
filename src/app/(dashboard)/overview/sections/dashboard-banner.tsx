"use client";

import Link from "next/link";

import { Box, Button, Card, CardContent, CircularProgress, Typography } from "@mui/material";

import ProjectPickerDialog from "@/components/project-picker-dialog";
import { useAskAvaNavigate } from "@/hooks/use-ask-ava-navigate";
import IllustrationAnalytics from "@/icons/illustrations/illustration-analytics";
import NiArrowRight from "@/icons/nexture/ni-arrow-right";
import NiSparkle from "@/icons/nexture/ni-sparkle";

export default function DashboardBanner() {
  const { open, projects, loading, error, handleAskAvaClick, handleSelectProject, handleClose } = useAskAvaNavigate();

  return (
    <>
      <Typography variant="h6" component="h6" className="mb-3">
        Welcome to AquaVista
      </Typography>

      <Card>
        <CardContent className="flex h-full flex-col items-start justify-between">
          <Box className="flex w-full flex-col md:flex-row">
            <Box className="w-full md:w-6/12 xl:w-8/12">
              <Typography variant="h4" component="h4" className="card-title">
                Your Municipal Rate-Study Assistant
              </Typography>
              <Typography
                variant="body1"
                component="p"
                className="text-text-secondary text-center md:text-left xl:max-w-md"
              >
                AquaVista helps consultants and municipal teams review uploaded project data, ask questions through Ask
                AVA, generate structured outputs, view AI-generated charts, and pin useful insights to a project
                dashboard — bridging data collection and downstream rate modeling.
              </Typography>
            </Box>
            <Box className="flex w-full justify-center md:w-6/12 md:justify-end xl:w-4/12">
              <IllustrationAnalytics className="text-primary h-64 w-full max-w-xs object-contain" />
            </Box>
          </Box>
          <Box className="flex flex-row gap-1">
            <Button
              className="mx-auto md:mx-0"
              size="medium"
              color="primary"
              variant="contained"
              startIcon={<NiSparkle size={"medium"} />}
              component={Link}
              href="/projects"
            >
              Explore Projects
            </Button>

            <Button
              className="mx-auto md:mx-0"
              size="medium"
              color="primary"
              variant="pastel"
              endIcon={loading ? <CircularProgress size={16} color="inherit" /> : <NiArrowRight size={"medium"} />}
              onClick={handleAskAvaClick}
              disabled={loading}
            >
              Ask AVA
            </Button>
          </Box>
        </CardContent>
      </Card>

      <ProjectPickerDialog
        open={open}
        projects={projects}
        loading={loading}
        error={error}
        onSelect={handleSelectProject}
        onClose={handleClose}
      />
    </>
  );
}
