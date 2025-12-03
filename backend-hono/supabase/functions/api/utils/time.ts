/**
 * Delays the execution for a specified amount of time.
 * @param ms The number of milliseconds to delay. Defaults to 500ms.
 * @returns A promise that resolves after the specified delay.
 */
export async function sleep(ms: number = 500): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
}
