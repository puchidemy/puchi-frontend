import { AuthProvider } from "@/providers/AuthProvider";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";

const AUTH_API_URL =
  process.env.NEXT_PUBLIC_AUTH_API_URL ||
  process.env.AUTH_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:3000";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider baseUrl={AUTH_API_URL}>
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
