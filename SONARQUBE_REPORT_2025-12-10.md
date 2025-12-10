# SonarQube 코드 품질 분석 보고서

**프로젝트**: Dalligo (달리고)
**분석 일시**: 2025년 12월 10일 13:21 KST
**SonarQube 버전**: 25.11.0.114957
**분석 도구**: sonar-scanner-cli 8.0.1.6346

---

## 📊 전체 요약

| 항목 | 결과 | 상태 |
|------|------|------|
| **Quality Gate** | ✅ **PASSED** | OK |
| **총 코드 라인** | 34,847 lines | - |
| **분석 파일 수** | 140 files | TypeScript + CSS |

---

## 🔢 핵심 메트릭

### 신뢰성 (Reliability)
| 메트릭 | 값 | 등급 |
|--------|-----|------|
| **Bugs** | **0** | ⭐ A (최고) |
| **Reliability Rating** | 1.0 | A |

### 보안성 (Security)
| 메트릭 | 값 | 등급 |
|--------|-----|------|
| **Vulnerabilities** | **0** | ⭐ A (최고) |
| **Security Rating** | 1.0 | A |
| **Security Hotspots** | 3 | 검토 필요 |

### 유지보수성 (Maintainability)
| 메트릭 | 값 | 등급 |
|--------|-----|------|
| **Code Smells** | 97 | - |
| **Technical Debt** | 451분 (~7.5시간) | - |
| **Maintainability Rating** | 1.0 | A |

### 기타 메트릭
| 메트릭 | 값 | 상태 |
|--------|-----|------|
| **Coverage** | 0.0% | ⚠️ 테스트 커버리지 없음 |
| **Duplications** | 13.4% | ⚠️ 기준(3%) 초과 |
| **Complexity** | 2,914 | - |
| **Cognitive Complexity** | 994 | - |

---

## 🐛 이슈 상세 분석

### 심각도별 분포

| 심각도 | 개수 | 비율 |
|--------|------|------|
| 🔴 BLOCKER | 0 | 0% |
| 🟠 CRITICAL | 0 | 0% |
| 🟡 MAJOR | 40 | 41.2% |
| 🔵 MINOR | 57 | 58.8% |
| ⚪ INFO | 0 | 0% |
| **합계** | **97** | 100% |

### 유형별 분포

| 유형 | 개수 | 비율 |
|------|------|------|
| CODE_SMELL | 97 | 100% |
| BUG | 0 | 0% |
| VULNERABILITY | 0 | 0% |

### 규칙별 상위 이슈 (Top 10)

| 순위 | 규칙 ID | 설명 | 개수 |
|------|---------|------|------|
| 1 | S6853 | A form label must be associated with a control | 32 |
| 2 | S7735 | Unexpected negated condition | 16 |
| 3 | S7764 | Prefer using nullish coalescing operator | 10 |
| 4 | S6759 | Mark the props of the component as read-only | 8 |
| 5 | S6353 | Use `includes` method instead of `indexOf` | 6 |
| 6 | S7773 | Unnecessary assignment to variable | 4 |
| 7 | S7748 | Don't use zero fraction in number | 4 |
| 8 | S7781 | Prefer `replaceAll()` over `replace()` | 3 |
| 9 | S1874 | Deprecated code usage | 2 |
| 10 | S3358 | Extract nested ternary operation | 2 |

---

## 🔒 보안 핫스팟 (Security Hotspots)

총 **3개**의 보안 핫스팟이 검토 필요합니다.

### 1. 정규식 DoS 취약점 (MEDIUM)
- **파일**: `dalli/src/app/admin/users/admins/new/page.tsx:31`
- **규칙**: S5852
- **문제**: 백트래킹으로 인한 정규식 성능 저하 가능성
- **메시지**: "Make sure the regex used here, which is vulnerable to super-linear runtime due to backtracking, cannot lead to denial of service."

### 2. 약한 난수 생성기 사용 (MEDIUM)
- **파일**: `dalli/src/app/admin/coupons/new/page.tsx:50`
- **규칙**: S2245
- **문제**: `Math.random()` 사용 - 보안 목적에 부적합
- **메시지**: "Make sure that using this pseudorandom number generator is safe here."
- **권장**: 쿠폰 코드 생성 시 `crypto.randomUUID()` 또는 `crypto.getRandomValues()` 사용

### 3. Geolocation API 사용 (LOW)
- **파일**: `dalli/src/hooks/useCurrentLocation.ts:54`
- **규칙**: S5604
- **문제**: 위치 정보 수집의 필요성 확인 필요
- **메시지**: "Make sure the use of the geolocation is necessary."
- **상태**: 배달 앱 특성상 필수 기능으로 허용 가능

---

## 📁 파일별 이슈 분포 (상위 10개)

