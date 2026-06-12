# studio-critic-ai

`studio-critic-ai`는 건축 설계 스튜디오의 크리틱 피드백을 다음 작업 리스트, 다음 크리틱 준비 항목, 발표 문장, 포트폴리오 서사로 바꿔주는 정적 AI 웹앱 MVP입니다.

이 프로젝트는 ChatGPT보다 더 똑똑한 AI를 만드는 것이 아니라, 사용자가 매번 프로젝트 맥락과 출력 형식을 반복해서 설명하고 결과를 따로 정리하는 시간을 줄이는 데 집중합니다.

## 기존 ARCHIVE AI와 다른 점

기존 ARCHIVE AI가 “건축 의사결정 기록 시스템”에 가까웠다면, `studio-critic-ai`는 크리틱 직후 바로 실행할 수 있는 **AI 스튜디오 매니저**입니다.

- 피드백을 단순 보관하지 않고 작업 카드로 전환합니다.
- 건축 전용 카테고리로 피드백을 분류합니다.
- 다음 크리틱에 필요한 도면, 다이어그램, 예상 질문을 정리합니다.
- 누적 피드백과 완료 작업을 바탕으로 설계 발전 서사를 만듭니다.

## 충돌 해결 기준

최근 병합 과정에서 `.gitignore`와 `README.md`가 충돌할 수 있었기 때문에, 이 문서는 기존 저장소의 기본 안내와 Studio Critic AI MVP 설명을 함께 보존하는 방향으로 정리했습니다. 병합 충돌 표식은 남기지 않아야 합니다.

## 핵심 기능

- 프로젝트 생성 및 편집
- 교수 / 팀원 / 본인 / 클라이언트 / 기타 피드백 입력
- Firebase AI Logic + Gemini Developer API 기반 텍스트 분석
- Firebase 설정이 없는 경우 Mock 분석으로 대체되는 샘플 모드
- 건축 전용 카테고리 태그 표시
- AI 분석 결과 기반 작업 카드 자동 생성
- 작업 상태 변경: 해야 함 / 진행 중 / 완료 / 보류
- 다음 크리틱 준비 패널 생성
- 포트폴리오 서사 생성
- localStorage 자동 저장
- JSON 데이터 내보내기 / 불러오기
- localStorage 초기화 및 샘플 데이터 복원

## 무료 운영 구조

MVP는 추가 서버 비용이 거의 들지 않도록 설계했습니다.

- 별도 Express / Render / Cloud Functions 서버 없음
- Firestore, Firebase Storage, Firebase Auth 미사용
- 데이터 저장은 브라우저 `localStorage` 사용
- 정적 파일만으로 GitHub Pages 또는 Firebase Hosting 배포 가능
- 텍스트 기반 Gemini 호출만 사용
- 이미지 생성, 영상 생성, 고급 음성 분석, 대용량 PDF 분석 제외

## Firebase Spark 플랜 사용 전제

이 MVP는 Firebase Spark 플랜을 기준으로 정적 웹앱처럼 동작하도록 구성했습니다.

- Firebase Hosting을 쓰더라도 정적 배포만 전제합니다.
- Firestore / Storage / Auth는 MVP에서 사용하지 않습니다.
- Cloud Billing 또는 Blaze 플랜 연결이 필수라는 전제를 두지 않습니다.
- Gemini Developer API free tier의 사용량 제한에 도달하면 앱은 Mock 결과로 대체할 수 있습니다.

## Firebase AI Logic / Gemini 설정 방법

Firebase AI Logic Web SDK는 `src/app.js`에서 동적으로 불러옵니다. Firebase 설정 파일이 없으면 앱은 자동으로 샘플 / Mock 모드로 실행됩니다.

1. Firebase Console에서 웹 앱을 만들고 Firebase config 값을 복사합니다.
2. `src/firebaseConfig.example.js`를 `src/firebaseConfig.js`로 복사합니다. 예시 파일은 커밋하고, 실제 값이 들어간 `src/firebaseConfig.js`는 커밋하지 않습니다.
3. `src/firebaseConfig.js`에 본인의 Firebase 설정값을 입력합니다.
4. `src/app.js`의 `MODEL_NAME` 상수를 필요 시 현재 지원되는 경량 텍스트 모델명으로 변경합니다.
5. 브라우저에서 앱을 열고 피드백을 입력한 뒤 `AI 분석하기`를 실행합니다.

```js
// src/firebaseConfig.js 예시 — 실제 값은 공개 저장소에 커밋하지 마세요.
export const firebaseConfig = {
  apiKey: "YOUR_FIREBASE_WEB_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  appId: "YOUR_FIREBASE_APP_ID",
};
```

> 경고: 실제 API 키나 Firebase 설정값을 공개 GitHub 저장소에 직접 올리지 마세요. 이 저장소의 `.gitignore`는 `.env`, `.env.*`, `src/firebaseConfig.js`, 루트 `firebaseConfig.js`를 제외하도록 설정되어 있습니다. 단, 예시 파일인 `src/firebaseConfig.example.js`는 설정 방법 안내를 위해 계속 추적합니다.

## 데이터 저장 주의사항

현재 데이터는 서버나 DB가 아니라 브라우저 `localStorage`에 저장됩니다.

- 같은 컴퓨터라도 브라우저를 바꾸면 데이터가 보이지 않을 수 있습니다.
- 브라우저 캐시 / 사이트 데이터 삭제 시 데이터가 사라질 수 있습니다.
- 중요한 작업 기록은 상단의 `데이터 내보내기`로 JSON 백업을 저장하세요.
- 백업 파일은 `데이터 불러오기`로 다시 복원할 수 있습니다.

## 실행 방법

별도 빌드 과정이 필요 없습니다. 정적 파일 서버만 실행하면 됩니다.

```bash
python3 -m http.server 4173
```

브라우저에서 다음 주소를 엽니다.

```text
http://localhost:4173
```

또는 VS Code Live Server, Firebase Hosting Emulator, GitHub Pages 같은 정적 호스팅 환경에서 열 수 있습니다.

## 배포 방법

### GitHub Pages

1. GitHub 저장소 Settings → Pages로 이동합니다.
2. Source를 현재 브랜치와 루트 폴더로 설정합니다.
3. 배포 후 `index.html`이 진입점으로 사용됩니다.

### Firebase Hosting

Firebase Hosting을 사용할 경우에도 정적 파일만 배포합니다.

```bash
firebase init hosting
firebase deploy --only hosting
```

`public` 폴더를 별도로 만들지 않고 루트 배포를 선택하거나, 필요하면 `index.html`과 `src/`를 hosting public 폴더로 복사하세요.

## 향후 확장 계획

- Firestore 저장
- 로그인
- PDF 분석
- 음성 입력
- 이미지 기반 패널 피드백
- 팀 협업 기능

## 보안 / 민감 정보 체크리스트

- `src/firebaseConfig.js`는 커밋하지 않습니다.
- 공개 저장소에는 `src/firebaseConfig.example.js`만 포함합니다.
- OpenAI API 키는 사용하지 않습니다.
- Firebase 설정이 없어도 앱은 샘플 프로젝트와 Mock 분석으로 열립니다.
