"use client";

import { usePathname } from "next/navigation";
import { PropsWithChildren } from "react";

import { Box, Paper } from "@mui/material";

import { cn } from "@/lib/utils";
import { useThemeContext } from "@/theme/theme-provider";
import { ContentType } from "@/types";

export default function ContentWrapper({ children }: PropsWithChildren) {
  const { content } = useThemeContext();
  const pathname = usePathname();
  // The project workspace (sidebar + big card) needs the full available width,
  // regardless of the user's global "Boxed" content preference.
  const isProjectWorkspace = /^\/projects\/[^/]+/.test(pathname);

  return (
    <Paper
      elevation={0}
      className={cn(
        "flex min-h-[calc(100vh-7.5rem)] w-full min-w-0 rounded-xl bg-transparent py-5 sm:rounded-4xl sm:py-6 md:py-8",
        isProjectWorkspace ? "ps-[5px] pe-4 lg:pe-12" : "px-4 lg:px-12",
      )}
    >
      <Box className="flex w-full">
        <Box
          className={cn(
            "mx-auto w-full transition-all",
            content === ContentType.Boxed && !isProjectWorkspace && "max-w-screen-lg",
          )}
        >
          <Box className="-mx-2 min-h-full overflow-x-auto px-2 *:mb-2">{children}</Box>
        </Box>
      </Box>
    </Paper>
  );
}
