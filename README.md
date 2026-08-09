# 스마트 빗물받이 관제 대시보드 프론트엔드 프로토타입 

기술 스택: `Next.js 16`, `React 19`, `TypeScript`, `Tailwind CSS v4`

## Requirements

- Node.js `20.9.0` 이상
- npm `10` 이상 권장

## Installation

```bash
npm install
```

## Environment Variables

`.env.example`을 참고하여 `.env` 파일 설정

```env
APP_URL=http://localhost:3000
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
NEXT_PUBLIC_KAKAO_MAP_APP_KEY=your_kakao_javascript_key
```

- `APP_URL`: 개발/운영 서버 주소. 예: `http://localhost:3000`
- `NEXT_PUBLIC_API_BASE_URL`: Spring Boot 백엔드 주소. 예: `http://localhost:8080`
- `NEXT_PUBLIC_KAKAO_MAP_APP_KEY`: 카카오 디벨로퍼스에서 발급한 JavaScript 키

카카오 디벨로퍼스 앱의 카카오맵 API를 활성화하고, JavaScript 키 설정의
JavaScript SDK 도메인에 `APP_URL`과 실제 배포 도메인을 등록해야 합니다.

## Run

개발 서버:

```bash
npm run dev
```

프로덕션 빌드 및 서버 시작:

```bash
npm run build
npm run start
```

브라우저에서 `http://localhost:3000`으로 접속

## Quality Checks

```bash
npm run typecheck
npm run lint
```

## Project Structure

```text
app/                    Next.js App Router 엔트리
components/dashboard/   대시보드 화면 컴포넌트
components/ui/          공용 UI 컴포넌트
lib/                    타입, 유틸, 목업 데이터
public/                 정적 에셋
scripts/                실행 보조 스크립트
```
