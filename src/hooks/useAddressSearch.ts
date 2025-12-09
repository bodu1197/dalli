'use client'

import { useCallback, useEffect, useState } from 'react'
import type { DaumAddressData } from '@/types/address.types'

// 다음 주소 API 윈도우 타입 확장
declare global {
  interface Window {
    daum: {
      Postcode: new (config: {
        oncomplete: (data: DaumAddressData) => void
        onclose?: (state: string) => void
        width?: string | number
        height?: string | number
      }) => {
        open: () => void
        embed: (element: HTMLElement) => void
      }
    }
  }
}

interface UseAddressSearchOptions {
  onComplete: (data: DaumAddressData) => void
  onClose?: () => void
}

interface UseAddressSearchReturn {
  isLoaded: boolean
  openSearch: () => void
  embedSearch: (container: HTMLElement) => void
}

/**
 * 다음 주소 검색 API 훅
 */
export function useAddressSearch({
  onComplete,
  onClose,
}: UseAddressSearchOptions): UseAddressSearchReturn {
  const [isLoaded, setIsLoaded] = useState(false)

  // 스크립트 로드
  useEffect(() => {
    // 이미 로드됨
    if (window.daum?.Postcode) {
      setIsLoaded(true)
      return
    }

    const script = document.createElement('script')
    script.src =
      '//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js'
    script.async = true
    script.onload = () => setIsLoaded(true)
    document.head.appendChild(script)

    return () => {
      // 스크립트는 제거하지 않음 (다른 컴포넌트에서 사용할 수 있음)
    }
  }, [])

  // 팝업 형태로 열기
  const openSearch = useCallback(() => {
    if (!isLoaded || !window.daum?.Postcode) {
      console.error('다음 주소 API가 로드되지 않았습니다')
      return
    }

    new window.daum.Postcode({
      oncomplete: onComplete,
      onclose: (state: string) => {
        if (state === 'FORCE_CLOSE' || state === 'COMPLETE_CLOSE') {
          onClose?.()
        }
      },
    }).open()
  }, [isLoaded, onComplete, onClose])

  // 특정 요소에 임베드
  const embedSearch = useCallback(
    (container: HTMLElement) => {
      if (!isLoaded || !window.daum?.Postcode) {
        console.error('다음 주소 API가 로드되지 않았습니다')
        return
      }

      new window.daum.Postcode({
        oncomplete: onComplete,
        onclose: (state: string) => {
          if (state === 'FORCE_CLOSE' || state === 'COMPLETE_CLOSE') {
            onClose?.()
          }
        },
        width: '100%',
        height: '100%',
      }).embed(container)
    },
    [isLoaded, onComplete, onClose]
  )

  return {
    isLoaded,
    openSearch,
    embedSearch,
  }
}
