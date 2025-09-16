import { Link } from "@/i18n/routing";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const settingAccount = {
  title: "Account",
  items: [
    { label: "Preferences", href: "/settings" },
    { label: "Profile", href: "/settings/profile" },
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

const RightBarSetting = () => {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="px-4">{settingAccount.title}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col font-medium">
          {settingAccount.items.map((item) => {
            return (
              <Link
                href={item.href}
                key={item.label}
                className="text-xl py-2 px-4 rounded-lg hover:bg-border/50 dark:hover:bg-border/70"
              >
                {item.label}
              </Link>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="px-4">{settingSubscription.title}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col font-medium">
          {settingSubscription.items.map((item) => {
            return (
              <Link
                href={item.href}
                key={item.label}
                className="text-xl py-2 px-4 rounded-lg hover:bg-border/50 dark:hover:bg-border/70"
              >
                {item.label}
              </Link>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="px-4">{settingSupport.title}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col font-medium">
          {settingSupport.items.map((item) => {
            return (
              <Link
                href={item.href}
                key={item.label}
                className="text-xl py-2 px-4 rounded-lg hover:bg-border/50 dark:hover:bg-border/70"
              >
                {item.label}
              </Link>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
};

export default RightBarSetting;
