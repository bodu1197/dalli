/**
 * 배달 시스템 타입 정의
 * @description 라이더 배차 및 배달 관리를 위한 모든 타입 정의
 */

// ============================================================================
// 배달 요청 타입
// ============================================================================

/**
 * 배달 요청 상태
 */
export type DeliveryRequestStatus =
  | 'pending' // 라이더 배차 대기
  | 'dispatching' // 라이더에게 요청 중
  | 'accepted' // 라이더 수락
  | 'picked_up' // 픽업 완료
  | 'delivering' // 배달 중
  | 'delivered' // 배달 완료
  | 'cancelled' // 취소됨

/**
 * 배달 요청 상태 라벨
 */
export const DELIVERY_REQUEST_STATUS_LABELS: Record<DeliveryRequestStatus, string> = {
  pending: '라이더 배정 대기',
  dispatching: '라이더 요청 중',
  accepted: '라이더 배정 완료',
  picked_up: '픽업 완료',
  delivering: '배달 중',
  delivered: '배달 완료',
  cancelled: '취소됨',
}

/**
 * 라이더 응답 상태
 */
export type RiderResponseStatus =
  | 'pending' // 응답 대기
  | 'accepted' // 수락
  | 'rejected' // 거절
  | 'timeout' // 시간 초과

/**
 * 라이더 거절 사유
 */
export type RiderRejectionReason =
  | 'too_far' // 거리가 너무 멀어서
  | 'too_busy' // 현재 배달 중
  | 'personal' // 개인 사정
  | 'vehicle_issue' // 차량 문제
  | 'weather' // 날씨 문제
  | 'other' // 기타

/**
 * 라이더 거절 사유 라벨
 */
export const RIDER_REJECTION_REASON_LABELS: Record<RiderRejectionReason, string> = {
  too_far: '거리가 너무 멀어요',
  too_busy: '현재 배달 중이에요',
  personal: '개인 사정이 있어요',
  vehicle_issue: '차량에 문제가 있어요',
  weather: '날씨가 안 좋아요',
  other: '기타',
}

// ============================================================================
// 배달 요청 인터페이스
// ============================================================================

/**
 * 배달 요청
 */
export interface DeliveryRequest {
  id: string
  orderId: string
  orderNumber: string
  restaurantId: string
  restaurantName: string
  restaurantAddress: string
  restaurantLat: number
  restaurantLng: number
  restaurantPhone: string
  deliveryAddress: string
  deliveryDetail: string | null
  deliveryLat: number
  deliveryLng: number
  customerPhone: string
  status: DeliveryRequestStatus
  assignedRiderId: string | null
  assignedRiderName: string | null
  assignedRiderPhone: string | null
  // 배달 정보
  estimatedDistance: number // 총 예상 거리 (미터)
  estimatedDuration: number // 총 예상 시간 (분)
  deliveryFee: number // 배달비
  riderEarnings: number // 라이더 수익
  // 아이템 정보
  itemCount: number
  itemSummary: string
  deliveryInstructions: string | null
  // 시간
  requestedAt: string
  acceptedAt: string | null
  pickedUpAt: string | null
  deliveredAt: string | null
  cancelledAt: string | null
  // 메타
  createdAt: string
  updatedAt: string
}

/**
 * 배달 요청에 대한 라이더 응답
 */
export interface DeliveryRequestRider {
  id: string
  deliveryRequestId: string
  riderId: string
  riderName: string
  riderPhone: string
  status: RiderResponseStatus
  rejectionReason: RiderRejectionReason | null
  // 라이더 위치 (요청 시점)
  riderLat: number
  riderLng: number
  distanceToRestaurant: number // 식당까지 거리 (미터)
  // 시간
  requestedAt: string
  respondedAt: string | null
  timeoutAt: string // 응답 제한 시간
  createdAt: string
}

// ============================================================================
// 라이더 위치 타입
// ============================================================================

/**
 * 라이더 위치 정보
 */
export interface RiderLocation {
  riderId: string
  lat: number
  lng: number
  heading: number | null // 방향 (0-360도)
  speed: number | null // 속도 (m/s)
  accuracy: number | null // 정확도 (미터)
  updatedAt: string
}

/**
 * 라이더 위치 업데이트 입력
 */
export interface UpdateRiderLocationInput {
  lat: number
  lng: number
  heading?: number
  speed?: number
  accuracy?: number
}

