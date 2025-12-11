'use client'

/**
 * 주문 취소 모달 컴포넌트
 * @description 취소 사유 선택 및 취소 확인 모달
 */

import { useState, useCallback, useRef, useEffect } from 'react'
import { X, AlertTriangle, Loader2, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useCancelOrder } from '@/hooks/useCancelOrder'
import {
  getAvailableCancelReasons,
  CANCEL_TYPE_LABELS,
} from '@/lib/constants/order-cancellation'
import type {
  CancelabilityCheck,
  CancelReasonCategory,
  CancelModalProps,
} from '@/types/order-cancellation.types'

/**
 * 외부에서 key prop으로 리셋을 제어하는 래퍼 컴포넌트
 */
export function CancelOrderModal(props: CancelModalProps) {
  // 모달이 닫혔다가 열릴 때마다 key가 변경되어 내부 컴포넌트가 리마운트됨
  if (!props.isOpen) return null

  return <CancelOrderModalContent {...props} />
}

/**
 * 실제 모달 컨텐츠 컴포넌트
 */
function CancelOrderModalContent({
  onClose,
  orderId,
  cancelability,
  onCancelComplete,
}: Omit<CancelModalProps, 'isOpen'>) {
  const [selectedReason, setSelectedReason] = useState<CancelReasonCategory | null>(null)
  const [reasonDetail, setReasonDetail] = useState('')
  const [step, setStep] = useState<'select' | 'confirm' | 'success'>('select')
  const successTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const {
    mutate: cancelOrder,
    isPending: isCancelling,
    error,
  } = useCancelOrder({
    onSuccess: () => {
      setStep('success')
      // 2초 후 모달 닫기
      successTimerRef.current = setTimeout(() => {
        onCancelComplete?.()
      }, 2000)
    },
  })

  // 고객용 취소 사유 목록
  const availableReasons = getAvailableCancelReasons('customer')

  // 타이머 정리
  useEffect(() => {
    return () => {
      if (successTimerRef.current) {
        clearTimeout(successTimerRef.current)
      }
    }
  }, [])

  const handleSelectReason = useCallback((reason: CancelReasonCategory) => {
    setSelectedReason(reason)
  }, [])

  const handleConfirm = useCallback(() => {
    if (!selectedReason) return
    setStep('confirm')
  }, [selectedReason])

  const handleCancel = useCallback(() => {
    if (!selectedReason) return
    cancelOrder({
      orderId,
      reasonCategory: selectedReason,
      reasonDetail: reasonDetail.trim() || undefined,
    })
  }, [cancelOrder, orderId, selectedReason, reasonDetail])

  const handleBack = useCallback(() => {
    setStep('select')
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      {/* 오버레이 */}
      <div
        className="absolute inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* 모달 */}
      <div
        className={cn(
          'relative z-10 w-full max-w-md bg-white',
          'rounded-t-3xl sm:rounded-2xl',
          'shadow-xl',
          'max-h-[90vh] overflow-hidden',
          'animate-slide-up sm:animate-fade-in'
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cancel-modal-title"
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between border-b border-neutral-100 px-4 py-4">
          <h2 id="cancel-modal-title" className="text-lg font-bold text-neutral-900">
            {step === 'success' ? '취소 완료' : '주문 취소'}
          </h2>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-neutral-100"
            aria-label="닫기"
          >
            <X className="h-5 w-5 text-neutral-500" />
          </button>
        </div>

        {/* 컨텐츠 */}
        <div className="overflow-y-auto p-4" style={{ maxHeight: 'calc(90vh - 140px)' }}>
          {step === 'select' && (
            <SelectReasonStep
              cancelability={cancelability}
              availableReasons={availableReasons}
              selectedReason={selectedReason}
              reasonDetail={reasonDetail}
              onSelectReason={handleSelectReason}
              onReasonDetailChange={setReasonDetail}
            />
          )}

          {step === 'confirm' && (
            <ConfirmStep
              cancelability={cancelability}
              selectedReason={selectedReason!}
              reasonDetail={reasonDetail}
              error={error}
            />
          )}

          {step === 'success' && <SuccessStep />}
        </div>

        {/* 푸터 */}
        {step !== 'success' && (
          <div className="flex gap-3 border-t border-neutral-100 p-4">
            {step === 'select' ? (
              <>
                <button
                  onClick={onClose}
                  className="flex-1 rounded-xl border border-neutral-200 py-3 font-semibold text-neutral-700 transition-colors hover:bg-neutral-50"
                >
                  닫기
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={!selectedReason}
                  className={cn(
                    'flex-1 rounded-xl py-3 font-semibold text-white transition-colors',
                    selectedReason
                      ? 'bg-red-500 hover:bg-red-600'
                      : 'cursor-not-allowed bg-neutral-300'
                  )}
                >
                  다음
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleBack}
                  disabled={isCancelling}
                  className="flex-1 rounded-xl border border-neutral-200 py-3 font-semibold text-neutral-700 transition-colors hover:bg-neutral-50 disabled:opacity-50"
                >
                  이전
                </button>
                <button
                  onClick={handleCancel}
                  disabled={isCancelling}
                  className={cn(
                    'flex-1 rounded-xl py-3 font-semibold text-white transition-colors',
                    'bg-red-500 hover:bg-red-600',
                    'flex items-center justify-center gap-2',
                    isCancelling && 'cursor-not-allowed opacity-70'
                  )}
                >
                  {isCancelling ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      취소 중...
                    </>
                  ) : (
                    '주문 취소하기'
                  )}
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ============================================================================
// 서브 컴포넌트
// ============================================================================

interface SelectReasonStepProps {
  cancelability: CancelabilityCheck
  availableReasons: Array<{ value: CancelReasonCategory; label: string; description: string }>
  selectedReason: CancelReasonCategory | null
  reasonDetail: string
  onSelectReason: (reason: CancelReasonCategory) => void
  onReasonDetailChange: (detail: string) => void
}

function SelectReasonStep({
  cancelability,
  availableReasons,
  selectedReason,
  reasonDetail,
  onSelectReason,
  onReasonDetailChange,
}: SelectReasonStepProps) {
  return (
    <div className="space-y-4">
      {/* 취소 정보 안내 */}
      <div className="rounded-xl bg-amber-50 p-4">
        <div className="flex gap-3">
          <AlertTriangle className="h-5 w-5 flex-shrink-0 text-amber-500" />
          <div className="text-sm">
            <p className="font-semibold text-amber-800">
              {cancelability.cancelType === 'instant' ? '즉시 취소' : '취소 요청'}
            </p>
            <p className="mt-1 text-amber-700">{cancelability.message}</p>
          </div>
        </div>
      </div>

      {/* 환불 정보 */}
      <div className="rounded-xl bg-neutral-50 p-4">
        <h3 className="mb-2 text-sm font-semibold text-neutral-700">환불 정보</h3>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-neutral-500">환불율</span>
            <span className="font-medium text-neutral-900">
              {cancelability.refundRate}%
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-500">예상 환불금액</span>
            <span className="font-bold text-primary">
              {cancelability.refundAmount.toLocaleString()}원
            </span>
          </div>
        </div>
      </div>

      {/* 취소 사유 선택 */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-neutral-700">
          취소 사유를 선택해주세요
        </h3>
        <div className="space-y-2">
          {availableReasons.map((reason) => (
            <label
              key={reason.value}
              className={cn(
                'flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors',
                selectedReason === reason.value
                  ? 'border-primary bg-primary/5'
                  : 'border-neutral-200 hover:border-neutral-300'
              )}
            >
              <input
                type="radio"
                name="cancelReason"
                value={reason.value}
                checked={selectedReason === reason.value}
                onChange={() => onSelectReason(reason.value)}
                className="mt-0.5 h-4 w-4 text-primary focus:ring-primary"
              />
              <div className="flex-1">
                <span className="font-medium text-neutral-900">{reason.label}</span>
                <p className="mt-0.5 text-sm text-neutral-500">{reason.description}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* 상세 사유 입력 (기타 선택 시) */}
      {selectedReason === 'other' && (
        <div>
          <label
            htmlFor="reason-detail"
            className="mb-2 block text-sm font-semibold text-neutral-700"
          >
            상세 사유 입력
          </label>
          <textarea
            id="reason-detail"
            value={reasonDetail}
            onChange={(e) => onReasonDetailChange(e.target.value)}
            placeholder="취소 사유를 자세히 입력해주세요"
            maxLength={500}
            rows={3}
            className={cn(
              'w-full rounded-xl border border-neutral-200 p-3 text-sm',
              'placeholder:text-neutral-400',
              'focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary'
            )}
          />
          <p className="mt-1 text-right text-xs text-neutral-400">
            {reasonDetail.length}/500
          </p>
        </div>
      )}
    </div>
  )
}

interface ConfirmStepProps {
  cancelability: CancelabilityCheck
  selectedReason: CancelReasonCategory
  reasonDetail: string
  error: Error | null
}

function ConfirmStep({
  cancelability,
  selectedReason,
  reasonDetail,
  error,
}: ConfirmStepProps) {
  const reasonOption = getAvailableCancelReasons('customer').find(
    (r) => r.value === selectedReason
  )

  return (
    <div className="space-y-4">
      {/* 경고 메시지 */}
      <div className="rounded-xl bg-red-50 p-4">
        <div className="flex gap-3">
          <AlertTriangle className="h-5 w-5 flex-shrink-0 text-red-500" />
          <div className="text-sm">
            <p className="font-semibold text-red-800">주문을 취소하시겠습니까?</p>
            <p className="mt-1 text-red-700">
              {cancelability.cancelType === 'instant'
                ? '확인 버튼을 누르면 즉시 취소됩니다.'
                : '취소 요청 후 점주 승인이 필요합니다.'}
            </p>
          </div>
        </div>
      </div>

      {/* 취소 정보 요약 */}
      <div className="rounded-xl border border-neutral-200 p-4">
        <h3 className="mb-3 text-sm font-semibold text-neutral-700">취소 정보</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-neutral-500">취소 유형</span>
            <span className="font-medium text-neutral-900">
              {CANCEL_TYPE_LABELS[cancelability.cancelType!]}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-500">취소 사유</span>
            <span className="font-medium text-neutral-900">{reasonOption?.label}</span>
          </div>
          {reasonDetail && (
            <div className="pt-2">
              <span className="text-neutral-500">상세 사유</span>
              <p className="mt-1 rounded-lg bg-neutral-50 p-2 text-neutral-700">
                {reasonDetail}
              </p>
            </div>
          )}
          <div className="flex justify-between border-t border-neutral-100 pt-2">
            <span className="text-neutral-500">환불 금액</span>
            <span className="font-bold text-primary">
              {cancelability.refundAmount.toLocaleString()}원
            </span>
          </div>
        </div>
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div className="rounded-xl bg-red-50 p-4">
          <p className="text-sm text-red-600">{error.message}</p>
        </div>
      )}
    </div>
  )
}

function SuccessStep() {
  return (
    <div className="flex flex-col items-center py-8">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
        <CheckCircle className="h-8 w-8 text-green-600" />
      </div>
      <h3 className="text-lg font-bold text-neutral-900">주문이 취소되었습니다</h3>
      <p className="mt-2 text-center text-sm text-neutral-500">
        환불은 결제 수단에 따라 3~5 영업일 내에 처리됩니다.
      </p>
    </div>
  )
}
