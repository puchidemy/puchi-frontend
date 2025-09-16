import RightBarSetting from "@/components/settings/RightBarSetting";

type ProtectedLayoutProps = {
  children: React.ReactNode;
};

export default function SettingLayout({ children }: ProtectedLayoutProps) {
  return (
    <div className="p-4 gap-8 flex max-md:flex-col max-w-[1024px] mx-auto">
      <div className="flex-1 space-y-10">{children}</div>
      <div className="w-full md:w-96 flex flex-col gap-4">
        <RightBarSetting />
      </div>
    </div>
  );
}
