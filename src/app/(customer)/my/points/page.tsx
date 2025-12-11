'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { ArrowLeft, TrendingUp, TrendingDown, Info, Loader2, AlertCircle } from 'lucide-react'
import { usePointInfo, usePointTransactions } from '@/hooks/usePoint'
import { POINT_POLICY } from '@/types/point.types'
import type { PointTransaction, PointTransactionType } from '@/types/point.types'

type TabType = 'all' | 'earn' | 'use'

export default function PointsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('all')

  const { pointInfo, isLoading: isLoadingInfo, error: infoError, refetch: refetchInfo } = usePointInfo()
  const {
    transactions,
    isLoading: isLoadingTx,
    error: txError,
    hasMore,
    loadMore,
    refetch: refetchTx
  } = usePointTransactions(20)

  const filteredTransactions =
    activeTab === 'all'
      ? transactions
      : transactions.filter((tx) =>
          activeTab === 'earn'
            ? tx.type === 'earn' || tx.type === 'admin_add'
            : tx.type === 'use' || tx.type === 'admin_deduct' || tx.type === 'expire'
        )

  const handleRefresh = useCallback(() => {
    refetchInfo()
    refetchTx()
  }, [refetchInfo, refetchTx])

  const isLoading = isLoadingInfo || isLoadingTx
  const error = infoError || txError

  return (
    <div className="min-h-screen bg-[var(--color-neutral-50)]">
      {/* 헤더 */}
      <header className="sticky top-0 z-30 bg-white border-b border-[var(--color-neutral-100)]">
        <div className="flex items-center px-4 h-14">
          <Link
            href="/my"
            className="w-10 h-10 flex items-center justify-center -ml-2"
          >
            <ArrowLeft className="w-6 h-6 text-[var(--color-neutral-700)]" />
          </Link>
          <h1 className="flex-1 text-center font-bold text-[var(--color-neutral-900)]">
            포인트
          </h1>
          <div className="w-10" />
        </div>
      </header>

      {/* 포인트 잔액 카드 */}
      <section className="p-4 bg-white">
        {isLoadingInfo ? (
          <div className="bg-gradient-to-r from-[var(--color-primary-500)] to-[var(--color-primary-600)] rounded-2xl p-6 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          </div>
        ) : infoError ? (
          <div className="bg-[var(--color-error-50)] rounded-2xl p-6 text-center">
            <AlertCircle className="w-8 h-8 text-[var(--color-error-500)] mx-auto mb-2" />
            <p className="text-[var(--color-error-600)] mb-3">{infoError}</p>
            <button
              onClick={handleRefresh}
              className="px-4 py-2 bg-[var(--color-primary-500)] text-white rounded-lg"
            >
              다시 시도
            </button>
          </div>
        ) : (
          <div className="bg-gradient-to-r from-[var(--color-primary-500)] to-[var(--color-primary-600)] rounded-2xl p-6 text-white">
            <p className="text-sm opacity-80 mb-2">사용 가능한 포인트</p>
            <p className="text-3xl font-bold mb-4">
              {(pointInfo?.balance ?? 0).toLocaleString()}P
            </p>

            <div className="flex gap-4 text-sm">
              <div>
                <p className="opacity-70">총 적립</p>
                <p className="font-semibold">+{(pointInfo?.totalEarned ?? 0).toLocaleString()}P</p>
              </div>
              <div>
                <p className="opacity-70">총 사용</p>
                <p className="font-semibold">-{(pointInfo?.totalUsed ?? 0).toLocaleString()}P</p>
              </div>
            </div>

            {/* 이번달 만료 예정 경고 */}
            {(pointInfo?.expiringThisMonth ?? 0) > 0 && (
              <div className="mt-4 p-3 bg-white/10 rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">
                  이번 달 {pointInfo?.expiringThisMonth.toLocaleString()}P 소멸 예정
                </span>
              </div>
            )}
          </div>
        )}

        {/* 포인트 안내 */}
        <div className="mt-4 p-4 bg-[var(--color-neutral-50)] rounded-xl flex items-start gap-3">
          <Info className="w-5 h-5 text-[var(--color-primary-500)] flex-shrink-0 mt-0.5" />
          <div className="text-sm text-[var(--color-neutral-600)]">
            <p className="font-medium text-[var(--color-neutral-700)] mb-1">
              포인트 적립 안내
            </p>
            <ul className="space-y-1 text-xs">
              <li>• 주문 금액의 {POINT_POLICY.EARN_RATE}% 포인트 적립</li>
              <li>• 최소 {POINT_POLICY.MIN_USE_AMOUNT.toLocaleString()}P부터 사용 가능</li>
              <li>• {POINT_POLICY.USE_UNIT}P 단위로 사용 가능</li>
              <li>• 포인트는 적립일로부터 {POINT_POLICY.EXPIRY_DAYS}일간 유효</li>
            </ul>
          </div>
        </div>
      </section>

      {/* 탭 */}
      <div className="flex bg-white border-b border-[var(--color-neutral-100)] mt-3">
        <button
          onClick={() => setActiveTab('all')}
          className={`flex-1 py-3 text-center font-medium border-b-2 transition-colors ${
            activeTab === 'all'
              ? 'text-[var(--color-neutral-900)] border-[var(--color-neutral-900)]'
              : 'text-[var(--color-neutral-400)] border-transparent'
          }`}
        >
          전체
        </button>
        <button
          onClick={() => setActiveTab('earn')}
          className={`flex-1 py-3 text-center font-medium border-b-2 transition-colors ${
            activeTab === 'earn'
              ? 'text-[var(--color-neutral-900)] border-[var(--color-neutral-900)]'
              : 'text-[var(--color-neutral-400)] border-transparent'
          }`}
        >
          적립
        </button>
        <button
          onClick={() => setActiveTab('use')}
          className={`flex-1 py-3 text-center font-medium border-b-2 transition-colors ${
            activeTab === 'use'
              ? 'text-[var(--color-neutral-900)] border-[var(--color-neutral-900)]'
              : 'text-[var(--color-neutral-400)] border-transparent'
          }`}
        >
          사용
        </button>
      </div>

      {/* 포인트 내역 */}
      <main className="pb-20">
        {isLoadingTx && transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[40vh]">
            <Loader2 className="w-8 h-8 text-[var(--color-primary-500)] animate-spin mb-4" />
            <p className="text-[var(--color-neutral-500)]">로딩 중...</p>
          </div>
        ) : txError ? (
          <div className="flex flex-col items-center justify-center min-h-[40vh]">
            <p className="text-[var(--color-error-500)] mb-4">{txError}</p>
            <button
              onClick={refetchTx}
              className="px-4 py-2 bg-[var(--color-primary-500)] text-white rounded-lg"
            >
              다시 시도
            </button>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[40vh]">
            <span className="text-5xl mb-4">P</span>
            <p className="text-[var(--color-neutral-500)]">
              포인트 내역이 없습니다
            </p>
          </div>
        ) : (
          <>
            <div className="divide-y divide-[var(--color-neutral-100)]">
              {filteredTransactions.map((tx) => (
                <PointHistoryItem key={tx.id} transaction={tx} />
              ))}
            </div>

            {/* 더 보기 버튼 */}
            {hasMore && (
              <div className="p-4">
                <button
                  onClick={loadMore}
                  disabled={isLoadingTx}
                  className="w-full py-3 bg-white border border-[var(--color-neutral-200)] rounded-xl text-[var(--color-neutral-700)] font-medium disabled:opacity-50"
                >
                  {isLoadingTx ? (
                    <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                  ) : (
                    '더 보기'
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}

interface PointHistoryItemProps {
  transaction: PointTransaction
}

function PointHistoryItem({ transaction }: Readonly<PointHistoryItemProps>) {
  const isEarn = transaction.type === 'earn' || transaction.type === 'admin_add'
  const isExpire = transaction.type === 'expire'

  const formattedDate = new Date(transaction.createdAt).toLocaleDateString('ko-KR', {
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  const getDescription = (type: PointTransactionType): string => {
    switch (type) {
      case 'earn':
        return transaction.description ?? '주문 적립'
      case 'use':
        return transaction.description ?? '주문 사용'
      case 'expire':
        return '포인트 소멸'
      case 'admin_add':
        return transaction.description ?? '관리자 지급'
      case 'admin_deduct':
        return transaction.description ?? '관리자 차감'
      default:
        return transaction.description ?? '포인트'
    }
  }

  const getIconBgClass = (): string => {
    if (isEarn) return 'bg-[var(--color-success-50)]'
    if (isExpire) return 'bg-[var(--color-neutral-100)]'
    return 'bg-[var(--color-error-50)]'
  }

  const getIconColorClass = (): string => {
    if (isExpire) return 'text-[var(--color-neutral-400)]'
    return 'text-[var(--color-error-500)]'
  }

  const getAmountColorClass = (): string => {
    if (isEarn) return 'text-[var(--color-success-500)]'
    if (isExpire) return 'text-[var(--color-neutral-400)]'
    return 'text-[var(--color-error-500)]'
  }

  const displayAmount = transaction.amount > 0 ? `+${transaction.amount.toLocaleString()}` : transaction.amount.toLocaleString()

  return (
    <div className="flex items-center gap-4 px-4 py-4 bg-white">
      {/* 아이콘 */}
      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getIconBgClass()}`}>
        {isEarn ? (
          <TrendingUp className="w-5 h-5 text-[var(--color-success-500)]" />
        ) : (
          <TrendingDown className={`w-5 h-5 ${getIconColorClass()}`} />
        )}
      </div>

      {/* 내용 */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-[var(--color-neutral-900)]">
          {getDescription(transaction.type)}
        </p>
        <p className="text-xs text-[var(--color-neutral-400)] mt-1">
          {formattedDate}
        </p>
      </div>

      {/* 포인트 금액 */}
      <div className="text-right">
        <p className={`font-bold ${getAmountColorClass()}`}>
          {displayAmount}P
        </p>
        <p className="text-xs text-[var(--color-neutral-400)]">
          잔액 {transaction.balanceAfter.toLocaleString()}P
        </p>
      </div>
    </div>
  )
}
