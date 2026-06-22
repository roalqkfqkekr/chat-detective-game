# 톡탐정 검색엔진 등록 가이드

## 1. 배포 확인

접속 주소:

`https://playatelier.github.io/chat-detective-game/`

sitemap 확인:

`https://playatelier.github.io/chat-detective-game/sitemap.xml`

robots 확인:

`https://playatelier.github.io/chat-detective-game/robots.txt`

GitHub username을 변경했으므로 이전 GitHub Pages 주소 기준으로 등록했던 Google Search Console, Naver Search Advisor, Bing Webmaster Tools 속성은 새 주소로 다시 등록해야 합니다. 기존 Google 인증 파일이 프로젝트에 남아 있다면 삭제하지 않아도 되지만, 새 URL 속성에서 다시 소유권 확인과 sitemap 제출을 진행하세요.

## 2. Google Search Console 등록

1. 접속: `https://search.google.com/search-console`
2. Google 계정으로 로그인합니다.
3. `속성 추가`를 선택합니다.
4. `URL 접두어`를 선택합니다.
5. 입력 URL:

   `https://playatelier.github.io/chat-detective-game/`

6. 소유권 인증 방식은 `HTML 파일 업로드`를 우선 사용합니다.
7. Google이 제공하는 `googlexxxx.html` 파일을 프로젝트 루트에 넣습니다.
8. 다음 명령으로 커밋하고 push합니다.

   ```bash
   git add googlexxxx.html
   git commit -m "Add Google Search Console verification file"
   git push
   ```

9. 배포 후 아래 주소로 인증 파일 접속을 확인합니다.

   `https://playatelier.github.io/chat-detective-game/googlexxxx.html`

10. Search Console에서 `확인`을 누릅니다.
11. 인증 완료 후 `Sitemaps` 메뉴에서 다음 sitemap을 제출합니다.

    `https://playatelier.github.io/chat-detective-game/sitemap.xml`

12. `URL 검사`에서 메인 URL을 입력합니다.

    `https://playatelier.github.io/chat-detective-game/`

13. `실제 URL 테스트`를 실행합니다.
14. `색인 생성 요청`을 누릅니다.

## 3. 네이버 서치어드바이저 등록

1. 접속: `https://searchadvisor.naver.com`
2. 네이버 계정으로 로그인합니다.
3. `웹마스터 도구`로 이동합니다.
4. 사이트 등록에 다음 주소를 입력합니다.

   `https://playatelier.github.io/chat-detective-game/`

5. 소유확인은 `HTML 파일 업로드` 방식을 우선 사용합니다.
6. 네이버가 제공하는 인증 파일을 프로젝트 루트에 넣습니다.
7. 다음 명령으로 커밋하고 push합니다.

   ```bash
   git add naver*.html
   git commit -m "Add Naver Search Advisor verification file"
   git push
   ```

8. 배포 후 인증 파일 URL 접속을 확인합니다.
9. 네이버 서치어드바이저에서 소유확인을 완료합니다.
10. 사이트맵 제출 메뉴에 다음 주소를 제출합니다.

    `https://playatelier.github.io/chat-detective-game/sitemap.xml`

11. 웹페이지 수집 요청에 다음 주소를 제출합니다.

    `https://playatelier.github.io/chat-detective-game/`

## 4. Bing Webmaster Tools 등록

1. 접속: `https://www.bing.com/webmasters`
2. Microsoft 계정으로 로그인합니다.
3. 사이트 추가에 다음 주소를 입력합니다.

   `https://playatelier.github.io/chat-detective-game/`

4. 안내에 따라 소유권 인증을 완료합니다.
5. sitemap 제출 메뉴에 다음 주소를 제출합니다.

   `https://playatelier.github.io/chat-detective-game/sitemap.xml`

6. `URL Submission`에서 메인 URL을 제출합니다.

   `https://playatelier.github.io/chat-detective-game/`

## 5. 등록 후 확인

며칠 뒤 아래 검색어로 확인합니다.

```text
site:playatelier.github.io/chat-detective-game
```

또는:

```text
톡탐정 대화 속 진실을 찾아라
```

## 6. 주의

- 검색엔진 등록 후 바로 노출되지 않을 수 있습니다.
- 반영에는 며칠에서 몇 주까지 걸릴 수 있습니다.
- 검색 노출 순위는 보장되지 않습니다.
- GitHub Project Pages에서는 `robots.txt`가 도메인 루트가 아니라 `/chat-detective-game/robots.txt`에 놓입니다.
- 그래도 sitemap은 Search Console, Naver Search Advisor, Bing Webmaster Tools에 직접 제출할 수 있습니다.
- 커스텀 도메인을 연결하면 장기적으로 SEO 관리가 더 유리합니다.
- Google, Naver, Bing 소유권 인증은 계정 로그인과 브라우저 인증이 필요하므로 자동화 도구가 대신 완료할 수 없습니다.
