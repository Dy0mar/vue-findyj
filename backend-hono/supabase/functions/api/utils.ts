/**
 * Find word in string
 */
function findWord(word: string, str: string): boolean {
  return str.includes(word.toLowerCase())
}

/**
 * Find words in string
 * returns found word or null
 */
export function findWordsInString(words: string[], str: string): string | null {
  for (const w of words) {
    if (findWord(w, str)) {
      return w
    }
  }
  return null
}

/**
 * Sleep.
 */
export async function sleep(ms: number = 500): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
}
