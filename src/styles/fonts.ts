import { Gabarito, Capriola } from "next/font/google";
import localFont from "next/font/local";

const capriola = Capriola({
  variable: "--font-capriola",
  subsets: ["latin"],
  display: "swap",
  weight: ["400"],
});

const gabarito = Gabarito({
  variable: "--font-gabarito",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const din = localFont({
  src: "../../public/fonts/DINRoundPro-Medi.woff2",
  variable: "--font-din",
  display: "swap",
  weight: "400",
});

export const fonts = `${gabarito.variable} ${capriola.variable} ${din.variable}`;
