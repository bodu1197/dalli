import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import type { KakaoGeocodingResult } from '@/types/address.types'

const MOCK_KAKAO_REST_KEY = 'TEST_KAKAO_REST_KEY'
let geocodingModule: typeof import('./geocoding') // To hold the re-imported module

describe('Kakao Geocoding API', () => {
  let originalFetch: typeof global.fetch

  beforeEach(async () => {
    originalFetch = global.fetch
    global.fetch = vi.fn() as typeof fetch
    vi.clearAllMocks()

    // Stub the environment variable
    vi.stubEnv('NEXT_PUBLIC_KAKAO_REST_KEY', MOCK_KAKAO_REST_KEY)

    // Reset module cache and re-import the module to pick up the stubbed env var
    vi.resetModules()
    geocodingModule = await import('./geocoding')
  })

  afterEach(() => {
    global.fetch = originalFetch
    vi.unstubAllEnvs()
    vi.resetModules() // Good practice to reset for next test suite
  })

  describe('getCoordinatesFromAddress', () => {
    it('should return coordinates for a valid address', async () => {
      const mockResponse: KakaoGeocodingResult = {
        meta: {
          total_count: 1,
          page_count: 1,
          is_end: true,
        },
        documents: [
          {
            address_name: '서울 강남구 테헤란로 427',
            address_type: 'ROAD',
            x: '127.058359',
            y: '37.508861',
            // ... other fields not used in our function
          },
        ],
      }

      ;(global.fetch as vi.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      })

      const { getCoordinatesFromAddress } = geocodingModule
      const result = await getCoordinatesFromAddress('서울 강남구 테헤란로 427')
      expect(result).toEqual({
        lat: 37.508861,
        lng: 127.058359,
        address: '서울 강남구 테헤란로 427',
      })
      expect(global.fetch).toHaveBeenCalledWith(
        `https://dapi.kakao.com/v2/local/search/address.json?query=${encodeURIComponent(
          '서울 강남구 테헤란로 427'
        )}`,
        { headers: { Authorization: `KakaoAK ${MOCK_KAKAO_REST_KEY}` } }
      )
    })

    it('should throw error if KAKAO_REST_KEY is not set', async () => {
      vi.stubEnv('NEXT_PUBLIC_KAKAO_REST_KEY', '') // Overwrite for this specific test
      vi.resetModules() // Re-import to pick up the overwritten env var
      const { getCoordinatesFromAddress } = await import('./geocoding') // Re-import here too
      await expect(getCoordinatesFromAddress('address')).rejects.toThrow(
        '카카오 REST API 키가 설정되지 않았습니다'
      )
    })

    it('should throw an error if fetch fails', async () => {
      ;(global.fetch as vi.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
      })

      const { getCoordinatesFromAddress } = geocodingModule
      await expect(getCoordinatesFromAddress('address')).rejects.toThrow(
        '주소 검색에 실패했습니다'
      )
    })

    it('should throw an error if no address is found', async () => {
      const mockResponse: KakaoGeocodingResult = {
        meta: { total_count: 0, page_count: 0, is_end: true },
        documents: [],
      }

      ;(global.fetch as vi.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      })

      const { getCoordinatesFromAddress } = geocodingModule
      await expect(getCoordinatesFromAddress('invalid address')).rejects.toThrow(
        '주소를 찾을 수 없습니다'
      )
    })
  })

  describe('getAddressFromCoordinates', () => {
    const mockCoordinates = { lat: 37.508861, lng: 127.058359 }

    it('should return road address for valid coordinates', async () => {
      const mockResponse = {
        meta: { total_count: 1, page_count: 1, is_end: true },
        documents: [
          {
            road_address: { address_name: '서울 강남구 테헤란로 427' },
            address: { address_name: '서울 강남구 역삼동 702-2' },
          },
        ],
      }

      ;(global.fetch as vi.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      })

      const { getAddressFromCoordinates } = geocodingModule
      const result = await getAddressFromCoordinates(mockCoordinates)
      expect(result).toBe('서울 강남구 테헤란로 427')
      expect(global.fetch).toHaveBeenCalledWith(
        `https://dapi.kakao.com/v2/local/geo/coord2address.json?x=${mockCoordinates.lng}&y=${mockCoordinates.lat}`,
        { headers: { Authorization: `KakaoAK ${MOCK_KAKAO_REST_KEY}` } }
      )
    })

    it('should return jibun address if road address is not available', async () => {
      const mockResponse = {
        meta: { total_count: 1, page_count: 1, is_end: true },
        documents: [
          {
            road_address: null,
            address: { address_name: '서울 강남구 역삼동 702-2' },
          },
        ],
      }

      ;(global.fetch as vi.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      })

      const { getAddressFromCoordinates } = geocodingModule
      const result = await getAddressFromCoordinates(mockCoordinates)
      expect(result).toBe('서울 강남구 역삼동 702-2')
    })

    it('should return empty string if no address is found', async () => {
      const mockResponse = {
        meta: { total_count: 0, page_count: 0, is_end: true },
        documents: [],
      }

      ;(global.fetch as vi.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      })

      const { getAddressFromCoordinates } = geocodingModule
      await expect(getAddressFromCoordinates(mockCoordinates)).resolves.toBe('')
    })

    it('should throw error if KAKAO_REST_KEY is not set', async () => {
      vi.stubEnv('NEXT_PUBLIC_KAKAO_REST_KEY', '')
      vi.resetModules()
      const { getAddressFromCoordinates } = await import('./geocoding')
      await expect(getAddressFromCoordinates(mockCoordinates)).rejects.toThrow(
        '카카오 REST API 키가 설정되지 않았습니다'
      )
    })

    it('should throw an error if fetch fails', async () => {
      ;(global.fetch as vi.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
      })

      const { getAddressFromCoordinates } = geocodingModule
      await expect(getAddressFromCoordinates(mockCoordinates)).rejects.toThrow(
        '좌표 변환에 실패했습니다'
      )
    })
  })

  describe('searchPlacesByKeyword', () => {
    const mockKeyword = '카페'
    const mockCoordinates = { lat: 37.508861, lng: 127.058359 }
    const mockRadius = 1000

    it('should return places for a valid keyword', async () => {
      const mockResponse = {
        meta: { total_count: 1, page_count: 1, is_end: true },
        documents: [
          {
            id: '12345',
            place_name: '스타벅스 강남점',
            address_name: '서울 강남구 테헤란로 427',
            road_address_name: '서울 강남구 테헤란로 427',
            x: '127.058359',
            y: '37.508861',
          },
        ],
      }

      ;(global.fetch as vi.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      })

      const { searchPlacesByKeyword } = geocodingModule
      const result = await searchPlacesByKeyword(mockKeyword)
      expect(result).toEqual([
        {
          id: '12345',
          placeName: '스타벅스 강남점',
          address: '서울 강남구 테헤란로 427',
          roadAddress: '서울 강남구 테헤란로 427',
          lat: 37.508861,
          lng: 127.058359,
          distance: undefined,
        },
      ])
      expect(global.fetch).toHaveBeenCalledWith(
        `https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURIComponent(
          mockKeyword
        )}`,
        { headers: { Authorization: `KakaoAK ${MOCK_KAKAO_REST_KEY}` } }
      )
    })

    it('should return places with coordinates and radius', async () => {
      const mockResponse = {
        meta: { total_count: 1, page_count: 1, is_end: true },
        documents: [
          {
            id: '12345',
            place_name: '스타벅스 강남점',
            address_name: '서울 강남구 테헤란로 427',
            road_address_name: '서울 강남구 테헤란로 427',
            x: '127.058359',
            y: '37.508861',
            distance: '500',
          },
        ],
      }

      ;(global.fetch as vi.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      })

      const { searchPlacesByKeyword } = geocodingModule
      const result = await searchPlacesByKeyword(
        mockKeyword,
        mockCoordinates,
        mockRadius
      )
      expect(result[0].distance).toBe('500')
      expect(global.fetch).toHaveBeenCalledWith(
        `https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURIComponent(
          mockKeyword
        )}&x=${mockCoordinates.lng}&y=${mockCoordinates.lat}&radius=${mockRadius}`,
        { headers: { Authorization: `KakaoAK ${MOCK_KAKAO_REST_KEY}` } }
      )
    })

    it('should throw error if KAKAO_REST_KEY is not set', async () => {
      vi.stubEnv('NEXT_PUBLIC_KAKAO_REST_KEY', '')
      vi.resetModules()
      const { searchPlacesByKeyword } = await import('./geocoding')
      await expect(searchPlacesByKeyword('keyword')).rejects.toThrow(
        '카카오 REST API 키가 설정되지 않았습니다'
      )
    })

    it('should throw an error if fetch fails', async () => {
      ;(global.fetch as vi.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
      })

      const { searchPlacesByKeyword } = geocodingModule
      await expect(searchPlacesByKeyword('keyword')).rejects.toThrow(
        '장소 검색에 실패했습니다'
      )
    })
  })
})