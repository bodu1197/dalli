'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

interface NotificationSetting {
  id: string
  label: string
  description: string
  enabled: boolean
}

export default function NotificationSettingsPage() {
  const [settings, setSettings] = useState<NotificationSetting[]>([
    {
      id: 'push_order',
      label: '주문 알림',
      description: '주문 접수, 조리 완료, 배달 상태 알림',
      enabled: true,
    },
    {
      id: 'push_marketing',
      label: '마케팅 알림',
      description: '이벤트, 할인, 신메뉴 소식',
      enabled: false,
    },
    {
      id: 'push_chat',
      label: '채팅 알림',
      description: '새 메시지 도착 알림',
      enabled: true,
    },
    {
      id: 'push_review',
      label: '리뷰 알림',
      description: '사장님 답글, 리뷰 관련 알림',
      enabled: true,
    },
    {
      id: 'email_order',
      label: '주문 확인 이메일',
      description: '주문 완료 시 이메일 영수증 발송',
      enabled: true,
    },
    {
      id: 'email_marketing',
      label: '마케팅 이메일',
      description: '뉴스레터, 프로모션 정보',
      enabled: false,
    },
    {
      id: 'sms_order',
      label: '주문 SMS',
      description: '주요 주문 상태 변경 시 문자 발송',
      enabled: false,
    },
  ])

  const handleToggle = (id: string) => {
    setSettings((prev) =>
      prev.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s))
    )
    // Note: Save settings to API (to be implemented with Supabase)
  }

  const pushSettings = settings.filter((s) => s.id.startsWith('push_'))
  const emailSettings = settings.filter((s) => s.id.startsWith('email_'))
  const smsSettings = settings.filter((s) => s.id.startsWith('sms_'))

  return (
    <div className="min-h-screen bg-[var(--color-neutral-50)]">
      {/* 헤더 */}
      <header className="sticky top-0 z-30 bg-white border-b border-[var(--color-neutral-100)]">
        <div className="flex items-center px-4 h-14">
          <Link
            href="/settings"
            className="w-10 h-10 flex items-center justify-center -ml-2"
          >
            <ArrowLeft className="w-6 h-6 text-[var(--color-neutral-700)]" />
          </Link>
          <h1 className="flex-1 text-center font-bold text-[var(--color-neutral-900)]">
            알림 설정
          </h1>
          <div className="w-10" />
        </div>
      </header>

      <main className="pb-20">
        {/* 푸시 알림 */}
        <section className="mt-3 bg-white">
          <div className="px-4 py-3 border-b border-[var(--color-neutral-100)]">
            <h2 className="text-sm font-semibold text-[var(--color-neutral-500)]">
              푸시 알림
            </h2>
          </div>
          <div className="divide-y divide-[var(--color-neutral-100)]">
            {pushSettings.map((setting) => (
              <SettingToggle
                key={setting.id}
                setting={setting}
                onToggle={() => handleToggle(setting.id)}
              />
            ))}
          </div>
        </section>

        {/* 이메일 알림 */}
        <section className="mt-3 bg-white">
          <div className="px-4 py-3 border-b border-[var(--color-neutral-100)]">
            <h2 className="text-sm font-semibold text-[var(--color-neutral-500)]">
              이메일 알림
            </h2>
          </div>
          <div className="divide-y divide-[var(--color-neutral-100)]">
            {emailSettings.map((setting) => (
              <SettingToggle
                key={setting.id}
                setting={setting}
                onToggle={() => handleToggle(setting.id)}
              />
            ))}
          </div>
        </section>

        {/* SMS 알림 */}
        <section className="mt-3 bg-white">
          <div className="px-4 py-3 border-b border-[var(--color-neutral-100)]">
            <h2 className="text-sm font-semibold text-[var(--color-neutral-500)]">
              SMS 알림
            </h2>
          </div>
          <div className="divide-y divide-[var(--color-neutral-100)]">
            {smsSettings.map((setting) => (
              <SettingToggle
                key={setting.id}
                setting={setting}
                onToggle={() => handleToggle(setting.id)}
              />
            ))}
          </div>
        </section>

        {/* 안내 문구 */}
        <div className="px-4 py-6 text-center">
          <p className="text-sm text-[var(--color-neutral-400)]">
            주문 관련 필수 알림은 설정과 관계없이 발송됩니다.
          </p>
        </div>
      </main>
    </div>
  )
}

function SettingToggle({
  setting,
  onToggle,
}: {
  setting: NotificationSetting
  onToggle: () => void
}) {
  return (
    <div className="flex items-center justify-between px-4 py-4">
      <div className="flex-1 min-w-0 pr-4">
        <p className="font-medium text-[var(--color-neutral-800)]">
          {setting.label}
        </p>
        <p className="text-sm text-[var(--color-neutral-500)] mt-0.5">
          {setting.description}
        </p>
      </div>
      <button
        onClick={onToggle}
        className={`relative w-12 h-7 rounded-full transition-colors ${
          setting.enabled
            ? 'bg-[var(--color-primary-500)]'
            : 'bg-[var(--color-neutral-300)]'
        }`}
      >
        <span
          className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${
            setting.enabled ? 'left-6' : 'left-1'
          }`}
        />
      </button>
    </div>
  )
}
