# 똑똑꺼비 (Toktokggubi)

<div align="center">
  <img src="frontend/src/assets/images/character/big-character-02.png" width="180" height="120">
</div>

> 예산 관리와 AI 소비 코칭, interactive 소비 제안을 통해 과소비를 예방하고 혜택을 최적화하여 사용자의 건전한 소비 습관을 만들어주는 서비스

## 서비스 소개

똑똑꺼비는 AI 기반의 개인 맞춤형 예산 관리 및 소비 코칭 서비스입니다. 사용자의 소비 패턴을 분석하여 예산을 자동으로 추천하고, 실시간 알림과 월간 리포트를 통해 건전한 소비 습관을 형성하도록 돕습니다.

###  핵심 가치

1. **AI 기반 맞춤형 예산 추천**: 사용자의 소비 패턴을 분석하여 개인화된 예산안을 제안
2. **실시간 소비 코칭**: 현재 상황에 맞는 즉각적인 알림과 주기적인 코칭 리포트 제공
3. **Interactive 소비 제안**: 흔들기 등 사용자 행동을 통한 최적의 소비 제안 확인
4. **통합 혜택 관리**: 흩어진 카드 혜택과 기프티콘을 한 곳에서 관리하고 최적 사용 시점 안내
5. **게이미피케이션**: 친구와의 몰빵 등 재미 요소를 결합한 소비 관리

## 시스템 아키텍처

![시스템 아키텍처](docs/system-architecture.jpg)

### 아키텍처 구성 요소

**Client (Mobile Device)**
- React Native 기반 모바일 앱
- HTTPS를 통한 서버와의 요청/응답
- Cloud Messaging을 통한 알림 수신

**Server (EC2 Instance)**
- **Nginx**: 리버스 프록시 역할
- **Main Application Logic**: 핵심 비즈니스 로직 처리
  - JWT Token 관리
  - 예산 관리
  - 유저/금융 데이터 처리
- **MySQL**: 유저/금융 데이터 저장
- **Redis**: JWT Token 및 예산 데이터 캐싱
- **MongoDB**: 월간 소비 리포트 저장 및 조회
- **Jenkins**: CI/CD 자동화

**AI Server**
- 사용자별 ML 모델 학습 및 관리
- 월간 소비 분석 리포트 생성
- 초기 예산 맞춤 설정 설계
- 결제 건 알림 내용 설계

**External Services**
- **Cloud Messaging (FCM)**: 푸시 알림 발송
- **GMS**: 알림 내용 조합 및 전송


## 주요 기능

### 1. 예산 관리

- **초기 예산 설정**: 월소득 정보를 통한 AI 기반 전체/카테고리별 예산 제안
- **자동 예산 설정**: 매월 초 이전달 소비 내역 기반 자동 예산 설정
- **실시간 예산 현황**: 카테고리별 사용 현황과 남은 예산 실시간 모니터링

### 2. 소비 내역 조회
- **실시간 거래 내역**: 카드사 API 연동을 통한 실시간 거래 내역 동기화
- **카테고리별 분석**: 대분류별 소비 패턴 분석 및 시각화
- **월간 리포트**: 상세한 소비 분석과 개선 제안

### 3. AI 소비 코칭

- **실시간 알림**:
  - 예산 80% 도달 시 알림
  - 해당 장소 사용 가능 예산 알림
  - 이상 소비 패턴 감지 시 즉시 알림
- **월간 리포트**:
  - AI 이상 소비 탐지 결과
  - 월간 소비 한마디 (LLM 기반)
  - 월간 지출 요약 및 지출 내역

### 4. Interactive 소비 제안
- **흔들기 기능**: 
  - 해당 장소 최적의 결제 수단 제안 (카드, 기프티콘)
  - 동일 카테고리 더 나은 장소 제안
  - 해당 장소 카테고리 사용 가능 예산 알림
- **QR 결제**: 카드 결제

### 5. 혜택 & 기프티콘 관리
- **카드 관리**:
  - 내 카드 내역 불러오기
  - 카드별 혜택 확인 및 관리
- **기프티콘 관리**:
  - 기프티콘 등록 및 관리
  - 최신순, 기간만료순 조회
- **세일 정보 달력**: 브랜드별 할인 정보 및 이벤트 캘린더

### 6. 게이미피케이션

- **N빵**: 함께 쓴 비용을 공평하게 분할하는 계산기
- **몰빵**: 한 명이 전부 지불하는 재미있는 대결 게임
  - WebSocket 기반 실시간 대결
  - 흔들기 배틀로 점수 경쟁
  - 친구와 함께하는 소셜 기능

## 기술 스택

