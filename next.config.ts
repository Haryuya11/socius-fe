import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
};

module.exports = {
  i18n: {
    // These are all the locales you want to support in
    // your application
    locales: ["en-US", "vi"],
    defaultLocale: "en-US",
    domains: [
      {
        domain: "example.com",
        defaultLocale: "en-US",
      },
      {
        domain: "example.vi",
        defaultLocale: "vi",
      },
    ],
  },
};

export default nextConfig;
