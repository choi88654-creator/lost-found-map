\# 분실물 지도



주운 물건은 지도에 올리고, 잃어버린 물건은 지도에서 찾는 위치 기반 분실물 서비스입니다.



\- 배포 주소: (Vercel 주소)

\- 개발 기간: 2026.09 \~ 2026.11 (1인 개발)



\## 주요 기능



\- 지도 클릭으로 발견 위치 지정, 사진 업로드와 함께 분실물 등록

\- 지도 위 마커 표시, 마커 클릭 시 상세 정보 모달

\- 카테고리·상태(보관중/수령완료) 필터

\- 작성자 본인만 수령완료로 상태 변경 (익명 인증 + RLS)

\- 새 글 등록 시 디스코드 채널에 알림 카드 전송



\## 기술 스택



React, Vite, Tailwind CSS, Kakao Maps JavaScript API, Supabase(Postgres, Storage, Auth, Edge Functions), Vercel



\## 구조



```

브라우저(React) ──등록──▶ Supabase Storage(사진) + Postgres(items)

&#x20;       │

&#x20;       └─ itemId만 전송 ─▶ Edge Function ─▶ Postgres 조회 ─▶ Discord Webhook

```



\## 설계 결정



\- \*\*웹훅 호출 위치\*\*: 클라이언트에서 호출하면 웹훅 URL이 배포 JS에 노출되므로 Edge Function으로 옮겼습니다. URL은 서버 secret에만 보관합니다.

\- \*\*알림 위조·중복 방지\*\*: 프론트는 글 ID만 보내고, 함수가 DB에서 내용을 읽어 카드를 만듭니다. 등록 5분 이내이고 `notified\_at`이 비어 있는 글만 처리합니다.

\- \*\*소유권\*\*: 회원가입 없이 Supabase 익명 로그인으로 `owner\_id`를 기록하고, RLS로 본인 글만 수정되게 했습니다.

\- \*\*상태 끌어올리기\*\*: 등록 후 마커가 즉시 반영되도록 DB 조회를 `App`으로 올렸습니다.



\## 테스트 결과



| 항목 | 결과 |

|---|---|

| 등록→디스코드 도착 지연 | (실측: 평균 4초 / 최대 5초, 콜드스타트 제외) |

| 사용성 테스트 | (실제 응답 5명 |



\## 알려진 한계



\- 다른 사용자의 새 글은 새로고침해야 보입니다 (Realtime 미적용)

\- 익명 세션 기반이라 브라우저 데이터를 지우거나 기기를 바꾸면 소유권을 잃습니다

\- 업로드된 사진은 공개 URL로 접근됩니다

\- 본인 확인 질문 기능은 설계만 하고 구현하지 않았습니다



\## 실행 방법



```bash

npm install

cp .env.example .env   # 값 입력

npm run dev

```



`.env`에는 `VITE\_SUPABASE\_URL`, `VITE\_SUPABASE\_ANON\_KEY`가 필요하고, 카카오 JavaScript 키는 `index.html`에 넣습니다 (도메인 제한으로 보호되는 키).

