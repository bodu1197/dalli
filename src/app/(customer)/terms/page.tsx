'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function TermsPage() {
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
            이용약관
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
              제1조 (목적)
            </h2>
            <p className="leading-relaxed">
              이 약관은 달리고(이하 &quot;회사&quot;)가 제공하는 배달 플랫폼 서비스(이하 &quot;서비스&quot;)의
              이용조건 및 절차, 회사와 회원 간의 권리와 의무, 책임사항 및 기타 필요한 사항을 규정함을 목적으로 합니다.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-bold text-[var(--color-neutral-900)] mb-4">
              제2조 (정의)
            </h2>
            <ul className="list-decimal list-inside space-y-3 text-[var(--color-neutral-600)]">
              <li>
                <strong>&quot;서비스&quot;</strong>란 회사가 제공하는 배달 중개 플랫폼으로서,
                이용자가 음식점의 메뉴를 주문하고 배달받을 수 있도록 하는 서비스를 말합니다.
              </li>
              <li>
                <strong>&quot;회원&quot;</strong>이란 이 약관에 동의하고 회사와 서비스 이용계약을 체결한 자를 말합니다.
              </li>
              <li>
                <strong>&quot;음식점&quot;</strong>이란 회사의 플랫폼에 입점하여 음식을 판매하는 사업자를 말합니다.
              </li>
              <li>
                <strong>&quot;라이더&quot;</strong>란 회원의 주문을 배달하는 배달 서비스 제공자를 말합니다.
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-bold text-[var(--color-neutral-900)] mb-4">
              제3조 (약관의 효력 및 변경)
            </h2>
            <ol className="list-decimal list-inside space-y-3 text-[var(--color-neutral-600)]">
              <li>
                이 약관은 서비스 화면에 게시하거나 기타의 방법으로 회원에게 공지함으로써 효력을 발생합니다.
              </li>
              <li>
                회사는 관련 법령을 위배하지 않는 범위에서 이 약관을 개정할 수 있습니다.
              </li>
              <li>
                회사가 약관을 개정할 경우에는 적용일자 및 개정사유를 명시하여 현행약관과 함께
                서비스 초기화면에 그 적용일자 7일 이전부터 적용일자 전일까지 공지합니다.
              </li>
            </ol>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-bold text-[var(--color-neutral-900)] mb-4">
              제4조 (회원가입)
            </h2>
            <ol className="list-decimal list-inside space-y-3 text-[var(--color-neutral-600)]">
              <li>
                서비스 이용을 원하는 자는 회사가 정한 가입 양식에 따라 회원정보를 기입하고
                이 약관에 동의한다는 의사표시를 함으로써 회원가입을 신청합니다.
              </li>
              <li>
                회사는 제1항과 같이 회원으로 가입할 것을 신청한 자 중 다음 각 호에 해당하지 않는 한
                회원으로 등록합니다.
                <ul className="list-disc list-inside mt-2 ml-4 space-y-1">
                  <li>가입신청자가 이 약관에 의하여 이전에 회원자격을 상실한 적이 있는 경우</li>
                  <li>등록 내용에 허위, 기재누락, 오기가 있는 경우</li>
                  <li>기타 회원으로 등록하는 것이 회사의 서비스 운영에 현저히 지장이 있다고 판단되는 경우</li>
                </ul>
              </li>
            </ol>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-bold text-[var(--color-neutral-900)] mb-4">
              제5조 (서비스의 제공 및 변경)
            </h2>
            <ol className="list-decimal list-inside space-y-3 text-[var(--color-neutral-600)]">
              <li>
                회사는 다음과 같은 서비스를 제공합니다.
                <ul className="list-disc list-inside mt-2 ml-4 space-y-1">
                  <li>음식점 정보 제공 및 주문 중개 서비스</li>
                  <li>배달 서비스</li>
                  <li>리뷰 및 평점 서비스</li>
                  <li>쿠폰 및 포인트 서비스</li>
                  <li>기타 회사가 정하는 서비스</li>
                </ul>
              </li>
              <li>
                회사는 서비스의 내용을 변경할 경우 변경된 서비스의 내용 및 제공일자를 명시하여
                현재의 서비스의 내용을 게시한 곳에 즉시 공지합니다.
              </li>
            </ol>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-bold text-[var(--color-neutral-900)] mb-4">
              제6조 (서비스 이용료)
            </h2>
            <ol className="list-decimal list-inside space-y-3 text-[var(--color-neutral-600)]">
              <li>
                회원의 서비스 이용은 무료를 원칙으로 합니다.
              </li>
              <li>
                단, 배달료, 음식 가격 등 실제 거래에 따른 비용은 회원이 부담합니다.
              </li>
              <li>
                회사는 필요한 경우 별도의 유료 서비스를 제공할 수 있으며,
                이 경우 해당 서비스의 요금 및 이용조건을 사전에 공지합니다.
              </li>
            </ol>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-bold text-[var(--color-neutral-900)] mb-4">
              제7조 (결제 및 환불)
            </h2>
            <ol className="list-decimal list-inside space-y-3 text-[var(--color-neutral-600)]">
              <li>
                회원은 서비스 내에서 제공하는 결제 수단을 통해 음식 대금을 결제할 수 있습니다.
              </li>
              <li>
                주문 취소 및 환불은 다음 각 호의 경우에 가능합니다.
                <ul className="list-disc list-inside mt-2 ml-4 space-y-1">
                  <li>음식점에서 주문을 접수하기 전인 경우: 전액 환불</li>
                  <li>음식점에서 주문을 접수한 후: 음식점의 동의 하에 환불</li>
                  <li>배달 중인 경우: 원칙적으로 환불 불가</li>
                </ul>
              </li>
              <li>
                환불 처리는 결제 수단에 따라 3~7영업일 이내에 진행됩니다.
              </li>
            </ol>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-bold text-[var(--color-neutral-900)] mb-4">
              제8조 (회원의 의무)
            </h2>
            <p className="mb-3 leading-relaxed">
              회원은 다음 행위를 하여서는 안 됩니다.
            </p>
            <ul className="list-disc list-inside space-y-2 text-[var(--color-neutral-600)]">
              <li>가입 신청 또는 회원정보 변경 시 허위내용의 등록</li>
              <li>타인의 정보 도용</li>
              <li>회사가 게시한 정보의 변경</li>
              <li>회사 및 기타 제3자의 저작권 등 지적재산권에 대한 침해</li>
              <li>회사 및 기타 제3자의 명예를 손상시키거나 업무를 방해하는 행위</li>
              <li>외설 또는 폭력적인 메시지, 화상, 음성 등 공서양속에 반하는 정보를 공개 또는 게시하는 행위</li>
              <li>기타 불법적이거나 부당한 행위</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-bold text-[var(--color-neutral-900)] mb-4">
              제9조 (회원 탈퇴 및 자격 상실)
            </h2>
            <ol className="list-decimal list-inside space-y-3 text-[var(--color-neutral-600)]">
              <li>
                회원은 언제든지 서비스 내 &quot;회원탈퇴&quot; 메뉴를 통하여 탈퇴를 요청할 수 있으며,
                회사는 즉시 회원탈퇴를 처리합니다.
              </li>
              <li>
                회원이 다음 각 호의 사유에 해당하는 경우, 회사는 회원자격을 제한 및 정지시킬 수 있습니다.
                <ul className="list-disc list-inside mt-2 ml-4 space-y-1">
                  <li>가입 신청 시에 허위 내용을 등록한 경우</li>
                  <li>다른 사람의 서비스 이용을 방해하거나 그 정보를 도용하는 경우</li>
                  <li>서비스를 이용하여 법령 또는 이 약관이 금지하는 행위를 하는 경우</li>
                </ul>
              </li>
            </ol>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-bold text-[var(--color-neutral-900)] mb-4">
              제10조 (손해배상)
            </h2>
            <ol className="list-decimal list-inside space-y-3 text-[var(--color-neutral-600)]">
              <li>
                회사는 회사의 고의 또는 과실로 인하여 회원에게 손해가 발생한 경우에 한하여 손해배상 책임을 부담합니다.
              </li>
              <li>
                회원이 이 약관을 위반하여 회사에 손해를 끼친 경우, 회원은 회사에 발생한 손해를 배상하여야 합니다.
              </li>
            </ol>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-bold text-[var(--color-neutral-900)] mb-4">
              제11조 (면책조항)
            </h2>
            <ol className="list-decimal list-inside space-y-3 text-[var(--color-neutral-600)]">
              <li>
                회사는 천재지변 또는 이에 준하는 불가항력으로 인하여 서비스를 제공할 수 없는 경우에는
                서비스 제공에 관한 책임이 면제됩니다.
              </li>
              <li>
                회사는 회원의 귀책사유로 인한 서비스 이용의 장애에 대하여 책임을 지지 않습니다.
              </li>
              <li>
                회사는 음식점이 제공하는 음식의 품질, 위생 등에 대하여 직접적인 책임을 지지 않습니다.
              </li>
              <li>
                회사는 라이더의 배달 과정에서 발생하는 사고에 대하여 직접적인 책임을 지지 않습니다.
              </li>
            </ol>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[var(--color-neutral-900)] mb-4">
              제12조 (분쟁해결)
            </h2>
            <ol className="list-decimal list-inside space-y-3 text-[var(--color-neutral-600)]">
              <li>
                회사는 회원이 제기하는 정당한 의견이나 불만을 반영하고 그 피해를 보상처리하기 위하여
                고객센터를 운영합니다.
              </li>
              <li>
                회사와 회원 간에 발생한 분쟁에 관한 소송은 회사의 본사 소재지를 관할하는 법원을
                전속관할법원으로 합니다.
              </li>
            </ol>
          </section>

          <div className="mt-10 p-4 bg-[var(--color-neutral-50)] rounded-xl">
            <p className="text-sm text-[var(--color-neutral-500)]">
              본 약관은 2024년 1월 1일부터 시행됩니다.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
