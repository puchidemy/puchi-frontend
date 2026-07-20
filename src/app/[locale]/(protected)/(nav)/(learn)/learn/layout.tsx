import type { ReactNode } from "react";

/**
 * Tall journey shell inside the learn two-column layout (keeps RightBar).
 * Does NOT use fixed fullscreen — that was covering the right panel.
 */
export default function JourneyShellLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="flex h-[calc(100dvh-1.25rem)] min-h-[480px] w-full min-w-0 flex-col max-sm:h-[calc(100dvh-5.5rem)]">
      {children}
    </div>
  );
}
