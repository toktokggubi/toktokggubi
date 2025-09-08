# 똑똑꺼비

SSAFY 13기 대전 2반 B207 핀!테크놀로~지아

## 서비스 목적

과소비를 예방하고 혜택을 최대한 활용하게 하여 사용자가 건전한 소비 습관을 형성하도록 돕는 모바일 핀테크 서비스

AI 기반 예산 설계, 실시간/정기 코칭, 위치·인터랙션 기반 제안으로 맞춤형 소비 경험 제공

## 주요 기능

- 예산 관리: 월별/카테고리별 예산 설정, 고정 지출 입력, AI 맞춤 예산안 추천
- 소비 내역 조회: 전체/기간/카테고리별 소비 내역, 명세서/결제일 확인, 연체 탐지
- AI 소비 코칭: 임계·초과 알림, 이상 탐지, 주간·월간 리포트 제공
- Interactive 소비 제안: 흔들기 기반 현장(GPS) 카드/기프티콘/할인 추천
- 혜택 관리: 카드사 혜택·기프티콘 통합 조회 및 만료 방지
- 게이미피케이션: n빵, 몰빵 등 소셜/재미 요소 결합

## 구현 기술

- Frontend: React Native (Expo), axios, Kakao Map API, 센서·GPS·푸시 알림 라이브러리
- Backend: Spring Boot 3.x (Java 17, JPA, Spring Security, JWT)
- Database: MySQL, PostgreSQL
- Infra/DevOps: Docker, Nginx, Jenkins (CI/CD)
- AI: 소비 데이터 기반 이상 탐지, AI 예산 리밸런싱/월간 리포트
