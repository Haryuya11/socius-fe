"use client";

import React, { useEffect } from "react";
import { useMsal } from "@azure/msal-react";
import { useAuthStore } from "@/stores/auth-store";
import { authUtils } from "@/lib/auth-helpers";
import { userService } from "@/services/user-service";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { accounts } = useMsal();

  const setUser = useAuthStore((state) => state.setUser);
  const setLoading = useAuthStore((state) => state.setLoading);
  const setInitialized = useAuthStore((state) => state.setInitialized);
  const isInitialized = useAuthStore((state) => state.isInitialized);

  const fetchProfile = async () => {
    const token = authUtils.getToken();
    if (!token) return; 

    try {
      // Chỉ set loading nếu chưa có data user (tránh flicking khi re-focus window)
      if (!useAuthStore.getState().user) setLoading(true);

      const profile = await userService.fetchProfile();
      setUser(profile);
      authUtils.saveUserProfile(profile);
    } catch (err) {
      console.error("Failed to fetch user profile", err);
      // Token lỗi hoặc hết hạn -> Silent fail hoặc clear user
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // 1. Khởi tạo từ localStorage ngay khi mount (Client-side)
  useEffect(() => {
    const storedUser = authUtils.getUserProfile();
    if (storedUser) {
      // Hydrate store ngay lập tức
      useAuthStore.setState({
        user: storedUser,
        isAuthenticated: true,
        isLoading: false,
      });
    }
    setInitialized(true);
  }, [setInitialized]);

  // 2. Lắng nghe thay đổi account từ MSAL
  useEffect(() => {
    if (!isInitialized) return;

    const token = authUtils.getToken();

    if (accounts.length > 0 && token) {
      // Trường hợp: User F5 lại trang hoặc mở tab mới đã có session MSAL
      fetchProfile();
    } else if (accounts.length === 0) {
      // Trường hợp: Session MSAL bị mất -> Clear store
      setUser(null);
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accounts, isInitialized]);

  return <>{children}</>;
}
