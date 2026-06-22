# 톡탐정

`톡탐정`은 가상의 메신저 대화 속 단서를 수집해 진실을 추리하는 순수 HTML/CSS/JavaScript 기반 웹게임입니다.

기본 포함 사건은 3개입니다. `사라진 축제 정산금`, `잠긴 방송실의 사라진 원본`, `익명 계정의 조작 캡처`를 선택해서 플레이할 수 있습니다.

- 저장소: [chat-detective-game](https://github.com/playatelier/chat-detective-game)
- 배포 링크: [톡탐정 웹게임](https://playatelier.github.io/chat-detective-game/)

## 주요 기능

- 에피소드 선택 허브와 에피소드별 이어하기
- 6개 챕터로 진행되는 메신저 추리 사건 3개
- 단체 채팅방, 1:1 채팅, 자료 보관함, 타임라인, 정산 메모 탐색
- 메시지, 타임라인, 메모 항목 클릭을 통한 단서 수첩 저장
- 진짜 단서와 가짜 단서를 모두 선택 가능한 추리 구조
- 챕터별 중간 추리 질문과 다음 챕터 해금
- 최종 범인, 부족 금액, 핵심 시간대, 결정적 단서 제출
- 점수 계산, 탐정 등급, 놓친 단서, 전체 해설 리포트
- localStorage 기반 에피소드별 이어하기, 최고 점수, 최고 등급, 누적 플레이 저장
- 결과 복사하기
- 애니메이션 줄이기, 효과음, 해설 자동 펼치기, 읽은 메시지 흐리게 표시, 촘촘한 읽기 모드 설정
- 광고 영역과 프리미엄 사건팩 확장 UI 준비
- 자체 제작 SVG 기반 홈 일러스트, 아이콘, 사건 커버 이미지

## 파일 구조

```text
chat-detective-game/
├─ assets/
│  ├─ case-covers/
│  ├─ icons/
│  └─ illustrations/
├─ index.html
├─ sitemap.xml
├─ robots.txt
├─ styles.css
├─ app.js
├─ story.js
├─ SEARCH_REGISTRATION_GUIDE.md
└─ README.md
```

## 실행 방법

별도 빌드가 필요 없습니다.

1. 이 폴더의 `index.html`을 브라우저에서 엽니다.
2. `사건 시작`을 누릅니다.
3. 자료를 읽고 단서를 저장한 뒤 중간 추리와 최종 추리를 진행합니다.

로컬 서버가 필요하지 않지만, 원하면 다음처럼 간단한 정적 서버로 열 수 있습니다.

```bash
python -m http.server 8080
```

이후 `http://localhost:8080`에서 확인합니다.

## GitHub Pages 배포 방법

1. GitHub 저장소에 `index.html`, `styles.css`, `app.js`, `story.js`, `README.md`를 업로드합니다.
2. 저장소 `Settings`로 이동합니다.
3. `Pages` 메뉴에서 `Deploy from a branch`를 선택합니다.
4. 브랜치는 `main`, 폴더는 `/root`를 선택합니다.
5. 생성된 GitHub Pages URL에서 바로 실행됩니다.

## 검색엔진 등록 및 노출 방법

- 사이트 주소: `https://playatelier.github.io/chat-detective-game/`
- sitemap 주소: `https://playatelier.github.io/chat-detective-game/sitemap.xml`
- robots 주소: `https://playatelier.github.io/chat-detective-game/robots.txt`

기본 SEO 설정은 `index.html`의 robots, canonical, Open Graph, Twitter Card, theme-color, favicon 메타 태그로 구성되어 있습니다. 검색엔진 등록은 각 서비스 계정 인증이 필요하므로 직접 로그인 후 아래 순서대로 진행합니다.

GitHub username을 변경한 경우 기존 Google Search Console, Naver Search Advisor, Bing Webmaster Tools에 등록된 예전 주소 속성은 새 주소로 자동 이전되지 않을 수 있습니다. `https://playatelier.github.io/chat-detective-game/`를 새 URL 속성으로 다시 등록하고 sitemap도 새 주소로 다시 제출하세요. 기존 Google 인증 파일이 있다면 파일 자체는 그대로 둘 수 있지만, 새 URL 속성 인증 과정에서 검색엔진이 요구하는 방식에 맞춰 다시 확인해야 합니다.

Google Search Console:

1. `https://search.google.com/search-console`에 접속합니다.
2. `속성 추가`에서 `URL 접두어`를 선택합니다.
3. `https://playatelier.github.io/chat-detective-game/`를 입력합니다.
4. HTML 파일 업로드 방식으로 소유권을 인증합니다.
5. 인증 후 `Sitemaps` 메뉴에서 `https://playatelier.github.io/chat-detective-game/sitemap.xml`을 제출합니다.
6. URL 검사에서 메인 URL을 입력하고 실제 URL 테스트 후 색인 생성을 요청합니다.

Naver Search Advisor:

1. `https://searchadvisor.naver.com`에 접속합니다.
2. 웹마스터 도구에서 사이트를 등록합니다.
3. 네이버 서치어드바이저 사이트 등록 주소는 `https://playatelier.github.io`로 시도합니다.
4. 실제 서비스 주소는 `https://playatelier.github.io/chat-detective-game/`입니다.
5. GitHub Project Pages는 하위 경로 사이트이므로 네이버 인증이 까다로울 수 있습니다.
6. 우선 HTML 태그 인증 방식을 사용합니다. 현재 `index.html`에는 네이버 인증 meta 태그가 추가되어 있습니다.
7. 인증 후 사이트맵 제출 주소는 `https://playatelier.github.io/chat-detective-game/sitemap.xml`입니다.
8. 인증 후 웹페이지 수집 요청 주소는 `https://playatelier.github.io/chat-detective-game/`입니다.

Bing Webmaster Tools:

1. `https://www.bing.com/webmasters`에 접속합니다.
2. 사이트 추가에서 `https://playatelier.github.io/chat-detective-game/`를 입력합니다.
3. 소유권 인증을 완료합니다.
4. sitemap 제출 메뉴에 `https://playatelier.github.io/chat-detective-game/sitemap.xml`을 등록합니다.
5. URL Submission에서 메인 URL을 제출합니다.

검색 반영에는 며칠에서 몇 주까지 걸릴 수 있으며, 검색 노출 순위는 보장되지 않습니다. GitHub Project Pages에서는 `robots.txt`가 도메인 루트가 아니라 `/chat-detective-game/robots.txt`에 놓입니다. 그래도 sitemap은 Google Search Console, Naver Search Advisor, Bing Webmaster Tools에 직접 제출할 수 있습니다. 장기적으로는 커스텀 도메인을 연결하면 `robots.txt`와 sitemap 관리가 더 깔끔합니다.

## 포함 에피소드

| 에피소드 | 개요 | 핵심 추리 |
| --- | --- | --- |
| 사라진 축제 정산금 | 축제 부스 현금 정산금 70,000원이 사라진 사건 | 현금/계좌/재료비 분리, 20:10~20:20 공백 |
| 잠긴 방송실의 사라진 원본 | 잠긴 방송실 안 PC에서 최종 상영본 원본 컷 세 개가 사라진 사건 | 물리 출입 없음, 원격 접속, NAS 로그 |
| 익명 계정의 조작 캡처 | 학과 익명 계정에 조작 캡처 네 장이 예약 게시된 사건 | 원본 대화 대조, 관리자 화면 반사, 예약 게시 로그 |

## UI/UX 개선 내용

- 홈 상단을 `Messenger Mystery` 배지, 대표 카피, 스마트폰 추리 일러스트가 있는 히어로로 구성했습니다.
- 사건 선택 카드는 사건별 커버 이미지, 진행률, 최고 점수/등급, 선택 상태 배지를 표시합니다.
- 사건 대시보드는 챕터 진행 카드와 2x2 수사 액션 카드로 구성해 관리 화면 느낌을 줄였습니다.
- 채팅방에는 방별 저장 단서 수, 챕터 해금 구분선, 핀 배지, 사진/파일 카드 구분 스타일을 추가했습니다.
- 단서 수첩은 저장 단서 수, 관련 인물 수, 현재 챕터 요약과 출처/관련 인물 배지를 표시합니다.
- 타임라인은 세로 라인과 시간 배지 중심으로 정리했고, 자료 메모는 금액/로그/파일 기록 성격을 배지로 구분합니다.
- 최종 추리 화면은 인물 카드형 선택과 최종 보고서 작성 분위기로 개선했습니다.
- 결과 리포트는 탐정 보고서와 사건 파일 스탬프 느낌을 강화했습니다.

## 추가된 SVG 에셋

- `assets/illustrations/hero-phone.svg`
- `assets/icons/magnifier.svg`
- `assets/icons/evidence-pin.svg`
- `assets/icons/notebook.svg`
- `assets/icons/timeline.svg`
- `assets/icons/memo.svg`
- `assets/icons/lock.svg`
- `assets/case-covers/festival-money.svg`
- `assets/case-covers/broadcast-room.svg`
- `assets/case-covers/anonymous-capture.svg`

## 에셋 추가 방법

외부 이미지를 다운로드하지 말고, 직접 제작한 SVG 파일을 `assets/illustrations`, `assets/icons`, `assets/case-covers` 중 성격에 맞는 폴더에 추가합니다. SVG는 어두운 배경에서도 보이도록 충분한 대비를 주고, 실제 메신저 앱 로고, 브랜드 로고, 실제 인물 사진을 포함하지 않습니다.

## 사건 커버 이미지 연결 방법

각 사건 객체에 선택 필드를 추가하면 홈 사건 카드에서 자동으로 사용됩니다. 필드가 없으면 기본 커버 이미지로 fallback됩니다.

```js
{
  id: "new-case",
  title: "새 사건",
  coverImage: "assets/case-covers/new-case.svg",
  themeColor: "#ffd166",
  tagline: "한 줄 사건 카피"
}
```

## 스토리 구조

모든 사건 데이터는 `story.js`의 `STORIES` 배열에 들어 있습니다. 첫 번째 사건은 호환성을 위해 `STORY` 상수로도 제공됩니다.

주요 필드:

- `chapters`: 챕터 목록, 해금 자료, 중간 추리 질문 연결
- `characters`: 등장인물 정보
- `rooms`: 채팅방과 메시지
- `timeline`: 시간순 사건 기록
- `notes`: 정산 메모와 계산 자료
- `checkpointQuestions`: 챕터별 중간 추리 질문
- `finalQuestions`: 최종 추리 질문과 정답
- `ending`: 최종 해설

## 에피소드 추가 방법

1. `story.js`에 새 `createSomethingStory()` 함수를 만듭니다.
2. 기존 에피소드와 같은 구조로 `chapters`, `characters`, `rooms`, `timeline`, `notes`, `checkpointQuestions`, `finalQuestions`, `ending`을 반환합니다.
3. 파일 마지막의 `STORIES` 배열에 새 함수를 추가합니다.

```js
const STORIES = [STORY, createBroadcastStory(), createAnonymousStory(), createNewStory()];
```

각 에피소드는 독립된 id를 가져야 하며, 메시지/단서 id도 에피소드 안에서 중복되지 않아야 합니다.

## 챕터 추가 방법

1. 해당 에피소드의 `chapters` 배열에 새 챕터 객체를 추가합니다.
2. `id`, `title`, `intro`, `unlocks`, `checkpointQuestionId`를 지정합니다.
3. 새 챕터에서 열릴 채팅방은 `unlocks`에 `room-`으로 시작하는 id를 넣습니다.
4. 새 챕터의 메시지, 타임라인, 메모 항목에는 같은 `chapter` 값을 넣습니다.

## 채팅방/메시지 추가 방법

해당 에피소드의 `rooms`에 방을 추가하거나 기존 방의 `messages` 배열에 메시지를 추가합니다.

메시지 기본 구조:

```js
{
  id: "m-example-001",
  senderId: "minji",
  time: "10:12",
  text: "현금 봉투 누가 봤어?",
  type: "message",
  chapter: "ch1",
  clue: false
}
```

사진 설명 카드와 파일 공유는 실제 이미지를 쓰지 않고 `type: "photo"` 또는 `type: "file"`과 `description`으로 표현합니다.

## 단서 추가 방법

메시지, 타임라인 항목, 메모 항목에 다음 필드를 추가하면 진짜 단서로 처리됩니다.

```js
{
  clue: true,
  clueTitle: "20:16 사진 속 파우치",
  clueExplanation: "도윤의 물건이 열린 봉투 근처에 있었다.",
  clueWeight: 5,
  relatedCharacterIds: ["doyoon", "yuna"]
}
```

`clue: false`인 항목도 사용자가 수첩에 저장할 수 있습니다. 최종 결과 전까지 진짜 단서 여부는 공개되지 않습니다.

## 중간 추리 질문 추가 방법

해당 에피소드의 `checkpointQuestions`에 객관식 질문을 추가하고, 해당 챕터의 `checkpointQuestionId`에 연결합니다.

```js
{
  id: "cq-new",
  chapter: "ch2",
  question: "누구의 알리바이가 가장 약한가?",
  choices: ["A", "B", "C", "D"],
  answerIndex: 0,
  explanation: "해설 문장"
}
```

틀려도 다음 챕터는 열리지만 결과 점수에서 차이가 납니다.

## 수익화 확장 아이디어

현재 버전에는 광고 SDK나 결제 SDK가 없습니다. 대신 다음 위치와 기능을 확장 지점으로 남겨두었습니다.

- 홈 화면 하단 광고 영역
- 챕터 해금 후 광고 영역
- 결과 리포트 하단 광고 영역
- 보상형 광고 힌트 보기
- 놓친 단서 1개 공개
- 중간 추리 재도전
- 최종 제출 전 경고 힌트
- 프리미엄 장편 사건팩 잠금 카드

준비된 사건팩 예시:

- 학교생활 사건팩
- 알바 사건팩
- 커플 사건팩
- 회사생활 사건팩
- 미스터리 사건팩
- 장편 시즌팩

## 콘텐츠 제작 주의사항

- 실제 메신저 앱 UI를 그대로 복제하지 않습니다.
- 실제 인물, 실제 사건, 실제 브랜드, 실제 범죄 사건을 사용하지 않습니다.
- 모든 사건, 인물, 대화 내용은 가상으로 제작합니다.
- 외부 이미지, 실제 브랜드 로고, 실제 인물 사진을 사용하지 않습니다.
- 본 프로젝트의 이미지는 실제 메신저 앱, 실제 브랜드, 실제 인물 사진을 사용하지 않고 자체 제작한 SVG 그래픽으로 구성됩니다.
- 잔혹 범죄, 살인, 성범죄, 자살, 실제 범죄 모방 소재는 제외합니다.
- 생활형 미스터리, 학교, 동아리, 알바, 팀플, 축제 같은 가벼운 소재 중심으로 운영합니다.

## 보안 및 개인정보 안내

- 현재 프로젝트는 정적 웹앱이라 서버, DB, 로그인, 결제, API 키가 없습니다.
- 개인정보를 서버로 전송하지 않습니다.
- 진행 기록, 선택 단서, 설정값은 브라우저 `localStorage`에만 저장됩니다.
- 정적 사이트 특성상 `story.js`의 정답과 스토리 데이터는 개발자도구에서 볼 수 있습니다.
- 유료 사건팩, 온라인 랭킹, 계정 기능을 넣을 때는 별도의 서버 구조가 필요합니다.
- 외부 광고 SDK나 결제 SDK를 추가할 경우 별도의 개인정보/보안 검토가 필요합니다.

## 향후 이미지 에셋 확장 계획

- 사건별 추가 커버 이미지
- 챕터 해금용 미니 일러스트
- 인물별 추상 아바타 SVG
- 단서 유형별 아이콘 세트
- 결과 등급별 스탬프 그래픽

## 향후 업데이트 계획

- 사용자 제작 사건
- 온라인 랭킹
- 친구 공유 링크
- 프리미엄 장편 사건팩
- 보상형 광고 힌트
- PWA 설치 지원
- 에피소드 검색/필터
- 시즌별 사건 업데이트
- 여러 엔딩 분기
