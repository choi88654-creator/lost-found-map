\# 트러블슈팅 기록



프로젝트를 진행하며 겪은 에러와 해결 과정을 기록합니다.



\---



\## 1. 카카오맵 SDK 403 에러



\- \*\*일시\*\*: 2026-09-30

\- \*\*증상\*\*: 지도가 뜨지 않고, 콘솔에 카카오 SDK 요청이 403으로 실패

\- \*\*원인\*\*: 카카오 디벨로퍼스에서 Web 플랫폼 도메인 등록 저장 누락 또는 카카오맵 제품 설정 미활성화

\- \*\*해결\*\*: 앱 > 일반 > 플랫폼에서 `http://localhost:5173` 등록 후 반드시 "저장" 클릭, 제품 설정에서 카카오맵 활성화 여부 확인

\- \*\*배운 점\*\*: 카카오 API는 앱 생성만으로 열리지 않고, 도메인 등록과 제품 활성화가 별도로 필요하다



\## 2. Supabase 요청이 GitHub 주소로 전송됨 (CORS 에러)



\- \*\*일시\*\*: 2026-10-03

\- \*\*증상\*\*: 콘솔에 CORS 에러, 요청 주소가 `github.com/.../rest/v1/items`로 찍힘

\- \*\*원인\*\*: `.env`의 `VITE\_SUPABASE\_URL`에 Supabase Project URL 대신 GitHub 저장소 주소를 붙여넣음

\- \*\*해결\*\*: Supabase 대시보드 Project Settings > API에서 Project URL을 다시 복사해 교체

\- \*\*배운 점\*\*: 에러 메시지에 찍힌 요청 URL을 먼저 확인하면 원인을 빨리 찾을 수 있다



\## 3. Supabase URL에 `/rest/v1/`까지 포함되어 요청 경로가 중복됨



\- \*\*일시\*\*: 2026-10-03

\- \*\*증상\*\*: URL을 고쳤는데도 데이터 불러오기 실패

\- \*\*원인\*\*: API URL 필드를 `/rest/v1/`까지 복사해서 `createClient()`에 넣음. 라이브러리가 내부적으로 `/rest/v1/`를 붙이므로 경로가 중복됨

\- \*\*해결\*\*: `.env`의 URL을 `https://xxxx.supabase.co`까지만 남기고 끝의 `/rest/v1/`와 `/` 제거 후 개발 서버 재시작

\- \*\*배운 점\*\*: Vite는 `.env` 변경 시 개발 서버를 재시작해야 반영된다



\## 4. PowerShell에서 npm 스크립트 실행 차단



\- \*\*일시\*\*: 2026-10-05

\- \*\*증상\*\*: `npm run dev` 실행 시 스크립트 실행 불가 에러

\- \*\*원인\*\*: Windows PowerShell 실행 정책이 `.ps1` 스크립트를 차단

\- \*\*해결\*\*: 관리자 PowerShell에서 `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser` 실행

\- \*\*배운 점\*\*: 코드가 아닌 OS 보안 설정 때문에 생기는 에러도 있다



\## 5. `npm run dev` 실행 시 package.json을 찾지 못함



\- \*\*일시\*\*: 2026-10-05

\- \*\*증상\*\*: `ENOENT: no such file or directory, open 'C:\\Users\\CES\\package.json'`

\- \*\*원인\*\*: 프로젝트 폴더가 아닌 사용자 홈 폴더에서 명령어를 실행

\- \*\*해결\*\*: `cd`로 `lost-found-map` 폴더로 이동한 뒤 실행

\- \*\*배운 점\*\*: 터미널의 현재 경로를 항상 확인한다



\## 6. 지도 클릭 이벤트에서 최신 상태값을 읽지 못하는 문제 (예방)



\- \*\*일시\*\*: 2026-10-06

\- \*\*상황\*\*: 지도 클릭 이벤트는 지도 생성 시 한 번만 등록되어, 그 안에서 React 상태(`isPicking`)를 읽으면 초기값에 고정됨

\- \*\*해결\*\*: `useRef`에 최신 상태를 계속 저장해 이벤트 핸들러에서 ref를 읽도록 설계

\- \*\*배운 점\*\*: 외부 라이브러리 이벤트 핸들러와 React 상태를 연결할 때는 클로저 문제를 고려해야 한다



\## 7. Vercel 배포 실패: `@tailwindcss/vite` 패키지를 찾을 수 없음



\- \*\*일시\*\*: 2026-10-07

