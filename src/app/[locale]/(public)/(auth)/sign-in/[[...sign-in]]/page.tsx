import { Skeleton } from "@/components/ui/skeleton";
import { ClerkLoaded, ClerkLoading, SignIn } from "@clerk/nextjs";

export const metadata = {
  title: "Đăng nhập",
  description: "Đăng nhập",
};

const SignInPage = () => {
  return (
    <div className="min-h-[490.55px]">
      <ClerkLoading>
        <Skeleton className="h-[490.55px] w-[400px] rounded-xl" />
      </ClerkLoading>
      <ClerkLoaded>
        <SignIn />
      </ClerkLoaded>
    </div>
  );
};

export default SignInPage;
