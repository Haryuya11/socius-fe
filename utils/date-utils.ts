/**
 * Hàm parse chuỗi thời gian từ server về chuẩn UTC Date object
 * Giúp next-intl hiểu đúng giờ, không bị lệch +7
 */
export function parseToUtcDate(dateString: string): Date {
  if (!dateString) return new Date();

  // Logic cũ của bạn: Thêm Z nếu thiếu để báo hiệu đây là giờ UTC
  let normalizedDate = dateString;
  if (!dateString.endsWith("Z") && !/[+\-]\d{2}:\d{2}$/.test(dateString)) {
    normalizedDate += "Z";
  }

  // Trả về đối tượng Date thay vì chuỗi text
  return new Date(normalizedDate);
}
