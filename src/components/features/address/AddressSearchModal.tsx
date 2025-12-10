'use client'

import { useState, useCallback } from 'react'
import { X, MapPin, Navigation, Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Spinner } from '@/components/ui/Spinner'
import { useAddressSearch } from '@/hooks/useAddressSearch'
import { useCurrentLocation } from '@/hooks/useCurrentLocation'
import { getCoordinatesFromAddress } from '@/lib/kakao/geocoding'
import type { DaumAddressData, AddressInput } from '@/types/address.types'

interface AddressSearchModalProps {
  readonly isOpen: boolean
  readonly onClose: () => void
  readonly onSelect: (address: AddressInput) => void
}

type Step = 'search' | 'detail'

export function AddressSearchModal({
  isOpen,
  onClose,
  onSelect,
}: AddressSearchModalProps) {
  const [step, setStep] = useState<Step>('search')
  const [selectedAddress, setSelectedAddress] = useState<string>('')
  const [detailAddress, setDetailAddress] = useState('')
  const [label, setLabel] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { state: locationState, getCurrentLocation } = useCurrentLocation()

  // 다음 주소 검색 완료 핸들러
  const handleAddressComplete = useCallback((data: DaumAddressData) => {
    // 도로명 주소 우선
    const address = data.roadAddress || data.jibunAddress || data.address
    setSelectedAddress(address)
    setStep('detail')
    setError(null)
  }, [])

  const { isLoaded, openSearch } = useAddressSearch({
    onComplete: handleAddressComplete,
  })

  // 현재 위치로 주소 설정
  const handleCurrentLocation = async () => {
    await getCurrentLocation()

    if (locationState.status === 'success' && locationState.address) {
      setSelectedAddress(locationState.address)
      setStep('detail')
      setError(null)
    }
  }

  // 최종 주소 선택 완료
  const handleComplete = async () => {
    if (!selectedAddress) return

    setIsLoading(true)
    setError(null)

    try {
      // 좌표 가져오기
      const { lat, lng } = await getCoordinatesFromAddress(selectedAddress)

      onSelect({
        label: label || undefined,
        address: selectedAddress,
        detail: detailAddress || undefined,
        lat,
        lng,
      })

      // 상태 초기화
      resetState()
      onClose()
    } catch (err) {
      setError('주소 좌표를 가져오는데 실패했습니다. 다시 시도해주세요.')
    } finally {
      setIsLoading(false)
    }
  }

  // 상태 초기화
  const resetState = () => {
    setStep('search')
    setSelectedAddress('')
    setDetailAddress('')
    setLabel('')
    setError(null)
  }

  // 모달 닫기
  const handleClose = () => {
    resetState()
    onClose()
  }

  // 뒤로가기
  const handleBack = () => {
    setStep('search')
    setSelectedAddress('')
    setDetailAddress('')
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50">
      {/* 오버레이 */}
      <button
        type="button"
        className="absolute inset-0 bg-black/50 border-none cursor-default p-0 m-0"
        onClick={handleClose}
        onKeyDown={(e) => {
          if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            handleClose()
          }
        }}
        aria-label="모달 닫기"
        tabIndex={0}
      />

      {/* 모달 */}
      <div className="absolute inset-x-0 bottom-0 bg-white rounded-t-3xl max-h-[90vh] flex flex-col animate-slide-up">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--color-neutral-100)]">
          <h2 className="text-lg font-bold">
            {step === 'search' ? '주소 검색' : '상세 주소 입력'}
          </h2>
          <button
            onClick={handleClose}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[var(--color-neutral-100)]"
          >
            <X className="w-6 h-6 text-[var(--color-neutral-500)]" />
          </button>
        </div>

        {/* 콘텐츠 */}
        <div className="flex-1 overflow-y-auto p-4">
          {step === 'search' ? (
            <div className="space-y-4">
              {/* 현재 위치 버튼 */}
              <button
                onClick={handleCurrentLocation}
                disabled={locationState.status === 'loading'}
                className={cn(
                  'w-full flex items-center gap-3 p-4 rounded-xl border border-[var(--color-neutral-200)]',
                  'hover:border-[var(--color-primary-500)] hover:bg-[var(--color-primary-50)]',
                  'transition-colors'
                )}
              >
                {locationState.status === 'loading' ? (
                  <Spinner size="sm" />
                ) : (
                  <Navigation className="w-5 h-5 text-[var(--color-primary-500)]" />
                )}
                <span className="font-medium">현재 위치로 설정</span>
              </button>

              {locationState.error && (
                <p className="text-sm text-red-500">{locationState.error}</p>
              )}

              {/* 주소 검색 버튼 */}
              <button
                onClick={openSearch}
                disabled={!isLoaded}
                className={cn(
                  'w-full flex items-center gap-3 p-4 rounded-xl border border-[var(--color-neutral-200)]',
                  'hover:border-[var(--color-primary-500)] hover:bg-[var(--color-primary-50)]',
                  'transition-colors'
                )}
              >
                <Search className="w-5 h-5 text-[var(--color-neutral-500)]" />
                <span className="text-[var(--color-neutral-500)]">
                  {isLoaded ? '주소 검색하기' : '주소 검색 로딩 중...'}
                </span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* 선택된 주소 표시 */}
              <div className="p-4 bg-[var(--color-neutral-50)] rounded-xl">
                <div className="flex items-start gap-2">
                  <MapPin className="w-5 h-5 text-[var(--color-primary-500)] mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">{selectedAddress}</p>
                    <button
                      onClick={handleBack}
                      className="text-sm text-[var(--color-primary-500)] mt-1"
                    >
                      주소 다시 검색
                    </button>
                  </div>
                </div>
              </div>

              {/* 상세 주소 입력 */}
              <Input
                label="상세 주소"
                placeholder="동/호수, 건물명 등"
                value={detailAddress}
                onChange={(e) => setDetailAddress(e.target.value)}
              />

              {/* 주소 별칭 (선택) */}
              <div>
                <label className="block text-sm font-medium text-[var(--color-neutral-700)] mb-2">
                  주소 별칭 (선택)
                </label>
                <div className="flex gap-2">
                  {['집', '회사', '학교'].map((item) => (
                    <button
                      key={item}
                      onClick={() => setLabel(label === item ? '' : item)}
                      className={cn(
                        'px-4 py-2 rounded-full text-sm font-medium',
                        'border transition-colors',
                        label === item
                          ? 'border-[var(--color-primary-500)] bg-[var(--color-primary-500)] text-white'
                          : 'border-[var(--color-neutral-200)] text-[var(--color-neutral-700)] hover:border-[var(--color-neutral-400)]'
                      )}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              {/* 에러 메시지 */}
              {error && (
                <p className="text-sm text-red-500">{error}</p>
              )}
            </div>
          )}
        </div>

        {/* 하단 버튼 */}
        {step === 'detail' && (
          <div className="p-4 border-t border-[var(--color-neutral-100)] safe-area-bottom">
            <Button
              onClick={handleComplete}
              fullWidth
              size="lg"
              isLoading={isLoading}
              disabled={!selectedAddress}
            >
              이 주소로 설정
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
