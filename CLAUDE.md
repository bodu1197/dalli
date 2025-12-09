# 🚀 DALLI (달리) - Claude Code 프로젝트 가이드

> **⚠️ 중요: Claude Code는 코드 생성 전 반드시 이 문서를 읽고 모든 규칙을 따라야 합니다.**
> **🧠 필수: 모든 기능 개발 전 Sequential Thinking MCP를 사용하여 기획/설계를 수행해야 합니다.**

---

## 📋 프로젝트 개요

| 항목 | 내용 |
|------|------|
| **프로젝트명** | 달리 (DALLI) |
| **목표** | 배달의민족, 쿠팡이츠를 뛰어넘는 대한민국 최고의 배달 슈퍼앱 |
| **배포** | Vercel (https://dalli.vercel.app) |
| **데이터베이스** | Supabase (PostgreSQL + PostGIS) |
| **저장소** | GitHub (환경변수 참조) |

### 핵심 기술 스택
```
Frontend:  Next.js 16 + React 19 + TypeScript 5 (strict mode)
Styling:   Tailwind CSS 4
State:     Zustand 5 (client) + TanStack Query 5 (server)
Backend:   Supabase (Auth, Database, Realtime, Storage)
Maps:      카카오맵 API + 다음 주소 API
Infra:     Vercel (Hosting, Edge Functions, CI/CD)
Quality:   SonarQube (100% 품질 게이트 통과 필수)
```

### 5대 역할 및 페이지 수 (총 127페이지)
| 역할 | URL 경로 | 설명 | 페이지 수 |
|------|----------|------|-----------|
| 🔧 공통 | 다양함 | 인증, 채팅, 알림, 설정 | 18 |
| 👤 일반 사용자 | `/` | 음식 주문 고객 | 35 |
| 🏪 식당 사장 | `/owner/*` | 음식점 점주 | 24 |
| 🛵 라이더 | `/rider/*` | 배달 기사 | 18 |
| 👑 최고 관리자 | `/admin/*` | 플랫폼 운영자 | 32 |

---

## 📄 전체 페이지 목록 (127개)

### 🔧 공통 페이지 (18개)

#### 인증 시스템 (6개)
| # | 페이지명 | URL | 기능 |
|---|----------|-----|------|
| 1 | 로그인 | `/login` | 이메일/소셜 로그인 (카카오, 네이버, 구글, 애플) |
| 2 | 회원가입 | `/signup` | 역할 선택, 이메일/휴대폰 인증, 약관 동의 |
| 3 | 회원가입 - 사장님 | `/signup/owner` | 사업자등록증, 가게 정보, 정산 계좌 |
| 4 | 회원가입 - 라이더 | `/signup/rider` | 신분증, 운전면허, 차량정보, 보험 |
| 5 | 비밀번호 찾기 | `/forgot-password` | 이메일/SMS 인증 후 재설정 |
| 6 | 비밀번호 재설정 | `/reset-password` | 새 비밀번호 입력 |

#### 채팅 시스템 (4개)
| # | 페이지명 | URL | 기능 |
|---|----------|-----|------|
| 7 | 채팅 목록 | `/chat` | 전체 대화 목록, 안 읽은 메시지 표시 |
| 8 | 1:1 채팅방 | `/chat/[roomId]` | 실시간 메시지, 이미지 전송, 읽음 확인 |
| 9 | 주문별 채팅 | `/chat/order/[orderId]` | 고객-식당-라이더 3자 채팅 |
| 10 | 그룹 주문 채팅 | `/chat/group/[groupId]` | 함께 주문하는 친구들과 채팅 |

#### 알림 시스템 (3개)
| # | 페이지명 | URL | 기능 |
|---|----------|-----|------|
| 11 | 알림 센터 | `/notifications` | 전체 알림 목록, 읽음/삭제 처리 |
| 12 | 알림 상세 | `/notifications/[id]` | 알림 상세 내용, 관련 페이지 이동 |
| 13 | 알림 설정 | `/settings/notifications` | 푸시, 이메일, SMS 알림 ON/OFF |

#### 설정 및 기타 (5개)
| # | 페이지명 | URL | 기능 |
|---|----------|-----|------|
| 14 | 설정 메인 | `/settings` | 전체 설정 메뉴 |
| 15 | 프로필 설정 | `/settings/profile` | 닉네임, 프로필 사진, 연락처 수정 |
| 16 | 보안 설정 | `/settings/security` | 비밀번호 변경, 2단계 인증, 로그인 기록 |
| 17 | 약관 및 정책 | `/terms` | 이용약관, 개인정보처리방침 |
| 18 | 회원탈퇴 | `/settings/withdraw` | 탈퇴 사유 선택, 본인 확인 후 탈퇴 |

---

### 👤 일반 사용자 페이지 (35개)

#### 홈 & 검색 (6개)
| # | 페이지명 | URL | 기능 |
|---|----------|-----|------|
| 19 | 홈 (메인) | `/` | 카테고리, 추천 가게, 이벤트 배너 |
| 20 | 검색 | `/search` | 키워드 검색, 최근 검색어, 인기 검색어 |
| 21 | 검색 결과 | `/search/results` | 검색 결과 목록, 필터, 정렬 |
| 22 | 카테고리별 목록 | `/category/[slug]` | 치킨, 피자, 중식, 한식 등 카테고리 |
| 23 | 주소 설정 | `/address/select` | 현재 위치, 저장된 주소 선택 |
| 24 | 지도에서 보기 | `/map` | 주변 가게 지도 표시 |

#### 음식점 & 메뉴 (5개)
| # | 페이지명 | URL | 기능 |
|---|----------|-----|------|
| 25 | 음식점 상세 | `/restaurant/[id]` | 가게 정보, 메뉴 목록, 리뷰 |
| 26 | 메뉴 상세 | `/restaurant/[id]/menu/[menuId]` | 메뉴 옵션 선택, 수량, 장바구니 담기 |
| 27 | 가게 정보 | `/restaurant/[id]/info` | 영업시간, 전화번호, 위치, 원산지 |
| 28 | 가게 리뷰 목록 | `/restaurant/[id]/reviews` | 전체 리뷰, 사진 리뷰, 평점별 필터 |
| 29 | 리뷰 상세 | `/review/[reviewId]` | 리뷰 전체 내용, 사장님 댓글 |

#### 장바구니 & 주문 (8개)
| # | 페이지명 | URL | 기능 |
|---|----------|-----|------|
| 30 | 장바구니 | `/cart` | 담은 메뉴, 수량 변경, 삭제 |
| 31 | 주문서 작성 | `/checkout` | 배달 주소, 요청사항, 쿠폰 적용 |
| 32 | 결제 | `/checkout/payment` | 결제 수단 선택, 최종 결제 |
| 33 | 결제 완료 | `/checkout/complete` | 주문 완료 안내, 예상 시간 |
| 34 | 주문 내역 | `/orders` | 전체 주문 목록, 진행/완료 필터 |
| 35 | 주문 상세 | `/orders/[orderId]` | 주문 내용, 상태, 영수증 |
| 36 | 실시간 추적 | `/orders/[orderId]/tracking` | 라이더 위치, 예상 도착 시간 |
| 37 | 그룹 주문 | `/group-order/[id]` | 친구 초대, 공동 장바구니, 분할 결제 |

#### 리뷰 & 찜 (5개)
| # | 페이지명 | URL | 기능 |
|---|----------|-----|------|
| 38 | 리뷰 작성 | `/orders/[orderId]/review` | 별점, 사진, 텍스트 리뷰 작성 |
| 39 | 내 리뷰 목록 | `/my/reviews` | 작성한 리뷰, 수정/삭제 |
| 40 | 찜한 가게 | `/my/favorites` | 즐겨찾기한 음식점 목록 |
| 41 | 자주 시킨 메뉴 | `/my/frequent` | 재주문 하기 쉬운 목록 |
| 42 | 최근 본 가게 | `/my/recent` | 최근 방문한 음식점 |

#### 마이페이지 (11개)
| # | 페이지명 | URL | 기능 |
|---|----------|-----|------|
| 43 | 마이페이지 | `/my` | 프로필, 메뉴 바로가기 |
| 44 | 쿠폰함 | `/my/coupons` | 보유 쿠폰, 쿠폰 등록 |
| 45 | 포인트 | `/my/points` | 포인트 잔액, 적립/사용 내역 |
| 46 | 주소 관리 | `/my/addresses` | 배달 주소 목록, 추가/수정/삭제 |
| 47 | 주소 추가 | `/my/addresses/new` | 주소 검색, 상세 주소 입력 |
| 48 | 결제 수단 관리 | `/my/payments` | 카드, 간편결제 목록 |
| 49 | 카드 등록 | `/my/payments/card/new` | 신용/체크카드 등록 |
| 50 | 고객센터 | `/support` | FAQ, 1:1 문의, 공지사항 |
| 51 | 1:1 문의 | `/support/inquiry` | 문의 작성, 내 문의 내역 |
| 52 | 문의 상세 | `/support/inquiry/[id]` | 문의 내용, 답변 확인 |
| 53 | 공지사항 | `/notice` | 공지 목록, 상세 보기 |

---

### 🏪 식당 사장 페이지 (24개)

#### 대시보드 & 주문 관리 (6개)
| # | 페이지명 | URL | 기능 |
|---|----------|-----|------|
| 54 | 대시보드 | `/owner` | 오늘 매출, 신규 주문, 리뷰 알림 |
| 55 | 주문 목록 | `/owner/orders` | 신규/조리중/완료 주문 탭 |
| 56 | 주문 상세 | `/owner/orders/[id]` | 주문 내역, 접수/거절, 조리 완료 |
| 57 | 주문 거절 | `/owner/orders/[id]/reject` | 거절 사유 선택 |
| 58 | 조리 시간 설정 | `/owner/orders/[id]/time` | 예상 조리 시간 입력 |
| 59 | 주문 이력 | `/owner/orders/history` | 과거 주문 검색, 필터 |

#### 메뉴 관리 (6개)
| # | 페이지명 | URL | 기능 |
|---|----------|-----|------|
| 60 | 메뉴 목록 | `/owner/menus` | 전체 메뉴, 품절 설정, 순서 변경 |
| 61 | 메뉴 등록 | `/owner/menus/new` | 이름, 가격, 사진, 설명, 옵션 |
| 62 | 메뉴 수정 | `/owner/menus/[id]/edit` | 메뉴 정보 수정 |
| 63 | 옵션 그룹 관리 | `/owner/menus/options` | 사이즈, 토핑 등 옵션 그룹 |
| 64 | 카테고리 관리 | `/owner/categories` | 메뉴 카테고리 추가/수정/삭제 |
| 65 | 원산지 관리 | `/owner/ingredients` | 원산지 정보 등록 |

#### 가게 & 영업 관리 (5개)
| # | 페이지명 | URL | 기능 |
|---|----------|-----|------|
| 66 | 가게 정보 수정 | `/owner/store` | 상호명, 소개, 로고, 배경 이미지 |
| 67 | 영업 시간 설정 | `/owner/store/hours` | 요일별 영업시간, 브레이크타임 |
| 68 | 휴무일 설정 | `/owner/store/holidays` | 정기 휴무, 임시 휴무 |
| 69 | 배달/주문 설정 | `/owner/store/delivery` | 최소 주문, 배달비, 배달 반경 |
| 70 | 임시 영업중지 | `/owner/store/pause` | 일시 중지, 재개 |

#### 매출 & 정산 (4개)
| # | 페이지명 | URL | 기능 |
|---|----------|-----|------|
| 71 | 매출 통계 | `/owner/stats` | 일/주/월별 매출, 인기 메뉴 |
| 72 | 정산 내역 | `/owner/settlements` | 정산 예정, 완료 내역 |
| 73 | 정산 상세 | `/owner/settlements/[id]` | 정산 상세 내역, 세금계산서 |
| 74 | 정산 계좌 설정 | `/owner/bank` | 정산 받을 계좌 등록/변경 |

#### 리뷰 & 프로모션 (3개)
| # | 페이지명 | URL | 기능 |
|---|----------|-----|------|
| 75 | 리뷰 관리 | `/owner/reviews` | 리뷰 목록, 답변 작성 |
| 76 | 쿠폰 관리 | `/owner/coupons` | 가게 전용 쿠폰 발행 |
| 77 | 쿠폰 등록 | `/owner/coupons/new` | 할인율, 유효기간, 조건 설정 |

---

### 🛵 라이더 페이지 (18개)

#### 배달 관리 (8개)
| # | 페이지명 | URL | 기능 |
|---|----------|-----|------|
| 78 | 홈 (대기 화면) | `/rider` | 근무 상태, 오늘 실적, 배달 요청 |
| 79 | 배달 요청 목록 | `/rider/requests` | 수락 가능한 배달 목록 |
| 80 | 배달 상세 (수락 전) | `/rider/requests/[id]` | 픽업지, 배달지, 예상 수입, 거리 |
| 81 | 현재 배달 | `/rider/delivery/[id]` | 진행 중인 배달 상태 |
| 82 | 네비게이션 | `/rider/delivery/[id]/navi` | 경로 안내, 카카오/네이버 지도 연동 |
| 83 | 픽업 완료 | `/rider/delivery/[id]/pickup` | 음식 수령 확인 |
| 84 | 배달 완료 | `/rider/delivery/[id]/complete` | 배달 완료 사진, 확인 |
| 85 | 배달 내역 | `/rider/history` | 과거 배달 기록 |

#### 수입 & 출금 (5개)
| # | 페이지명 | URL | 기능 |
|---|----------|-----|------|
| 86 | 수입 통계 | `/rider/earnings` | 일/주/월별 수입, 건수 |
| 87 | 수입 상세 | `/rider/earnings/[date]` | 일별 상세 내역 |
| 88 | 출금 요청 | `/rider/withdraw` | 출금 금액 입력, 계좌 선택 |
| 89 | 출금 내역 | `/rider/withdraw/history` | 출금 요청/완료 내역 |
| 90 | 계좌 설정 | `/rider/bank` | 출금 계좌 등록/변경 |

#### 설정 & 서류 (5개)
| # | 페이지명 | URL | 기능 |
|---|----------|-----|------|
| 91 | 라이더 설정 | `/rider/settings` | 배달 반경, 알림 설정 |
| 92 | 차량 정보 | `/rider/vehicle` | 오토바이/자전거/도보 정보 |
| 93 | 서류 관리 | `/rider/documents` | 신분증, 면허증, 보험 등록 |
| 94 | 보험 정보 | `/rider/insurance` | 가입된 보험 확인, 청구 |
| 95 | 안전 교육 | `/rider/safety` | 필수 안전 교육 이수 |

---

### 👑 최고 관리자 페이지 (32개)

#### 대시보드 (2개)
| # | 페이지명 | URL | 기능 |
|---|----------|-----|------|
| 96 | 메인 대시보드 | `/admin` | 전체 통계, 실시간 주문, 알림 |
| 97 | 실시간 모니터링 | `/admin/realtime` | 현재 주문, 라이더 위치 지도 |

#### 회원 관리 (8개)
| # | 페이지명 | URL | 기능 |
|---|----------|-----|------|
| 98 | 고객 목록 | `/admin/users/customers` | 일반 사용자 목록, 검색, 필터 |
| 99 | 고객 상세 | `/admin/users/customers/[id]` | 고객 정보, 주문 이력, 제재 |
| 100 | 점주 목록 | `/admin/users/owners` | 식당 사장님 목록 |
| 101 | 점주 상세 | `/admin/users/owners/[id]` | 점주 정보, 가게 목록, 정산 |
| 102 | 라이더 목록 | `/admin/users/riders` | 라이더 목록, 활동 상태 |
| 103 | 라이더 상세 | `/admin/users/riders/[id]` | 라이더 정보, 배달 이력, 서류 |
| 104 | 관리자 목록 | `/admin/users/admins` | 관리자 계정, 권한 관리 |
| 105 | 관리자 등록 | `/admin/users/admins/new` | 새 관리자 계정 생성 |

#### 가게 관리 (5개)
| # | 페이지명 | URL | 기능 |
|---|----------|-----|------|
| 106 | 입점 신청 목록 | `/admin/stores/applications` | 신규 입점 신청 심사 |
| 107 | 입점 심사 | `/admin/stores/applications/[id]` | 서류 확인, 승인/거절 |
| 108 | 가게 목록 | `/admin/stores` | 전체 음식점 목록 |
| 109 | 가게 상세 | `/admin/stores/[id]` | 가게 정보, 메뉴, 리뷰, 매출 |
| 110 | 카테고리 관리 | `/admin/categories` | 음식 카테고리 추가/수정 |

#### 주문 & 정산 관리 (7개)
| # | 페이지명 | URL | 기능 |
|---|----------|-----|------|
| 111 | 주문 목록 | `/admin/orders` | 전체 주문 목록, 상태별 필터 |
| 112 | 주문 상세 | `/admin/orders/[id]` | 주문 상세, 강제 취소/환불 |
| 113 | 분쟁 목록 | `/admin/disputes` | 고객-점주-라이더 분쟁 |
| 114 | 분쟁 처리 | `/admin/disputes/[id]` | 분쟁 조정, 환불/보상 처리 |
| 115 | 점주 정산 | `/admin/settlements/owners` | 점주 정산 목록, 실행 |
| 116 | 라이더 정산 | `/admin/settlements/riders` | 라이더 출금 요청 처리 |
| 117 | 정산 내역 | `/admin/settlements/history` | 전체 정산 이력 |

#### 프로모션 & 콘텐츠 (5개)
| # | 페이지명 | URL | 기능 |
|---|----------|-----|------|
| 118 | 쿠폰 관리 | `/admin/coupons` | 플랫폼 쿠폰 생성/관리 |
| 119 | 이벤트 관리 | `/admin/events` | 프로모션 이벤트 관리 |
| 120 | 배너 관리 | `/admin/banners` | 홈 화면 배너 등록 |
| 121 | 공지사항 관리 | `/admin/notices` | 공지 작성/수정/삭제 |
| 122 | FAQ 관리 | `/admin/faq` | 자주 묻는 질문 관리 |

#### 시스템 설정 & 통계 (5개)
| # | 페이지명 | URL | 기능 |
|---|----------|-----|------|
| 123 | 수수료 설정 | `/admin/settings/fees` | 중개 수수료, 결제 수수료 |
| 124 | 배달비 정책 | `/admin/settings/delivery` | 거리별 배달비, 할증 정책 |
| 125 | 매출 분석 | `/admin/analytics/sales` | 전체 매출, 성장률, 차트 |
| 126 | 사용자 분석 | `/admin/analytics/users` | 가입자 수, 활성 사용자, 이탈률 |
| 127 | 지역별 분석 | `/admin/analytics/regions` | 지역별 주문량, 인기 카테고리 |

---

## 🧠 AI 기획/설계 규칙 (필수)

### Sequential Thinking MCP 사용 필수
```
모든 기능 개발 시 다음 순서를 반드시 준수:

1. 🧠 기획 (Sequential Thinking MCP)
   - 요구사항 분석
   - 기능 명세 작성
   - 데이터 흐름 설계

2. 📐 설계 (Sequential Thinking MCP)
   - DB 스키마 설계
   - API 엔드포인트 설계
   - 컴포넌트 구조 설계
   - 상태 관리 설계

3. 💻 구현
   - 정석 코드만 허용 (편법 절대 금지)
   - SonarQube 품질 기준 준수

4. 🧪 테스트
   - 단위 테스트 작성
   - 통합 테스트 작성
   - SonarQube MCP 검사 통과

5. ✅ 검증
   - SonarQube 100% 품질 게이트 통과
   - 코드 리뷰
```

### 기획 없이 코드 작성 금지
```typescript
// ❌ 금지: 바로 코드 작성
// 사용자가 기능 요청 → 바로 코드 작성

// ✅ 필수: Sequential Thinking 먼저
// 사용자가 기능 요청 → Sequential Thinking MCP로 분석 → 설계 → 코드 작성
```

---

## 🗺️ 위치 기반 시스템

### 핵심 원칙
- **모든 식당은 위치 기반**: 위도(lat), 경도(lng) 필수 저장
- **사용자 위치 기반 검색**: 반경 내 식당만 표시
- **거리순 + 광고 우선 정렬**

### 다음 주소 API 통합
```typescript
// 📁 src/components/features/address/AddressSearch.tsx
'use client'

import { useEffect, useCallback } from 'react'

interface AddressData {
  address: string      // 기본 주소
  zonecode: string     // 우편번호
  buildingName: string // 건물명
  addressType: 'R' | 'J' // R: 도로명, J: 지번
}

export function useAddressSearch(onComplete: (data: AddressData) => void) {
  useEffect(() => {
    const script = document.createElement('script')
    script.src = '//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js'
    script.async = true
    document.head.appendChild(script)
    
    return () => {
      document.head.removeChild(script)
    }
  }, [])

  const openSearch = useCallback(() => {
    new window.daum.Postcode({
      oncomplete: (data: AddressData) => {
        onComplete(data)
      },
    }).open()
  }, [onComplete])

  return { openSearch }
}
```

### 카카오맵 Geocoding API
```typescript
// 📁 src/lib/kakao/geocoding.ts
interface GeocodingResult {
  lat: number
  lng: number
  address: string
}

export async function getCoordinates(address: string): Promise<GeocodingResult> {
  const response = await fetch(
    `https://dapi.kakao.com/v2/local/search/address.json?query=${encodeURIComponent(address)}`,
    {
      headers: {
        Authorization: `KakaoAK ${process.env.NEXT_PUBLIC_KAKAO_REST_KEY}`,
      },
    }
  )

  if (!response.ok) {
    throw new Error('Geocoding failed')
  }

  const data = await response.json()
  
  if (data.documents.length === 0) {
    throw new Error('Address not found')
  }

  const { x, y, address_name } = data.documents[0]
  
  return {
    lat: parseFloat(y),
    lng: parseFloat(x),
    address: address_name,
  }
}
```

### 위치 기반 식당 검색 (Supabase)
```sql
-- 📁 supabase/migrations/001_location_functions.sql

