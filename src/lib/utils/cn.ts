import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Tailwind CSS 클래스 병합 유틸리티
 * clsx로 조건부 클래스를 처리하고, tailwind-merge로 충돌하는 클래스를 병합
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}
