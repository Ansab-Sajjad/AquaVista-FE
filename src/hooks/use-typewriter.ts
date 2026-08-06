"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const TYPING_SPEED_MS = 12;
const CHARS_PER_TICK = 2;

type QueueItem = { id: string; content: string };

/**
 * Streams text content character-by-character to produce a typewriter effect.
 *
 * The hook maintains an internal queue so multiple messages (e.g. a narrative
 * answer followed by a table/chart caption) animate sequentially rather than
 * all at once. Callers enqueue messages via `enqueue` and read back the
 * partial content via `getDisplayedContent`. A message is considered "done"
 * once `isTyping(id)` returns false AND it has been enqueued before.
 */
export function useTypewriter() {
  const [typingIds, setTypingIds] = useState<Set<string>>(new Set());
  const [displayedLengths, setDisplayedLengths] = useState<Record<string, number>>({});
  const displayedLengthsRef = useRef<Record<string, number>>({});
  const queueRef = useRef<QueueItem[]>([]);
  const currentRef = useRef<QueueItem | null>(null);

  useEffect(() => {
    displayedLengthsRef.current = displayedLengths;
  }, [displayedLengths]);

  useEffect(() => {
    const interval = setInterval(() => {
      const current = currentRef.current;
      if (!current) {
        const next = queueRef.current.shift();
        if (next) {
          currentRef.current = next;
          setTypingIds((prev) => new Set(prev).add(next.id));
          setDisplayedLengths((prev) => ({ ...prev, [next.id]: 0 }));
        }
        return;
      }

      const currentLen = displayedLengthsRef.current[current.id] ?? 0;
      const nextLen = currentLen + CHARS_PER_TICK;

      if (nextLen >= current.content.length) {
        const finishedId = current.id;
        setDisplayedLengths((prev) => ({ ...prev, [finishedId]: current.content.length }));
        currentRef.current = null;
        setTypingIds((prev) => {
          const next = new Set(prev);
          next.delete(finishedId);
          return next;
        });
      } else {
        setDisplayedLengths((prev) => ({ ...prev, [current.id]: nextLen }));
      }
    }, TYPING_SPEED_MS);

    return () => clearInterval(interval);
  }, []);

  const enqueue = useCallback((items: QueueItem[]) => {
    queueRef.current.push(...items.filter((item) => item.content.length > 0));
  }, []);

  const getDisplayedContent = useCallback(
    (id: string, fullContent: string) => {
      if (!typingIds.has(id)) return fullContent;
      const len = displayedLengths[id] ?? 0;
      return fullContent.slice(0, len);
    },
    [typingIds, displayedLengths],
  );

  const isTyping = useCallback((id: string) => typingIds.has(id), [typingIds]);

  /** Total number of characters currently displayed across all streaming messages. */
  const progress = Object.values(displayedLengths).reduce((sum, len) => sum + len, 0);

  const reset = useCallback(() => {
    queueRef.current = [];
    currentRef.current = null;
    setTypingIds(new Set());
    setDisplayedLengths({});
  }, []);

  return { enqueue, getDisplayedContent, isTyping, reset, progress };
}
