import { formatDistanceToNow, parseISO } from "date-fns";
import { vi } from "date-fns/locale";

/**
 * Hàm format thời gian thông báo
 * Xử lý lỗi lệch 7 tiếng do Timezone
 */
export function formatRelativeTime(dateString: string): string {
  if (!dateString) return "";

  // 1. Xử lý chuỗi thời gian
  // Nếu server trả về "2026-01-10T12:00:00" (thiếu chữ Z ở cuối)
  // Trình duyệt sẽ hiểu nhầm là giờ Local (VN).
  // Ta cần thêm 'Z' vào cuối để khẳng định đây là giờ UTC.
  let normalizedDate = dateString;
  if (!dateString.endsWith("Z") && !dateString.includes("+")) {
    normalizedDate += "Z";
  }

  try {
    // 2. Parse sang Date object
    const date = parseISO(normalizedDate);

    // 3. Tính khoảng cách thời gian (VD: "5 phút trước")
    return formatDistanceToNow(date, {
      addSuffix: true, // Thêm chữ "trước"
      locale: vi, // Tiếng Việt
    });
  } catch (error) {
    console.error("Lỗi parse ngày tháng:", error);
    return "";
  }
}