// ============================================================================
// 라이더 정보 타입
// ============================================================================

/**
 * 라이더 차량 유형
 */
export type RiderVehicleType = 'motorcycle' | 'bicycle' | 'kickboard' | 'walk'

/**
 * 라이더 차량 유형 라벨
 */
export const RIDER_VEHICLE_TYPE_LABELS: Record<RiderVehicleType, string> = {
  motorcycle: '오토바이',
  bicycle: '자전거',
  kickboard: '킥보드',
  walk: '도보',
}

/**
 * 라이더 근무 상태
 */
export type RiderWorkStatus = 'offline' | 'online' | 'busy'

/**
 * 라이더 근무 상태 라벨
 */
export const RIDER_WORK_STATUS_LABELS: Record<RiderWorkStatus, string> = {
  offline: '오프라인',
  online: '대기 중',
  busy: '배달 중',
}

/**
 * 라이더 프로필
 */
export interface RiderProfile {
  id: string
  userId: string
  name: string
  phone: string
  profileImage: string | null
  vehicleType: RiderVehicleType
  vehicleNumber: string | null
  workStatus: RiderWorkStatus
  currentLat: number | null
  currentLng: number | null
  maxDeliveryRadius: number // 최대 배달 반경 (미터)
  totalDeliveries: number
  rating: number
  todayEarnings: number
  todayDeliveries: number
  isVerified: boolean
  createdAt: string
  updatedAt: string
}

// ============================================================================
// 배달 관련 입력 타입
// ============================================================================

/**
 * 배달 요청 생성 입력 (시스템에서 사용)
 */
export interface CreateDeliveryRequestInput {
  orderId: string
  searchRadius?: number // 라이더 검색 반경 (기본: 3000m)
}

/**
 * 배달 수락 입력
 */
export interface AcceptDeliveryInput {
  deliveryRequestId: string
}

/**
 * 배달 거절 입력
 */
export interface RejectDeliveryInput {
  deliveryRequestId: string
  reason: RiderRejectionReason
}

/**
 * 픽업 완료 입력
 */
export interface PickupCompleteInput {
  deliveryRequestId: string
  photoUrl?: string // 픽업 확인 사진 (선택)
}

/**
 * 배달 완료 입력
 */
export interface DeliveryCompleteInput {
  deliveryRequestId: string
  photoUrl?: string // 배달 완료 사진 (선택)
}

// ============================================================================
// 배달 관련 조회 타입
// ============================================================================

/**
 * 라이더가 볼 수 있는 배달 요청 목록 아이템
 */
export interface AvailableDeliveryRequest {
  id: string
  orderId: string
  orderNumber: string
  restaurantName: string
  restaurantAddress: string
  restaurantLat: number
  restaurantLng: number
  deliveryAddress: string
  deliveryLat: number
  deliveryLng: number
  distanceToRestaurant: number // 현재 위치에서 식당까지 (미터)
  totalDistance: number // 식당 → 배달지 거리 (미터)
  estimatedDuration: number // 예상 소요 시간 (분)
  riderEarnings: number // 예상 수익
  itemCount: number
  itemSummary: string
  requestedAt: string
  timeoutAt: string // 응답 제한 시간
}

/**
 * 라이더의 현재 배달 정보
 */
export interface CurrentDelivery {
  id: string
  orderId: string
  orderNumber: string
  status: DeliveryRequestStatus
  // 식당 정보
  restaurantName: string
  restaurantAddress: string
  restaurantLat: number
  restaurantLng: number
  restaurantPhone: string
  // 배달지 정보
  deliveryAddress: string
  deliveryDetail: string | null
  deliveryLat: number
  deliveryLng: number
  customerPhone: string
  deliveryInstructions: string | null
  // 아이템 정보
  itemCount: number
  items: Array<{
    name: string
    quantity: number
  }>
  // 수익 정보
  riderEarnings: number
  // 시간
  acceptedAt: string
  pickedUpAt: string | null
}

/**
 * 배달 이력 아이템
 */
export interface DeliveryHistoryItem {
  id: string
  orderId: string
  orderNumber: string
  restaurantName: string
  deliveryAddress: string
  status: DeliveryRequestStatus
  riderEarnings: number
  totalDistance: number
  deliveredAt: string | null
  createdAt: string
}

