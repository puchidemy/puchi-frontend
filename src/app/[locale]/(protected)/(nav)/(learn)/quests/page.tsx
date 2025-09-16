import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BadgeCheck, Lock, TimerReset, Zap } from "lucide-react";

const QuestsPage = () => {
  return (
    <div className="min-h-screen p-6 space-y-6 font-din">
      {/* Header Welcome Card */}
      <Card className="bg-super rounded-2xl">
        <CardContent className="min-h-60 flex items-center justify-between p-6">
          <div>
            <h2 className="text-2xl font-bold">Welcome!</h2>
            <p className="mt-2">
              Complete quests to earn rewards! Quests refresh every day.
            </p>
          </div>
          <div>
            {/* Placeholder image, replace with actual image */}
            <div className="w-40 h-40 bg-green-500 rounded-full"></div>
          </div>
        </CardContent>
      </Card>

      {/* Daily Quests Section */}
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold">Daily Quests</h3>
        <div className="flex font-bold items-center text-yellow-500">
          <TimerReset className="w-5 h-5 mr-1" />
          <span>12 HOURS</span>
        </div>
      </div>

      {/* Quest Item */}
      <Card className="bg-gray-800 border border-gray-700 rounded-xl">
        <CardContent className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-4">
            <Zap className="text-yellow-400 w-6 h-6" />
            <span className="font-semibold">Earn 10 XP</span>
          </div>
          <div className="flex items-center space-x-2">
            <Progress value={0} max={10} className="w-40 h-2 bg-gray-700" />
            <BadgeCheck className="w-6 h-6 text-yellow-400" />
          </div>
        </CardContent>
      </Card>

      {/* Locked Quest Item */}
      <Card className="bg-gray-800 border border-gray-700 rounded-xl opacity-50">
        <CardContent className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-4">
            <Lock className="text-gray-400 w-6 h-6" />
            <span className="font-semibold">More quests unlock soon</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuestsPage;
