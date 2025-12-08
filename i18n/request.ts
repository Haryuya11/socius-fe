import { getRequestConfig } from "next-intl/server";
import { cookies } from "next/headers";

export default getRequestConfig(async () => {
  // Đọc cookie, mặc định là 'en-US'
  const locale = (await cookies()).get("NEXT_LOCALE")?.value || "en-US";

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
