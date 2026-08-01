const AUTH_TOKEN_KEY = "aquavista-auth-token";
const AUTH_USER_KEY = "aquavista-user";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

function getDefaultApiBaseUrl() {
  if (typeof window === "undefined") {
    return "";
  }
  if (API_BASE_URL) {
    return API_BASE_URL;
  }
  return window.location.origin;
}

export function normalizeAvatarUrl(url?: string | null) {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (url.startsWith("/uploads")) {
    const baseUrl = getDefaultApiBaseUrl();
    return `${baseUrl}${url}`;
  }
  return url;
}

export function getStoredAuthToken() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(AUTH_TOKEN_KEY);
}

export function getStoredAuthUser() {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(AUTH_USER_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object" && "image" in parsed) {
      return { ...parsed, image: normalizeAvatarUrl(String(parsed.image || "")) };
    }
    return parsed;
  } catch {
    return null;
  }
}

export function isAuthenticated() {
  return Boolean(getStoredAuthToken());
}

export function isAdminUser() {
  const user = getStoredAuthUser();
  if (!user) {
    return false;
  }

  const roleValue = user.role ?? user.userRole ?? user.userType ?? user.type ?? user.isAdmin;

  if (typeof roleValue === "boolean") {
    return roleValue;
  }

  if (typeof roleValue === "string") {
    const normalizedRole = roleValue.trim().toLowerCase();
    return ["admin", "superadmin", "super admin", "administrator", "owner"].includes(normalizedRole);
  }

  return false;
}

export function setAuthCookies(token: string, user: Record<string, unknown> | null = null) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(AUTH_TOKEN_KEY, token);

  if (user) {
    const normalizedUser = {
      ...user,
      image: normalizeAvatarUrl(String((user as any).image || "")),
    };
    window.localStorage.setItem(AUTH_USER_KEY, JSON.stringify(normalizedUser));
    window.dispatchEvent(new CustomEvent("auth-user-change", { detail: normalizedUser }));
  }
}

export function clearAuthState() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(AUTH_TOKEN_KEY);
  window.localStorage.removeItem(AUTH_USER_KEY);
}
