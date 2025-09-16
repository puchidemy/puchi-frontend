import Link from "next/link";
import { ChevronLeft, Flag, Share2 } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";

const HeaderStory = () => {
  return (
    <div className="sticky top-0 left-0 w-full h-16 z-50 bg-background border-b">
      <div className="flex h-full mx-2 md:mx-8 justify-between items-center">
        <Link href="/learn">
          <ChevronLeft />
        </Link>
        <div className="space-x-2">
          <ThemeToggle />
          <Button variant="ghost" size="icon" title="Share" aria-label="Share">
            <Share2 />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            title="Report"
            aria-label="Report"
          >
            <Flag />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default HeaderStory;
