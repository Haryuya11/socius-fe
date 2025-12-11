import Cookies from "js-cookie";
import { UserProfile } from "@/types/user";

const TOKEN_KEY = "session_token";
const MS_GRAPH_TOKEN_KEY = "ms_graph_token";
const USER_KEY = "user_profile";

export const authUtils = {
  // save token and user info to localStorage
  setAuth: (
    token: string,
    msGraphToken: string,
    expiresAt: Date
  ) => {
    Cookies.set(TOKEN_KEY, token, { expires: expiresAt, path: "/" });

    Cookies.set(MS_GRAPH_TOKEN_KEY, msGraphToken, {
      expires: expiresAt,
      path: "/",
    });
  },

  // remove token and user info from localStorage
  clearAuth: () => {
    Cookies.remove(TOKEN_KEY, { path: "/" });
    Cookies.remove(MS_GRAPH_TOKEN_KEY, { path: "/" });

    if (typeof window !== "undefined") {
      localStorage.removeItem(USER_KEY);
    }
  },

  // get access token from localStorage
  getToken: () => {
    return Cookies.get(TOKEN_KEY);
  },

  // get ms graph token
  getMsGraphToken: () => {
    return Cookies.get(MS_GRAPH_TOKEN_KEY);
  },

  // save user info to localStorage
  saveUserProfile: (user: UserProfile) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    }
  },

  // get user info from localStorage
  getUserProfile: (): UserProfile | null => {
    if (typeof window === "undefined") return null;
    const data = localStorage.getItem(USER_KEY);
    try {
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },
};
