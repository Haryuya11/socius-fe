import Cookies from "js-cookie";
import { UserProfile } from "@/types/user";

const TOKEN_KEY = "session_token";
const MS_GRAPH_TOKEN_KEY = "ms_graph_token";
const USER_KEY = "user_profile";

export const authUtils = {
  setAuth: (token: string, msGraphToken: string) => {
    const cookieExpiry = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);
    Cookies.set(TOKEN_KEY, token, { expires: cookieExpiry, path: "/" });
    Cookies.set(MS_GRAPH_TOKEN_KEY, msGraphToken, {
      expires: cookieExpiry,
      path: "/",
    });
  },

  clearAuth: () => {
    Cookies.remove(TOKEN_KEY, { path: "/" });
    Cookies.remove(MS_GRAPH_TOKEN_KEY, { path: "/" });
    if (typeof window !== "undefined") {
      localStorage.removeItem(USER_KEY);
    }
  },

  getToken: () => Cookies.get(TOKEN_KEY),
  getMsGraphToken: () => Cookies.get(MS_GRAPH_TOKEN_KEY),

  saveUserProfile: (user: UserProfile) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    }
  },

  getUserProfile: (): UserProfile | null => {
    if (typeof window === "undefined") return null;
    const data = localStorage.getItem(USER_KEY);
    try {
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  hasPermission: (
    permissionCode: string,
    scopeCode?: string | null,
  ): boolean => {
    if (typeof window === "undefined") return false;
    const user = authUtils.getUserProfile();

    if (!user || !Array.isArray(user.permissions)) return false;

    if (user.systemRole === "SYS_ADMIN") return true;

    return user.permissions.some((p) => {
      if (p.permissionCode === "system.full" && p.scope === "GLOBAL")
        return true;

      if (p.permissionCode !== permissionCode) return false;

      if (!scopeCode) return true;

      return p.resourceCode === scopeCode;
    });
  },
};
