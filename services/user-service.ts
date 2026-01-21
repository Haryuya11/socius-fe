import http from "@/lib/axios"; 
import { ApiResponse } from "@/types/response";
import { ChangePasswordRequest, UserProfile } from "@/types/user";

export const userService = {
  fetchProfile: async (): Promise<UserProfile> => {
    const response = await http.get<ApiResponse<UserProfile>>(
      "/api/employees/profile"
    );
    return response.data.data;
  },

  changePassword: async (payload: ChangePasswordRequest): Promise<boolean> => {
    try {
      const response = await http.put<ApiResponse<null>>(
        "/api/employees/change-password",
        payload
      );
      return response.data.success;
    } catch (error) {
      console.error("Failed to change password", error);
      throw error;
    }
  },
};
