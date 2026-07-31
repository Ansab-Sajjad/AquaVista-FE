"use client";

import { useParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { PushPin } from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  TextField,
  Typography,
} from "@mui/material";

import { AquaVista } from "@/lib/AquaVista";
import { getStoredAuthToken } from "@/lib/auth";
import { cn } from "@/lib/utils";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  type?: "narrative" | "table" | "chart";
  title?: string;
  isPinned?: boolean;
};

type ChatRecord = {
  _id: string;
  title: string;
  messages: (Omit<Message, "id"> & { createdAt?: string; _id?: string })[];
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const WELCOME_MESSAGE: Message = {
  id: "welcome",
  role: "assistant",
  content: `Hi, I'm ${AquaVista.assistantName} — your ${AquaVista.assistantFullName}. Ask me anything about this project's uploaded data and municipal finance. I'll stay grounded in the data and tell you when I don't know.`,
};

export default function AskAvaPage() {
  const params = useParams();
  const projectId = (params?.id as string) || "";
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [chatId, setChatId] = useState<string | null>(null);
  const [chatTitle, setChatTitle] = useState("New conversation");
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pinnedChatId, setPinnedChatId] = useState<string | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<"gemini" | "groq" | "ollama">("gemini");

  const token = getStoredAuthToken();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadChat = useCallback(async (selectedChatId: string, title: string) => {
    if (!projectId || !token) return;

    setIsLoading(true);
    setError(null);

    try {
      const chatRes = await fetch(
        `${API_BASE_URL}/api/projects/${encodeURIComponent(projectId)}/ava/chats/${encodeURIComponent(selectedChatId)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!chatRes.ok) {
        throw new Error("Failed to load Ask AVA conversation");
      }

      const chat = (await chatRes.json()) as ChatRecord;
      setChatId(selectedChatId);
      setChatTitle(title);

      const persistedMessages = chat.messages.map((message, index) => ({
        id: message._id || `${message.role}-${index}-${message.createdAt?.toString() ?? Date.now().toString()}`,
        role: message.role,
        content: message.content,
        type: message.type,
        title: message.title,
      }));

      if (persistedMessages.length > 0) {
        setMessages(persistedMessages);
      } else {
        setMessages([WELCOME_MESSAGE]);
      }

      // Fetch pinned chat status
      try {
        const pinnedRes = await fetch(
          `${API_BASE_URL}/api/projects/${encodeURIComponent(projectId)}/ava/chats/${encodeURIComponent(selectedChatId)}/pinned-messages`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (pinnedRes.ok) {
          const pinnedData = await pinnedRes.json();
          setPinnedChatId(pinnedData.pinnedMessageIds?.[0] || null);
        }
      } catch (err) {
        console.error("Failed to load pinned chat status:", err);
        // Continue without pinned state
      }
    } catch (err) {
      console.error(err);
      setError("Unable to load Ask AVA conversation. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [projectId, token]);

  useEffect(() => {
    async function fetchChat() {
      if (!projectId || !token) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const chatsRes = await fetch(`${API_BASE_URL}/api/projects/${encodeURIComponent(projectId)}/ava/chats`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!chatsRes.ok) {
          throw new Error("Failed to load chat list");
        }

        const chats = (await chatsRes.json()) as any[];
        
        let selectedChat = chats[0];

        if (!selectedChat) {
          const createRes = await fetch(`${API_BASE_URL}/api/projects/${encodeURIComponent(projectId)}/ava/chats`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ title: "Ask AVA conversation" }),
          });

          if (!createRes.ok) {
            throw new Error("Failed to create Ask AVA chat");
          }

          selectedChat = await createRes.json();
        }

        if (!selectedChat) {
          throw new Error("No Ask AVA chat available");
        }

        await loadChat(selectedChat._id, selectedChat.title || "New conversation");
      } catch (err) {
        console.error(err);
        setError("Unable to load Ask AVA. Please refresh the page.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchChat();
  }, [projectId, token, loadChat]);

  const sendMessage = async () => {
    if (!input.trim() || isThinking || !projectId || !token || !chatId) return;

    const userMessage: Message = { id: String(Date.now()), role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsThinking(true);
    setError(null);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/projects/${encodeURIComponent(projectId)}/ava/chats/${encodeURIComponent(chatId)}/messages`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ content: userMessage.content, provider: selectedProvider }),
        },
      );

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        const message = payload?.message || "AVA is temporarily unavailable. Please try again.";
        throw new Error(message);
      }

      const payload = (await response.json()) as { messages: Array<Message & { _id?: string }> };
      const assistantMessages = payload.messages.filter((item) => item.role === "assistant");
      setMessages((prev) => [
        ...prev,
        ...assistantMessages.map((item, index) => ({
          id: item._id || `${Date.now()}-${index}`,
          role: item.role,
          content: item.content,
          type: item.type,
          title: item.title,
        })),
      ]);
    } catch (err) {
      console.error(err);
      setError((err as Error).message || "AVA is temporarily unavailable. Please try again.");
    } finally {
      setIsThinking(false);
    }
  };

  const handlePin = async (message: Message) => {
    if (!projectId || !token || !chatId) return;

    const isCurrentlyPinned = pinnedChatId === chatId;

    if (isCurrentlyPinned) {
      // Unpin the chat
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/projects/${encodeURIComponent(projectId)}/ava/chats/${encodeURIComponent(chatId)}/messages/${encodeURIComponent(message.id)}/unpin`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        if (!response.ok) {
          throw new Error("Failed to unpin message");
        }
        setPinnedChatId(null);
      } catch (err) {
        console.error(err);
      }
    } else {
      // Pin the chat (using the message content)
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/projects/${encodeURIComponent(projectId)}/ava/chats/${encodeURIComponent(chatId)}/messages/${encodeURIComponent(message.id)}/pin`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              content: message.content,
              type: message.type || "narrative",
              title: message.title || "AquaVista Assistant",
            }),
          },
        );
        if (!response.ok) {
          throw new Error("Failed to pin message");
        }
        setPinnedChatId(chatId);
      } catch (err) {
        console.error(err);
      }
    }
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
            {chatTitle}
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

          <Box className="mb-4 flex flex-wrap gap-4">
            <Box className="w-full max-w-sm">
              <FormControl fullWidth>
                <InputLabel id="ava-provider-select-label">AI Agent / Model</InputLabel>
                <Select
                  labelId="ava-provider-select-label"
                  value={selectedProvider}
                  label="AI Agent / Model"
                  onChange={(event: SelectChangeEvent<"gemini" | "groq" | "ollama">) => {
                    setSelectedProvider(event.target.value);
                  }}
                >
                  <MenuItem value="gemini">⚡ Google Gemini</MenuItem>
                  <MenuItem value="groq">🚀 Groq - Llama 3.3</MenuItem>
                  <MenuItem value="ollama">🦙 Ollama / OpenRouter - DeepSeek R1</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>

          <Box className="flex-1 space-y-4 overflow-y-auto pr-2">
            {isLoading ? (
              <Box className="bg-grey-50 text-text-secondary rounded-3xl p-6 text-center">
                <Typography>Loading Ask AVA conversation...</Typography>
              </Box>
            ) : null}

            {error ? (
              <Box className="bg-error/10 text-error rounded-3xl p-4">
                <Typography>{error}</Typography>
              </Box>
            ) : null}

            {messages.map((message) => (
              <Box
                key={message.id}
                className={cn("flex w-full", message.role === "user" ? "justify-end" : "justify-start")}
              >
                <Box
                  className={cn(
                    "max-w-[80%] rounded-3xl px-5 py-3",
                    message.role === "user"
                      ? "bg-primary rounded-br-sm text-white"
                      : "bg-grey-50 text-text-primary rounded-bl-sm",
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
                          className="h-6 w-6"
                          onClick={() => handlePin(message)}
                          title={pinnedChatId === chatId ? "Unpin from Dashboard" : "Pin to Dashboard"}
                        >
                          <PushPin
                            className={pinnedChatId === chatId ? "text-primary" : "text-text-secondary"}
                            fontSize="small"
                          />
                        </IconButton>
                      )}
                    </Box>
                  )}
                  <Typography
                    variant="body2"
                    className={cn(
                      "leading-relaxed whitespace-pre-wrap",
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
                <Box className="bg-grey-50 text-text-primary rounded-3xl rounded-bl-sm px-5 py-3">
                  <Typography variant="body2">AVA is thinking...</Typography>
                </Box>
              </Box>
            )}
            <div ref={messagesEndRef} />
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
              disabled={isLoading || !token || !chatId}
            />
            <Button
              variant="contained"
              onClick={sendMessage}
              disabled={!input.trim() || isThinking || isLoading || !token || !chatId}
              className="h-14 px-6"
            >
              Send
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
