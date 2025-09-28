# B207 포팅 매뉴얼

## 1. Gitlab 소스 클론 이후 빌드 및 배포 가이드

### 1) Backend/AI 서버에 사용한 JVM, 웹서버, WAS 제품 등의 종류와 설정 값, 버전

-   **JVM/Java**: Java 17+
-   **Spring Boot**: 3.x (내장 **Tomcat**)
-   **AI Service**: Python 3.x, Flask
-   **DB**: **MySQL 8.0**, **MongoDB (latest)**
-   **Cache**: **Redis (latest)**
-   **Message Queue**: **RabbitMQ (management)**
-   **리버스 프록시**: **Nginx** (HTTPS, `/`→프론트, `/api/`→백엔드, `/ai/`→AI)
-   **CI/CD**: **Jenkins LTS (JDK21)**
-   **IDE**: IntelliJ IDEA (Java 21 호환), VSCode (Python)
-   **Docker Engine**: 24.x+
-   **Docker Compose**: v2.x+

### 2) 빌드 시 사용되는 환경 변수 등의 내용 상세

#### Backend (`.env` for `compose.yml`)

```properties
# --- DB & Services ---
MYSQL_DATABASE
MYSQL_USER
MYSQL_PASSWORD
MYSQL_ROOT_PASSWORD

MONGO_ROOT_USERNAME
MONGO_ROOT_PASSWORD
MONGO_DATABASE
MONGO_HOST
MONGO_PORT

REDIS_HOST
REDIS_PORT

RABBITMQ_DEFAULT_USER
RABBITMQ_DEFAULT_PASS
RABBITMQ_HOST
RABBITMQ_PORT

# --- Spring Boot App ---
SPRING_PORT
SPRING_PROFILES_ACTIVE

# --- JWT ---
JWT_SECRET
JWT_ISSUER
SIGNUP_EXP_MINUTES
ACCESS_EXP_MINUTES
REFRESH_EXP_DAYS

# --- External APIs ---
FINANCE_BASE_URL
FINANCE_API_KEY
GMS_API_KEY
KAKAO_CLIENT_ID
KAKAO_REST_KEY
OPENAI_API_KEY

# --- Secrets (Paths inside container) ---
GOOGLE_APPLICATION_CREDENTIALS
FCM_CREDENTIALS_LOCATION
FCM_ENABLED
```

#### AI Service (`ai/.env`)


##### env 내용
```properties
# --- Database (PostgreSQL for user metadata) ---
DB_HOST=postgres # Or your postgres service name
POSTGRES_DB
POSTGRES_USER
POSTGRES_PASSWORD
POSTGRES_PORT

# --- LLM Configuration ---
LLM_PROVIDER=huggingface-local # Options: huggingface-local, huggingface-api, local, openai
LLM_MODEL_NAME=EleutherAI/polyglot-ko-1.3b # huggingface에서 model 중, 한국어 text generation 모델을 선택해 작성성

# Optional, hugggingface-local을 선택했을 경우, 모델을 pull하기 위한 토큰 로그인 필요
HUGGING_FACE_HUB_TOKEN=your_hf_token
```

```bash
# 컨테이너에 접속하여 로그인
docker exec -it ai bash

# 로그인
huggingface-cli login --token $HUGGING_FACE_HUB_TOKEN

```


```
LOCAL_LLM_URL=http://host.docker.internal:11434 # for Ollama, etc.
```
# OPENAI_API_KEY is shared with backend

```

#### Frontend Service

```properties

EXPO_PUBLIC_API_URL_ANDROID
EXPO_PUBLIC_API_URL_IOS

EXPO_PUBLIC_KAKAO_REST_KEY
EXPO_PUBLIC_KAKAO_JAVA_SCRIPT_KEY
EXPO_PUBLIC_KAKAO_NATIVE_APP_KEY

EXPO_PUBLIC_GOOGLE_MAP_API_KEY
```

### 3) Frontend Service

프론트엔드는 React Native 기반의 Expo 프로젝트로 구성되어 있습니다. 빌드 및 실행을 위한 절차는 다음과 같습니다.

#### 1. 필수 환경 구성
- Node.js (v16 이상 권장)
- npm 또는 yarn 패키지 매니저
- Expo CLI (전역 설치 필요)
  ```bash
  npm install -g expo-cli
  ```

#### 2. 프로젝트 복제

```bash
# 프로젝트 루트로 이동
cd frontend

# .env 파일 생성 후 실행
# 로컬 실행
npx expo start --localhost -c
```

#### 3. 환경 변수 설정

```bash
# .env 파일 생성 후 작성
```

#### 4. 빌드 및 실행


```bash
eas.json에 환경변수 삽입 후

# 1. expo config 확인 (환경변수 반영 체크)
npx expo config --type public

# 2. 빌드 실행
eas build -p android --profile preview

# 3. 빌드 결과 확인 및 실행
eas build:list
adb install build-output.apk
```

```bash
# 빌드
expo build:android