| 파일 | 이슈 수 | 주요 문제 |
|------|---------|-----------|
| `admin/coupons/new/page.tsx` | 11 | 폼 레이블 접근성 |
| `admin/settings/delivery/page.tsx` | 7 | 폼 레이블 접근성 |
| `admin/categories/page.tsx` | 4 | replaceAll 미사용, 접근성 |
| `admin/realtime/page.tsx` | 4 | 숫자 포맷팅 |
| `(customer)/notifications/page.tsx` | 3 | 부정 조건문, props readonly |
| `(auth)/signup/page.tsx` | 2 | 이중 부정, 부정 조건문 |
| `admin/faq/page.tsx` | 2 | useState 구조분해 |
| `admin/layout.tsx` | 1 | props readonly |
| `(auth)/layout.tsx` | 1 | props readonly |
| `(customer)/layout.tsx` | 1 | props readonly |

---

## 🎯 권장 수정 사항

### 우선순위 1: 접근성 (Accessibility) - 32건

**문제**: `<label>` 태그가 폼 컨트롤과 연결되어 있지 않음

```tsx
// ❌ 잘못된 코드
<label>이름</label>
<input type="text" />

// ✅ 수정 코드 (htmlFor 사용)
<label htmlFor="name">이름</label>
<input id="name" type="text" />

// ✅ 또는 label로 감싸기
<label>
  이름
  <input type="text" />
</label>
```

**영향 파일**:
- `admin/coupons/new/page.tsx` (11건)
- `admin/settings/delivery/page.tsx` (7건)
- 기타 관리자 폼 페이지

### 우선순위 2: 코드 스타일 - 16건

**문제**: 부정 조건문 사용 (S7735)

```tsx
// ❌ 잘못된 코드
if (!isLoading) {
  // 로딩 완료 시
} else {
  // 로딩 중
}

// ✅ 수정 코드
if (isLoading) {
  // 로딩 중
} else {
  // 로딩 완료 시
}
```

### 우선순위 3: Nullish Coalescing - 10건

**문제**: `||` 대신 `??` 연산자 권장

```tsx
// ❌ 잘못된 코드
const value = data || defaultValue

// ✅ 수정 코드 (0, '', false도 유효한 값으로 처리)
const value = data ?? defaultValue
```

### 우선순위 4: React Props Readonly - 8건

**문제**: 컴포넌트 props가 readonly로 마크되지 않음

```tsx
// ❌ 잘못된 코드
function Component({ children }: { children: React.ReactNode }) { }

// ✅ 수정 코드
function Component({ children }: Readonly<{ children: React.ReactNode }>) { }

// ✅ 또는
interface Props {
  readonly children: React.ReactNode
}
```

### 우선순위 5: 보안 핫스팟 수정

**쿠폰 코드 생성 (S2245)**:
```tsx
// ❌ 잘못된 코드
const code = Math.random().toString(36).substring(7)

// ✅ 수정 코드
const code = crypto.randomUUID().replace(/-/g, '').substring(0, 8).toUpperCase()
```

---

## 📈 품질 개선 로드맵

### 단기 (1주 이내)
- [ ] 접근성 이슈 수정 (32건) - 폼 레이블 연결
- [ ] 보안 핫스팟 검토 및 수정 (3건)
- [ ] MAJOR 이슈 수정 (40건)

### 중기 (2주 이내)
- [ ] MINOR 이슈 수정 (57건)
- [ ] 중복 코드 리팩토링 (현재 13.4% → 목표 3% 이하)

### 장기 (4주 이내)
- [ ] 테스트 커버리지 80% 달성
- [ ] 기술 부채 0 달성

---

## 📋 SonarQube 대시보드 링크

- **대시보드**: http://localhost:9000/dashboard?id=dalligo
- **이슈 목록**: http://localhost:9000/project/issues?id=dalligo
- **보안 핫스팟**: http://localhost:9000/security_hotspots?id=dalligo
- **중복 코드**: http://localhost:9000/component_measures?id=dalligo&metric=duplicated_lines_density

---

## 🏆 결론

| 항목 | 현재 상태 | 목표 |
|------|-----------|------|
| Quality Gate | ✅ PASSED | 유지 |
| Bugs | 0 | 0 유지 |
| Vulnerabilities | 0 | 0 유지 |
| Code Smells | 97 | 0 |
| Security Hotspots | 3 TO_REVIEW | 0 TO_REVIEW |
| Coverage | 0% | 80%+ |
| Duplications | 13.4% | 3% 이하 |

**전체 평가**: 핵심 보안 및 신뢰성 지표는 양호하나, 유지보수성 개선과 테스트 커버리지 확보가 필요합니다.

---

*보고서 생성: Claude Code*
*분석 엔진: SonarQube Community Build 25.11.0*
