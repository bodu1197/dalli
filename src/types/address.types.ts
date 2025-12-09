// 다음 주소 API 응답 타입
export interface DaumAddressData {
  address: string // 기본 주소 (도로명 또는 지번)
  addressType: 'R' | 'J' // R: 도로명, J: 지번
  zonecode: string // 우편번호
  roadAddress: string // 도로명 주소
  jibunAddress: string // 지번 주소
  buildingName: string // 건물명
  apartment: 'Y' | 'N' // 아파트 여부
  sido: string // 시/도
  sigungu: string // 시/군/구
  bname: string // 법정동/법정리
  bname1: string // 법정동/법정리 첫번째 단어
  bname2: string // 법정동/법정리 두번째 단어
  roadname: string // 도로명
  roadnameCode: string // 도로명 코드
  autoJibunAddress: string // 자동 지번 주소
  autoRoadAddress: string // 자동 도로명 주소
  userSelectedType: 'R' | 'J' // 사용자 선택 주소 타입
  userLanguageType: 'K' | 'E' // 사용자 언어 타입
}

// 카카오맵 Geocoding 응답 타입
export interface KakaoGeocodingResult {
  documents: {
    address: {
      address_name: string
      region_1depth_name: string
      region_2depth_name: string
      region_3depth_name: string
      mountain_yn: 'Y' | 'N'
      main_address_no: string
      sub_address_no: string
    } | null
    road_address: {
      address_name: string
      region_1depth_name: string
      region_2depth_name: string
      region_3depth_name: string
      road_name: string
      underground_yn: 'Y' | 'N'
      main_building_no: string
      sub_building_no: string
      building_name: string
      zone_no: string
    } | null
    x: string // 경도 (longitude)
    y: string // 위도 (latitude)
    address_name: string
    address_type: 'REGION' | 'ROAD' | 'REGION_ADDR' | 'ROAD_ADDR'
  }[]
  meta: {
    total_count: number
    pageable_count: number
    is_end: boolean
  }
}

// 좌표 타입
export interface Coordinates {
  lat: number
  lng: number
}

// 주소 저장 타입 (DB)
export interface Address {
  id: string
  userId: string
  label: string | null // 집, 회사 등
  address: string // 기본 주소
  detail: string | null // 상세 주소
  lat: number
  lng: number
  isDefault: boolean
  createdAt: string
}

// 주소 입력 타입
export interface AddressInput {
  label?: string
  address: string
  detail?: string
  lat: number
  lng: number
  isDefault?: boolean
}

// 현재 위치 상태 타입
export interface LocationState {
  status: 'idle' | 'loading' | 'success' | 'error'
  coordinates: Coordinates | null
  address: string | null
  error: string | null
}
