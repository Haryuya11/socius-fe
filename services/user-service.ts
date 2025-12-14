import http from "@/lib/axios"; // Import instance axios của bạn
import { ApiResponse } from "@/types/response";
import { ChangePasswordRequest, UserProfile } from "@/types/user";

export const userService = {
  fetchProfile: async (): Promise<UserProfile> => {
    const response = await http.get<ApiResponse<UserProfile>>(
      "/mvc/employees/profile"
    );
    return response.data.data;
  },
  // ... các hàm cũ (fetchEployees, deleteEmployee) giữ nguyên

  // Thêm hàm đổi mật khẩu
  changePassword: async (payload: ChangePasswordRequest): Promise<boolean> => {
    try {
      const response = await http.put<ApiResponse<null>>(
        "/mvc/employees/change-password",
        payload
      );
      return response.data.success;
    } catch (error) {
      console.error("Failed to change password", error);
      throw error;
    }
  },
};
