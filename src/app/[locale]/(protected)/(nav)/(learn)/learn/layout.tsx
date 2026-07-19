import type { ReactNode } from "react";

/**
 * Full-viewport shell for Journey Map + Chapter.
 * Escapes parent learn padding / dual-column layout; clears bottom nav + sidebar.
 */
export default function JourneyShellLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div
      className={[
        "fixed inset-0 z-30 flex flex-col bg-background",
        // Mobile bottom nav (~4rem)
        "max-sm:bottom-16",
        // Match SidebarLeft offsets from (nav)/layout
        "sm:left-[84px] lg:left-60",
      ].join(" ")}
    >
      {children}
    </div>
  );
}