-- PostGIS 확장 활성화
CREATE EXTENSION IF NOT EXISTS postgis;

-- 거리 계산 함수 (미터 단위)
CREATE OR REPLACE FUNCTION get_distance_meters(
  lat1 FLOAT, lng1 FLOAT,
  lat2 FLOAT, lng2 FLOAT
) RETURNS FLOAT AS $$
BEGIN
  RETURN ST_Distance(
    ST_SetSRID(ST_MakePoint(lng1, lat1), 4326)::geography,
    ST_SetSRID(ST_MakePoint(lng2, lat2), 4326)::geography
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 반경 내 식당 검색 함수 (광고 우선 정렬)
CREATE OR REPLACE FUNCTION search_restaurants_nearby(
  user_lat FLOAT,
  user_lng FLOAT,
  radius_meters INT DEFAULT 3000,
  limit_count INT DEFAULT 20
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  address TEXT,
  lat FLOAT,
  lng FLOAT,
  distance FLOAT,
  is_advertised BOOLEAN,
  ad_priority INT,
  rating FLOAT,
  delivery_fee INT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    r.id,
    r.name,
    r.address,
    r.lat,
    r.lng,
    get_distance_meters(user_lat, user_lng, r.lat, r.lng) as distance,
    r.is_advertised,
    r.ad_priority,
    r.rating,
    r.delivery_fee
  FROM restaurants r
  WHERE 
    r.is_open = true
    AND get_distance_meters(user_lat, user_lng, r.lat, r.lng) <= radius_meters
  ORDER BY
    CASE WHEN r.is_advertised AND r.ad_expires_at > NOW() THEN 0 ELSE 1 END,
    r.ad_priority DESC,
    distance ASC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql STABLE;
```

### 위치 저장 프로세스
```typescript
// 📁 src/hooks/useLocationSave.ts
import { useMutation } from '@tanstack/react-query'
import { getCoordinates } from '@/lib/kakao/geocoding'
import { createClient } from '@/lib/supabase/client'

interface SaveLocationInput {
  address: string
  detail?: string
  userId: string
}

export function useSaveLocation() {
  const supabase = createClient()

  return useMutation({
    mutationFn: async ({ address, detail, userId }: SaveLocationInput) => {
      // 1. 카카오 API로 좌표 변환
      const { lat, lng } = await getCoordinates(address)

      // 2. DB에 저장
      const { data, error } = await supabase
        .from('addresses')
        .insert({
          user_id: userId,
          address,
          detail,
          lat,
          lng,
        })
        .select()
        .single()

      if (error) throw error
      return data
    },
  })
}
```

---

## 📢 광고 시스템

### 광고 플랜
| 플랜 | 월 비용 | 노출 우선순위 | 혜택 |
|------|---------|---------------|------|
| **Basic** | 50,000원 | 3 | 일반 상위 노출 |
| **Premium** | 100,000원 | 2 | 검색 결과 상단 + 배너 |
| **Exclusive** | 200,000원 | 1 | 최상단 고정 + 푸시 알림 |

### 광고 테이블 스키마
```sql
-- 📁 supabase/migrations/002_advertisements.sql

CREATE TABLE advertisements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  plan_type TEXT NOT NULL CHECK (plan_type IN ('basic', 'premium', 'exclusive')),
  amount INTEGER NOT NULL,
  start_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  end_date TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN DEFAULT true,
  payment_status TEXT NOT NULL CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  payment_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 식당 테이블에 광고 필드 추가
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS is_advertised BOOLEAN DEFAULT false;
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS ad_priority INTEGER DEFAULT 0;
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS ad_expires_at TIMESTAMPTZ;

-- 광고 활성화 트리거
CREATE OR REPLACE FUNCTION update_restaurant_ad_status()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.payment_status = 'paid' AND NEW.is_active = true THEN
    UPDATE restaurants SET
      is_advertised = true,
      ad_priority = CASE NEW.plan_type
        WHEN 'exclusive' THEN 1
        WHEN 'premium' THEN 2
        WHEN 'basic' THEN 3
        ELSE 0
      END,
      ad_expires_at = NEW.end_date
    WHERE id = NEW.restaurant_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_advertisement_paid
AFTER INSERT OR UPDATE ON advertisements
FOR EACH ROW EXECUTE FUNCTION update_restaurant_ad_status();
```

### 광고 결제 프로세스
```typescript
// 📁 src/hooks/useAdvertisement.ts
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

type AdPlanType = 'basic' | 'premium' | 'exclusive'

const AD_PRICES: Record<AdPlanType, number> = {
  basic: 50000,
  premium: 100000,
  exclusive: 200000,
}

interface CreateAdInput {
  restaurantId: string
  planType: AdPlanType
  months: number
}

export function useCreateAdvertisement() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ restaurantId, planType, months }: CreateAdInput) => {
      const amount = AD_PRICES[planType] * months
      const endDate = new Date()
      endDate.setMonth(endDate.getMonth() + months)

      // 1. 광고 레코드 생성 (결제 대기)
      const { data: ad, error: adError } = await supabase
        .from('advertisements')
        .insert({
          restaurant_id: restaurantId,
          plan_type: planType,
          amount,
          end_date: endDate.toISOString(),
          payment_status: 'pending',
        })
        .select()
        .single()

      if (adError) throw adError

      // 2. 결제 처리 (토스페이먼츠 등)
      // ... 결제 로직

      return ad
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['advertisements'] })
    },
  })
}
```

---

## 📱 반응형 디자인 가이드

### Mobile First 접근법 (필수)
```css
/* 기본: 모바일 스타일 */
.container {
  @apply px-4;
}

