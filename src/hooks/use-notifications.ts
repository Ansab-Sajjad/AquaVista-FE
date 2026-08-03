"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { getStoredAuthToken } from "@/lib/auth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export type NotificationCategory =
  | "file_upload_complete"
  | "file_upload_failed"
  | "member_added"
  | "member_removed"
  | "project_created";

export interface NotificationActor {
  id: string;
  name: string;
  profileImage?: string | null;
}

export interface NotificationItem {
  id: string;
  type: "system" | "user";
  category: NotificationCategory;
  title: string;
  message: string;
  isRead: boolean;
  href?: string | null;
  actor?: NotificationActor | null;
  createdAt: string;
  /** local-only flag: true while the user hasn't opened the panel yet */
  temporaryUnread: boolean;
  /** local-only flag: manually re-marked unread by the user */
  markedUnread: boolean;
}

interface UseNotificationsReturn {
  notifications: NotificationItem[];
  unreadCount: number;
  loading: boolean;
  markOneAsRead: (id: string) => void;
  markOneAsUnread: (id: string) => void;
  markAllAsRead: () => void;
}

function authHeader(): HeadersInit {
  const token = getStoredAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function useNotifications(): UseNotificationsReturn {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchNotifications() {
      try {
        const res = await fetch(`${API_BASE_URL}/api/notifications`, {
          headers: authHeader(),
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = await res.json();

        if (!cancelled) {
          setNotifications(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            data.map((n: any) => ({
              ...n,
              id: String(n.id),
              // notifications fetched fresh are shown as temporaryUnread until modal is opened
              temporaryUnread: !n.isRead,
              markedUnread: false,
            }))
          );
        }
      } catch {
        if (!cancelled) setNotifications([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchNotifications();
    return () => {
      cancelled = true;
    };
  }, []);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.isRead || n.markedUnread).length,
    [notifications]
  );

  const markOneAsRead = useCallback((id: string) => {
    // Optimistic update
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, isRead: true, markedUnread: false, temporaryUnread: false } : n
      )
    );

    // Persist to server (fire-and-forget)
    fetch(`${API_BASE_URL}/api/notifications/${id}/read`, {
      method: "PATCH",
      headers: authHeader(),
    }).catch(() => {
      // On failure, revert
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === id ? { ...n, isRead: false } : n
        )
      );
    });
  }, []);

  const markOneAsUnread = useCallback((id: string) => {
    // Local state only — no API call per requirements 5.4
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, markedUnread: true } : n))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    // Optimistic update
    setNotifications((prev) =>
      prev.map((n) => ({
        ...n,
        isRead: true,
        temporaryUnread: false,
        markedUnread: false,
      }))
    );

    // Persist to server
    fetch(`${API_BASE_URL}/api/notifications/read-all`, {
      method: "PATCH",
      headers: authHeader(),
    }).catch(() => {
      // Silent failure — unread count badge may be stale until next page load
    });
  }, []);

  return { notifications, unreadCount, loading, markOneAsRead, markOneAsUnread, markAllAsRead };
}
