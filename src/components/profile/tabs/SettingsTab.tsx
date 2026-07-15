"use client";

import { useTranslations } from "next-intl";
import { ChevronRight, User, Shield, Bell, Globe, Settings, LogOut } from "lucide-react";
import { signOut } from "@/config/supertokens";

const quickLinks = [
  { id: "profile", icon: User, href: "/settings/profile", color: "var(--unit-5)" },
  { id: "preferences", icon: Settings, href: "/settings", color: "var(--unit-1)" },
  { id: "notifications", icon: Bell, href: "/settings/notifications", color: "var(--unit-4)" },
  { id: "privacy", icon: Shield, href: "/settings/privacy", color: "var(--unit-2)" },
  { id: "language", icon: Globe, href: "/settings/language", color: "var(--unit-3)" },
] as const;

export default function SettingsTab() {
  const t = useTranslations("Profile");

  return (
    <div className="rounded-2xl bg-card border border-border p-4 divide-y divide-border">
      {quickLinks.map((link) => (
        <a
          key={link.id}
          href={link.href}
          className="flex items-center gap-3 py-4 group cursor-pointer"
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: `color-mix(in srgb, ${link.color} 15%, transparent)`, color: link.color }}
          >
            <link.icon size={20} />
          </div>
          <span className="flex-1 text-sm font-medium">{t(`settingsLinks.${link.id}`)}</span>
          <ChevronRight size={16} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
        </a>
      ))}

      {/* Sign Out */}
      <button
        onClick={() => signOut().then(() => window.location.reload())}
        className="flex items-center gap-3 py-4 w-full group cursor-pointer text-left"
      >
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: "color-mix(in srgb, var(--destructive) 15%, transparent)", color: "var(--destructive)" }}
        >
          <LogOut size={20} />
        </div>
        <span className="flex-1 text-sm font-medium text-destructive">{t("settingsLinks.signOut")}</span>
        <ChevronRight size={16} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
      </button>
    </div>
  );
}