# 실행
expo run:android
```

### 4) 배포 시 특이사항

-   **기동 순서**: `mysql`, `mongodb`, `redis`, `rabbitmq` → `backend` → `ai` → `nginx`
-   **주요 포트**
    -   **Nginx (Gateway)**: `80/tcp`, `443/tcp`
    -   **Backend (Spring)**: `8080/tcp`
    -   **AI (Flask)**: `5000/tcp`
    -   **MySQL**: `3306/tcp`
    -   **MongoDB**: `27017/tcp`
    -   **Mongo-Express**: `8082/tcp` (Web UI)
    -   **Redis**: `6379/tcp`
    -   **RabbitMQ**: `5672/tcp` (AMQP), `15672/tcp` (Management UI)
    -   **Jenkins**: `8081/tcp` (Web UI), `50000/tcp` (Agent)

-   **리버스 프록시 (Nginx)**
    -   `location /api/` → `http://backend:8080/`
    -   `location /ai/` → `http://ai:5000/ai/`

-   **컨테이너 파일 위치**
    -   Backend: `backend/`
    -   AI: `ai/`
    -   Nginx: `nginx/`
    -   Jenkins: `jenkins/`
    -   Secrets: `secrets/`

### 5) DB 접속 정보 및 스키마 파일

-   **Backend 설정**: `backend/src/main/resources/application.properties`
-   **Backend 개발용 설정**: `backend/src/main/resources/application-dev.properties`
-   **MySQL 스키마**: `backend/src/main/resources/toktokggubi_ddl.sql`
-   **AI 서비스 DB 설정**: `ai/app.py` (psycopg2 connection details)


---

## 2. 프로젝트에서 사용하는 외부 서비스 정보

-   **Google Cloud Platform**
    -   **Vision API (OCR)**: 서비스 계정 키 필요 (`secrets/toktokggubi-sa.json`)
    -   **Firebase Cloud Messaging (FCM)**: 서비스 계정 키 필요 (`secrets/firebase-service-account.json`)

-   **Kakao OAuth**
    -   `KAKAO_CLIENT_ID`, `KAKAO_REST_KEY` 환경 변수 설정 필요.
    -   Redirect URI: `https://j13b207.p.ssafy.io/auth/kakao/callback`

-   **SSAFY Finance API**
    -   `FINANCE_BASE_URL`, `FINANCE_API_KEY` 환경 변수 설정 필요.

-   **GMS LLM (SSAFY Proxy)**
    -   `GMS_API_KEY` 환경 변수 설정 필요.

-   **OpenAI / Hugging Face (AI Service)**
    -   `LLM_PROVIDER`에 따라 `OPENAI_API_KEY` 또는 `HUGGING_FACE_HUB_TOKEN` 환경 변수 설정 필요.

-   **GOOGLE MAP API**
    -   `EXPO_PUBLIC_GOOGLE_MAP_API_KEY` 환경 변수 설정 필요.

-   **KAKAO MAP API**
    -   `EXPO_PUBLIC_KAKAO_REST_KEY` 환경 변수 설정 필요.

---

## 3. 빌드·배포 추가 준비 사항

### 1) `.env` 파일 배치

- 프로젝트 루트에 `.env` 파일을 생성하고 위 `1.2)` 항목의 모든 백엔드 환경 변수를 채워넣습니다. 예시: 프로젝트 루트에 .env 파일 생성 -> 편집기로 열어 값 채우기

AI 서비스용 `.env` 파일은 `ai/` 디렉터리에 별도로 배치합니다.

### 2) Secrets 파일 배치

프로젝트 루트에 `secrets` 디렉터리를 생성하고 다음 파일을 배치합니다.

1. Backend
-   `secrets/toktokggubi-sa.json` (Google Cloud 서비스 계정 키)
-   `secrets/firebase-service-account.json` (Firebase 서비스 계정 키)

2. Frontend
`/frontend` 디렉토리로 이동한 후, 해당 파일들을 집어넣습니다.
-   `eas.json` (Expo App Services)
-   `app.config.js` (Expo App Configuration)



`compose.yml` 파일은 이 경로의 파일들을 Docker Secrets로 컨테이너 내부에 마운트합니다.

### 3) Docker 네트워크 준비

`compose.yml`에 정의된 서비스들은 기본적으로 같은 네트워크를 사용하므로 별도 생성은 필요하지 않습니다.

### 4) 실행 순서 (빌드 + 기동)

프로젝트 루트 디렉터리에서 다음 명령어를 실행합니다.

```bash
# 1. 모든 서비스 빌드 및 기동 (백그라운드)
docker compose -f compose.yml -f compose.prod.yml -f compose.ai.yml up -d --build

# 2. (선택) 로그 확인
docker compose logs -f backend
docker compose logs -f ai
```

### 5) 포트 개방 (방화벽 설정)

서버 방화벽에서 다음 포트들을 외부에 개방해야 합니다.

-   **웹 트래픽**: `80/tcp`, `443/tcp`
-   **Jenkins (사용 시)**: `8081/tcp`

내부 통신용 포트(`3306`, `6379`, `8080` 등)는 외부로 노출할 필요가 없습니다.

### 6) 빠른 확인

```bash
# 컨테이너 상태 확인 (모두 'Up' 또는 'healthy' 상태여야 함)
docker compose ps

# 백엔드 Health Check (Nginx를 통해)
curl -kI https://<your-domain>/api/actuator/health
# 예상 응답: HTTP/1.1 200 OK

# AI 서비스 확인 (Nginx를 통해)
curl -kI https://<your-domain>/ai/
# 예상 응답: HTTP/1.1 200 OK
```

> 위 순서대로 `.env` 및 `secrets` 파일 준비 → `docker compose up` 실행 → 포트 개방을 진행하면 배포가 완료됩니다.