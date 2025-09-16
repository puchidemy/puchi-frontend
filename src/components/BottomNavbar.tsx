"use client";

import Image from "next/image";

import { navigationList } from "@/constants/navigation";
import { Link, usePathname } from "@/i18n/routing";

const BottomNavBar = () => {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 bg-background sm:hidden border-t-2 w-full py-2 sm:py-4 flex justify-around z-50">
      {navigationList.map((item) => {
        const isActive = pathname.split("/")[1] === item.slug;
        return (
          <Link
            key={item.slug}
            href={`/${item.slug}`}
            className={`gap-4 p-2 rounded-xl border-2 hover:bg-sky-100 dark:hover:bg-sky-900/40 ${
              isActive &&
              "text-sky-400 border-sky-400 bg-sky-100 dark:bg-sky-900/40"
            }`}
          >
            <Image src={item.icon} alt={item.label} width={32} height={32} />
          </Link>
        );
      })}
    </div>
  );
};

export default BottomNavBar;
