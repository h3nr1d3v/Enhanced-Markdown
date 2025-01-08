export function countWordsAndChars(text: string) {
  const words = text.trim().split(/\s+/).filter(word => word.length > 0).length;
  const chars = text.length;
  return { words, chars };
}

