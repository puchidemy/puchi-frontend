import { SupertokensProvider } from "@/providers/SupertokensProvider";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SupertokensProvider>
      <div className="flex min-h-screen flex-col relative">
        <Header />
        <main className="relative flex flex-1 items-center justify-center px-4 py-10 overflow-hidden">
          {/* Gradient blur effect behind card */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
            <div className="absolute w-[600px] h-[600px] rounded-full bg-primary/5 blur-[120px] -translate-y-1/4" />
            <div className="absolute w-[500px] h-[500px] rounded-full bg-[var(--unit-5)]/5 blur-[100px] translate-x-1/4 translate-y-1/4" />
            <div className="absolute w-[400px] h-[400px] rounded-full bg-[var(--unit-2)]/5 blur-[80px] -translate-x-1/4 translate-y-1/3" />
          </div>
          <div className="relative z-10">{children}</div>
        </main>
        <Footer />
      </div>
    </SupertokensProvider>
  );
}
