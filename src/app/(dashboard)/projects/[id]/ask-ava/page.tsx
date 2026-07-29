"use client";

import { useParams } from "next/navigation";
import { useState } from "react";

import { Box, Button, Card, CardContent, Chip, IconButton, TextField, Typography } from "@mui/material";

import { AquaVista, isWithinAssistantScope, outOfScopeMessage } from "@/lib/AquaVista";
import { cn } from "@/lib/utils";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  type?: "narrative" | "table" | "chart";
  title?: string;
};

const MOCK_RESPONSES: Record<string, string> = {
  "revenue sufficient":
    "Yes, total operating revenue has exceeded total operating expenses in each of the last five years. The debt service coverage covenant is met with a 1.45x margin in 2024.",
  default:
    "I can only answer questions about this project's data and municipal finance topics. Please ask about rates, revenue, expenses, debt, or customer classes.",
};

export default function AskAvaPage() {
  const params = useParams();
  const projectId = (params?.id as string) || "";
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: `Hi, I'm ${AquaVista.assistantName} — your ${AquaVista.assistantFullName}. Ask me anything about this project's uploaded data and municipal finance. I'll stay grounded in the data and tell you when I don't know.`,
    },
  ]);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);

  const sendMessage = () => {
    if (!input.trim()) return;
    const userMessage: Message = { id: String(Date.now()), role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsThinking(true);

    setTimeout(() => {
      const lower = userMessage.content.toLowerCase();
      let response: string;
      let title = "Analyst note";

      if (!isWithinAssistantScope(userMessage.content)) {
        response = outOfScopeMessage();
        title = `${AquaVista.assistantName} guardrail`;
      } else if (lower.includes("revenue") || lower.includes("sufficient") || lower.includes("expense")) {
        response = MOCK_RESPONSES["revenue sufficient"];
      } else if (lower.includes("customer") || lower.includes("allocation")) {
        response =
          "Residential customers represent 72% of accounts and 58% of billed consumption. Commercial accounts are 18% of accounts but 35% of consumption.";
      } else {
        response = MOCK_RESPONSES.default;
      }

      const assistantMessage: Message = {
        id: String(Date.now() + 1),
        role: "assistant",
        content: response,
        title,
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsThinking(false);
    }, 1000);
  };

  const handlePin = (message: Message) => {
    // In a real app this would pin to the dashboard.
    alert(`Pinned "${message.title || message.content.slice(0, 40)}..." to the Dashboard`);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <Box className="flex w-full flex-col gap-4">
      <Box className="flex items-center justify-between">
        <Box>
          <Typography variant="h4" component="h2">
            Ask {AquaVista.assistantName}
          </Typography>
          <Typography variant="body1" className="text-text-secondary">
            Ask questions about this project's data and municipal finance topics.
          </Typography>
        </Box>
        <Chip label="Beta" size="small" color="warning" />
      </Box>

      <Card className="bg-background-paper shadow-darker-xs flex h-[calc(100vh-22rem)] flex-col rounded-3xl">
        <CardContent className="flex h-full flex-col gap-4 p-5">
          <Box className="bg-grey-25 text-text-secondary rounded-2xl p-3 text-sm">
            <strong>Ground rules:</strong> {AquaVista.assistantName} answers questions based on this project&apos;s{" "}
            {AquaVista.terminology.baselineData.toLowerCase()}. It avoids speculation, cites source files, and asks for
            clarification when the data is incomplete.
          </Box>

          <Box className="flex-1 space-y-4 overflow-y-auto pr-2">
            {messages.map((message) => (
              <Box
                key={message.id}
                className={cn(
                  "flex w-full",
                  message.role === "user" ? "justify-end" : "justify-start",
                )}
              >
                <Box
                  className={cn(
                    "max-w-[80%] rounded-3xl px-5 py-3",
                    message.role === "user" ? "bg-primary text-white rounded-br-sm" : "bg-grey-50 text-text-primary rounded-bl-sm",
                  )}
                >
                  {message.role === "assistant" && (
                    <Box className="mb-2 flex items-center gap-2">
                      <Typography variant="caption" className="text-primary font-semibold">
                        {message.title || "AquaVista Assistant"}
                      </Typography>
                      {message.id !== "welcome" && (
                        <IconButton
                          size="small"
                          color="primary"
                          className="h-6 w-6"
                          onClick={() => handlePin(message)}
                          title="Pin to Dashboard"
                        >
                          <Typography className="text-sm">📌</Typography>
                        </IconButton>
                      )}
                    </Box>
                  )}
                  <Typography
                    variant="body2"
                    className={cn(
                      "whitespace-pre-wrap leading-relaxed",
                      message.role === "user" ? "text-white" : "text-text-primary",
                    )}
                  >
                    {message.content}
                  </Typography>
                </Box>
              </Box>
            ))}
            {isThinking && (
              <Box className="flex w-full justify-start">
                <Box className="bg-grey-50 rounded-3xl rounded-bl-sm px-5 py-3 text-text-primary">
                  <Typography variant="body2">AVA is thinking...</Typography>
                </Box>
              </Box>
            )}
          </Box>

          <Box className="mt-auto flex items-start gap-2 pt-2">
            <TextField
              fullWidth
              multiline={false}
              maxRows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask AVA about revenue, expenses, customer classes, rates..."
              slotProps={{ input: { className: "rounded-2xl" } }}
            />
            <Button variant="contained" onClick={sendMessage} disabled={!input.trim() || isThinking} className="h-14 px-6">
              Send
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