/* sm (≥640px): 태블릿 세로 */
@screen sm {
  .container {
    @apply px-6;
  }
}

/* md (≥768px): 태블릿 가로 */
@screen md {
  .container {
    @apply px-8;
  }
}

/* lg (≥1024px): 데스크톱 */
@screen lg {
  .container {
    @apply px-12 max-w-6xl mx-auto;
  }
}

/* xl (≥1280px): 대형 데스크톱 */
@screen xl {
  .container {
    @apply max-w-7xl;
  }
}
```

### 브레이크포인트 정의
```typescript
// 📁 src/lib/constants/breakpoints.ts
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const

// 📁 src/hooks/useMediaQuery.ts
import { useState, useEffect } from 'react'
import { BREAKPOINTS } from '@/lib/constants/breakpoints'

type BreakpointKey = keyof typeof BREAKPOINTS

export function useMediaQuery(breakpoint: BreakpointKey): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const query = `(min-width: ${BREAKPOINTS[breakpoint]}px)`
    const media = window.matchMedia(query)
    
    setMatches(media.matches)
    
    const listener = (e: MediaQueryListEvent) => setMatches(e.matches)
    media.addEventListener('change', listener)
    
    return () => media.removeEventListener('change', listener)
  }, [breakpoint])

  return matches
}

// 📁 src/hooks/useDevice.ts
export function useDevice() {
  const isMobile = !useMediaQuery('md')
  const isTablet = useMediaQuery('md') && !useMediaQuery('lg')
  const isDesktop = useMediaQuery('lg')

  return { isMobile, isTablet, isDesktop }
}
```

### 컴포넌트별 반응형 패턴
```typescript
// 📁 src/components/layouts/ResponsiveLayout.tsx
'use client'

import { useDevice } from '@/hooks/useDevice'
import { MobileNav } from './MobileNav'
import { DesktopNav } from './DesktopNav'
import { MobileBottomSheet } from './MobileBottomSheet'
import { DesktopSidebar } from './DesktopSidebar'

interface ResponsiveLayoutProps {
  children: React.ReactNode
}

export function ResponsiveLayout({ children }: ResponsiveLayoutProps) {
  const { isMobile, isDesktop } = useDevice()

  return (
    <div className="min-h-screen">
      {/* 네비게이션: 모바일 햄버거 / PC 풀 메뉴 */}
      {isMobile ? <MobileNav /> : <DesktopNav />}

      <main className={cn(
        'pt-16', // 헤더 높이
        isDesktop && 'pl-64' // PC 사이드바 너비
      )}>
        {children}
      </main>

      {/* 장바구니: 모바일 바텀시트 / PC 사이드바 */}
      {isMobile ? <MobileBottomSheet /> : <DesktopSidebar />}
    </div>
  )
}
```

### 식당 목록 그리드
```typescript
// 📁 src/components/features/restaurant/RestaurantGrid.tsx
interface RestaurantGridProps {
  restaurants: Restaurant[]
}

export function RestaurantGrid({ restaurants }: RestaurantGridProps) {
  return (
    <div className={cn(
      'grid gap-4',
      'grid-cols-1',           // 모바일: 1열
      'sm:grid-cols-2',        // 태블릿: 2열
      'lg:grid-cols-3',        // 데스크톱: 3열
      'xl:grid-cols-4'         // 대형: 4열
    )}>
      {restaurants.map((restaurant) => (
        <RestaurantCard key={restaurant.id} restaurant={restaurant} />
      ))}
    </div>
  )
}
```

---

## 🔍 SonarQube 품질 기준 (100% 통과 필수)

### 품질 게이트 조건
| 메트릭 | 기준 | 설명 |
|--------|------|------|
| **Bugs** | 0 | 버그 없음 |
| **Vulnerabilities** | 0 | 보안 취약점 없음 |
| **Code Smells** | A등급 | 기술 부채 최소화 |
| **Coverage** | ≥ 80% | 테스트 커버리지 |
| **Duplications** | < 3% | 중복 코드 |

### 코드 스멜 방지 규칙
```typescript
// ❌ 금지: 복잡도 높은 함수
function complexFunction() {
  if (a) {
    if (b) {
      if (c) {
        if (d) { // 중첩 4단계 - 금지!
          // ...
        }
      }
    }
  }
}

// ✅ 권장: Early Return 패턴
function simpleFunction() {
  if (!a) return
  if (!b) return
  if (!c) return
  if (!d) return
  // 실제 로직
}

// ❌ 금지: 긴 함수 (30줄 초과)
function longFunction() {
  // 100줄의 코드... 금지!
}

// ✅ 권장: 작은 함수로 분리
function shortFunction() {
  const result1 = step1()
  const result2 = step2(result1)
  return step3(result2)
}

// ❌ 금지: 매직 넘버
if (status === 1) { } // 1이 뭐지?

// ✅ 권장: 상수 사용
const ORDER_STATUS = {
  PENDING: 1,
  CONFIRMED: 2,
  DELIVERED: 3,
} as const

if (status === ORDER_STATUS.PENDING) { }
```

### 보안 취약점 방지
```typescript
// ❌ 금지: XSS 취약점
<div dangerouslySetInnerHTML={{ __html: userInput }} />

// ✅ 권장: 안전한 렌더링
<div>{sanitizedContent}</div>

// ❌ 금지: SQL Injection (직접 쿼리)
const query = `SELECT * FROM users WHERE id = '${userId}'`

// ✅ 권장: 파라미터 바인딩 (Supabase)
const { data } = await supabase
  .from('users')
  .select('*')
  .eq('id', userId)

// ❌ 금지: 민감 정보 노출
console.log('API Key:', process.env.SECRET_KEY)

// ✅ 권장: 환경변수 보호
// 서버에서만 사용, 클라이언트 노출 금지
```

### 테스트 커버리지 80% 달성
```typescript
// 📁 src/hooks/__tests__/useOrder.test.ts
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useOrders, useCreateOrder, useCancelOrder } from '../useOrder'

describe('useOrder hooks', () => {
  const queryClient = new QueryClient()
  const wrapper = ({ children }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )

  describe('useOrders', () => {
    it('should fetch orders successfully', async () => {
      const { result } = renderHook(() => useOrders(), { wrapper })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toBeDefined()
    })

    it('should filter orders by status', async () => {
      const { result } = renderHook(
        () => useOrders({ status: 'pending' }),
        { wrapper }
      )

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      result.current.data?.forEach(order => {
        expect(order.status).toBe('pending')
      })
    })
  })

  describe('useCreateOrder', () => {
    it('should create order successfully', async () => {
      const { result } = renderHook(() => useCreateOrder(), { wrapper })

      await result.current.mutateAsync({
        restaurantId: 'test-restaurant-id',
        items: [{ menuId: 'menu-1', quantity: 1 }],
        deliveryAddress: {
          address: '서울시 강남구',
          lat: 37.5,
          lng: 127.0,
        },
        paymentMethod: 'card',
      })

      expect(result.current.isSuccess).toBe(true)
    })
  })
})
```

### SonarQube MCP 검사 실행
```bash
# 코드 작성 후 반드시 실행
npm run sonar:check

