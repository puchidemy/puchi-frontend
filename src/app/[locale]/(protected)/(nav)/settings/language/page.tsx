import SelectLanguage from "@/components/SelectLanguage";
import { Separator } from "@/components/ui/separator";

const SettingLanguage = () => {
  return (
    <div>
      <div className="text-2xl text-gray-500 dark:text-gray-100 font-bold">
        Language
      </div>
      <Separator className="mt-2 mb-4" />
      <SelectLanguage />
    </div>
  );
};

export default SettingLanguage;
