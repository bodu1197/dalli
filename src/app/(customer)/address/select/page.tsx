'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Plus, Navigation } from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { AddressCard, AddressSearchModal } from '@/components/features/address'
import { useAddress } from '@/hooks/useAddress'
import { useCurrentLocation } from '@/hooks/useCurrentLocation'
import { useLocationStore } from '@/stores/location.store'
import type { AddressInput, Address } from '@/types/address.types'

export default function AddressSelectPage() {
  const router = useRouter()
  const { addresses, isLoading, addAddress } = useAddress()
  const { selectedAddress, setSelectedAddress, recentAddresses } = useLocationStore()
  const { state: locationState, getCurrentLocation } = useCurrentLocation()

  const [isModalOpen, setIsModalOpen] = useState(false)

  // 주소 선택
  const handleSelectAddress = (address: Address) => {
    setSelectedAddress(address)
    router.back()
  }

  // 새 주소 추가
  const handleAddAddress = async (input: AddressInput) => {
    const newAddress = await addAddress(input)
    if (newAddress) {
      setSelectedAddress(newAddress)
      router.back()
    }
  }

  // 현재 위치로 설정
  const handleCurrentLocation = async () => {
    await getCurrentLocation()
    if (locationState.coordinates && locationState.address) {
      // 임시 주소 객체 생성 (DB 저장 없이)
      const tempAddress: Address = {
        id: 'current-location',
        userId: '',
        label: '현재 위치',
        address: locationState.address,
        detail: null,
        lat: locationState.coordinates.lat,
        lng: locationState.coordinates.lng,
        isDefault: false,
        createdAt: new Date().toISOString(),
      }
      setSelectedAddress(tempAddress)
      router.back()
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* 헤더 */}
      <header className="h-14 flex items-center px-4 border-b border-[var(--color-neutral-100)]">
        <button onClick={() => router.back()} className="p-2 -ml-2">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="flex-1 text-center text-lg font-semibold pr-8">
          주소 설정
        </h1>
      </header>

      <main className="flex-1 px-4 py-6">
        {/* 현재 위치 버튼 */}
        <button
          onClick={handleCurrentLocation}
          disabled={locationState.status === 'loading'}
          className="w-full flex items-center gap-3 p-4 mb-4 rounded-xl border border-[var(--color-neutral-200)] hover:border-[var(--color-primary-500)] hover:bg-[var(--color-primary-50)] transition-colors"
        >
          {locationState.status === 'loading' ? (
            <Spinner size="sm" />
          ) : (
            <Navigation className="w-5 h-5 text-[var(--color-primary-500)]" />
          )}
          <span className="font-medium">현재 위치로 설정</span>
        </button>

        {locationState.error && (
          <p className="text-sm text-red-500 mb-4">{locationState.error}</p>
        )}

        {/* 저장된 주소 목록 */}
        <section className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-medium text-[var(--color-neutral-500)]">
              저장된 주소
            </h2>
            <Link
              href="/my/addresses"
              className="text-sm text-[var(--color-primary-500)]"
            >
              관리
            </Link>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Spinner size="md" />
            </div>
          ) : addresses.length > 0 ? (
            <div className="space-y-3">
              {addresses.map((address) => (
                <AddressCard
                  key={address.id}
                  address={address}
                  isSelected={selectedAddress?.id === address.id}
                  onSelect={() => handleSelectAddress(address)}
                />
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-[var(--color-neutral-500)]">
              <p>저장된 주소가 없습니다</p>
            </div>
          )}
        </section>

        {/* 최근 사용한 주소 */}
        {recentAddresses.length > 0 && (
          <section className="mb-6">
            <h2 className="text-sm font-medium text-[var(--color-neutral-500)] mb-3">
              최근 사용한 주소
            </h2>
            <div className="space-y-3">
              {recentAddresses
                .filter((a) => !addresses.find((sa) => sa.id === a.id))
                .map((address) => (
                  <AddressCard
                    key={address.id}
                    address={address}
                    isSelected={selectedAddress?.id === address.id}
                    onSelect={() => handleSelectAddress(address)}
                  />
                ))}
            </div>
          </section>
        )}

        {/* 새 주소 추가 버튼 */}
        <Button
          variant="outline"
          fullWidth
          size="lg"
          onClick={() => setIsModalOpen(true)}
        >
          <Plus className="w-5 h-5 mr-2" />
          새 주소 추가
        </Button>
      </main>

      {/* 주소 검색 모달 */}
      <AddressSearchModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelect={handleAddAddress}
      />
    </div>
  )
}
