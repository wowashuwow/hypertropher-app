import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const TITLE_CASE_EXCEPTIONS = new Set([
  'a','an','the','and','but','or','for','nor','on','at','to','by','in',
  'of','up','as','with','into','from','over','than','that',
])

export function toTitleCase(str: string): string {
  return str
    .toLowerCase()
    .split(' ')
    .map((word, i) => {
      if (i === 0 || !TITLE_CASE_EXCEPTIONS.has(word)) {
        return word.charAt(0).toUpperCase() + word.slice(1)
      }
      return word
    })
    .join(' ')
}
