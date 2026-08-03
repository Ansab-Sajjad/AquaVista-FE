"use client";
import { useCallback } from "react";

const GITHUB_CLIENT_ID = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID || "";

const POPUP_WIDTH = 500;
const POPUP_HEIGHT = 700;
const MESSAGE_TYPE = "github-oauth-code";

/**
 * Popup-based GitHub OAuth flow.
 *
 * Opens a small centered popup window pointing at GitHub's authorize endpoint.
 * After the user authorizes, GitHub redirects the popup to
 * `/auth/github/callback`, which posts the `code` back to this window via
 * `postMessage` and closes itself — mirroring how the Google sign-in popup
 * behaves.
 *
 * @returns a Promise that resolves with the GitHub `code` to exchange with the
 *   backend, or rejects if the popup is blocked / closed / errors.
 */
export function useGitHubAuth() {
  return useCallback((): Promise<string> => {
    return new Promise<string>((resolve, reject) => {
      if (!GITHUB_CLIENT_ID) {
        reject(new Error("GitHub client ID is not configured."));
        return;
      }

      const redirectUri = `${window.location.origin}/auth/github/callback`;
      const githubAuthUrl =
        `https://github.com/login/oauth/authorize` +
        `?client_id=${GITHUB_CLIENT_ID}` +
        `&redirect_uri=${encodeURIComponent(redirectUri)}` +
        `&scope=user:email`;

      const left = window.screenX + Math.max(0, (window.outerWidth - POPUP_WIDTH) / 2);
      const top = window.screenY + Math.max(0, (window.outerHeight - POPUP_HEIGHT) / 2);
      const features =
        `popup=yes` +
        `,width=${POPUP_WIDTH}` +
        `,height=${POPUP_HEIGHT}` +
        `,left=${left}` +
        `,top=${top}`;

      const popup = window.open(githubAuthUrl, "github-oauth-popup", features);
      if (!popup || popup.closed || typeof popup.closed === "undefined") {
        reject(new Error("Popup was blocked. Please allow popups for this site and try again."));
        return;
      }

      let pollTimer: ReturnType<typeof setInterval> | null = null;
      let settled = false;

      const cleanup = () => {
        if (pollTimer) clearInterval(pollTimer);
        window.removeEventListener("message", handleMessage);
      };

      const handleMessage = (event: MessageEvent) => {
        // Only accept messages from our own origin (the callback page).
        if (event.origin !== window.location.origin) return;
        const data = event.data;
        if (!data || data.type !== MESSAGE_TYPE) return;

        if (settled) return;
        settled = true;
        cleanup();

        if (data.code) {
          resolve(data.code as string);
        } else {
          reject(new Error(data.errorDescription || data.error || "GitHub sign-in failed."));
        }
      };

      window.addEventListener("message", handleMessage);

      // Detect when the user closes the popup without completing auth.
      pollTimer = setInterval(() => {
        if (popup.closed) {
          if (settled) return;
          settled = true;
          cleanup();
          reject(new Error("GitHub sign-in was cancelled."));
        }
      }, 500);
    });
  }, []);
}