// ============================================================================
// ETA (예상 도착 시간) 타입
// ============================================================================

/**
 * ETA 정보
 */
export interface ETAInfo {
  /** 예상 도착 시간 (ISO string) */
  eta: string
  /** 남은 시간 (분) */
  remainingMinutes: number
  /** 남은 거리 (미터) */
  remainingDistance: number
  /** 마지막 업데이트 시간 */
  updatedAt: string
}

// ============================================================================
// 배달비 정책 타입
// ============================================================================

/**
 * 배달비 계산 정책
 */
export const DELIVERY_FEE_POLICY = {
  /** 기본 배달비 */
  BASE_FEE: 3000,
  /** 거리당 추가 요금 (1km당) */
  FEE_PER_KM: 500,
  /** 기본 거리 (이 거리까지는 기본 배달비) */
  BASE_DISTANCE: 2000, // 2km
  /** 최대 배달 거리 */
  MAX_DISTANCE: 10000, // 10km
  /** 심야 할증 시작 시간 */
  NIGHT_SURCHARGE_START: 22, // 22시
  /** 심야 할증 종료 시간 */
  NIGHT_SURCHARGE_END: 6, // 6시
  /** 심야 할증 비율 */
  NIGHT_SURCHARGE_RATE: 0.2, // 20%
  /** 악천후 할증 비율 */
  BAD_WEATHER_SURCHARGE_RATE: 0.3, // 30%
} as const

/**
 * 라이더 수익 정책
 */
export const RIDER_EARNINGS_POLICY = {
  /** 기본 수익 (건당) */
  BASE_EARNINGS: 2500,
  /** 거리당 추가 수익 (1km당) */
  EARNINGS_PER_KM: 300,
  /** 기본 거리 (이 거리까지는 기본 수익) */
  BASE_DISTANCE: 2000, // 2km
  /** 심야 할증 비율 */
  NIGHT_SURCHARGE_RATE: 0.25, // 25%
  /** 악천후 할증 비율 */
  BAD_WEATHER_SURCHARGE_RATE: 0.3, // 30%
} as const

// ============================================================================
// DB 레코드 타입 (snake_case)
// ============================================================================

/**
 * delivery_requests 테이블 레코드
 */
export interface DeliveryRequestRecord {
  id: string
  order_id: string
  order_number: string
  restaurant_id: string
  restaurant_name: string
  restaurant_address: string
  restaurant_lat: number
  restaurant_lng: number
  restaurant_phone: string
  delivery_address: string
  delivery_detail: string | null
  delivery_lat: number
  delivery_lng: number
  customer_phone: string
  status: DeliveryRequestStatus
  assigned_rider_id: string | null
  assigned_rider_name: string | null
  assigned_rider_phone: string | null
  estimated_distance: number
  estimated_duration: number
  delivery_fee: number
  rider_earnings: number
  item_count: number
  item_summary: string
  delivery_instructions: string | null
  requested_at: string
  accepted_at: string | null
  picked_up_at: string | null
  delivered_at: string | null
  cancelled_at: string | null
  created_at: string
  updated_at: string
}

/**
 * delivery_request_riders 테이블 레코드
 */
export interface DeliveryRequestRiderRecord {
  id: string
  delivery_request_id: string
  rider_id: string
  rider_name: string
  rider_phone: string
  status: RiderResponseStatus
  rejection_reason: RiderRejectionReason | null
  rider_lat: number
  rider_lng: number
  distance_to_restaurant: number
  requested_at: string
  responded_at: string | null
  timeout_at: string
  created_at: string
}

/**
 * rider_locations 테이블 레코드
 */
export interface RiderLocationRecord {
  rider_id: string
  lat: number
  lng: number
  heading: number | null
  speed: number | null
  accuracy: number | null
  updated_at: string
}

/**
 * riders 테이블 레코드
 */
export interface RiderRecord {
  id: string
  user_id: string
  name: string
  phone: string
  profile_image: string | null
  vehicle_type: RiderVehicleType
  vehicle_number: string | null
  work_status: RiderWorkStatus
  current_lat: number | null
  current_lng: number | null
  max_delivery_radius: number
  total_deliveries: number
  rating: number
  today_earnings: number
  today_deliveries: number
  is_verified: boolean
  created_at: string
  updated_at: string
}
