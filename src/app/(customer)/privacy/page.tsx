'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
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
            개인정보처리방침
          </h1>
          <div className="w-10" />
        </div>
      </header>

      <main className="px-4 py-6 pb-20">
        <div className="prose prose-sm max-w-none text-[var(--color-neutral-700)]">
          <p className="text-sm text-[var(--color-neutral-500)] mb-6">
            시행일: 2024년 1월 1일
          </p>

          <section className="mb-8">
            <h2 className="text-lg font-bold text-[var(--color-neutral-900)] mb-4">
              1. 개인정보의 처리 목적
            </h2>
            <p className="mb-3 leading-relaxed">
              달리고(이하 &quot;회사&quot;)는 다음의 목적을 위하여 개인정보를 처리합니다.
              처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며,
              이용 목적이 변경되는 경우에는 별도의 동의를 받는 등 필요한 조치를 이행할 예정입니다.
            </p>
            <ul className="list-disc list-inside space-y-2 text-[var(--color-neutral-600)]">
              <li>회원 가입 및 관리</li>
              <li>재화 또는 서비스 제공</li>
              <li>마케팅 및 광고에의 활용</li>
              <li>서비스 개선 및 개발</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-bold text-[var(--color-neutral-900)] mb-4">
              2. 개인정보의 처리 및 보유 기간
            </h2>
            <p className="mb-3 leading-relaxed">
              회사는 법령에 따른 개인정보 보유·이용기간 또는 정보주체로부터 개인정보를
              수집 시에 동의 받은 개인정보 보유·이용기간 내에서 개인정보를 처리·보유합니다.
            </p>
            <div className="bg-[var(--color-neutral-50)] p-4 rounded-xl space-y-3">
              <div>
                <p className="font-medium text-[var(--color-neutral-800)]">회원 정보</p>
                <p className="text-sm text-[var(--color-neutral-500)]">
                  회원 탈퇴 시까지 (관련 법령에 따라 일정 기간 보관)
                </p>
              </div>
              <div>
                <p className="font-medium text-[var(--color-neutral-800)]">주문 정보</p>
                <p className="text-sm text-[var(--color-neutral-500)]">
                  전자상거래법에 따라 5년간 보관
                </p>
              </div>
              <div>
                <p className="font-medium text-[var(--color-neutral-800)]">결제 정보</p>
                <p className="text-sm text-[var(--color-neutral-500)]">
                  전자상거래법에 따라 5년간 보관
                </p>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-bold text-[var(--color-neutral-900)] mb-4">
              3. 수집하는 개인정보 항목
            </h2>
            <div className="space-y-4">
              <div className="bg-[var(--color-neutral-50)] p-4 rounded-xl">
                <p className="font-medium text-[var(--color-neutral-800)] mb-2">
                  필수 수집 항목
                </p>
                <p className="text-sm text-[var(--color-neutral-600)]">
                  이메일, 비밀번호, 이름, 휴대폰 번호, 배달 주소
                </p>
              </div>
              <div className="bg-[var(--color-neutral-50)] p-4 rounded-xl">
                <p className="font-medium text-[var(--color-neutral-800)] mb-2">
                  선택 수집 항목
                </p>
                <p className="text-sm text-[var(--color-neutral-600)]">
                  프로필 사진, 생년월일, 성별
                </p>
              </div>
              <div className="bg-[var(--color-neutral-50)] p-4 rounded-xl">
                <p className="font-medium text-[var(--color-neutral-800)] mb-2">
                  자동 수집 항목
                </p>
                <p className="text-sm text-[var(--color-neutral-600)]">
                  IP 주소, 쿠키, 방문 기록, 서비스 이용 기록, 기기 정보
                </p>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-bold text-[var(--color-neutral-900)] mb-4">
              4. 개인정보의 제3자 제공
            </h2>
            <p className="mb-3 leading-relaxed">
              회사는 정보주체의 개인정보를 원칙적으로 외부에 제공하지 않습니다.
              다만, 아래의 경우에는 예외로 합니다.
            </p>
            <ul className="list-disc list-inside space-y-2 text-[var(--color-neutral-600)]">
              <li>정보주체가 사전에 동의한 경우</li>
              <li>법령의 규정에 의거하거나, 수사 목적으로 법령에 정해진 절차와 방법에 따라 수사기관의 요구가 있는 경우</li>
              <li>배달 서비스 제공을 위해 음식점 및 배달 기사에게 필요한 최소한의 정보를 제공하는 경우</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-bold text-[var(--color-neutral-900)] mb-4">
              5. 개인정보의 파기
            </h2>
            <p className="leading-relaxed">
              회사는 개인정보 보유기간의 경과, 처리목적 달성 등 개인정보가 불필요하게 되었을 때에는
              지체없이 해당 개인정보를 파기합니다. 전자적 파일 형태로 기록·저장된 개인정보는
              기록을 재생할 수 없도록 파기하며, 종이 문서에 기록·저장된 개인정보는 분쇄기로
              분쇄하거나 소각하여 파기합니다.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-bold text-[var(--color-neutral-900)] mb-4">
              6. 정보주체의 권리와 의무
            </h2>
            <p className="mb-3 leading-relaxed">
              정보주체는 회사에 대해 언제든지 다음 각 호의 개인정보 보호 관련 권리를 행사할 수 있습니다.
            </p>
            <ul className="list-disc list-inside space-y-2 text-[var(--color-neutral-600)]">
              <li>개인정보 열람요구</li>
              <li>오류 등이 있을 경우 정정 요구</li>
              <li>삭제요구</li>
              <li>처리정지 요구</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-bold text-[var(--color-neutral-900)] mb-4">
              7. 개인정보 보호책임자
            </h2>
            <div className="bg-[var(--color-neutral-50)] p-4 rounded-xl">
              <p className="font-medium text-[var(--color-neutral-800)]">개인정보 보호책임자</p>
              <ul className="mt-2 text-sm text-[var(--color-neutral-600)] space-y-1">
                <li>성명: 홍길동</li>
                <li>직책: 개인정보보호팀장</li>
                <li>이메일: privacy@dalligo.com</li>
                <li>연락처: 02-1234-5678</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[var(--color-neutral-900)] mb-4">
              8. 개인정보처리방침의 변경
            </h2>
            <p className="leading-relaxed">
              이 개인정보처리방침은 시행일로부터 적용되며, 법령 및 방침에 따른 변경내용의
              추가, 삭제 및 정정이 있는 경우에는 변경사항의 시행 7일 전부터
              공지사항을 통하여 고지할 것입니다.
            </p>
          </section>
        </div>
      </main>
    </div>
  )
}
