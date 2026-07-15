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
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex flex-1 items-center justify-center px-4 py-10 relative">
          {/* Gradient blur blobs behind card */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-primary/5 blur-[100px]" />
            <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] rounded-full bg-[var(--unit-5)]/5 blur-[80px]" />
            <div className="absolute top-1/2 right-1/4 w-[350px] h-[350px] rounded-full bg-[var(--unit-2)]/5 blur-[70px]" />
          </div>
          <div className="relative z-10">{children}</div>
        </main>
        <Footer />
      </div>
    </SupertokensProvider>
  );
}
