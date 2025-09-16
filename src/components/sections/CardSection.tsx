import Image from "next/image";
import { Button } from "../ui/button";

const CardSection = () => {
  return (
    <div className="w-full h-60 flex bg-emerald-600 rounded-2xl">
      <div className="w-1/2 p-6 pr-10 flex flex-col justify-between">
        <div>
          <p className="text-2xl font-bold mb-4">Section 1</p>
          <p className="text-sm">40 UNITS</p>
        </div>
        <Button variant="super" className="w-full">
          CONTINUE
        </Button>
      </div>
      <div className="w-1/2 flex justify-center items-center">
        <Image
          src="/images/thumb/numbers.png"
          alt="section-1"
          width={200}
          height={200}
        />
      </div>
    </div>
  );
};

export default CardSection;
