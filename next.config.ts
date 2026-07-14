import type { NextConfig } from "next";
import withNextIntl from "next-intl/plugin";
import withBundleAnalyzer from "@next/bundle-analyzer";

const bundleAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig: NextConfig = {
  output: "standalone",
  assetPrefix: process.env.NEXT_PUBLIC_APP_URL || "",

  images: {
    remotePatterns: [
      { protocol: "https", hostname: "img.clerk.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
    ],
  },

  experimental: {
    globalNotFound: true,
  },

  // Dùng Webpack thay vì Turbopack vì @svgr/webpack gây leak CPU/RAM trên Turbopack
  webpack(config) {
    // Tìm rule xử lý SVG mặc định của Next.js
    const fileLoaderRule = config.module.rules.find((rule: any) =>
      rule.test?.test?.('.svg')
    );

    if (fileLoaderRule) {
      // Exclude *.svg từ file-loader mặc định
      fileLoaderRule.exclude = /\.svg$/i;
    }

    // Cấu hình loader để import file .svg trực tiếp dưới dạng React component
    config.module.rules.push({
      test: /\.svg$/i,
      use: ['@svgr/webpack'],
    });

    return config;
  },

  logging: {
    fetches: {
      fullUrl: false,
    },
  },

  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
};

export default bundleAnalyzer(withNextIntl()(nextConfig));
