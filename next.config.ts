import type { NextConfig } from "next";
import withNextIntl from "next-intl/plugin";
import withBundleAnalyzer from "@next/bundle-analyzer";

const bundleAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

/** Local multi-service gateway (mirrors Envoy path routing). */
function localApiRewrites() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
  const useLocalGateway =
    process.env.LOCAL_API_GATEWAY === "1" ||
    apiUrl === "http://localhost:3000" ||
    apiUrl === "http://127.0.0.1:3000";
  if (!useLocalGateway) return [];

  // Upstream Go ports — MUST NOT be :3000 (would loop rewrites).
  // FE public URL stays NEXT_PUBLIC_AUTH_API_URL=http://localhost:3000.
  const auth = process.env.LOCAL_AUTH_URL || "http://localhost:8080";
  const core = process.env.LOCAL_CORE_URL || "http://localhost:8001";
  const learn = process.env.LOCAL_LEARN_URL || "http://localhost:8002";
  const media = process.env.LOCAL_MEDIA_URL || "http://localhost:8003";
  const notification =
    process.env.LOCAL_NOTIFICATION_URL || "http://localhost:8004";

  // Only Limen API paths — NOT FE pages (/auth/continue, /auth/sign-in, …)
  return [
    { source: "/auth/oauth/:path*", destination: `${auth}/auth/oauth/:path*` },
    {
      source: "/auth/signin/:path*",
      destination: `${auth}/auth/signin/:path*`,
    },
    {
      source: "/auth/signup/:path*",
      destination: `${auth}/auth/signup/:path*`,
    },
    {
      source: "/auth/passwords/:path*",
      destination: `${auth}/auth/passwords/:path*`,
    },
    {
      source: "/auth/social/:path*",
      destination: `${auth}/auth/social/:path*`,
    },
    { source: "/auth/me", destination: `${auth}/auth/me` },
    { source: "/auth/signout", destination: `${auth}/auth/signout` },
    { source: "/v1/profile/:path*", destination: `${core}/v1/profile/:path*` },
    { source: "/v1/profile", destination: `${core}/v1/profile` },
    {
      source: "/v1/onboarding/:path*",
      destination: `${core}/v1/onboarding/:path*`,
    },
    {
      source: "/v1/onboarding",
      destination: `${core}/v1/onboarding`,
    },
    { source: "/v1/social/:path*", destination: `${core}/v1/social/:path*` },
    { source: "/v1/learn/:path*", destination: `${learn}/v1/learn/:path*` },
    { source: "/v1/media/:path*", destination: `${media}/v1/media/:path*` },
    {
      source: "/notification/:path*",
      destination: `${notification}/notification/:path*`,
    },
  ];
}

const nextConfig: NextConfig = {
  output: "standalone",
  assetPrefix: process.env.NEXT_PUBLIC_APP_URL || "",

  async rewrites() {
    return localApiRewrites();
  },

  images: {
    remotePatterns: [
      { protocol: "https", hostname: "img.clerk.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "cdn.puchi.io.vn" },
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