# 품질 게이트 통과 확인
npm run sonar:gate
```

---

## 📋 개발 순서 로드맵 (상세)

> **원칙**: 의존성 순서 → 핵심 기능 우선 → 점진적 복잡도 증가

---

### 🏗️ Phase 1: 프로젝트 기반 설정 (Foundation)

#### 1.1 개발 환경 구성
| # | 작업 | 파일/폴더 | 상태 |
|---|------|-----------|------|
| 1 | ESLint 설정 (strict rules) | `.eslintrc.json` | ✅ |
| 2 | Prettier 설정 | `.prettierrc` | ✅ |
| 3 | TypeScript strict mode 활성화 | `tsconfig.json` | ✅ |
| 4 | Husky + lint-staged 설정 | `.husky/`, `package.json` | ⬜ |
| 5 | 폴더 구조 생성 | `src/` 하위 폴더들 | ⬜ |
| 6 | Path alias 설정 (@/) | `tsconfig.json` | ✅ |
| 7 | 환경변수 타입 정의 | `src/types/env.d.ts` | ⬜ |

#### 1.2 폴더 구조 생성 (필수)
```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/             # 인증 관련 그룹
│   │   ├── login/
│   │   ├── signup/
│   │   └── forgot-password/
│   ├── (customer)/         # 고객 페이지 그룹
│   │   ├── page.tsx        # 홈 (/)
│   │   ├── search/
│   │   ├── restaurant/
│   │   ├── cart/
│   │   ├── checkout/
│   │   ├── orders/
│   │   └── my/
│   ├── owner/              # 점주 페이지
│   ├── rider/              # 라이더 페이지
│   ├── admin/              # 관리자 페이지
│   └── api/                # API 라우트
├── components/
│   ├── ui/                 # 기본 UI (Button, Input, Modal)
│   ├── layouts/            # 레이아웃 (Header, Footer, Nav)
│   └── features/           # 기능별 컴포넌트
│       ├── auth/
│       ├── restaurant/
│       ├── cart/
│       ├── order/
│       ├── rider/
│       └── admin/
├── hooks/                  # 커스텀 훅
├── lib/                    # 라이브러리 설정
│   ├── supabase/           # Supabase 클라이언트
│   ├── kakao/              # 카카오맵 API
│   └── utils/              # 유틸리티 함수
├── stores/                 # Zustand 스토어
├── types/                  # TypeScript 타입
├── constants/              # 상수 정의
└── styles/                 # 전역 스타일
```

#### 1.3 Supabase 데이터베이스 설정
| # | 작업 | 설명 | 상태 |
|---|------|------|------|
| 1 | PostGIS 확장 활성화 | 위치 기반 검색용 | ⬜ |
| 2 | 핵심 테이블 생성 (users) | 사용자 테이블 | ⬜ |
| 3 | 핵심 테이블 생성 (addresses) | 주소 테이블 | ⬜ |
| 4 | 핵심 테이블 생성 (categories) | 카테고리 테이블 | ⬜ |
| 5 | 핵심 테이블 생성 (restaurants) | 식당 테이블 | ⬜ |
| 6 | 핵심 테이블 생성 (menus) | 메뉴 테이블 | ⬜ |
| 7 | 핵심 테이블 생성 (orders) | 주문 테이블 | ⬜ |
| 8 | 핵심 테이블 생성 (riders) | 라이더 테이블 | ⬜ |
| 9 | 핵심 테이블 생성 (reviews) | 리뷰 테이블 | ⬜ |
| 10 | 핵심 테이블 생성 (advertisements) | 광고 테이블 | ⬜ |
| 11 | 핵심 테이블 생성 (settlements) | 정산 테이블 | ⬜ |
| 12 | RLS 정책 설정 | Row Level Security | ⬜ |
| 13 | 인덱스 생성 | 성능 최적화 | ⬜ |
| 14 | 거리 계산 함수 생성 | `get_distance_meters` | ⬜ |
| 15 | 주변 식당 검색 함수 생성 | `search_restaurants_nearby` | ⬜ |
| 16 | Supabase 타입 생성 | `npm run db:types` | ⬜ |

#### 1.4 Supabase 클라이언트 설정
| # | 작업 | 파일 | 상태 |
|---|------|------|------|
| 1 | 브라우저 클라이언트 | `src/lib/supabase/client.ts` | ⬜ |
| 2 | 서버 클라이언트 | `src/lib/supabase/server.ts` | ⬜ |
| 3 | 미들웨어 | `src/middleware.ts` | ⬜ |
| 4 | 타입 정의 | `src/types/database.types.ts` | ⬜ |

---

### 🔐 Phase 2: 인증 시스템 (Authentication)

> **의존성**: Phase 1 완료 필요

#### 2.1 회원가입
| # | 작업 | URL | 기능 | 상태 |
|---|------|-----|------|------|
| 1 | 회원가입 페이지 | `/signup` | 역할 선택, 폼 | ⬜ |
| 2 | 이메일 회원가입 로직 | - | Supabase Auth | ⬜ |
| 3 | 소셜 로그인 (카카오) | - | OAuth 2.0 | ⬜ |
| 4 | 소셜 로그인 (네이버) | - | OAuth 2.0 | ⬜ |
| 5 | 소셜 로그인 (구글) | - | OAuth 2.0 | ⬜ |
| 6 | 이메일 인증 | - | 인증 메일 발송 | ⬜ |
| 7 | 점주 회원가입 | `/signup/owner` | 사업자 정보 | ⬜ |
| 8 | 라이더 회원가입 | `/signup/rider` | 차량/서류 정보 | ⬜ |
| 9 | 약관 동의 컴포넌트 | - | 필수/선택 약관 | ⬜ |

#### 2.2 로그인/로그아웃
| # | 작업 | URL | 기능 | 상태 |
|---|------|-----|------|------|
| 1 | 로그인 페이지 | `/login` | 이메일/소셜 | ⬜ |
| 2 | 로그인 로직 | - | 세션 생성 | ⬜ |
| 3 | 로그아웃 로직 | - | 세션 삭제 | ⬜ |
| 4 | 자동 로그인 (Remember me) | - | 쿠키 저장 | ⬜ |
| 5 | 비밀번호 찾기 | `/forgot-password` | 이메일 인증 | ⬜ |
| 6 | 비밀번호 재설정 | `/reset-password` | 새 비밀번호 | ⬜ |

#### 2.3 인증 상태 관리
| # | 작업 | 파일 | 기능 | 상태 |
|---|------|------|------|------|
| 1 | Auth 컨텍스트/스토어 | `src/stores/auth.store.ts` | 전역 상태 | ⬜ |
| 2 | useAuth 훅 | `src/hooks/useAuth.ts` | 인증 상태 접근 | ⬜ |
| 3 | Protected Route | `src/components/auth/ProtectedRoute.tsx` | 인증 필요 페이지 | ⬜ |
| 4 | Role Guard | `src/components/auth/RoleGuard.tsx` | 역할별 접근 제어 | ⬜ |
| 5 | Auth Middleware | `src/middleware.ts` | 서버 사이드 인증 | ⬜ |

---

### 🗺️ Phase 3: 위치 기반 시스템 (Location)

> **의존성**: Phase 1 완료 필요 (Phase 2와 병행 가능)

#### 3.1 주소 검색 (다음 주소 API)
| # | 작업 | 파일 | 기능 | 상태 |
|---|------|------|------|------|
| 1 | 다음 주소 API 스크립트 로드 | - | Script 컴포넌트 | ⬜ |
| 2 | 주소 검색 훅 | `src/hooks/useAddressSearch.ts` | 주소 검색 호출 | ⬜ |
| 3 | 주소 검색 컴포넌트 | `src/components/features/address/AddressSearch.tsx` | UI | ⬜ |
| 4 | 주소 입력 모달 | `src/components/features/address/AddressModal.tsx` | 모달 형태 | ⬜ |

#### 3.2 좌표 변환 (카카오맵 Geocoding)
| # | 작업 | 파일 | 기능 | 상태 |
|---|------|------|------|------|
| 1 | Geocoding 유틸리티 | `src/lib/kakao/geocoding.ts` | 주소→좌표 | ⬜ |
| 2 | 역 Geocoding | `src/lib/kakao/reverseGeocoding.ts` | 좌표→주소 | ⬜ |
| 3 | 현재 위치 가져오기 훅 | `src/hooks/useCurrentLocation.ts` | GPS | ⬜ |

#### 3.3 지도 표시 (카카오맵)
| # | 작업 | 파일 | 기능 | 상태 |
|---|------|------|------|------|
| 1 | 카카오맵 스크립트 로드 | - | Script 컴포넌트 | ⬜ |
| 2 | 기본 지도 컴포넌트 | `src/components/features/map/KakaoMap.tsx` | 지도 표시 | ⬜ |
| 3 | 마커 컴포넌트 | `src/components/features/map/Marker.tsx` | 위치 마커 | ⬜ |
| 4 | 식당 지도 표시 | `src/components/features/map/RestaurantMap.tsx` | 주변 식당 | ⬜ |
| 5 | 라이더 위치 추적 | `src/components/features/map/RiderTracker.tsx` | 실시간 위치 | ⬜ |

#### 3.4 주소 관리
| # | 작업 | URL | 기능 | 상태 |
|---|------|-----|------|------|
| 1 | 주소 선택 페이지 | `/address/select` | 현재 위치/저장 주소 | ⬜ |
| 2 | 주소 목록 | `/my/addresses` | 저장된 주소 관리 | ⬜ |
| 3 | 주소 추가 | `/my/addresses/new` | 새 주소 등록 | ⬜ |
| 4 | 주소 저장 훅 | `src/hooks/useAddress.ts` | CRUD 로직 | ⬜ |

---

### 🎨 Phase 4: 공통 UI 컴포넌트 (UI Library)

> **의존성**: Phase 1 완료 필요 (Phase 2, 3과 병행 가능)

#### 4.1 기본 UI 컴포넌트
| # | 컴포넌트 | 파일 | 변형 | 상태 |
|---|----------|------|------|------|
| 1 | Button | `src/components/ui/Button.tsx` | primary, secondary, outline, ghost, destructive | ⬜ |
| 2 | Input | `src/components/ui/Input.tsx` | text, password, email, number, search | ⬜ |
| 3 | Textarea | `src/components/ui/Textarea.tsx` | - | ⬜ |
| 4 | Select | `src/components/ui/Select.tsx` | single, multi | ⬜ |
| 5 | Checkbox | `src/components/ui/Checkbox.tsx` | - | ⬜ |
| 6 | Radio | `src/components/ui/Radio.tsx` | - | ⬜ |
| 7 | Switch | `src/components/ui/Switch.tsx` | - | ⬜ |
| 8 | Badge | `src/components/ui/Badge.tsx` | status, count | ⬜ |
| 9 | Avatar | `src/components/ui/Avatar.tsx` | image, fallback | ⬜ |
| 10 | Spinner | `src/components/ui/Spinner.tsx` | sm, md, lg | ⬜ |

#### 4.2 복합 UI 컴포넌트
| # | 컴포넌트 | 파일 | 기능 | 상태 |
|---|----------|------|------|------|
| 1 | Card | `src/components/ui/Card.tsx` | 콘텐츠 카드 | ⬜ |
| 2 | Modal | `src/components/ui/Modal.tsx` | 모달 다이얼로그 | ⬜ |
| 3 | BottomSheet | `src/components/ui/BottomSheet.tsx` | 모바일 바텀시트 | ⬜ |
| 4 | Toast | `src/components/ui/Toast.tsx` | 알림 토스트 | ⬜ |
| 5 | Dropdown | `src/components/ui/Dropdown.tsx` | 드롭다운 메뉴 | ⬜ |
| 6 | Tabs | `src/components/ui/Tabs.tsx` | 탭 네비게이션 | ⬜ |
| 7 | Accordion | `src/components/ui/Accordion.tsx` | 접기/펼치기 | ⬜ |
| 8 | Skeleton | `src/components/ui/Skeleton.tsx` | 로딩 스켈레톤 | ⬜ |
| 9 | EmptyState | `src/components/ui/EmptyState.tsx` | 빈 상태 표시 | ⬜ |
| 10 | ErrorState | `src/components/ui/ErrorState.tsx` | 에러 상태 표시 | ⬜ |

#### 4.3 폼 컴포넌트 (react-hook-form + zod)
| # | 컴포넌트 | 파일 | 기능 | 상태 |
|---|----------|------|------|------|
| 1 | Form | `src/components/ui/Form.tsx` | 폼 래퍼 | ⬜ |
| 2 | FormField | `src/components/ui/FormField.tsx` | 필드 래퍼 | ⬜ |
| 3 | FormError | `src/components/ui/FormError.tsx` | 에러 메시지 | ⬜ |
| 4 | FormLabel | `src/components/ui/FormLabel.tsx` | 레이블 | ⬜ |

#### 4.4 레이아웃 컴포넌트
| # | 컴포넌트 | 파일 | 기능 | 상태 |
|---|----------|------|------|------|
| 1 | Header | `src/components/layouts/Header.tsx` | 상단 헤더 | ⬜ |
| 2 | Footer | `src/components/layouts/Footer.tsx` | 하단 푸터 | ⬜ |
| 3 | MobileNav | `src/components/layouts/MobileNav.tsx` | 모바일 네비 | ⬜ |
| 4 | DesktopNav | `src/components/layouts/DesktopNav.tsx` | PC 네비 | ⬜ |
| 5 | Sidebar | `src/components/layouts/Sidebar.tsx` | 사이드바 | ⬜ |
| 6 | BottomNav | `src/components/layouts/BottomNav.tsx` | 모바일 하단 탭 | ⬜ |
| 7 | PageContainer | `src/components/layouts/PageContainer.tsx` | 페이지 컨테이너 | ⬜ |
| 8 | ResponsiveLayout | `src/components/layouts/ResponsiveLayout.tsx` | 반응형 레이아웃 | ⬜ |

#### 4.5 반응형 훅
| # | 훅 | 파일 | 기능 | 상태 |
|---|------|------|------|------|
| 1 | useMediaQuery | `src/hooks/useMediaQuery.ts` | 미디어 쿼리 | ⬜ |
| 2 | useDevice | `src/hooks/useDevice.ts` | 디바이스 감지 | ⬜ |
| 3 | useWindowSize | `src/hooks/useWindowSize.ts` | 윈도우 크기 | ⬜ |

---

### 🏠 Phase 5: 고객 - 홈 & 검색 (Customer Home)

> **의존성**: Phase 2 (인증), Phase 3 (위치), Phase 4 (UI) 완료 필요

#### 5.1 홈페이지
| # | 작업 | URL | 컴포넌트/기능 | 상태 |
|---|------|-----|---------------|------|
| 1 | 홈 페이지 레이아웃 | `/` | 페이지 구조 | ⬜ |
| 2 | 현재 위치 표시 헤더 | - | 주소 선택 버튼 | ⬜ |
| 3 | 이벤트 배너 캐러셀 | - | 광고/이벤트 배너 | ⬜ |
| 4 | 카테고리 아이콘 그리드 | - | 치킨, 피자, 중식... | ⬜ |
| 5 | 추천 식당 리스트 (광고 포함) | - | 광고 우선 정렬 | ⬜ |
| 6 | 인기 식당 리스트 | - | 평점/주문수 기준 | ⬜ |

#### 5.2 검색
| # | 작업 | URL | 기능 | 상태 |
|---|------|-----|------|------|
| 1 | 검색 페이지 | `/search` | 키워드 검색 | ⬜ |
| 2 | 검색창 컴포넌트 | - | 자동완성 | ⬜ |
| 3 | 최근 검색어 | - | 로컬 저장 | ⬜ |
| 4 | 인기 검색어 | - | 서버 통계 | ⬜ |
| 5 | 검색 결과 페이지 | `/search/results` | 필터/정렬 | ⬜ |
| 6 | 필터 컴포넌트 | - | 카테고리, 배달비, 최소주문 | ⬜ |
| 7 | 정렬 컴포넌트 | - | 거리, 평점, 배달시간 | ⬜ |

#### 5.3 카테고리
| # | 작업 | URL | 기능 | 상태 |
|---|------|-----|------|------|
| 1 | 카테고리별 목록 | `/category/[slug]` | 카테고리 필터링 | ⬜ |
| 2 | 무한 스크롤 | - | 페이지네이션 | ⬜ |

#### 5.4 지도 보기
| # | 작업 | URL | 기능 | 상태 |
|---|------|-----|------|------|
| 1 | 지도 페이지 | `/map` | 주변 식당 지도 | ⬜ |
| 2 | 식당 마커 클릭 | - | 간략 정보 표시 | ⬜ |
| 3 | 현재 위치 버튼 | - | 내 위치로 이동 | ⬜ |

---

### 🍽️ Phase 6: 고객 - 음식점 & 메뉴 (Restaurant)

> **의존성**: Phase 5 완료 필요

#### 6.1 음식점 상세
| # | 작업 | URL | 기능 | 상태 |
|---|------|-----|------|------|
| 1 | 식당 상세 페이지 | `/restaurant/[id]` | 매장 정보 | ⬜ |
| 2 | 식당 헤더 (이미지, 이름, 평점) | - | 상단 정보 | ⬜ |
| 3 | 영업 상태 표시 | - | 영업중/준비중/휴무 | ⬜ |
| 4 | 탭 네비게이션 (메뉴/정보/리뷰) | - | 탭 전환 | ⬜ |
| 5 | 메뉴 카테고리 탭 | - | 대표/사이드/음료 | ⬜ |
| 6 | 메뉴 리스트 | - | 메뉴 카드 | ⬜ |
| 7 | 찜하기 버튼 | - | 즐겨찾기 | ⬜ |

#### 6.2 메뉴 상세
| # | 작업 | URL | 기능 | 상태 |
|---|------|-----|------|------|
| 1 | 메뉴 상세 모달/페이지 | `/restaurant/[id]/menu/[menuId]` | 메뉴 정보 | ⬜ |
| 2 | 옵션 선택 | - | 필수/선택 옵션 | ⬜ |
| 3 | 수량 선택 | - | +/- 버튼 | ⬜ |
| 4 | 가격 계산 | - | 실시간 계산 | ⬜ |
| 5 | 장바구니 담기 버튼 | - | 장바구니 추가 | ⬜ |

#### 6.3 가게 정보
| # | 작업 | URL | 기능 | 상태 |
|---|------|-----|------|------|
| 1 | 가게 정보 탭/페이지 | `/restaurant/[id]/info` | 상세 정보 | ⬜ |
| 2 | 영업시간 표시 | - | 요일별 시간 | ⬜ |
| 3 | 전화번호 (클릭 통화) | - | tel: 링크 | ⬜ |
| 4 | 위치 지도 | - | 카카오맵 | ⬜ |
| 5 | 원산지 정보 | - | 테이블 형태 | ⬜ |

#### 6.4 리뷰
| # | 작업 | URL | 기능 | 상태 |
|---|------|-----|------|------|
| 1 | 리뷰 목록 탭/페이지 | `/restaurant/[id]/reviews` | 리뷰 리스트 | ⬜ |
| 2 | 평점별 필터 | - | 5/4/3/2/1점 필터 | ⬜ |
| 3 | 사진 리뷰만 보기 | - | 이미지 있는 리뷰 | ⬜ |
| 4 | 리뷰 카드 컴포넌트 | - | 별점, 내용, 사진 | ⬜ |
| 5 | 리뷰 상세 페이지 | `/review/[reviewId]` | 전체 내용 | ⬜ |

---

### 🛒 Phase 7: 고객 - 장바구니 & 주문 (Cart & Order)

> **의존성**: Phase 6 완료 필요

#### 7.1 장바구니
| # | 작업 | URL | 기능 | 상태 |
|---|------|-----|------|------|
| 1 | 장바구니 스토어 | `src/stores/cart.store.ts` | Zustand 상태 | ⬜ |
| 2 | 장바구니 페이지 | `/cart` | 담은 메뉴 목록 | ⬜ |
| 3 | 수량 변경 | - | +/- 버튼 | ⬜ |
| 4 | 메뉴 삭제 | - | 개별/전체 삭제 | ⬜ |
| 5 | 옵션 수정 | - | 옵션 변경 | ⬜ |
| 6 | 금액 계산 | - | 메뉴+옵션+배달비 | ⬜ |
| 7 | 최소 주문 금액 체크 | - | 미달 시 경고 | ⬜ |
| 8 | 플로팅 장바구니 버튼 | - | 모바일 하단 버튼 | ⬜ |

#### 7.2 주문서 작성
| # | 작업 | URL | 기능 | 상태 |
|---|------|-----|------|------|
| 1 | 주문서 페이지 | `/checkout` | 주문 정보 입력 | ⬜ |
| 2 | 배달 주소 선택/변경 | - | 주소 모달 | ⬜ |
| 3 | 배달 요청사항 | - | 텍스트 입력 | ⬜ |
| 4 | 일회용품 요청 | - | 체크박스 | ⬜ |
| 5 | 쿠폰 선택 | - | 쿠폰 모달 | ⬜ |
| 6 | 포인트 사용 | - | 포인트 입력 | ⬜ |
| 7 | 주문 금액 요약 | - | 상세 금액 표시 | ⬜ |

#### 7.3 결제
| # | 작업 | URL | 기능 | 상태 |
|---|------|-----|------|------|
| 1 | 결제 페이지 | `/checkout/payment` | 결제 수단 선택 | ⬜ |
| 2 | 토스페이먼츠 연동 | - | SDK 설정 | ⬜ |
| 3 | 카드 결제 | - | 신용/체크카드 | ⬜ |
| 4 | 간편결제 (카카오페이 등) | - | 간편결제 | ⬜ |
| 5 | 결제 처리 API | `/api/payment` | 서버 사이드 | ⬜ |
| 6 | 결제 콜백 처리 | - | 성공/실패 처리 | ⬜ |
| 7 | 결제 완료 페이지 | `/checkout/complete` | 주문 완료 안내 | ⬜ |

#### 7.4 주문 내역 & 추적
| # | 작업 | URL | 기능 | 상태 |
|---|------|-----|------|------|
| 1 | 주문 내역 페이지 | `/orders` | 주문 목록 | ⬜ |
| 2 | 진행중/완료 탭 | - | 상태별 필터 | ⬜ |
| 3 | 주문 카드 컴포넌트 | - | 요약 정보 | ⬜ |
| 4 | 주문 상세 페이지 | `/orders/[orderId]` | 전체 정보 | ⬜ |
| 5 | 주문 취소 | - | 취소 요청 | ⬜ |
| 6 | 실시간 추적 페이지 | `/orders/[orderId]/tracking` | 라이더 위치 | ⬜ |
| 7 | 배달 상태 스텝 | - | 주문접수→조리→배달→완료 | ⬜ |
| 8 | 라이더 위치 지도 | - | 실시간 위치 | ⬜ |
| 9 | 예상 도착 시간 | - | 남은 시간 표시 | ⬜ |

---

### 📝 Phase 8: 고객 - 리뷰 & 마이페이지 (Review & MyPage)

> **의존성**: Phase 7 완료 필요

#### 8.1 리뷰 작성
| # | 작업 | URL | 기능 | 상태 |
|---|------|-----|------|------|
| 1 | 리뷰 작성 페이지 | `/orders/[orderId]/review` | 리뷰 폼 | ⬜ |
| 2 | 별점 선택 | - | 1-5점 | ⬜ |
| 3 | 텍스트 리뷰 | - | 텍스트 입력 | ⬜ |
| 4 | 사진 첨부 | - | 이미지 업로드 | ⬜ |
| 5 | 리뷰 제출 | - | API 호출 | ⬜ |

#### 8.2 내 리뷰 관리
| # | 작업 | URL | 기능 | 상태 |
|---|------|-----|------|------|
| 1 | 내 리뷰 목록 | `/my/reviews` | 작성한 리뷰 | ⬜ |
| 2 | 리뷰 수정 | - | 수정 폼 | ⬜ |
| 3 | 리뷰 삭제 | - | 삭제 확인 | ⬜ |

#### 8.3 찜/즐겨찾기
| # | 작업 | URL | 기능 | 상태 |
|---|------|-----|------|------|
| 1 | 찜한 가게 | `/my/favorites` | 즐겨찾기 목록 | ⬜ |
| 2 | 자주 시킨 메뉴 | `/my/frequent` | 재주문 목록 | ⬜ |
| 3 | 최근 본 가게 | `/my/recent` | 최근 방문 | ⬜ |

#### 8.4 마이페이지
| # | 작업 | URL | 기능 | 상태 |
|---|------|-----|------|------|
| 1 | 마이페이지 | `/my` | 메뉴 허브 | ⬜ |
| 2 | 쿠폰함 | `/my/coupons` | 보유 쿠폰 | ⬜ |
| 3 | 포인트 | `/my/points` | 잔액/내역 | ⬜ |
| 4 | 결제 수단 관리 | `/my/payments` | 카드 목록 | ⬜ |
| 5 | 카드 등록 | `/my/payments/card/new` | 카드 추가 | ⬜ |

#### 8.5 고객센터
| # | 작업 | URL | 기능 | 상태 |
|---|------|-----|------|------|
| 1 | 고객센터 | `/support` | FAQ, 문의 | ⬜ |
| 2 | 1:1 문의 | `/support/inquiry` | 문의 작성 | ⬜ |
| 3 | 문의 상세 | `/support/inquiry/[id]` | 답변 확인 | ⬜ |
| 4 | 공지사항 | `/notice` | 공지 목록 | ⬜ |

#### 8.6 설정
| # | 작업 | URL | 기능 | 상태 |
|---|------|-----|------|------|
| 1 | 설정 메인 | `/settings` | 설정 메뉴 | ⬜ |
| 2 | 프로필 설정 | `/settings/profile` | 정보 수정 | ⬜ |
| 3 | 보안 설정 | `/settings/security` | 비밀번호 | ⬜ |
| 4 | 알림 설정 | `/settings/notifications` | 푸시/이메일 | ⬜ |
| 5 | 회원탈퇴 | `/settings/withdraw` | 탈퇴 처리 | ⬜ |

---

### 🏪 Phase 9: 점주 기능 (Owner)

> **의존성**: Phase 7 (주문 시스템) 완료 필요

#### 9.1 점주 대시보드
| # | 작업 | URL | 기능 | 상태 |
|---|------|-----|------|------|
| 1 | 대시보드 페이지 | `/owner` | 오늘 현황 | ⬜ |
| 2 | 매출 요약 카드 | - | 오늘/어제/이번주 | ⬜ |
| 3 | 신규 주문 알림 | - | 실시간 알림 | ⬜ |
| 4 | 미처리 리뷰 | - | 답변 대기 | ⬜ |

#### 9.2 주문 관리
| # | 작업 | URL | 기능 | 상태 |
|---|------|-----|------|------|
| 1 | 주문 목록 | `/owner/orders` | 신규/조리중/완료 | ⬜ |
| 2 | 주문 상세 | `/owner/orders/[id]` | 주문 내역 | ⬜ |
| 3 | 주문 접수 | - | 수락 버튼 | ⬜ |
| 4 | 주문 거절 | `/owner/orders/[id]/reject` | 거절 사유 | ⬜ |
| 5 | 조리 시간 설정 | `/owner/orders/[id]/time` | 예상 시간 | ⬜ |
| 6 | 조리 완료 | - | 완료 버튼 | ⬜ |
| 7 | 주문 이력 | `/owner/orders/history` | 과거 주문 | ⬜ |

#### 9.3 메뉴 관리
| # | 작업 | URL | 기능 | 상태 |
|---|------|-----|------|------|
| 1 | 메뉴 목록 | `/owner/menus` | 전체 메뉴 | ⬜ |
| 2 | 메뉴 등록 | `/owner/menus/new` | 새 메뉴 | ⬜ |
| 3 | 메뉴 수정 | `/owner/menus/[id]/edit` | 수정 | ⬜ |
| 4 | 메뉴 삭제 | - | 삭제 확인 | ⬜ |
| 5 | 품절 설정 | - | 토글 | ⬜ |
| 6 | 옵션 그룹 관리 | `/owner/menus/options` | 옵션 CRUD | ⬜ |
| 7 | 카테고리 관리 | `/owner/categories` | 카테고리 CRUD | ⬜ |
| 8 | 원산지 관리 | `/owner/ingredients` | 원산지 정보 | ⬜ |

#### 9.4 가게 관리
| # | 작업 | URL | 기능 | 상태 |
|---|------|-----|------|------|
| 1 | 가게 정보 수정 | `/owner/store` | 기본 정보 | ⬜ |
| 2 | 영업 시간 설정 | `/owner/store/hours` | 요일별 시간 | ⬜ |
| 3 | 휴무일 설정 | `/owner/store/holidays` | 정기/임시 휴무 | ⬜ |
| 4 | 배달/주문 설정 | `/owner/store/delivery` | 최소주문, 배달비 | ⬜ |
| 5 | 임시 영업중지 | `/owner/store/pause` | 일시 중지 | ⬜ |

#### 9.5 매출 & 정산
| # | 작업 | URL | 기능 | 상태 |
|---|------|-----|------|------|
| 1 | 매출 통계 | `/owner/stats` | 일/주/월 매출 | ⬜ |
| 2 | 정산 내역 | `/owner/settlements` | 정산 목록 | ⬜ |
| 3 | 정산 상세 | `/owner/settlements/[id]` | 상세 내역 | ⬜ |
| 4 | 정산 계좌 설정 | `/owner/bank` | 계좌 등록 | ⬜ |

#### 9.6 리뷰 & 프로모션
| # | 작업 | URL | 기능 | 상태 |
|---|------|-----|------|------|
| 1 | 리뷰 관리 | `/owner/reviews` | 리뷰 목록, 답변 | ⬜ |
| 2 | 쿠폰 관리 | `/owner/coupons` | 가게 쿠폰 | ⬜ |
| 3 | 쿠폰 등록 | `/owner/coupons/new` | 쿠폰 생성 | ⬜ |

---

### 🛵 Phase 10: 라이더 기능 (Rider)

> **의존성**: Phase 9 (점주 시스템) 완료 필요

#### 10.1 라이더 대시보드
| # | 작업 | URL | 기능 | 상태 |
|---|------|-----|------|------|
| 1 | 홈 (대기 화면) | `/rider` | 근무 상태 | ⬜ |
| 2 | 근무 시작/종료 토글 | - | 배달 가능 상태 | ⬜ |
| 3 | 오늘 실적 | - | 건수/수입 | ⬜ |

#### 10.2 배달 관리
| # | 작업 | URL | 기능 | 상태 |
|---|------|-----|------|------|
| 1 | 배달 요청 목록 | `/rider/requests` | 수락 가능 목록 | ⬜ |
| 2 | 배달 상세 (수락 전) | `/rider/requests/[id]` | 픽업지/배달지 | ⬜ |
| 3 | 배달 수락/거절 | - | 버튼 | ⬜ |
| 4 | 현재 배달 | `/rider/delivery/[id]` | 진행 중 배달 | ⬜ |
| 5 | 네비게이션 | `/rider/delivery/[id]/navi` | 카카오/네이버 지도 | ⬜ |
| 6 | 픽업 완료 | `/rider/delivery/[id]/pickup` | 수령 확인 | ⬜ |
| 7 | 배달 완료 | `/rider/delivery/[id]/complete` | 완료 처리 | ⬜ |
| 8 | 배달 내역 | `/rider/history` | 과거 기록 | ⬜ |

#### 10.3 수입 & 출금
| # | 작업 | URL | 기능 | 상태 |
|---|------|-----|------|------|
| 1 | 수입 통계 | `/rider/earnings` | 일/주/월 수입 | ⬜ |
| 2 | 수입 상세 | `/rider/earnings/[date]` | 일별 상세 | ⬜ |
| 3 | 출금 요청 | `/rider/withdraw` | 출금 신청 | ⬜ |
| 4 | 출금 내역 | `/rider/withdraw/history` | 출금 기록 | ⬜ |
| 5 | 계좌 설정 | `/rider/bank` | 계좌 등록 | ⬜ |

#### 10.4 설정 & 서류
| # | 작업 | URL | 기능 | 상태 |
|---|------|-----|------|------|
| 1 | 라이더 설정 | `/rider/settings` | 배달 반경 | ⬜ |
| 2 | 차량 정보 | `/rider/vehicle` | 차량 등록 | ⬜ |
| 3 | 서류 관리 | `/rider/documents` | 신분증/면허 | ⬜ |
| 4 | 보험 정보 | `/rider/insurance` | 보험 확인 | ⬜ |
| 5 | 안전 교육 | `/rider/safety` | 교육 이수 | ⬜ |

---

### 👑 Phase 11: 관리자 기능 (Admin)

> **의존성**: Phase 10 완료 필요

#### 11.1 대시보드
| # | 작업 | URL | 기능 | 상태 |
|---|------|-----|------|------|
| 1 | 메인 대시보드 | `/admin` | 전체 통계 | ⬜ |
| 2 | 실시간 모니터링 | `/admin/realtime` | 현재 주문/라이더 | ⬜ |

#### 11.2 회원 관리
| # | 작업 | URL | 기능 | 상태 |
|---|------|-----|------|------|
| 1 | 고객 목록 | `/admin/users/customers` | 고객 관리 | ⬜ |
| 2 | 고객 상세 | `/admin/users/customers/[id]` | 상세/제재 | ⬜ |
| 3 | 점주 목록 | `/admin/users/owners` | 점주 관리 | ⬜ |
| 4 | 점주 상세 | `/admin/users/owners/[id]` | 상세/가게 | ⬜ |
| 5 | 라이더 목록 | `/admin/users/riders` | 라이더 관리 | ⬜ |
| 6 | 라이더 상세 | `/admin/users/riders/[id]` | 상세/서류 | ⬜ |
| 7 | 관리자 목록 | `/admin/users/admins` | 관리자 계정 | ⬜ |
| 8 | 관리자 등록 | `/admin/users/admins/new` | 계정 생성 | ⬜ |

#### 11.3 가게 관리
| # | 작업 | URL | 기능 | 상태 |
|---|------|-----|------|------|
| 1 | 입점 신청 목록 | `/admin/stores/applications` | 심사 대기 | ⬜ |
| 2 | 입점 심사 | `/admin/stores/applications/[id]` | 승인/거절 | ⬜ |
| 3 | 가게 목록 | `/admin/stores` | 전체 가게 | ⬜ |
| 4 | 가게 상세 | `/admin/stores/[id]` | 상세 정보 | ⬜ |
| 5 | 카테고리 관리 | `/admin/categories` | 카테고리 CRUD | ⬜ |

#### 11.4 주문 & 정산
| # | 작업 | URL | 기능 | 상태 |
|---|------|-----|------|------|
| 1 | 주문 목록 | `/admin/orders` | 전체 주문 | ⬜ |
| 2 | 주문 상세 | `/admin/orders/[id]` | 상세/취소 | ⬜ |
| 3 | 분쟁 목록 | `/admin/disputes` | 분쟁 관리 | ⬜ |
| 4 | 분쟁 처리 | `/admin/disputes/[id]` | 조정/보상 | ⬜ |
| 5 | 점주 정산 | `/admin/settlements/owners` | 정산 처리 | ⬜ |
| 6 | 라이더 정산 | `/admin/settlements/riders` | 출금 처리 | ⬜ |
| 7 | 정산 내역 | `/admin/settlements/history` | 전체 이력 | ⬜ |

#### 11.5 프로모션 & 콘텐츠
| # | 작업 | URL | 기능 | 상태 |
|---|------|-----|------|------|
| 1 | 쿠폰 관리 | `/admin/coupons` | 플랫폼 쿠폰 | ⬜ |
| 2 | 이벤트 관리 | `/admin/events` | 프로모션 | ⬜ |
| 3 | 배너 관리 | `/admin/banners` | 홈 배너 | ⬜ |
| 4 | 공지사항 관리 | `/admin/notices` | 공지 CRUD | ⬜ |
| 5 | FAQ 관리 | `/admin/faq` | FAQ CRUD | ⬜ |

#### 11.6 시스템 설정 & 통계
| # | 작업 | URL | 기능 | 상태 |
|---|------|-----|------|------|
| 1 | 수수료 설정 | `/admin/settings/fees` | 수수료율 | ⬜ |
| 2 | 배달비 정책 | `/admin/settings/delivery` | 배달비 규칙 | ⬜ |
| 3 | 매출 분석 | `/admin/analytics/sales` | 매출 차트 | ⬜ |
| 4 | 사용자 분석 | `/admin/analytics/users` | 가입/이탈 | ⬜ |
| 5 | 지역별 분석 | `/admin/analytics/regions` | 지역 통계 | ⬜ |

---

### 🔔 Phase 12: 실시간 기능 (Realtime)

> **의존성**: Phase 11 완료 필요

#### 12.1 실시간 알림
| # | 작업 | 기능 | 상태 |
|---|------|------|------|
| 1 | Supabase Realtime 설정 | 연결 설정 | ⬜ |
| 2 | 주문 상태 변경 알림 | 실시간 구독 | ⬜ |
| 3 | 새 주문 알림 (점주) | 푸시 알림 | ⬜ |
| 4 | 배달 요청 알림 (라이더) | 푸시 알림 | ⬜ |
| 5 | 알림 센터 | `/notifications` | ⬜ |
| 6 | 알림 상세 | `/notifications/[id]` | ⬜ |

#### 12.2 채팅 시스템
| # | 작업 | URL | 기능 | 상태 |
|---|------|-----|------|------|
| 1 | 채팅 테이블 생성 | DB 스키마 | ⬜ |
| 2 | 채팅 목록 | `/chat` | 대화 목록 | ⬜ |
| 3 | 1:1 채팅방 | `/chat/[roomId]` | 실시간 메시지 | ⬜ |
| 4 | 주문별 채팅 | `/chat/order/[orderId]` | 3자 채팅 | ⬜ |
| 5 | 이미지 전송 | - | 사진 첨부 | ⬜ |
| 6 | 읽음 확인 | - | 읽음 표시 | ⬜ |

#### 12.3 라이더 위치 추적
| # | 작업 | 기능 | 상태 |
|---|------|------|------|
| 1 | 위치 업데이트 API | GPS 위치 전송 | ⬜ |
| 2 | 실시간 위치 구독 | 고객 측 구독 | ⬜ |
| 3 | 지도 위치 표시 | 마커 업데이트 | ⬜ |

---

### 📢 Phase 13: 광고 시스템 (Advertisement)

> **의존성**: Phase 9 (점주) 완료 필요

#### 13.1 광고 플랜 & 결제
| # | 작업 | URL | 기능 | 상태 |
|---|------|-----|------|------|
| 1 | 광고 플랜 페이지 | `/owner/ads` | 플랜 소개 | ⬜ |
| 2 | 플랜 선택 | `/owner/ads/plan` | Basic/Premium/Exclusive | ⬜ |
| 3 | 광고 결제 | `/owner/ads/payment` | 토스페이먼츠 | ⬜ |
| 4 | 광고 관리 | `/owner/ads/manage` | 현재 광고 | ⬜ |
| 5 | 광고 효과 분석 | `/owner/ads/analytics` | 노출/클릭/주문 | ⬜ |

#### 13.2 광고 노출 로직
| # | 작업 | 기능 | 상태 |
|---|------|------|------|
| 1 | 광고 우선순위 정렬 | 검색 결과 정렬 | ⬜ |
| 2 | 광고 배지 표시 | "광고" 라벨 | ⬜ |
| 3 | 광고 만료 처리 | 자동 비활성화 | ⬜ |

#### 13.3 관리자 광고 관리
| # | 작업 | URL | 기능 | 상태 |
|---|------|-----|------|------|
| 1 | 광고 현황 | `/admin/ads` | 전체 광고 | ⬜ |
| 2 | 광고 승인/거절 | `/admin/ads/[id]` | 심사 | ⬜ |
| 3 | 광고 매출 분석 | `/admin/ads/analytics` | 수익 통계 | ⬜ |

---

### 🎁 Phase 14: 쿠폰 & 프로모션 (Coupon)

> **의존성**: Phase 7 (주문) 완료 필요

#### 14.1 쿠폰 시스템
| # | 작업 | 기능 | 상태 |
|---|------|------|------|
| 1 | 쿠폰 테이블 생성 | DB 스키마 | ⬜ |
| 2 | 쿠폰 발급 (관리자) | 플랫폼 쿠폰 | ⬜ |
| 3 | 쿠폰 발급 (점주) | 가게 쿠폰 | ⬜ |
| 4 | 쿠폰 다운로드 | 사용자 획득 | ⬜ |
| 5 | 쿠폰 적용 | 주문 시 할인 | ⬜ |
| 6 | 쿠폰 만료 처리 | 자동 만료 | ⬜ |

#### 14.2 포인트 시스템
| # | 작업 | 기능 | 상태 |
|---|------|------|------|
| 1 | 포인트 테이블 생성 | DB 스키마 | ⬜ |
| 2 | 포인트 적립 | 주문 완료 시 | ⬜ |
| 3 | 포인트 사용 | 결제 시 차감 | ⬜ |
| 4 | 포인트 내역 | 적립/사용 기록 | ⬜ |

---

### 🚀 Phase 15: 최적화 & 배포 (Optimization)

> **의존성**: 모든 Phase 완료 필요

#### 15.1 성능 최적화
| # | 작업 | 기능 | 상태 |
|---|------|------|------|
| 1 | 이미지 최적화 | next/image 사용 | ⬜ |
| 2 | 코드 스플리팅 | 동적 import | ⬜ |
| 3 | API 캐싱 | TanStack Query | ⬜ |
| 4 | 정적 생성 | ISR/SSG | ⬜ |
| 5 | 번들 분석 | @next/bundle-analyzer | ⬜ |

#### 15.2 SEO 최적화
| # | 작업 | 기능 | 상태 |
|---|------|------|------|
| 1 | 메타데이터 설정 | title, description | ⬜ |
| 2 | Open Graph 태그 | 소셜 미리보기 | ⬜ |
| 3 | 사이트맵 생성 | sitemap.xml | ⬜ |
| 4 | robots.txt | 크롤링 규칙 | ⬜ |
| 5 | 구조화된 데이터 | JSON-LD | ⬜ |

#### 15.3 테스트
| # | 작업 | 기능 | 상태 |
|---|------|------|------|
| 1 | 단위 테스트 | Jest + RTL | ⬜ |
| 2 | 통합 테스트 | API 테스트 | ⬜ |
| 3 | E2E 테스트 | Playwright | ⬜ |
| 4 | 커버리지 80% 달성 | 품질 기준 | ⬜ |

#### 15.4 품질 검사
| # | 작업 | 기능 | 상태 |
|---|------|------|------|
| 1 | SonarQube 검사 | 코드 품질 | ⬜ |
| 2 | 보안 취약점 검사 | OWASP | ⬜ |
| 3 | 접근성 검사 | a11y | ⬜ |
| 4 | 성능 검사 | Lighthouse | ⬜ |

#### 15.5 배포
| # | 작업 | 기능 | 상태 |
|---|------|------|------|
| 1 | 환경변수 설정 | Vercel 환경변수 | ⬜ |
| 2 | 도메인 연결 | 커스텀 도메인 | ⬜ |
| 3 | CI/CD 파이프라인 | GitHub Actions | ⬜ |
| 4 | 모니터링 설정 | Vercel Analytics | ⬜ |
| 5 | 에러 추적 | Sentry | ⬜ |

---

### 📊 개발 순서 요약

```
Phase 1: 프로젝트 기반 설정 ──────────────────────────────┐
                                                          │
