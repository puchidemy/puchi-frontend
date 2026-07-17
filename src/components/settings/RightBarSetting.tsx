"use client";

import { Link, usePathname } from "@/i18n/routing";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const settingAccount = {
  title: "Account",
  items: [
    { label: "Profile", href: "/settings/profile" },
    { label: "Preferences", href: "/settings/preferences" },
    { label: "Notifications", href: "/settings/notifications" },
    { label: "Privacy settings", href: "/settings/privacy" },
    { label: "Language", href: "/settings/language" },
  ],
};

const settingSubscription = {
  title: "Subscription",
  items: [{ label: "Choose a plan", href: "/settings/super" }],
};

const settingSupport = {
  title: "Support",
  items: [{ label: "Help Center", href: "/help" }],
};

function pathMatches(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function SettingNavLink({
  href,
  label,
  pathname,
}: {
  href: string;
  label: string;
  pathname: string;
}) {
  const active = pathMatches(pathname, href);

  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "text-xl py-2 px-4 rounded-xl border-2 border-transparent transition-colors",
        "hover:bg-sky-100 dark:hover:bg-sky-900/40",
        active &&
          "text-sky-500 border-sky-400 bg-sky-100 dark:bg-sky-900/40 dark:text-sky-300",
      )}
    >
      {label}
    </Link>
  );
}

function SettingNavGroup({
  title,
  items,
  pathname,
}: {
  title: string;
  items: { label: string; href: string }[];
  pathname: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="px-4">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-1 font-medium">
        {items.map((item) => (
          <SettingNavLink
            key={item.href}
            href={item.href}
            label={item.label}
            pathname={pathname}
          />
        ))}
      </CardContent>
    </Card>
  );
}

const RightBarSetting = () => {
  const pathname = usePathname();

  return (
    <div className="space-y-4">
      <SettingNavGroup
        title={settingAccount.title}
        items={settingAccount.items}
        pathname={pathname}
      />
      <SettingNavGroup
        title={settingSubscription.title}
        items={settingSubscription.items}
        pathname={pathname}
      />
      <SettingNavGroup
        title={settingSupport.title}
        items={settingSupport.items}
        pathname={pathname}
      />
    </div>
  );
};

export default RightBarSetting;
