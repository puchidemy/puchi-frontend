import n2words from "n2words";

// https://github.com/forzagreen/n2words?tab=readme-ov-file#supported-languages
const supportedLanguages = [
  "en", // English (default)
  "ar", // Arabic
  "az", // Azerbaijani
  "cz", // Czech
  "dk", // Danish
  "de", // German
  "es", // Spanish
  "fr", // French
  "fr-BE", // French (Belgium)
  "fa", // Farsi
  "he", // Hebrew
  "hr", // Croatian
  "hu", // Hungarian
  "id", // Indonesian
  "it", // Italian
  "ko", // Korean
  "lt", // Lithuanian
  "lv", // Latvian
  "nl", // Dutch
  "no", // Norwegian
  "pl", // Polish
  "pt", // Portuguese
  "ru", // Russian
  "sr", // Serbian
  "tr", // Turkish
  "uk", // Ukrainian
  "vi", // Vietnamese
  "zh", // Chinese
];

export function numToWords(number: number | string | bigint, lang?: string) {
  const selectedLang = lang && supportedLanguages.includes(lang) ? lang : "en";
  return n2words(number, { lang: selectedLang });
}
