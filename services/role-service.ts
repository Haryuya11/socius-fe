import axios from "@/lib/axios";
import { Role } from "@/types/permission";

export const roleService = {
  fetchAllRoles: async (): Promise<Role[]> => {
    // Gọi API: {{server}}/api/roles
    const res = await axios.get("/api/roles");
    return res.data.data;
  },

  fetchRoleDetail: async (roleCode: string): Promise<Role> => {
    // Gọi API: {{server}}/api/roles/SYS_ADMIN
    const res = await axios.get(`/api/roles/${roleCode}`);
    return res.data.data;
  },
};
