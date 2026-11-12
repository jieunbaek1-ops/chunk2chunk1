# Chunk2Speak · Netlify 배포 묶음 (교사별 API 키 방식)

## 구조
- index.html : 웹앱 (학생 화면 + 교사 대시보드 + "AI 설정" 탭)
- netlify/functions/gemini.js : Gemini 호출 중계 (키를 저장하지 않고 요청마다 전달받음)
- netlify.toml : 배포 설정

## 환경 변수
없어도 됩니다. 각 교사가 웹앱의 **교사 → AI 설정** 탭에서 자신의 Google API 키를 입력합니다.
- GEMINI_MODEL (선택): 기본 모델을 바꿀 때만 설정합니다. 기본값은 gemini-2.5-flash입니다.

## 교사 화면 PIN
index.html의 `const TEACHER_PIN = '1234';`는 교사 화면을 학생이 실수로 열지 않도록 하는 장치입니다.
배포 전에 값을 바꾸세요. 서버에서 검사하지 않으므로 보안 장치는 아닙니다.

## 배포
1. GitHub 저장소에 이 폴더를 올리고 Netlify에서 "Import from Git"으로 연결 (권장)
2. 또는 Netlify CLI: `npx netlify-cli deploy --prod`

## 교사 안내
1. 배포 주소를 열고 교사 화면에서 AI 설정 탭으로 들어갑니다.
2. Google AI Studio에서 만든 API 키를 입력하고 저장합니다.
3. "연결 테스트"로 확인합니다.
4. 공용 기기에서는 사용 후 "키 지우기"를 누릅니다.
