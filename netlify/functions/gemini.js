// 교사 개인 API 키 방식의 Gemini 호출 (Netlify 서버 함수).
// 키는 요청마다 교사 기기에서 전달되며, 서버에 저장하거나 기록하지 않습니다.
// 환경 변수: GEMINI_MODEL (선택, 기본 gemini-2.5-flash)

const json = (code, obj) => ({
  statusCode: code,
  headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
  body: JSON.stringify(obj)
});
const KEY_RE = /^AIza[0-9A-Za-z_-]{20,}$/;
const MODEL_RE = /^[a-z0-9][a-z0-9.\-]{2,60}$/i;

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return json(405, { error: 'POST 요청만 받을 수 있어요.' });

  let body;
  try { body = JSON.parse(event.body || '{}'); }
  catch (e) { return json(400, { error: '요청 형식이 잘못됐어요.' }); }

  const apiKey = String(body.apiKey || '').trim();
  if (!KEY_RE.test(apiKey)) return json(400, { error: 'API 키 형식이 맞지 않아요. 설정 화면에서 다시 입력해 주세요.' });

  const model = MODEL_RE.test(String(body.model || '')) ? String(body.model)
    : (process.env.GEMINI_MODEL || 'gemini-2.5-flash');
  const base = 'https://generativelanguage.googleapis.com/v1beta';
  const headers = { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey };

  try {
    if (body.action === 'test') {
      const r = await fetch(`${base}/models`, { headers });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) return json(502, { error: (data.error && data.error.message) || ('Google 오류 ' + r.status) });
      const names = (data.models || []).map(m => String(m.name || '').replace('models/', ''));
      return json(200, { ok: true, count: names.length, hasModel: names.includes(model), model });
    }

    const prompt = String(body.prompt || '').slice(0, 20000);
    if (!prompt) return json(400, { error: '내용이 비어 있어요.' });
    const r = await fetch(`${base}/models/${encodeURIComponent(model)}:generateContent`, {
      method: 'POST', headers,
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) return json(502, { error: (data.error && data.error.message) || ('Gemini 오류 ' + r.status) });
    const c = (data.candidates || [])[0];
    const text = ((c && c.content && c.content.parts) || []).map(p => p.text || '').join('').trim();
    return json(200, { text });
  } catch (e) {
    return json(502, { error: 'Google 서버에 연결하지 못했어요: ' + e.message });
  }
};
