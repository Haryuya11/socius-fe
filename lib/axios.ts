import axios from "axios";
import { authUtils } from "@/lib/auth-helpers";
import { toast } from "sonner";
import { msalInstance, loginRequest } from "./msal-config";

// axios config
declare module "axios" {
  export interface InternalAxiosRequestConfig {
    _retry?: boolean;
  }
}

let msalInitPromise: Promise<void> | null = null;

export async function getValidToken(forceRefresh = false) {
  // if running in server (SSR), return null
  if (typeof window === "undefined") return null;

  try {
  // check if msal is initialized
  if (!msalInitPromise) {
    msalInitPromise = msalInstance.initialize();
  }

  // wait for msal to initialize
  await msalInitPromise;

  // get all accounts
  const account = msalInstance.getActiveAccount() || msalInstance.getAllAccounts()[0];
  if (!account) {
      return null;
    }

    // check if token is valid
    // if valid, return token
    // if not valid, refresh token
    const response = await msalInstance.acquireTokenSilent({
      ...loginRequest,
      account: account,
      forceRefresh: forceRefresh,
    });

    // check if new token is different from current token
    // if different, update token in cookie

    if (response.idToken) {

      const exp =
        response.idTokenClaims &&
        typeof response.idTokenClaims === "object" &&
        "exp" in response.idTokenClaims
          ? (response.idTokenClaims as { exp: number }).exp
          : Math.floor(Date.now() / 1000) + 3600;

      const expiresAt = new Date(exp * 1000);

      authUtils.setAuth(response.idToken, response.accessToken);
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
      const token = await getValidToken(false);

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
    const originalRequest = error.config;

    if (error.response?.status === 401) {
      // only intercept 401 errors if the request hasn't already been retried
      if (!originalRequest._retry) {
        // set _retry to true so we don't enter an infinite loop
        originalRequest._retry = true;

        try {
          console.log("Token expired (401). Attempting silent refresh...");

          // force refresh: force to get a new token from MSAL
          const newToken = await getValidToken(true);

          if (newToken) {
            console.log("Refresh success. Retrying original request...");

            originalRequest.headers.Authorization = `Bearer ${newToken}`;

            // retry the original request
            return http(originalRequest);
          }
        } catch (refreshError) {
          console.error("Retry failed:", refreshError);
        }
      }

      const loginPath = "/login";

      if (
        typeof window !== "undefined" &&
        !window.location.pathname.startsWith(loginPath)
      ) {
        // clear auth
        authUtils.clearAuth();
        toast.error("Phiên đăng nhập hết hạn, vui lòng đăng nhập lại.");

        // redirect to login
        window.location.href = loginPath;
      }
    }
    return Promise.reject(error);
  }
);

export default http;
