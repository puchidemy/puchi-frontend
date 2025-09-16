import { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";

import ThemeProvider from "@/components/providers/ThemeProvider";
import LazyMotionProvider from "@/components/providers/LazyMotionProvider";
import { DrawerCustom } from "@/components/DrawerCustom";
import { getBaseUrl } from "@/lib/helpers";
import { cn } from "@/lib/utils";
import { fonts } from "@/styles/fonts";

import "@/styles/globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(getBaseUrl()),
  applicationName: "Puchi",
  referrer: "origin-when-cross-origin",
  keywords: [
    "Puchi",
    "vietnamese",
    "learn vietnamese",
    "HoanIT",
    "hoan02",
    "Viet Nam",
  ],
  authors: [{ name: "Hoan", url: "https://www.facebook.com/hoanit02" }],
  creator: "Lê Công Hoan",
  publisher: "Hoan IT",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  facebook: {
    appId: "961750142645211",
  },
};

type RootLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function RootLayout({
  children,
  params,
}: RootLayoutProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className="relative scrollbar-thin"
    >
      <body
        className={cn(fonts, "flex flex-col font-sans")}
        suppressHydrationWarning
      >
        <ThemeProvider attribute="class" enableSystem disableTransitionOnChange>
          <NextIntlClientProvider locale={locale} messages={messages}>
            <LazyMotionProvider>
              {children}
              <DrawerCustom />
            </LazyMotionProvider>
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
