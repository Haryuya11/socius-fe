// utils/image-utils.ts

export type ImageType = "user" | "conversation" | "message";

export const getFullImageUrl = (
  path?: string | null,
  type: ImageType = "user",
): string => {
  // 1. Nếu không có path, trả về chuỗi rỗng
  if (!path) return "";

  // 2. Nếu path đã là URL đầy đủ (http/https) hoặc là Blob URL
  if (path.startsWith("http") || path.startsWith("blob:")) {
    return path;
  }

  // 3. Lấy Base URL từ biến môi trường (Mặc định đang là .../user)
  const baseUrl = process.env.NEXT_PUBLIC_AVATAR_BASE_URL || "";

  // 4. Xử lý đổi container dựa trên type
  // Giả sử baseUrl cấu hình là "https://.../user"
  let finalBaseUrl = baseUrl;

  if (type === "conversation") {
    // Thay thế /user bằng /conversation
    finalBaseUrl = baseUrl.replace("/user", "/conversation");
  } else if (type === "message") {
    // Thay thế /user bằng /message (cho ảnh gửi trong tin nhắn)
    finalBaseUrl = baseUrl.replace("/user", "/message");
  }

  // 5. Xử lý dấu gạch chéo
  const cleanBase = finalBaseUrl.replace(/\/+$/, "");
  const cleanPath = path.replace(/^\/+/, "");

  // 6. Trả về URL hoàn chỉnh
  return `${cleanBase}/${cleanPath}`;
};