Phase 2: 인증 시스템 ───────────┬───────────────────────────┤
                               │                          │
Phase 3: 위치 기반 시스템 ──────┤ (병행 가능)              │
                               │                          │
Phase 4: 공통 UI 컴포넌트 ──────┘                          │
                                                          ▼
Phase 5: 고객 - 홈 & 검색 ────────────────────────────────────┐
                                                             │
Phase 6: 고객 - 음식점 & 메뉴 ─────────────────────────────────┤
                                                             │
Phase 7: 고객 - 장바구니 & 주문 ───────────────────────────────┤
                                                             │
Phase 8: 고객 - 리뷰 & 마이페이지 ─────────────────────────────┘
                                                             │
Phase 9: 점주 기능 ────────────────────────────────────────────┤
                                                             │
Phase 10: 라이더 기능 ─────────────────────────────────────────┤
                                                             │
Phase 11: 관리자 기능 ─────────────────────────────────────────┘
                                                             │
Phase 12: 실시간 기능 ─────────┬─────────────────────────────────┤
                              │                               │
Phase 13: 광고 시스템 ─────────┤ (Phase 9 이후 가능)           │
                              │                               │
Phase 14: 쿠폰 & 프로모션 ─────┘                               │
                                                             │
Phase 15: 최적화 & 배포 ───────────────────────────────────────┘
```

---

## 🗄️ DB 스키마 설계

### ERD 관계도
```
users (사용자)
  ├── addresses (주소) [1:N]
  ├── orders (주문) [1:N]
  └── reviews (리뷰) [1:N]

