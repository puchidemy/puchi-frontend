import { Skeleton } from '@/components/ui/skeleton';
import { ClerkLoaded, ClerkLoading, SignUp } from '@clerk/nextjs';

export const metadata = {
  title: "Đăng ký",
  description: "Đăng ký",
};

const SignUpPage = () => {
  return (
    <div className="min-h-[665.3px]">
      <ClerkLoading>
        <Skeleton className="h-[665.3px] w-[400px] rounded-xl" />
      </ClerkLoading>
      <ClerkLoaded>
        <SignUp />
      </ClerkLoaded>
    </div>
  );
};
export default SignUpPage;
