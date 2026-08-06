"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { ArrowBack, Fullscreen, FullscreenExit, PushPin, Settings } from "@mui/icons-material";
import {
  Alert,
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

import AvaChart from "@/components/ask-ava/ava-chart";
import AvaTable from "@/components/ask-ava/ava-table";
import StartupQuestionsDialog from "@/components/ask-ava/startup-questions-dialog";
import type { AvaMessage, AvaUsage, StartupQuestion } from "@/components/ask-ava/types";
import { useTypewriter } from "@/hooks/use-typewriter";
import { AquaVista } from "@/lib/AquaVista";
import { getStoredAuthToken, isAdminUser } from "@/lib/auth";
import { cn } from "@/lib/utils";

type ChatRecord = {
  _id: string;
  title: string;
  messages: (Omit<AvaMessage, "id"> & { createdAt?: string; _id?: string })[];
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const WELCOME_MESSAGE: AvaMessage = {
  id: "welcome",
  role: "assistant",
  content: `Hi, I'm ${AquaVista.assistantName} — your ${AquaVista.assistantFullName}. Ask me anything about this project's uploaded data and municipal finance. I'll stay grounded in the data and tell you when I don't know.`,
};

export default function AskAvaPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectId = (params?.id as string) || "";
  const requestedUserId = searchParams.get("userId");
  const [messages, setMessages] = useState<AvaMessage[]>([WELCOME_MESSAGE]);
  const [chatId, setChatId] = useState<string | null>(null);
  const [chatTitle, setChatTitle] = useState("New conversation");
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pinnedMessageIds, setPinnedMessageIds] = useState<Set<string>>(new Set());
  const [selectedProvider, setSelectedProvider] = useState<"gemini" | "groq" | "ollama">("gemini");
  const [usage, setUsage] = useState<AvaUsage | null>(null);
  const [startupQuestions, setStartupQuestions] = useState<StartupQuestion[]>([]);
  const [startupDialogOpen, setStartupDialogOpen] = useState(false);
  const [viewedUserName, setViewedUserName] = useState<string | null>(null);
  const [isMaximized, setIsMaximized] = useState(false);

  const typewriter = useTypewriter();
  const { reset: resetTypewriter, enqueue: enqueueTypewriter } = typewriter;

  const token = getStoredAuthToken();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isAdmin = isAdminUser();
  const isAdminViewingUser = Boolean(requestedUserId) && isAdmin;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, typewriter.progress]);

  const fetchUsage = useCallback(async () => {
    if (!projectId || !token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/projects/${encodeURIComponent(projectId)}/ava/usage`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setUsage(await res.json());
    } catch {
      // Usage is non-critical; ignore
    }
  }, [projectId, token]);

  const fetchStartupQuestions = useCallback(async () => {
    if (!projectId || !token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/projects/${encodeURIComponent(projectId)}/ava/startup-questions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setStartupQuestions(await res.json());
    } catch {
      // Non-critical; ignore
    }
  }, [projectId, token]);

  const fetchViewedUser = useCallback(async () => {
    if (!requestedUserId || !token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/projects/admin/users/${encodeURIComponent(requestedUserId)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setViewedUserName(data.name || data.email || "this user");
      }
    } catch {
      // Non-critical; ignore
    }
  }, [requestedUserId, token]);

  const loadChat = useCallback(
    async (selectedChatId: string, title: string) => {
      if (!projectId || !token) return;

      setIsLoading(true);
      setError(null);
      resetTypewriter();

      try {
        const chatRes = await fetch(
          `${API_BASE_URL}/api/projects/${encodeURIComponent(projectId)}/ava/chats/${encodeURIComponent(selectedChatId)}${requestedUserId ? `?userId=${encodeURIComponent(requestedUserId)}` : ""}`,
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

        const persistedMessages: AvaMessage[] = chat.messages.map((message, index) => ({
          id: message._id || `${message.role}-${index}-${message.createdAt?.toString() ?? Date.now().toString()}`,
          role: message.role,
          content: message.content,
          type: message.type,
          title: message.title,
          tableData: message.tableData,
          chartData: message.chartData,
        }));

        if (persistedMessages.length > 0) {
          setMessages(persistedMessages);
        } else {
          setMessages([WELCOME_MESSAGE]);
        }

        // Fetch pinned message ids for this chat
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
            setPinnedMessageIds(new Set((pinnedData.pinnedMessageIds || []) as string[]));
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
    },
    [projectId, requestedUserId, token, resetTypewriter],
  );

  useEffect(() => {
    async function fetchChat() {
      if (!projectId || !token) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const chatsRes = await fetch(
          `${API_BASE_URL}/api/projects/${encodeURIComponent(projectId)}/ava/chats${requestedUserId ? `?userId=${encodeURIComponent(requestedUserId)}` : ""}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (!chatsRes.ok) {
          throw new Error("Failed to load chat list");
        }

        const chats = (await chatsRes.json()) as any[];

        let selectedChat = chats[0];

        if (!selectedChat) {
          if (isAdminViewingUser) {
            setChatId(null);
            setChatTitle("No conversation found");
            setMessages([WELCOME_MESSAGE]);
            setError("No Ask AVA conversations were found for this user in this project yet.");
            return;
          }

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
  }, [projectId, isAdminViewingUser, requestedUserId, token, loadChat]);

  // Load usage + startup questions + viewed user name on mount
  useEffect(() => {
    if (!isAdminViewingUser) {
      void fetchUsage();
      void fetchStartupQuestions();
    } else {
      void fetchViewedUser();
    }
  }, [fetchUsage, fetchStartupQuestions, fetchViewedUser, isAdminViewingUser]);

  const sendMessage = async (overrideContent?: string) => {
    if (isAdminViewingUser) {
      setError("This view is read-only. You can review the selected user's Ask AVA history here.");
      return;
    }

    if (usage?.limitReached) return;

    const contentToSend = (overrideContent ?? input).trim();
    if (!contentToSend || isThinking || !projectId || !token || !chatId) return;

    const userMessage: AvaMessage = { id: String(Date.now()), role: "user", content: contentToSend };
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
          body: JSON.stringify({ content: contentToSend, provider: selectedProvider }),
        },
      );

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        const message = payload?.message || "AVA is temporarily unavailable. Please try again.";
        if (response.status === 429 && payload?.usage) {
          setUsage(payload.usage);
        }
        throw new Error(message);
      }

      const payload = (await response.json()) as { messages: (AvaMessage & { _id?: string })[]; usage?: AvaUsage };
      const assistantMessages = payload.messages.filter((item) => item.role === "assistant");
      const mappedAssistant = assistantMessages.map((item, index) => ({
        id: item._id || `${Date.now()}-${index}`,
        role: item.role,
        content: item.content,
        type: item.type,
        title: item.title,
        tableData: item.tableData,
        chartData: item.chartData,
      }));
      setMessages((prev) => [...prev, ...mappedAssistant]);
      // Stream the narrative text in with a typewriter effect. Messages
      // without content (e.g. table/chart-only) are skipped by the hook.
      typewriter.enqueue(mappedAssistant.map((m) => ({ id: m.id, content: m.content })));
      if (payload.usage) setUsage(payload.usage);
    } catch (err) {
      console.error(err);
      setError((err as Error).message || "AVA is temporarily unavailable. Please try again.");
    } finally {
      setIsThinking(false);
    }
  };

  const handlePin = async (message: AvaMessage) => {
    if (!projectId || !token || !chatId) return;

    const isCurrentlyPinned = pinnedMessageIds.has(message.id);

    if (isCurrentlyPinned) {
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
        setPinnedMessageIds((prev) => {
          const next = new Set(prev);
          next.delete(message.id);
          return next;
        });
      } catch (err) {
        console.error(err);
      }
    } else {
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
              tableData: message.tableData,
              chartData: message.chartData,
            }),
          },
        );
        if (!response.ok) {
          throw new Error("Failed to pin message");
        }
        setPinnedMessageIds((prev) => new Set(prev).add(message.id));
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleSaveStartupQuestions = async (questions: StartupQuestion[]) => {
    if (!projectId || !token) return;
    const res = await fetch(`${API_BASE_URL}/api/projects/${encodeURIComponent(projectId)}/ava/startup-questions`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ questions }),
    });
    if (!res.ok) throw new Error("Failed to save startup questions");
    const saved = await res.json();
    setStartupQuestions(saved);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void sendMessage();
    }
  };

  const inputDisabled = isLoading || !token || !chatId || isAdminViewingUser || Boolean(usage?.limitReached);

  return (
    <Box className="flex w-full flex-col gap-4">
      <Box className="flex items-center justify-between animate-in fade-in slide-in-from-top-2 duration-500">
        <Box>
          <Typography variant="h4" component="h2">
            Ask {AquaVista.assistantName}
          </Typography>
          <Typography variant="body1" className="text-text-secondary">
            {chatTitle}
          </Typography>
        </Box>
        <Box className="flex items-center gap-2">
          {isAdmin && !isAdminViewingUser && (
            <Button
              startIcon={<Settings />}
              onClick={() => setStartupDialogOpen(true)}
              variant="outlined"
              className="w-fit transition-transform duration-200 hover:scale-105"
              sx={{
                borderColor: "divider",
                color: "text.primary",
                px: 2,
                py: 0.8,
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 600,
                "&:hover": {
                  borderColor: "primary.main",
                  color: "primary.main",
                  backgroundColor: "action.hover",
                },
              }}
            >
              Startup questions
            </Button>
          )}
          {isAdminViewingUser && (
            <Button
              startIcon={<ArrowBack />}
              onClick={() => router.push(requestedUserId ? `/users/${requestedUserId}` : `/projects/${projectId}/users`)}
              variant="outlined"
              className="w-fit transition-transform duration-200 hover:scale-105"
              sx={{
                borderColor: "divider",
                color: "text.primary",
                px: 2,
                py: 0.8,
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 600,
                "&:hover": {
                  borderColor: "primary.main",
                  color: "primary.main",
                  backgroundColor: "action.hover",
                },
              }}
            >
              Back to Users
            </Button>
          )}
        </Box>
      </Box>

      {isMaximized && (
        <Box
          onClick={() => setIsMaximized(false)}
          className="fixed inset-0 z-[1299] bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
        />
      )}

      <Card
        className={cn(
          "bg-background-paper shadow-darker-xs flex flex-col rounded-3xl transition-all duration-300 hover:shadow-md animate-in fade-in slide-in-from-bottom-3 duration-500 delay-100",
          isMaximized
            ? "fixed inset-3 z-[1300] h-auto w-auto shadow-2xl"
            : isAdminViewingUser
              ? "h-[calc(100vh-12rem)]"
              : "h-[calc(100vh-22rem)]",
        )}
      >
        <CardContent className="flex h-full flex-col gap-4 p-5">
          <Box className="flex items-center justify-between gap-2">
            {isAdminViewingUser ? (
              <Box className="bg-grey-25 text-text-secondary rounded-2xl p-3 text-sm flex-1">
                Viewing chats for {viewedUserName || "this user"}. This panel is read-only.
              </Box>
            ) : (
              <Box className="bg-grey-25 text-text-secondary rounded-2xl p-3 text-sm flex-1">
                <strong>Ground rules:</strong> {AquaVista.assistantName} answers questions based on this project&apos;s{" "}
                {AquaVista.terminology.baselineData.toLowerCase()}. It avoids speculation, cites source files, and asks
                for clarification when the data is incomplete.
              </Box>
            )}
            <Box className="flex items-center gap-2 flex-shrink-0">
              {!isAdminViewingUser && usage ? (
                <Typography
                  variant="caption"
                  className={cn(
                    "font-semibold",
                    usage.limitReached ? "text-error" : "text-text-secondary",
                  )}
                  title={`Ask AVA usage: ${usage.used} of ${usage.limit} questions today`}
                >
                  {usage.used}/{usage.limit}
                </Typography>
              ) : null}
              <IconButton
                onClick={() => setIsMaximized((prev) => !prev)}
                title={isMaximized ? "Exit full view" : "Expand chat to full view"}
                className="transition-transform duration-200 hover:scale-110"
                sx={{
                  borderColor: "divider",
                  color: "text.secondary",
                  "&:hover": { color: "primary.main" },
                }}
              >
                {isMaximized ? <FullscreenExit /> : <Fullscreen />}
              </IconButton>
            </Box>
          </Box>

          {/* Usage limit reached banner */}
          {!isAdminViewingUser && usage?.limitReached ? (
            <Alert severity="warning">
              You have reached your Ask AVA usage limit for today. Please contact your Admin or try again later.
            </Alert>
          ) : null}

          <Box className="mb-1 flex flex-wrap items-center gap-4">
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

          {/* Startup questions */}
          {!isAdminViewingUser && startupQuestions.length > 0 ? (
            <Box className="flex flex-wrap gap-2 animate-in fade-in slide-in-from-bottom-2 duration-500 delay-150">
              {startupQuestions.map((question, index) => (
                <Chip
                  key={question._id || index}
                  label={question.text}
                  variant="outlined"
                  color="primary"
                  clickable
                  onClick={() => void sendMessage(question.text)}
                  disabled={isThinking || inputDisabled}
                  className="transition-all duration-200 hover:scale-105 hover:shadow-sm animate-in fade-in zoom-in-95"
                  style={{ animationDelay: `${200 + index * 50}ms`, animationDuration: "300ms" }}
                />
              ))}
            </Box>
          ) : null}

          <Box className="flex-1 space-y-4 overflow-y-auto pr-2">
            {isLoading ? (
              <Box className="bg-grey-50 text-text-secondary rounded-3xl p-6 text-center animate-in fade-in duration-300">
                <Typography>Loading Ask AVA conversation...</Typography>
              </Box>
            ) : null}

            {error ? (
              <Box className="bg-error/10 text-error rounded-3xl p-4 animate-in fade-in slide-in-from-top-2 duration-300">
                <Typography>{error}</Typography>
              </Box>
            ) : null}

            {messages.map((message, index) => (
              <Box
                key={message.id}
                className={cn(
                  "flex w-full animate-in fade-in",
                  message.role === "user" ? "justify-end slide-in-from-right" : "justify-start slide-in-from-left-2"
                )}
                style={{ animationDelay: `${index * 50}ms`, animationDuration: "400ms" }}
              >
                <Box
                  className={cn(
                    "max-w-[80%] rounded-3xl px-5 py-3 transition-all duration-200",
                    message.role === "user"
                      ? "bg-primary rounded-br-sm text-white hover:shadow-md"
                      : "bg-grey-50 text-text-primary rounded-bl-sm hover:bg-grey-100",
                  )}
                >
                  {message.role === "assistant" && (
                    <Box className="mb-2 flex items-center gap-2">
                      <Typography variant="caption" className="text-primary font-semibold">
                        {message.title || "AquaVista Assistant"}
                      </Typography>
                      {message.id !== "welcome" && !isAdminViewingUser && (
                        <IconButton
                          size="small"
                          className="h-6 w-6 transition-transform duration-200 hover:scale-110"
                          onClick={() => handlePin(message)}
                          title={
                            pinnedMessageIds.has(message.id)
                              ? "Unpin from Dashboard"
                              : isAdmin
                                ? "Pin to Dashboard for all project members"
                                : "Pin to Dashboard (visible only to you)"
                          }
                        >
                          <PushPin
                            className={cn(
                              "transition-colors duration-200",
                              pinnedMessageIds.has(message.id) ? "text-primary" : "text-text-secondary"
                            )}
                            fontSize="small"
                          />
                        </IconButton>
                      )}
                    </Box>
                  )}
                  {message.content ? (
                    <Typography
                      variant="body2"
                      className={cn(
                        "leading-relaxed whitespace-pre-wrap",
                        message.role === "user" ? "text-white" : "text-text-primary",
                      )}
                    >
                      {message.role === "assistant"
                        ? typewriter.getDisplayedContent(message.id, message.content)
                        : message.content}
                      {message.role === "assistant" && typewriter.isTyping(message.id) && (
                        <span className="av-typing-cursor" aria-hidden="true">
                          &nbsp;
                        </span>
                      )}
                    </Typography>
                  ) : null}

                  {message.role === "assistant" &&
                  message.type === "table" &&
                  message.tableData &&
                  !typewriter.isTyping(message.id) &&
                  (Array.isArray(message.tableData.columns) || Array.isArray(message.tableData.rows)) ? (
                    <Box className="mt-2 overflow-hidden rounded-xl animate-in fade-in slide-in-from-bottom-2 duration-300">
                      <AvaTable data={message.tableData} />
                    </Box>
                  ) : null}

                  {message.role === "assistant" &&
                  message.type === "chart" &&
                  message.chartData &&
                  !typewriter.isTyping(message.id) ? (
                    <Box className="mt-2 overflow-hidden rounded-xl animate-in fade-in slide-in-from-bottom-2 duration-300">
                      <AvaChart data={message.chartData} />
                    </Box>
                  ) : null}
                </Box>
              </Box>
            ))}

            {isThinking && (
              <Box className="flex w-full justify-start animate-in fade-in slide-in-from-left-2 duration-300">
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
              placeholder={
                usage?.limitReached
                  ? "Ask AVA usage limit reached for today"
                  : "Ask AVA about revenue, expenses, customer classes, rates..."
              }
              slotProps={{ input: { className: "rounded-2xl transition-all duration-200 focus-within:shadow-md" } }}
              disabled={inputDisabled}
            />
            <Button
              variant="contained"
              onClick={() => void sendMessage()}
              disabled={
                !input.trim() ||
                isThinking ||
                isLoading ||
                !token ||
                !chatId ||
                isAdminViewingUser ||
                Boolean(usage?.limitReached)
              }
              className="h-14 px-6 transition-transform duration-200 hover:scale-105 disabled:scale-100"
            >
              Send
            </Button>
          </Box>
        </CardContent>
      </Card>

      {isAdmin ? (
        <StartupQuestionsDialog
          open={startupDialogOpen}
          questions={startupQuestions}
          onClose={() => setStartupDialogOpen(false)}
          onSave={handleSaveStartupQuestions}
        />
      ) : null}
    </Box>
  );
}