restaurants (식당)
  ├── owner: users [N:1]
  ├── menus (메뉴) [1:N]
  ├── orders (주문) [1:N]
  ├── reviews (리뷰) [1:N]
  └── advertisements (광고) [1:N]

orders (주문)
  ├── user: users [N:1]
  ├── restaurant: restaurants [N:1]
  ├── rider: riders [N:1]
  └── order_items (주문항목) [1:N]

riders (라이더)
  ├── user: users [1:1]
  └── orders (배달) [1:N]
```

### 핵심 테이블 SQL
```sql
-- 📁 supabase/migrations/000_init.sql

-- 사용자
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('customer', 'owner', 'rider', 'admin')) DEFAULT 'customer',
  avatar_url TEXT,
  default_address_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 주소
CREATE TABLE addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  label TEXT, -- 집, 회사 등
  address TEXT NOT NULL,
  detail TEXT,
  lat FLOAT NOT NULL,
  lng FLOAT NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 카테고리
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  icon TEXT,
  sort_order INTEGER DEFAULT 0
);

-- 식당
CREATE TABLE restaurants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES users(id),
  name TEXT NOT NULL,
  description TEXT,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  lat FLOAT NOT NULL,
  lng FLOAT NOT NULL,
  category_id UUID REFERENCES categories(id),
  min_order_amount INTEGER DEFAULT 0,
  delivery_fee INTEGER DEFAULT 0,
  estimated_delivery_time INTEGER DEFAULT 30, -- 분
  business_hours JSONB, -- {"mon": {"open": "09:00", "close": "22:00"}, ...}
  is_open BOOLEAN DEFAULT true,
  rating FLOAT DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  image_url TEXT,
  -- 광고 관련
  is_advertised BOOLEAN DEFAULT false,
  ad_priority INTEGER DEFAULT 0,
  ad_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 메뉴
