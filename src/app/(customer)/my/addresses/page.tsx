'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Plus, MapPin, MoreVertical, Trash2, Edit2, Star } from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { AddressSearchModal } from '@/components/features/address'
import { useAddress } from '@/hooks/useAddress'
import { cn } from '@/lib/utils'
import type { Address, AddressInput } from '@/types/address.types'

export default function AddressesPage() {
  const router = useRouter()
  const {
    addresses,
    isLoading,
    addAddress,
    deleteAddress,
    setDefaultAddress,
  } = useAddress()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [activeMenu, setActiveMenu] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // 새 주소 추가
  const handleAddAddress = async (input: AddressInput) => {
    await addAddress(input)
  }

  // 주소 삭제
  const handleDelete = async (id: string) => {
    setDeletingId(id)
    await deleteAddress(id)
    setDeletingId(null)
    setActiveMenu(null)
  }

  // 기본 주소 설정
  const handleSetDefault = async (id: string) => {
    await setDefaultAddress(id)
    setActiveMenu(null)
  }

  // 메뉴 토글
  const toggleMenu = (id: string) => {
    setActiveMenu(activeMenu === id ? null : id)
  }

  return (
    <div className="min-h-screen bg-[var(--color-neutral-50)] flex flex-col">
      {/* 헤더 */}
      <header className="h-14 flex items-center px-4 bg-white border-b border-[var(--color-neutral-100)]">
        <button onClick={() => router.back()} className="p-2 -ml-2">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="flex-1 text-center text-lg font-semibold pr-8">
          주소 관리
        </h1>
      </header>

      <main className="flex-1 pb-24">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : addresses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="w-16 h-16 rounded-full bg-[var(--color-neutral-100)] flex items-center justify-center mb-4">
              <MapPin className="w-8 h-8 text-[var(--color-neutral-400)]" />
            </div>
            <p className="text-[var(--color-neutral-500)] text-center mb-6">
              저장된 배달 주소가 없습니다.<br />
              자주 사용하는 주소를 추가해보세요.
            </p>
            <Button onClick={() => setIsModalOpen(true)}>
              <Plus className="w-5 h-5 mr-2" />
              주소 추가하기
            </Button>
          </div>
        ) : (
          <div className="p-4 space-y-3">
            {addresses.map((address) => (
              <AddressItem
                key={address.id}
                address={address}
                isMenuOpen={activeMenu === address.id}
                isDeleting={deletingId === address.id}
                onToggleMenu={() => toggleMenu(address.id)}
                onSetDefault={() => handleSetDefault(address.id)}
                onDelete={() => handleDelete(address.id)}
              />
            ))}
          </div>
        )}
      </main>

      {/* 하단 버튼 */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-[var(--color-neutral-100)] safe-area-bottom">
        <Button
          fullWidth
          size="lg"
          onClick={() => setIsModalOpen(true)}
        >
          <Plus className="w-5 h-5 mr-2" />
          새 주소 추가
        </Button>
      </div>

      {/* 주소 검색 모달 */}
      <AddressSearchModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelect={handleAddAddress}
      />

      {/* 메뉴 닫기 오버레이 */}
      {activeMenu && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setActiveMenu(null)}
        />
      )}
    </div>
  )
}

// 주소 아이템 컴포넌트
interface AddressItemProps {
  address: Address
  isMenuOpen: boolean
  isDeleting: boolean
  onToggleMenu: () => void
  onSetDefault: () => void
  onDelete: () => void
}

function AddressItem({
  address,
  isMenuOpen,
  isDeleting,
  onToggleMenu,
  onSetDefault,
  onDelete,
}: AddressItemProps) {
  return (
    <div className="bg-white rounded-2xl p-4 relative">
      <div className="flex items-start gap-3">
        {/* 아이콘 */}
        <div
          className={cn(
            'w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0',
            address.isDefault
              ? 'bg-[var(--color-primary-500)] text-white'
              : 'bg-[var(--color-neutral-100)] text-[var(--color-neutral-500)]'
          )}
        >
          <MapPin className="w-5 h-5" />
        </div>

        {/* 주소 정보 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {address.label && (
              <span className="font-semibold">{address.label}</span>
            )}
            {address.isDefault && (
              <span className="px-2 py-0.5 text-2xs font-medium bg-[var(--color-primary-100)] text-[var(--color-primary-700)] rounded-full">
                기본
              </span>
            )}
          </div>
          <p className="text-sm text-[var(--color-neutral-700)]">
            {address.address}
          </p>
          {address.detail && (
            <p className="text-sm text-[var(--color-neutral-500)]">
              {address.detail}
            </p>
          )}
        </div>

        {/* 더보기 버튼 */}
        <button
          onClick={onToggleMenu}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[var(--color-neutral-100)]"
        >
          <MoreVertical className="w-5 h-5 text-[var(--color-neutral-400)]" />
        </button>
      </div>

      {/* 드롭다운 메뉴 */}
      {isMenuOpen && (
        <div className="absolute right-4 top-14 z-20 bg-white rounded-xl shadow-lg border border-[var(--color-neutral-100)] py-1 min-w-[140px]">
          {!address.isDefault && (
            <button
              onClick={onSetDefault}
              className="w-full flex items-center gap-2 px-4 py-3 text-sm hover:bg-[var(--color-neutral-50)]"
            >
              <Star className="w-4 h-4" />
              기본 주소로 설정
            </button>
          )}
          <button
            onClick={onDelete}
            disabled={isDeleting}
            className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-500 hover:bg-red-50"
          >
            {isDeleting ? (
              <Spinner size="sm" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
            삭제
          </button>
        </div>
      )}
    </div>
  )
}
