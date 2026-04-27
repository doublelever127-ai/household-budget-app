# Project Instructions

이 프로젝트는 한국어 사용자를 위한 가계부 앱이다.

## 개발 원칙

- TypeScript를 사용한다.
- 사용자-facing 텍스트는 한국어로 작성한다.
- 화면 컴포넌트에는 UI 중심 코드만 두고, 비즈니스 로직은 store, service, utils로 분리한다.
- 금액은 number 타입으로 저장하고, 표시할 때만 포맷팅한다.
- 날짜는 ISO string으로 저장한다.
- 계산 로직은 순수 함수로 작성한다.
- any 사용을 피한다.
- 불필요한 의존성 추가를 피한다.

## 폴더 구조

가능하면 다음 구조를 유지한다.

```text
src/
  components/
  screens/
  navigation/
  store/
  services/
  utils/
  types/
  constants/
```

## 테스트

계산 로직은 반드시 테스트 가능한 형태로 작성한다.

우선 테스트 대상:

- 월별 거래 필터링
- 수입 합계
- 지출 합계
- 잔액 계산
- 카테고리별 지출 요약
- 예산 사용률

## 검증

코드를 수정한 뒤 가능한 명령을 실행한다.

```bash
npm run test
npm run typecheck
```

명령이 없으면 package.json을 확인하고 가능한 대체 검증을 수행한다.

## UI 원칙

- 모바일 기준으로 보기 좋은 간격과 버튼 크기를 사용한다.
- 빈 상태 화면을 제공한다.
- 에러 메시지는 한국어로 명확하게 작성한다.
- 수입과 지출은 시각적으로 구분한다.
