/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";
import { authUtils } from "@/lib/auth-helpers";
import { toast } from "sonner";
import { msalInstance, loginRequest } from "./msal-config";
import { getTranslations } from "next-intl/server";

let msalInitPromise: Promise<void> | null = null;

async function getValidToken() {
  // if running in server (SSR), return null
  if (typeof window === "undefined") return null;

  // check if msal is initialized
  if (!msalInitPromise) {
    msalInitPromise = msalInstance.initialize();
  }

  // wait for msal to initialize
  await msalInitPromise;

  // get all accounts
  const accounts = msalInstance.getAllAccounts();
  if (accounts.length === 0) {
    // if no accounts, return null
    return null;
  }

  const account = accounts[0];

  try {
    // check if token is valid
    // if valid, return token
    // if not valid, refresh token
    const response = await msalInstance.acquireTokenSilent({
      ...loginRequest,
      account: account,
    });

    // check if new token is different from current token
    // if different, update token in cookie
    const currentCookieToken = authUtils.getToken();

    if (response.idToken !== currentCookieToken) {
      console.log(
        "New token is different from current token, updating token in cookie..."
      );

      const exp =
        response.idTokenClaims &&
        typeof response.idTokenClaims === "object" &&
        "exp" in response.idTokenClaims
          ? (response.idTokenClaims as { exp: number }).exp
          : Math.floor(Date.now() / 1000) + 3600;

      const expiresAt = new Date(exp * 1000);

      authUtils.setAuth(response.idToken, response.accessToken, expiresAt);
    }

    return response.idToken;
  } catch (error) {
    console.log("Silent token acquisition failed", error);
    return null;
  }
}

// create instance
const http = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

// request interceptor
http.interceptors.request.use(
  async (config) => {
    if (typeof window !== "undefined") {
      // get token
      const token = await getValidToken();

      // if token is null, get token from cookie
      const finalToken = token || authUtils.getToken();

      if (finalToken) {
        config.headers.Authorization = `Bearer ${finalToken}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// response interceptor
http.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    if (error.response?.status === 401) {
      const t = await getTranslations("Auth");
      const loginPath = "/login";

      if (
        typeof window !== "undefined" &&
        !window.location.pathname.startsWith(loginPath)
      ) {
        // clear auth
        authUtils.clearAuth();
        toast.error(t("session_expired"));

        // redirect to login
        window.location.href = loginPath;
      }
    }
    return Promise.reject(error);
  }
);

export default http;
