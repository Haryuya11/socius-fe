export const getFullImageUrl = (path?: string | null): string => {
  // 1. Nếu không có path, trả về chuỗi rỗng
  if (!path) return "";

  // 2. Nếu path đã là URL đầy đủ (http/https) hoặc là Blob URL (khi đang preview crop)
  // thì trả về nguyên vẹn, không nối thêm base url.
  if (path.startsWith("http") || path.startsWith("blob:")) {
    return path;
  }

  // 3. Lấy Base URL từ biến môi trường
  const baseUrl = process.env.NEXT_PUBLIC_AVATAR_BASE_URL || "";

  // 4. Xử lý dấu gạch chéo để tránh lỗi duplicate (vd: domain.com/ + /user/img.png => domain.com//user...)
  // Xóa dấu / ở cuối base url (nếu có)
  const cleanBase = baseUrl.replace(/\/+$/, "");
  // Xóa dấu / ở đầu path (nếu có)
  const cleanPath = path.replace(/^\/+/, "");

  // 5. Trả về URL hoàn chỉnh
  return `${cleanBase}/${cleanPath}`;
};