CREATE TABLE menus (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price INTEGER NOT NULL,
  image_url TEXT,
  is_available BOOLEAN DEFAULT true,
  is_popular BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 메뉴 옵션
CREATE TABLE menu_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_id UUID NOT NULL REFERENCES menus(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price INTEGER DEFAULT 0,
  is_required BOOLEAN DEFAULT false
);

-- 주문
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id),
  rider_id UUID REFERENCES users(id),
  status TEXT NOT NULL CHECK (status IN (
    'pending', 'confirmed', 'preparing', 'ready',
    'picked_up', 'delivering', 'delivered', 'cancelled'
  )) DEFAULT 'pending',
  total_amount INTEGER NOT NULL,
  delivery_fee INTEGER DEFAULT 0,
  delivery_address TEXT NOT NULL,
  delivery_detail TEXT,
  delivery_lat FLOAT NOT NULL,
  delivery_lng FLOAT NOT NULL,
  special_instructions TEXT,
  estimated_delivery_time TIMESTAMPTZ,
  actual_delivery_time TIMESTAMPTZ,
  cancelled_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 주문 항목
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  menu_id UUID NOT NULL REFERENCES menus(id),
  menu_name TEXT NOT NULL, -- 스냅샷
  quantity INTEGER NOT NULL,
  price INTEGER NOT NULL, -- 스냅샷
  options JSONB DEFAULT '[]', -- 선택한 옵션 스냅샷
  special_instructions TEXT
);

