import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Address, Coordinates } from '@/types/address.types'

interface LocationState {
  // 현재 선택된 배달 주소
  selectedAddress: Address | null
  // 현재 위치 좌표 (GPS)
  currentLocation: Coordinates | null
  // 최근 검색한 주소 목록
  recentAddresses: Address[]
}

interface LocationActions {
  setSelectedAddress: (address: Address | null) => void
  setCurrentLocation: (location: Coordinates | null) => void
  addRecentAddress: (address: Address) => void
  removeRecentAddress: (addressId: string) => void
  clearRecentAddresses: () => void
}

type LocationStore = LocationState & LocationActions

const MAX_RECENT_ADDRESSES = 5

export const useLocationStore = create<LocationStore>()(
  persist(
    (set) => ({
      // 초기 상태
      selectedAddress: null,
      currentLocation: null,
      recentAddresses: [],

      // 액션
      setSelectedAddress: (address) =>
        set({ selectedAddress: address }),

      setCurrentLocation: (location) =>
        set({ currentLocation: location }),

      addRecentAddress: (address) =>
        set((state) => {
          // 중복 제거
          const filtered = state.recentAddresses.filter(
            (a) => a.id !== address.id
          )
          // 최근 주소 앞에 추가
          const updated = [address, ...filtered].slice(0, MAX_RECENT_ADDRESSES)
          return { recentAddresses: updated }
        }),

      removeRecentAddress: (addressId) =>
        set((state) => ({
          recentAddresses: state.recentAddresses.filter(
            (a) => a.id !== addressId
          ),
        })),

      clearRecentAddresses: () =>
        set({ recentAddresses: [] }),
    }),
    {
      name: 'dalligo-location',
      partialize: (state) => ({
        selectedAddress: state.selectedAddress,
        recentAddresses: state.recentAddresses,
      }),
    }
  )
)
