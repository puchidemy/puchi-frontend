export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]; // clone array để không mutate original
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1)); // random index từ 0 -> i
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]; // swap
  }
  return shuffled;
}
