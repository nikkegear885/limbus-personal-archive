# LIMBUS ARCHIVE · 개인용 공략집

사진·글 블록을 섞어 공략 작성 / 카테고리 검색 / E.G.O 기프트·테마팩·덱 정리 / 거울던전 회차 기록 / JSON 백업·복원.

## GitHub Pages 배포

1. GitHub에서 `limbus-personal-archive`라는 **새 공개 저장소**를 만듭니다. 니케 장비현황 저장소와 별도입니다.
2. 저장소에 `index.html`, `.nojekyll`, `README.md` 파일을 업로드합니다.
3. `Settings → Pages → Build and deployment → Source: Deploy from a branch → Branch: main / (root) → Save`.
4. 주소: `https://nikkegear885.github.io/limbus-personal-archive/` (저장소 이름이 위와 동일한 경우).

## 개인정보 / 데이터 저장

- GitHub Pages **화면은 공개**입니다. 비밀번호 보호 사이트가 아닙니다.
- 이 앱에서 작성한 공략·사진·회차 기록은 기본적으로 **접속한 기기의 브라우저 IndexedDB에만 저장**되고, GitHub 저장소로 업로드되지 않습니다.
- **다른 기기에서는 공략이 자동 동기화되지 않습니다.** `↓ 백업`으로 JSON을 저장하고 다른 브라우저에서 `↑ 불러오기`하세요.
- 기존 오프라인 HTML 버전 자료를 가져오려면 **반드시 기존 파일을 실행한 브라우저에서 백업을 먼저 다운로드**한 후, GitHub Pages 웹사이트에서 불러오세요. origin이 달라 자동 이전되지 않습니다.
- 브라우저 저장 데이터를 지우면 복구하기 어렵습니다. 사진 첨부 후에는 정기적인 백업이 필수입니다.
- 공개 GitHub 저장소에는 개인 백업 JSON, 사진, 계정 정보, 암호를 올리지 마세요.

## 구조

- `index.html`: 모든 UI/스타일/스크립트 포함. 외부 라이브러리가 없는 정적 단일 페이지.
- `.nojekyll`: GitHub Pages의 Jekyll 처리 비활성화.
- `README.md`: 배포·백업 설명.

## 배포 상태 확인

Pages를 `main / (root)`로 저장한 후 저장소의 Actions 탭에서 `pages build and deployment` 작업이 성공했는지 확인하세요. 실패하거나 작업이 없으면 해당 작업 및 저장소의 Actions 설정을 확인하세요.
