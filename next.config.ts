import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "socius.blob.core.windows.net",
        port: "",
        pathname: "/**", // Cho phép tất cả các đường dẫn con
      },
      // Nếu bạn dùng ảnh từ google, facebook, thêm tiếp vào đây...
    ],
  },
};

export default withNextIntl(nextConfig);
