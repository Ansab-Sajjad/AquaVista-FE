"use client";

import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import { PropsWithChildren } from "react";

import { Box, Button, Tab, Tabs, Typography } from "@mui/material";

import { cn } from "@/lib/utils";

const PROJECT_TABS = [
  { id: "dashboard", label: "Dashboard", href: (id: string) => `/projects/${id}/dashboard` },
  { id: "data", label: "Data", href: (id: string) => `/projects/${id}/data` },
  { id: "ask-ava", label: "Ask AVA", href: (id: string) => `/projects/${id}/ask-ava` },
  { id: "users", label: "Users", href: (id: string) => `/projects/${id}/users` },
];

export default function ProjectLayout({ children }: PropsWithChildren) {
  const params = useParams();
  const pathname = usePathname();
  const projectId = (params?.id as string) || "";

  const activeTab = PROJECT_TABS.find((tab) => pathname.includes(`/projects/${projectId}/${tab.id}`))?.id || "dashboard";

  return (
    <Box className="flex w-full flex-col gap-4">
      <Box className="bg-background-paper shadow-darker-xs flex flex-col gap-4 rounded-3xl p-5 sm:p-6">
        <Box className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <Box>
            <Typography variant="h3" component="h1">
              Project Workspace
            </Typography>
            <Typography variant="body2" className="text-text-secondary">
              ID: {projectId}
            </Typography>
          </Box>
          <Button component={Link} href="/projects" variant="outlined" color="grey" size="small">
            Back to Projects
          </Button>
        </Box>

        <Tabs
          value={activeTab}
          textColor="primary"
          indicatorColor="primary"
          className="min-h-12"
        >
          {PROJECT_TABS.map((tab) => (
            <Tab
              key={tab.id}
              value={tab.id}
              label={tab.label}
              component={Link}
              href={tab.href(projectId)}
              className={cn(
                "normal-case rounded-t-lg px-4 py-2 text-sm font-semibold",
                activeTab === tab.id ? "text-primary" : "text-text-secondary",
              )}
            />
          ))}
        </Tabs>
      </Box>

      <Box className="w-full">{children}</Box>
    </Box>
  );
}
