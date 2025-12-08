import type { Configuration, PopupRequest } from "@azure/msal-browser";

const clientId = process.env.NEXT_PUBLIC_AZURE_CLIENT_ID || "";
const redirectUri =
  process.env.NEXT_PUBLIC_AZURE_REDIRECT_URI || "http://localhost:3000";
const authority = process.env.NEXT_PUBLIC_AZURE_AUTHORITY || "";
export const msalConfig = {
  auth: {
    clientId: clientId, 
    authority: authority,
    redirectUri: redirectUri,
    postLogoutRedirectUri: redirectUri,
  },
  cache: {
    cacheLocation: "localStorage", 
    storeAuthStateInCookie: false,
  },
};

export const loginRequest = {
  scopes: [
    "openid",
    "profile",
    "email",
  ],
};
