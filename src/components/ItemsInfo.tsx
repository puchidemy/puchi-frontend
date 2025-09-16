import Image from "next/image";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

const ItemsInfo = async () => {
  const heart = "5";
  const gem = "10";
  const streak = "3";

  return (
    <div className="flex items-center justify-between w-full">
      <HoverCard>
        <HoverCardTrigger asChild>
          <div className="flex items-center px-4 py-2 rounded-lg hover:bg-foreground/10 cursor-pointer">
            <Image src="/icons/heart.svg" alt="heart" width={30} height={30} />
            <span className="ml-2 text-xl font-bold text-red-500">{heart}</span>
          </div>
        </HoverCardTrigger>
        <HoverCardContent className="w-[400px] h-[500px]">
          {/* Card content can be added here later */}
        </HoverCardContent>
      </HoverCard>

      <HoverCard>
        <HoverCardTrigger asChild>
          <div className="flex items-center px-4 py-2 rounded-lg hover:bg-foreground/10 cursor-pointer">
            <Image src="/icons/gem.svg" alt="gem" width={24} height={30} />
            <span className="ml-2 text-xl font-bold text-blue-400">{gem}</span>
          </div>
        </HoverCardTrigger>
        <HoverCardContent className="w-[400px] h-[500px]">
          {/* Card content can be added here later */}
        </HoverCardContent>
      </HoverCard>

      <HoverCard>
        <HoverCardTrigger asChild>
          <div className="flex items-center px-4 py-2 rounded-lg hover:bg-foreground/10 cursor-pointer">
            <Image src="/icons/fire.svg" alt="streak" width={25} height={30} />
            <span className="ml-2 text-xl font-bold">{streak}</span>
          </div>
        </HoverCardTrigger>
        <HoverCardContent className="w-[400px] h-[500px]">
          {/* Card content can be added here later */}
        </HoverCardContent>
      </HoverCard>
    </div>
  );
};

export default ItemsInfo;
