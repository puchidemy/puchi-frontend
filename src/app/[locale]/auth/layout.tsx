import { AuthProvider } from "@/providers/AuthProvider";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <div className="container flex grow flex-col px-0">
        <Header />
        <main className="flex flex-1 items-center justify-center px-4 py-10">
          {children}
        </main>
        <Footer />
      </div>
    </AuthProvider>
  );
}
