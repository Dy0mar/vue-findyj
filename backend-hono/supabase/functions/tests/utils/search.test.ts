import { assertEquals } from '@std/assert'
import { findWordsInString } from '../../api/utils/search.ts'

Deno.test('findWordsInString', async (t) => {
  await t.step('should return the word if it is found in the string', () => {
    const words = ['hello', 'world']
    const str = 'this is a test string with the word world in it'
    assertEquals(findWordsInString(words, str), 'world')
  })

  await t.step('should return the word if it is found in the string (case-insensitive)', () => {
    const words = ['hello', 'world']
    const str = 'this is a test string with the word WORLD in it'
    assertEquals(findWordsInString(words, str), 'world')
  })

  await t.step('should return null if the word is not found in the string', () => {
    const words = ['hello', 'world']
    const str = 'this is a test string'
    assertEquals(findWordsInString(words, str), null)
  })

  await t.step('should return the first word found', () => {
    const words = ['hello', 'world']
    const str = 'this is a test string with the word world and hello in it'
    assertEquals(findWordsInString(words, str), 'hello')
  })

  await t.step('should return null if the words array is empty', () => {
    const words: string[] = []
    const str = 'this is a test string'
    assertEquals(findWordsInString(words, str), null)
  })

  await t.step('should return null if the string is empty', () => {
    const words = ['hello', 'world']
    const str = ''
    assertEquals(findWordsInString(words, str), null)
  })
})
