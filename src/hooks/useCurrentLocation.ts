'use client'

import { useCallback, useState } from 'react'
import { getAddressFromCoordinates } from '@/lib/kakao/geocoding'
import type { Coordinates, LocationState } from '@/types/address.types'

interface UseCurrentLocationOptions {
  enableHighAccuracy?: boolean
  timeout?: number
  maximumAge?: number
}

interface UseCurrentLocationReturn {
  state: LocationState
  getCurrentLocation: () => Promise<void>
  clearLocation: () => void
}

/**
 * 현재 위치 가져오기 훅
 *
 * @description 배달 서비스 앱의 핵심 기능으로 사용자 위치 기반 음식점 검색 및
 * 배달 주소 설정에 필수적으로 사용됩니다.
 *
 * @security Geolocation API 사용 근거:
 * - 배달 앱의 핵심 기능으로 사용자 위치 기반 서비스 제공 필수
 * - 사용자 동의 후에만 위치 정보 수집 (브라우저 권한 요청)
 * - 위치 정보는 서버에 최소한으로 전송하며 로컬 처리 우선
 * - HTTPS 환경에서만 동작하여 보안 전송 보장
 */
export function useCurrentLocation(
  options?: UseCurrentLocationOptions
): UseCurrentLocationReturn {
  const [state, setState] = useState<LocationState>({
    status: 'idle',
    coordinates: null,
    address: null,
    error: null,
  })

  const getCurrentLocation = useCallback(async () => {
    // 브라우저 지원 확인
    if (!navigator.geolocation) {
      setState({
        status: 'error',
        coordinates: null,
        address: null,
        error: '이 브라우저에서는 위치 서비스를 지원하지 않습니다',
      })
      return
    }

    setState((prev) => ({
      ...prev,
      status: 'loading',
      error: null,
    }))

    try {
      // 위치 가져오기
      const position = await new Promise<GeolocationPosition>(
        (resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: options?.enableHighAccuracy ?? true,
            timeout: options?.timeout ?? 10000,
            maximumAge: options?.maximumAge ?? 0,
          })
        }
      )

      const coordinates: Coordinates = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      }

      // 좌표를 주소로 변환
      const address = await (async (): Promise<string | null> => {
        try {
          return await getAddressFromCoordinates(coordinates)
        } catch (error) {
          console.error('주소 변환 실패:', error)
          // 주소 변환 실패해도 좌표는 사용 가능
          return null
        }
      })()

      setState({
        status: 'success',
        coordinates,
        address,
        error: null,
      })
    } catch (error) {
      const errorMessage = ((): string => {
        if (error instanceof GeolocationPositionError) {
          switch (error.code) {
            case error.PERMISSION_DENIED:
              return '위치 권한이 거부되었습니다. 설정에서 권한을 허용해주세요'
            case error.POSITION_UNAVAILABLE:
              return '위치 정보를 사용할 수 없습니다'
            case error.TIMEOUT:
              return '위치 요청 시간이 초과되었습니다'
            default:
              return '위치를 가져오는데 실패했습니다'
          }
        }
        return '위치를 가져오는데 실패했습니다'
      })()

      setState({
        status: 'error',
        coordinates: null,
        address: null,
        error: errorMessage,
      })
    }
  }, [options?.enableHighAccuracy, options?.timeout, options?.maximumAge])

  const clearLocation = useCallback(() => {
    setState({
      status: 'idle',
      coordinates: null,
      address: null,
      error: null,
    })
  }, [])

  return {
    state,
    getCurrentLocation,
    clearLocation,
  }
}
