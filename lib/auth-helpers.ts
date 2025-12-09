import Cookies from "js-cookie";

const TOKEN_KEY = "session_token"; // ID Token (Auth chính)
const MS_GRAPH_TOKEN_KEY = "ms_graph_token"; // Access Token (Gọi Graph API)
const USER_KEY = "user_info"; // Info hiển thị UI

export interface UserInfo {
  id: string;
  name: string;
  email: string;
  username: string;
}

export const authUtils = {
  // Lưu thông tin Auth 
  setAuth: (token: string, msGraphToken: string, user: UserInfo) => {
    // Lưu ID Token (Session chính) - 30 ngày
    Cookies.set(TOKEN_KEY, token, { expires: 30, path: "/" });

    // Lưu Graph Token - 1 ngày 
    // Lưu ý: Token này dùng để gọi API Microsoft Graph
    Cookies.set(MS_GRAPH_TOKEN_KEY, msGraphToken, { expires: 1, path: "/" });

    if (typeof window !== "undefined") {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    }
  },

  // 2. Xóa sạch mọi thứ khi Logout
  clearAuth: () => {
    Cookies.remove(TOKEN_KEY, { path: "/" });
    Cookies.remove(MS_GRAPH_TOKEN_KEY, { path: "/" });

    if (typeof window !== "undefined") {
      localStorage.removeItem(USER_KEY);
    }
  },

  // 3. Lấy Session Token (ID Token)
  getToken: () => {
    return Cookies.get(TOKEN_KEY);
  },

  // 4. Lấy Microsoft Graph Token (access token)
  getMsGraphToken: () => {
    return Cookies.get(MS_GRAPH_TOKEN_KEY);
  },

  // 5. Lấy User Info
  getUserInfo: (): UserInfo | null => {
    if (typeof window === "undefined") return null;
    const userData = localStorage.getItem(USER_KEY);
    return userData ? (JSON.parse(userData) as UserInfo) : null;
  },
};
