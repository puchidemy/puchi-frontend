import { Suspense } from "react";
import ItemsInfo from "@/components/ItemsInfo";
import RightBarSection from "@/components/sections/RightBarSection";
import ScrollToTopButton from "@/components/ScrollToTopButton";

type LearnLayoutProps = {
  children: React.ReactNode;
};

function RightBarFallback() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center py-20">
      <div className="w-20 h-20 border-4 border-sky-300 border-t-sky-500 rounded-full animate-spin" />
    </div>
  );
}

export default async function LearnLayout({ children }: LearnLayoutProps) {
  return (
    <>
      <div className="xl:hidden">
        <ItemsInfo />
      </div>
      <div className="flex justify-center">
        <div className="relative flex w-full xl:w-[1024px]">
          <main className="min-w-0 w-full min-h-0 xl:pr-[350px]">
            {children}
            <ScrollToTopButton className="max-sm:bottom-20 xl:right-[calc(50%-220px)]" />
          </main>
          <aside
            className="max-xl:hidden fixed top-0 z-20 h-dvh w-[350px] overflow-y-auto pt-2 md:pt-4"
            style={{ right: "calc((100vw - 1276px) / 2)" }}
          >
            <Suspense fallback={<RightBarFallback />}>
              <RightBarSection />
            </Suspense>
          </aside>
        </div>
      </div>
    </>
  );
}
