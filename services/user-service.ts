import http from "@/lib/axios"; // Import instance axios của bạn
import { ApiResponse } from "@/types/response";
import { UserProfile } from "@/types/user";

export const userService = {
  fetchProfile: async (): Promise<UserProfile> => {
    const response = await http.get<ApiResponse<UserProfile>>(
      "/mvc/employees/profile"
    );
    return response.data.data;
  },
};
