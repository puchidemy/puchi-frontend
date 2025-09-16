import FooterStory from "../_components/FooterStory";
import HeaderStory from "../_components/HeaderStory";

type ProtectedLayoutProps = {
  children: React.ReactNode;
};

export default async function ProtectedLayout({
  children,
}: ProtectedLayoutProps) {
  return (
    <div className="h-full w-full">
      <HeaderStory />
      <div className="flex bg-gray-200 dark:bg-card min-h-full justify-center">{children}</div>
      <FooterStory />
    </div>
  );
}
