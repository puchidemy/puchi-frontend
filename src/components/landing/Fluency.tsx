import LanguagePill, {
  type PillVariant,
} from "@/components/landing/LanguagePill";
import { countries } from "@/constants/countries";

const variants: NonNullable<PillVariant>[] = [
  "secondary",
  "highlightOutline",
  "secondaryOutline",
  "primary",
  "highlight",
  "default",
  "primaryOutline",
];

const Fluency = () => {
  return (
    <ul className="flex flex-col gap-8 px-[5%] lg:px-0">
      {countries.map(([, country], index) => (
        <li key={country.title} className="flex justify-center">
          <LanguagePill
            title={country.title}
            word={country.word}
            flag={country.flag}
            tilt={index % 2 === 0 ? -1 : 1}
            variant={variants[index % variants.length]}
          />
        </li>
      ))}
    </ul>
  );
};

export default Fluency;
