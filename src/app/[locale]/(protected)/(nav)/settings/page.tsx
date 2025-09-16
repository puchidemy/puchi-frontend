import SelectTheme from "@/components/SelectTheme";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";

const Settings = () => {
  return (
    <div className="flex-1 space-y-10">
      <div className="">
        <div className="text-3xl text-gray-700 dark:text-gray-100 font-bold">
          Preferences
        </div>
      </div>

      <div>
        <div className="text-2xl text-gray-500 dark:text-gray-100 font-bold">
          Lesson experience
        </div>
        <Separator className="mt-2 mb-4" />
        <div className="flex items-center justify-between">
          <div className="text-xl font-semibold text-gray-600 dark:text-gray-100">
            Sound effects
          </div>
          <Switch />
        </div>
        <div className="flex items-center justify-between mt-6">
          <div className="text-xl font-semibold text-gray-600 dark:text-gray-100">
            Animations
          </div>
          <Switch />
        </div>
        <div className="flex items-center justify-between mt-6">
          <div className="text-xl font-semibold text-gray-600 dark:text-gray-100">
            Motivational messages
          </div>
          <Switch />
        </div>
        <div className="flex items-center justify-between mt-6">
          <div className="text-xl font-semibold text-gray-600 dark:text-gray-100">
            Listening exercises
          </div>
          <Switch />
        </div>
      </div>

      <div>
        <div className="text-2xl text-gray-500 dark:text-gray-100 font-bold">
          Appearance
        </div>
        <Separator className="mt-2 mb-4" />
        <div className="text-xl text-gray-500 dark:text-gray-100 font-bold mb-4">
          Dark mode
        </div>
        <SelectTheme />
      </div>
    </div>
  );
};

export default Settings;