\- \*\*증상\*\*: 로컬에서는 정상 동작하는데, Vercel 빌드 로그에 `ERR\_MODULE\_NOT\_FOUND: Cannot find package '@tailwindcss/vite'`가 찍히며 `npm run build`가 종료 코드 1로 실패

\- \*\*원인\*\*: 패키지가 프로젝트의 `package.json`에 기록되지 않았음. (이전에 프로젝트 폴더가 아닌 상위 폴더에서 npm install을 실행해, Node가 상위 폴더의 node\_modules에서 패키지를 찾아주는 바람에 로컬에서만 정상 동작했던 것으로 추정)

\- \*\*해결\*\*: 프로젝트 폴더 안에서 `npm install tailwindcss @tailwindcss/vite`를 다시 실행해 `package.json`에 반영한 뒤 커밋/푸시

\- \*\*배운 점\*\*: 로컬에서 되는 것과 배포 환경에서 되는 것은 다르다. 배포 전에 `npm run build`로 먼저 확인하고, 패키지는 반드시 프로젝트 폴더 안에서 설치한다



\## 8. 카카오 개발자 콘솔에서 도메인 등록 메뉴를 찾지 못함



\- \*\*일시\*\*: 2026-10-07

\- \*\*증상\*\*: Vercel 배포 후 카카오 도메인을 등록하려는데 "앱 > 일반"에 "플랫폼" 섹션이 없음

\- \*\*원인\*\*: 카카오 개발자 콘솔 UI 개편으로 Web 플랫폼 등록 메뉴가 사라지고, 키 종류별 설정 화면으로 통합됨

\- \*\*해결\*\*: 앱 > 플랫폼 키 > JavaScript 키 상세 페이지의 "JavaScript SDK 도메인"에 배포 도메인 추가 후 저장

\- \*\*배운 점\*\*: 외부 서비스 콘솔은 UI가 자주 바뀐다. 이전에 해결한 경로를 기록해두면 같은 문제를 반복해서 헤매지 않는다



## 9. supabase.js에 URL을 따옴표 없이 직접 입력하여 파싱 에러



- **일시**: 2026-10-09
- **증상**: `[PARSE_ERROR] Expected a semicolon or an implicit semicolon after a statement` (`src/lib/supabase.js:3`)
- **원인**: 3번째 줄에 `const supabaseUrl = https://...supabase.co/rest/v1/`처럼 URL이 문자열 따옴표 없이 코드에 직접 들어가 있었음. 끝의 `/rest/v1/`도 3번 항목과 같은 오류
- **해결**: `supabase.js`는 `import.meta.env.VITE_SUPABASE_URL`로 환경변수를 읽도록 되돌리고, URL은 `.env`에만 `https://xxxx.supabase.co` 형태로 작성
- **배운 점**: 키와 URL은 코드에 직접 쓰지 않고 환경변수로 분리한다. 에러 화면의 파일명과 줄 번호가 원인을 정확히 알려준다



## 10. 상태 끌어올리기로 구조 변경 (설계 결정 기록)



- **일시**: 2026-10-09
- **상황**: 등록 후 지도에 마커가 즉시 반영되지 않음. 마커 데이터를 `KakaoMap`이 직접 불러와서 등록 완료를 알 방법이 없었음
- **해결**: DB 조회(`items` 상태)를 `App.jsx`로 올리고, 등록 성공 시 `loadItems()`를 다시 호출. `KakaoMap`은 받은 `items`대로 마커를 그리기만 함. 마커를 다시 그릴 때는 기존 마커를 먼저 제거해 중복 방지
- **배운 점**: 여러 컴포넌트가 같은 데이터에 반응해야 하면 상태를 공통 부모에 둔다

10/11 - 상세 모달 커밋, 등록 폼에 보관 장소 입력 추가
        TROUBLESHOOTING 8~10번 기록, 배포 사이트 동작 확인

10/12 - 카테고리/상태 필터 구현 (filteredItems + useMemo, FilterBar 컴포넌트)
        CATEGORIES를 constants.js로 분리



## 11. 수령완료 변경 권한 설계

- 상황: 누구나 글을 등록하는 구조에서 update를 열면 남의 글 상태 조작 가능
- 해결: Supabase 익명 로그인 + items.owner_id(default auth.uid()) + RLS(owner_id = auth.uid())
- 주의: RLS가 막은 update는 에러 없이 0행을 반환하므로 클라이언트에서 직접 검사
- 한계: 브라우저 세션 기반이라 기기 변경 시 소유권 상실