### Frontend
- **Framework**: React Native (Expo)
- **Navigation**: Expo Router
- **State Management**: Zustand
- **API Client**: Axios + React Query
- **UI Components**: Custom Components
- **Maps**: React Native Maps
- **Camera**: Expo Camera
- **Sensors**: Expo Sensors (Accelerometer)
- **Push Notifications**: Firebase Cloud Messaging

### Backend
- **Framework**: Spring Boot 3.5.x
- **Language**: Java 17
- **Database**: MySQL, Redis, MongoDB
- **Security**: Spring Security + JWT
- **WebSocket**: STOMP (Spring Messaging, /topic/**)
- **API Documentation**: Swagger / OpenAPI
- **OCR**: Google Cloud Vision API (Server Side SDK)
- **External Integrations**: Kakao OAuth2 (Login) / SSAFY Finance OpenAPI / Firebase Cloud Messaging(FCM) / GMS LLM Proxy

### AI Service
- **Framework**: Flask
- **ML Libraries**: TensorFlow, scikit-learn
- **Models**: AutoEncoder, Isolation Forest
- **LLM**: Hugging Face Transformers (HyperCLOVAX)
- **Data Processing**: Pandas, NumPy
- **Scheduling**: APScheduler

### Infrastructure
- **Containerization**: Docker, Docker Compose
- **Web Server**: Nginx
- **Database**: PostgreSQL, Redis, MongoDB
- **Monitoring**: Spring Boot Actuator

## 프로젝트 구조

```
S13P21B207/
├── frontend/                 # React Native 앱
│   ├── app/                 # Expo Router 페이지
│   ├── src/
│   │   ├── features/        # 기능별 모듈
│   │   │   ├── Auth/        # 인증
│   │   │   ├── Budget/      # 예산 관리
│   │   │   ├── Home/        # 홈 화면
│   │   │   ├── Lucky/       # 게이미피케이션
│   │   │   ├── Pay/         # 결제 및 흔들기
│   │   │   ├── Report/      # 리포트
│   │   │   └── User/        # 사용자 관리
│   │   ├── shared/          # 공통 컴포넌트
│   │   └── types/           # 타입 정의
│   └── package.json
├── backend/                 # Spring Boot 서버
│   ├── src/main/java/com/ssafy/toktokggubi/
│   │   ├── domain/          # 도메인별 패키지
│   │   │   ├── auth/        # 인증
│   │   │   ├── budget/      # 예산 관리
│   │   │   ├── gms/         # 게임 및 메시징
│   │   │   ├── molbbang/    # 몰빵 게임
│   │   │   ├── notification/# 알림
│   │   │   ├── push/        # 푸시 알림
│   │   │   ├── report/      # 리포트
│   │   │   └── user/        # 사용자 관리
│   │   └── global/          # 전역 설정
│   └── build.gradle
├── ai/                      # AI 서비스
│   ├── model_functions/     # ML 모델 함수
│   │   ├── ae_functions.py  # AutoEncoder
│   │   └── it_functions.py  # Isolation Forest
│   ├── app.py              # Flask 앱
│   ├── model.py            # 모델 관리
│   └── requirements.txt
├── database/               # 데이터베이스 설정
├── nginx/                  # Nginx 설정
└── compose*.yml           # Docker Compose 파일
```

### 사전 요구사항
- Node.js 18+
- Java 17
- Python 3.8+
- Docker & Docker Compose
- MySQL, Redis, MongoDB


## AI 모델

### 이상 소비 탐지
- **AutoEncoder**: 정상 소비 패턴 학습 후 이상치 탐지
- **Isolation Forest**: 통계적 이상치 탐지
- **Ensemble**: 두 모델 결과를 결합하여 정확도 향상

### 예산 추천
- **LLM 기반**: HyperCLOVAX 모델을 활용한 자연어 예산 제안
- **패턴 분석**: 이전 달 소비 데이터 기반 예산 조정

### 개인화
- **사용자별 모델**: 각 사용자마다 별도의 ML 모델 학습
- **지속적 학습**: 매월 새로운 데이터로 모델 재학습

## 팀 구성

| 이름 | 역할 | 담당 |
|------|------|------|
| 이하연 | 팀장, FE | 프론트엔드 개발, 프로젝트 관리 |
| 권자은 | FE | 프론트엔드 개발 |
| 안덕현 | FE | 프론트엔드 개발 |
| 우지연 | BE | 백엔드 개발, 인프라 |
| 양준하 | BE | 백엔드 개발 |
| 허정현 | Infra, AI | AI 모델 개발, 인프라 구축 |

---

**똑똑꺼비**와 함께 스마트한 소비 습관을 만들어보세요!
