import { MetadataRoute } from "next";

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  return {
    name: "Puchi",
    icons: [
      {
        src: "/images/logo/logo-32.png",
        type: "image/png",
        sizes: "32x32",
      },
      {
        src: "/images/logo/logo-64.png",
        type: "image/png",
        sizes: "64x64",
      },
      {
        src: "/images/logo/logo-192.png",
        type: "image/png",
        sizes: "192x192",
      },
      {
        src: "/images/logo/logo-512.png",
        type: "image/png",
        sizes: "512x512",
      },
    ],
    start_url: "/",
    display: "standalone",
    background_color: "#7cff8f",
    theme_color: "#7cff8f",
  };
}
