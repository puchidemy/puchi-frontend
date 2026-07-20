type PlayerLayoutProps = {
  children: React.ReactNode;
};

/** Fullscreen learn sessions — no Sidebar / BottomNav / RightBar. */
export default function PlayerLayout({ children }: PlayerLayoutProps) {
  return (
    <div className="fixed inset-0 z-40 h-dvh w-full overflow-hidden bg-background">
      {children}
    </div>
  );
}
