"use client";

import { useParams } from "next/navigation";
import { useState } from "react";

import { Box, Button, Card, CardContent, Chip, Typography } from "@mui/material";

import { cn } from "@/lib/utils";

type PinnedItem = {
  id: string;
  type: "narrative" | "table" | "chart";
  title: string;
  sourceQuestion: string;
  createdBy: string;
  createdAt: string;
  content: string;
};

const MOCK_PINNED: PinnedItem[] = [
  {
    id: "1",
    type: "narrative",
    title: "Revenue sufficiency summary",
    sourceQuestion: "Is revenue sufficient to cover expenses?",
    createdBy: "Admin",
    createdAt: "2026-06-28",
    content:
      "Total operating revenue has exceeded total operating expenses in each of the last five years. The covenant is met with a comfortable margin.",
  },
];

const TYPE_LABELS: Record<string, string> = {
  narrative: "Narrative",
  table: "Table",
  chart: "Basic Chart",
};

export default function DashboardPage() {
  const params = useParams();
  const projectId = (params?.id as string) || "";
  const [pinned, setPinned] = useState<PinnedItem[]>(MOCK_PINNED);

  const handleUnpin = (id: string) => {
    setPinned((prev) => prev.filter((item) => item.id !== id));
  };

  if (pinned.length === 0) {
    return (
      <Box className="bg-background-paper shadow-darker-xs flex flex-col items-center justify-center gap-4 rounded-4xl p-12 text-center">
        <Typography variant="h3" component="h2">
          No pinned insights yet
        </Typography>
        <Typography variant="body1" className="text-text-secondary max-w-lg">
          Start a conversation with Ask AVA and pin useful responses, tables, or charts to build this project dashboard.
        </Typography>
        <Button variant="contained" href={`/projects/${projectId}/ask-ava`}>
          Start a chat with Ask AVA
        </Button>
      </Box>
    );
  }

  return (
    <Box className="flex w-full flex-col gap-4">
      <Box className="flex items-center justify-between">
        <Typography variant="h4" component="h2">
          Dashboard
        </Typography>
        <Chip
          label={`${pinned.length} pinned ${pinned.length === 1 ? "item" : "items"}`}
          size="small"
          color="primary"
        />
      </Box>

      <Box className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {pinned.map((item) => (
          <Card
            key={item.id}
            className={cn(
              "bg-background-paper shadow-darker-xs flex h-full flex-col rounded-3xl",
              item.type === "table" && "md:col-span-2 xl:col-span-2",
            )}
          >
            <CardContent className="flex h-full flex-col gap-3 p-5">
              <Box className="flex items-start justify-between gap-2">
                <Box>
                  <Typography variant="h6" component="h3" className="text-text-primary">
                    {item.title}
                  </Typography>
                  <Typography variant="caption" className="text-text-secondary">
                    {TYPE_LABELS[item.type]} &bull; {item.sourceQuestion}
                  </Typography>
                </Box>
                <Chip label={TYPE_LABELS[item.type]} size="small" color="primary" variant="outlined" />
              </Box>

              <Box className="bg-grey-25 rounded-2xl p-4">
                <Typography variant="body2" className="text-text-primary whitespace-pre-wrap">
                  {item.content}
                </Typography>
              </Box>

              <Box className="mt-auto flex items-center justify-between pt-2">
                <Typography variant="caption" className="text-text-secondary">
                  {item.createdBy} &bull; {item.createdAt}
                </Typography>
                <Button size="small" color="error" onClick={() => handleUnpin(item.id)}>
                  Unpin
                </Button>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  );
}
