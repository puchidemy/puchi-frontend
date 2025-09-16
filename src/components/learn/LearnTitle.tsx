import { ArrowLeft, Notebook } from "lucide-react";

import { Button } from "../ui/button";
import { Link } from "@/i18n/routing";

interface LearnTitleProps {
  data: {
    numSection: number;
    numUnit: number;
    titleUnit: string;
  };
}

const LearnTitle = ({ data }: LearnTitleProps) => {
  const { numSection, numUnit, titleUnit } = data;

  return (
    <div
      className="p-4 mx-auto max-w-[560px] h-20 rounded-xl flex justify-between items-center"
      style={{ backgroundColor: `var(--unit-${numUnit % 10})` }}
    >
      <div className="">
        <Link href="/sections" className="flex gap-2 text-gray-200">
          <ArrowLeft className="cursor-pointer" />
          <span className="underline underline-offset-2">
            SECTION {numSection}, UNIT {numUnit}:
          </span>
        </Link>
        <h1 className="mt-2 lg:ml-2 ml-6 text-xl font-bold text-gray-50">
          {titleUnit}
        </h1>
      </div>

      <Link
        href={`/guidebook?section=${numSection}&unit=${numUnit}`}
        className="items-center"
      >
        <Button variant="immersive">
          <Notebook />
          <span className="ml-2 max-xl:hidden text-gray-50">GUIDEBOOK</span>
        </Button>
      </Link>
    </div>
  );
};

export default LearnTitle;