-- 리뷰
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id),
  order_id UUID REFERENCES orders(id),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  content TEXT,
  images TEXT[],
  owner_reply TEXT,
  owner_reply_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 라이더
CREATE TABLE riders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id),
  vehicle_type TEXT CHECK (vehicle_type IN ('bike', 'motorcycle', 'car')),
  license_number TEXT,
  current_lat FLOAT,
  current_lng FLOAT,
  is_available BOOLEAN DEFAULT false,
  total_deliveries INTEGER DEFAULT 0,
  rating FLOAT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 광고
CREATE TABLE advertisements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  plan_type TEXT NOT NULL CHECK (plan_type IN ('basic', 'premium', 'exclusive')),
  amount INTEGER NOT NULL,
  start_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  end_date TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN DEFAULT true,
  payment_status TEXT NOT NULL CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  payment_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 정산
CREATE TABLE settlements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID REFERENCES restaurants(id),
  rider_id UUID REFERENCES users(id),
  order_id UUID REFERENCES orders(id),
  amount INTEGER NOT NULL,
  fee INTEGER DEFAULT 0, -- 수수료
  net_amount INTEGER NOT NULL, -- 실수령액
  status TEXT CHECK (status IN ('pending', 'completed')) DEFAULT 'pending',
  settled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_restaurants_location ON restaurants USING gist (
  ST_SetSRID(ST_MakePoint(lng, lat), 4326)
);
CREATE INDEX idx_restaurants_category ON restaurants(category_id);
CREATE INDEX idx_restaurants_advertised ON restaurants(is_advertised, ad_priority);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_restaurant ON orders(restaurant_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_menus_restaurant ON menus(restaurant_id);
```

### RLS 정책
```sql
-- 📁 supabase/migrations/001_rls.sql

-- RLS 활성화
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- 사용자: 자신의 데이터만 조회/수정
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid() = id);

-- 주소: 자신의 주소만 관리
CREATE POLICY "Users can manage own addresses" ON addresses
  FOR ALL USING (auth.uid() = user_id);

-- 식당: 누구나 조회, 점주만 수정
CREATE POLICY "Anyone can view restaurants" ON restaurants
  FOR SELECT USING (true);

CREATE POLICY "Owners can manage own restaurant" ON restaurants
  FOR ALL USING (auth.uid() = owner_id);

-- 메뉴: 누구나 조회
CREATE POLICY "Anyone can view menus" ON menus
  FOR SELECT USING (true);

-- 주문: 관련자만 조회
CREATE POLICY "Users can view own orders" ON orders
  FOR SELECT USING (
    auth.uid() = user_id OR
    auth.uid() = rider_id OR
    auth.uid() IN (SELECT owner_id FROM restaurants WHERE id = restaurant_id)
  );
```

---

## 🚨 절대 규칙 (MUST FOLLOW)

### 1. TypeScript 엄격 모드
```typescript
// ❌ 절대 금지
any                          // any 타입 사용 금지
unknown                      // unknown 타입 사용 금지 (타입 가드 없이)
// @ts-ignore               // 타입 무시 금지
// @ts-nocheck              // 타입 체크 비활성화 금지
as SomeType                  // 타입 단언 남용 금지
!                           // non-null assertion 남용 금지

// ✅ 반드시 준수
interface Props { }          // 모든 props 타입 정의
function fn(): ReturnType    // 모든 함수 반환 타입 명시
const value: Type = ...      // 추론 어려운 경우 타입 명시
```

### 2. 절대 하지 말 것
```typescript
// ❌ 커밋 금지 항목
console.log()                // 디버그용 로그 (커밋 전 삭제)
console.error()              // 에러는 proper logging 사용
alert()                      // 사용자에게 toast 사용
"하드코딩 문자열"             // 상수로 분리 (constants.ts)
style={{ }}                  // 인라인 스타일 금지 (Tailwind 사용)
<div> 남용                   // 시맨틱 태그 사용 (section, article, nav)
편법 코드                    // 정석 코드만 허용
```

### 3. 파일 네이밍 규칙
```
📁 폴더: kebab-case          예: order-history/
📄 컴포넌트: PascalCase.tsx   예: OrderCard.tsx
📄 훅: camelCase.ts          예: useOrder.ts (use로 시작)
📄 유틸: camelCase.ts        예: formatPrice.ts
📄 타입: types.ts            예: order.types.ts
📄 상수: constants.ts        예: UPPERCASE_SNAKE_CASE 변수명
📄 스토어: store.ts          예: cart.store.ts
```

### 4. Import 순서 (자동 정렬)
```typescript
// 1. React/Next.js
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

// 2. 외부 라이브러리
import { useQuery } from '@tanstack/react-query'
import { z } from 'zod'

// 3. 내부 모듈 (@/ alias)
import { Button } from '@/components/ui'
import { useAuth } from '@/hooks/useAuth'
import { formatPrice } from '@/lib/utils'

// 4. 타입 (type-only import)
import type { Order } from '@/types'

// 5. 스타일/에셋
import './styles.css'
```

---

## 🌐 환경 변수

### .env.local (Git 제외)
```env
# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=달리

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_ACCESS_TOKEN=your_access_token
SUPABASE_PROJECT_ID=your_project_id
SUPABASE_DB_PASSWORD=your_db_password

# Maps (카카오)
NEXT_PUBLIC_KAKAO_MAP_KEY=your_kakao_javascript_key
NEXT_PUBLIC_KAKAO_REST_KEY=your_kakao_rest_key

# Payment (토스페이먼츠)
NEXT_PUBLIC_TOSS_CLIENT_KEY=your_client_key
TOSS_SECRET_KEY=your_secret_key

# GitHub
GITHUB_REPO=your_github_repo_url
```

---

## 🚀 명령어

```bash
# 개발
npm run dev           # 개발 서버 (localhost:3000)

# 검증
npm run type-check    # TypeScript 검사
npm run lint          # ESLint 검사
npm run lint:fix      # ESLint 자동 수정
npm run format        # Prettier 포맷팅
npm run test          # 테스트 실행
npm run test:coverage # 커버리지 리포트
npm run sonar:check   # SonarQube 검사
npm run validate      # 전체 검증 (type + lint + test + sonar)

# 빌드 & 배포
npm run build         # 프로덕션 빌드
npm run start         # 프로덕션 실행
vercel                # Vercel 프리뷰 배포
vercel --prod         # Vercel 프로덕션 배포

# Supabase
npm run db:types      # DB 타입 재생성
npm run db:migrate    # 마이그레이션 실행
npm run db:reset      # DB 초기화
```

---

## ✅ 작업 체크리스트

### 기능 개발 전
- [ ] Sequential Thinking MCP로 기획/설계 완료
- [ ] DB 스키마 설계 검토
- [ ] API 엔드포인트 설계
- [ ] 컴포넌트 구조 설계

### 코드 작성 시
- [ ] TypeScript 타입 완벽하게 정의
- [ ] Zod 스키마로 입력값 검증
- [ ] 에러 처리 (try-catch) 완료
- [ ] 로딩 상태 처리
- [ ] 빈 상태 (Empty State) 처리
- [ ] 반응형 디자인 (Mobile/PC)
- [ ] 접근성 (a11y) 확인

### 커밋 전
- [ ] console.log 제거
- [ ] 테스트 작성 및 통과
- [ ] SonarQube 품질 게이트 100% 통과
- [ ] 커밋 메시지 규칙 준수

---

**🧠 Claude Code는 모든 작업 전 Sequential Thinking MCP를 사용하여 기획/설계를 수행해야 합니다.**
**🔍 모든 코드는 SonarQube 100% 품질 게이트를 통과해야 합니다.**
**📱 모든 UI는 PC와 모바일 환경에 각각 최적화되어야 합니다.**
**✨ 편법 코드는 절대 불허, 정석 코드만 허용됩니다.**
