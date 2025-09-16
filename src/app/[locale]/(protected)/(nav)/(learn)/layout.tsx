import ItemsInfo from "@/components/ItemsInfo";
import RightBarSection from "@/components/sections/RightBarSection";
import ScrollToTopButton from "@/components/ScrollToTopButton";

type LearnLayoutProps = {
  children: React.ReactNode;
};

export default async function LearnLayout({ children }: LearnLayoutProps) {
  return (
    <>
      <div className="xl:hidden">
        <ItemsInfo />
      </div>
      <div className="flex justify-center">
        <div className="h-full flex xl:w-[1024px] w-full relative">
          <main className="min-w-[300px] absolute left-0 right-0 xl:right-[350px]">
            {children}
            <ScrollToTopButton className="max-sm:bottom-20 xl:right-[calc(50%-220px)]" />
          </main>
          <div
            className="max-xl:hidden w-[350px] fixed"
            style={{ right: "calc((100vw - 1276px) / 2)" }}
          >
            <RightBarSection />
          </div>
        </div>
      </div>
    </>
  );
}
