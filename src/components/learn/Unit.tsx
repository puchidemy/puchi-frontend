import { Separator } from "../ui/separator";
import LessonButton from "../LessonButton";

interface UnitData {
  numSection: number;
  numUnit: number;
  titleUnit: string;
  lessons: {
    id: number;
    type: string;
    activePercentage: number;
  }[];
}

interface UnitProps {
  data: UnitData;
}

const Unit = ({ data }: UnitProps) => {
  const { numUnit, lessons } = data;
  const color = `var(--unit-${numUnit % 10})`;
  return (
    <div className="h-[620px]">
      <div className="flex justify-center items-center">
        <Separator className="w-1/3 h-[3px]" />
        <h2 className="mx-4">Unit {numUnit}</h2>
        <Separator className="w-1/3 h-[3px]" />
      </div>

      <div className="relative flex flex-col items-center">
        {lessons.map((lesson, index) => {
          return (
            <LessonButton
              key={index}
              index={index}
              lesson={lesson}
              color={color}
            />
          );
        })}
      </div>
    </div>
  );
};

export default Unit;
