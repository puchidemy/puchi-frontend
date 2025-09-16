import Image from "next/image";
import { Card, CardContent, CardHeader } from "../ui/card";
import ItemsInfo from "../ItemsInfo";
import { Link } from "@/i18n/routing";
import { Button } from "../ui/button";
import { currentUser } from "@clerk/nextjs/server";
import FooterLink from "../FooterLink";

const RightBarSection = async () => {
  const user = await currentUser();

  return (
    <div className="w-full h-full">
      <ItemsInfo />
      <div className="space-y-6 mt-6 overflow-y-auto max-h-[calc(100vh-88px)] scrollbar-hide">
        <Card>
          <CardHeader className="text-xl font-bold">
            Unlock Leaderboards!
          </CardHeader>
          <CardContent className="flex gap-6">
            <Image
              alt="unlock"
              src="/icons/unlock.svg"
              width={40}
              height={56}
            />
            <p className="text-lg">
              Complete 9 more lessons to start competing
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <span className="text-xl font-bold">Daily Quests</span>
            <Link className="text-sky-500 pb-[6px]" href="/quests">
              VIEW ALL
            </Link>
          </CardHeader>
          <CardContent className="flex gap-6">
            <Image alt="unlock" src="/icons/xp.svg" width={40} height={40} />
            <div className="w-full">
              <p className="text-lg font-bold">Earn 10 XP</p>
              <div className="flex items-center">
                <div className="h-4 w-full bg-highlight/20 rounded-l-[8px] text-center text-sm leading-[1rem]">
                  0/10
                </div>
                <Image
                  alt="unlock"
                  src="/icons/chest.svg"
                  width={32}
                  height={32}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {!user && (
          <Card>
            <CardHeader className="text-xl font-bold">
              Create a profile to save your progress!
            </CardHeader>
            <CardContent className="w-full flex flex-col gap-4">
              <Link href="/sign-up">
                <Button variant="primary" className="w-full">
                  CREATE A PROFILE
                </Button>
              </Link>
              <Link href="/sign-in">
                <Button variant="secondary" className="w-full">
                  SIGN IN
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        <FooterLink />
      </div>
    </div>
  );
};

export default RightBarSection;
