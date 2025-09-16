import { Locale } from "@/i18n/config";

interface Country {
  title: string;
  flag: string;
  word: string;
}

const recordCountries: Record<Locale, Country> = {
  en: {
    title: "English",
    flag: "en",
    word: "Hello",
  },
  es: {
    title: "Spanish",
    flag: "es",
    word: "Hola",
  },
  fr: {
    title: "French",
    flag: "fr",
    word: "Bonjour",
  },
  ko: {
    title: "Korean",
    flag: "ko",
    word: "Annyeong",
  },
  ja: {
    title: "Japanese",
    flag: "ja",
    word: "Konnichiwa",
  },
  zh: {
    title: "Mandarin",
    flag: "zh",
    word: "Nǐ hǎo",
  },
  it: {
    title: "Italian",
    flag: "it",
    word: "Ciao",
  },
  ru: {
    title: "Russian",
    flag: "ru",
    word: "Привет",
  },
  de: {
    title: "German",
    flag: "de",
    word: "Hallo",
  },
};

export const countries: [Locale, Country][] = Object.entries(
  recordCountries
) as [Locale, Country][];
