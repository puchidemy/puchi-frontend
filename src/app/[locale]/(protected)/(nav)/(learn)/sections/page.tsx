import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import CardSection from "@/components/sections/CardSection";

const SectionsPage = () => {
  return (
    <div className="w-full xl:pr-8 pr-0">
      <div className="sticky top-0 transition-colors duration-300 border-b-2 bg-background">
        <Link
          href="/learn"
          className="flex py-4 xl:py-6 gap-2 items-center text-gray-500"
        >
          <ArrowLeft className="cursor-pointer" />
          <span className="text-xl font-din">Back</span>
        </Link>
      </div>

      <div className="mt-2 xl:mt-8 space-y-4 font-din">
        <CardSection />
        <CardSection />
        <CardSection />
        <CardSection />
        <CardSection />
      </div>
    </div>
  );
};

export default SectionsPage;
