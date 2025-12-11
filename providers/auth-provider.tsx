/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { UserProfile } from "@/types/user";
import { userService } from "@/services/user-service";
import { authUtils } from "@/lib/auth-helpers";
import { loginRequest } from "@/lib/msal-config";
import { SystemRole } from "@/types/roles";
import { useMsal } from "@azure/msal-react";
import { toast } from "sonner";

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: () => Promise<void>;
  logout: () => void;
  hasRole: (role: SystemRole) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { instance, accounts } = useMsal();

  const [user, setUser] = useState<UserProfile | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // get user info from localStorage
  useEffect(() => {
    const storedUser = authUtils.getUserProfile();
    if (storedUser) {
      setUser(storedUser);
    }
    setIsInitialized(true);
  }, []);

  // fetch user profile
  const fetchProfile = async () => {
    const token = authUtils.getToken();
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      if (!user) setIsLoading(true);
      const profile = await userService.fetchProfile();
      setUser(profile);
      authUtils.saveUserProfile(profile);
    } catch (err) {
      console.error("Failed to fetch user profile", err);
    } finally {
      setIsLoading(false);
    }
  };

  // check if user is authenticated and fetch user profile
  useEffect(() => {
    if (!isInitialized) return;

    const token = authUtils.getToken();

    if (accounts.length > 0 && token) {
      fetchProfile();
    } else if (accounts.length === 0 && !token) {
      setUser(null);
      setIsLoading(false);
    }
  }, [accounts, isInitialized]);

  const login = async () => {
    try {
      setIsLoading(true);
      const response = await instance.loginPopup(loginRequest);

      const expiresAt =
        response.expiresOn || new Date(Date.now() + 3600 * 1000);
      authUtils.setAuth(response.idToken, response.accessToken, expiresAt);

      await fetchProfile();

      console.log("Login successful", response);
      toast.success("Đăng nhập thành công!");
    } catch (error) {
      console.error("Login failed", error);
      toast.error("Đăng nhập thất bại");
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    // instance.logoutPopup({
    //   postLogoutRedirectUri: window.location.origin + "/login",
    // });
    instance.logoutRedirect({
      postLogoutRedirectUri: window.location.origin + "/login",
    });
    authUtils.clearAuth();
    setUser(null);
  };

  //   const handleLogout = () => {
  //     authUtils.clearAuth();
  //     const currentOrigin = window.location.origin;
  //     const loginPage = "/login";

  //     instance.logoutRedirect({
  //       postLogoutRedirectUri: `${currentOrigin}${loginPage}`,
  //     });
  //   };

  const hasRole = (roleCode: SystemRole) => {
    return user?.systemRole === roleCode;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined || context === null) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
