import { useAuthStore } from "@/stores/auth-store";
import { useMsal } from "@azure/msal-react";
import { loginRequest } from "@/lib/msal-config";
import { authUtils } from "@/lib/auth-helpers";
import { userService } from "@/services/user-service";
import { toast } from "sonner";
import { SystemRole } from "@/types/roles";

export const useAuth = () => {
  const { instance } = useMsal();

  // Lấy state trực tiếp từ store
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);
  const hasRole = useAuthStore((state) => state.hasRole);

  // Lấy các setter cần thiết
  const setUser = useAuthStore((state) => state.setUser);
  const setLoading = useAuthStore((state) => state.setLoading);
  const resetStore = useAuthStore((state) => state.reset);

  const login = async () => {
    try {
      setLoading(true);
      // 1. Gọi MSAL Popup
      const response = await instance.loginPopup(loginRequest);

      // 2. Lưu token
      authUtils.setAuth(response.idToken, response.accessToken);

      // 3. Fetch profile từ API backend
      const profile = await userService.fetchProfile();

      // 4. Cập nhật vào Store
      setUser(profile);
      authUtils.saveUserProfile(profile);

      console.log("Login successful", response);
      toast.success("Đăng nhập thành công!");
    } catch (error) {
      console.error("Login failed", error);
      toast.error("Đăng nhập thất bại");
      // Nếu lỗi, clear loading
      setLoading(false);
    }
  };

  const logout = () => {
    // 1. Clear store & local storage
    resetStore();
    authUtils.clearAuth();

    // 2. Redirect MSAL logout
    instance.logoutRedirect({
      postLogoutRedirectUri: window.location.origin + "/login",
    });
  };

  // Wrapper cho hasRole để component dễ dùng
  const checkRole = (role: SystemRole) => hasRole(role);

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    hasRole: checkRole,
  };
};
