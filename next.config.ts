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

  // 1. Cấu hình sẵn cho Turbopack (khi sau này Next.js vá lỗi loop và quay lại dùng)
  turbopack: {
    rules: {
      "*.svg": {
        loaders: [
          {
            loader: "@svgr/webpack",
            options: {
              svgProps: {
                fill: "currentColor",
              },
            },
          },
        ],
        as: "*.js",
      },
    },
  },

  // 2. Cấu hình cho Webpack (Dùng chính ở môi trường dev lúc này để tránh CPU 100%)
  webpack(config) {
    const fileLoaderRule = config.module.rules.find((rule: any) =>
      rule.test?.test?.('.svg')
    );

    if (fileLoaderRule) {
      fileLoaderRule.exclude = /\.svg$/i;
    }

    config.module.rules.push({
      test: /\.svg$/i,
      use: [
        {
          loader: "@svgr/webpack",
          options: {
            svgProps: {
              fill: "currentColor",
            },
          },
        },
      ],
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
