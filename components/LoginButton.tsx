"use client";

import { useMsal } from "@azure/msal-react";
import { toast } from "sonner";

export default function LoginButton() {
  const { instance } = useMsal();

  const login = async () => {
    try {
      const res = await instance.loginPopup({
        scopes: ["openid", "profile", "email"],
      });

      console.log("Login success:", res);
      toast.success("Login successful!");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <button
      className="px-4 py-2 bg-blue-500 text-white rounded"
      onClick={login}
    >
      Login with Azure AD
    </button>
  );
}
