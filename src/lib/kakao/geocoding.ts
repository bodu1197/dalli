import type { Coordinates, KakaoGeocodingResult } from '@/types/address.types'

const KAKAO_REST_KEY = process.env.NEXT_PUBLIC_KAKAO_REST_KEY

interface GeocodingResponse {
  lat: number
  lng: number
  address: string
}

/**
 * 주소를 좌표로 변환 (Geocoding)
 */
export async function getCoordinatesFromAddress(
  address: string
): Promise<GeocodingResponse> {
  if (!KAKAO_REST_KEY) {
    throw new Error('카카오 REST API 키가 설정되지 않았습니다')
  }

  const response = await fetch(
    `https://dapi.kakao.com/v2/local/search/address.json?query=${encodeURIComponent(address)}`,
    {
      headers: {
        Authorization: `KakaoAK ${KAKAO_REST_KEY}`,
      },
    }
  )

  if (!response.ok) {
    throw new Error('주소 검색에 실패했습니다')
  }

  const data: KakaoGeocodingResult = await response.json()

  if (data.documents.length === 0) {
    throw new Error('주소를 찾을 수 없습니다')
  }

  const { x, y, address_name } = data.documents[0]

  return {
    lat: parseFloat(y),
    lng: parseFloat(x),
    address: address_name,
  }
}

/**
 * 좌표를 주소로 변환 (Reverse Geocoding)
 */
export async function getAddressFromCoordinates(
  coordinates: Coordinates
): Promise<string> {
  if (!KAKAO_REST_KEY) {
    throw new Error('카카오 REST API 키가 설정되지 않았습니다')
  }

  const { lat, lng } = coordinates

  const response = await fetch(
    `https://dapi.kakao.com/v2/local/geo/coord2address.json?x=${lng}&y=${lat}`,
    {
      headers: {
        Authorization: `KakaoAK ${KAKAO_REST_KEY}`,
      },
    }
  )

  if (!response.ok) {
    throw new Error('좌표 변환에 실패했습니다')
  }

  const data = await response.json()

  if (data.documents.length === 0) {
    throw new Error('해당 좌표의 주소를 찾을 수 없습니다')
  }

  // 도로명 주소 우선, 없으면 지번 주소
  const doc = data.documents[0]
  return doc.road_address?.address_name || doc.address?.address_name || ''
}

/**
 * 키워드로 장소 검색
 */
export async function searchPlacesByKeyword(
  keyword: string,
  coordinates?: Coordinates,
  radius?: number
): Promise<
  Array<{
    id: string
    placeName: string
    address: string
    roadAddress: string
    lat: number
    lng: number
    distance?: string
  }>
> {
  if (!KAKAO_REST_KEY) {
    throw new Error('카카오 REST API 키가 설정되지 않았습니다')
  }

  let url = `https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURIComponent(keyword)}`

  if (coordinates) {
    url += `&x=${coordinates.lng}&y=${coordinates.lat}`
    if (radius) {
      url += `&radius=${radius}`
    }
  }

  const response = await fetch(url, {
    headers: {
      Authorization: `KakaoAK ${KAKAO_REST_KEY}`,
    },
  })

  if (!response.ok) {
    throw new Error('장소 검색에 실패했습니다')
  }

  const data = await response.json()

  return data.documents.map(
    (doc: {
      id: string
      place_name: string
      address_name: string
      road_address_name: string
      y: string
      x: string
      distance?: string
    }) => ({
      id: doc.id,
      placeName: doc.place_name,
      address: doc.address_name,
      roadAddress: doc.road_address_name,
      lat: parseFloat(doc.y),
      lng: parseFloat(doc.x),
      distance: doc.distance,
    })
  )
}
