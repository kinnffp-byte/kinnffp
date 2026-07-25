/* ── Supabase 연결 (이 두 줄만 채우면 됩니다) ───────────────────── */
const SUPABASE_URL  = 'https://bpzwdbnglicqmhqtdpiu.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwendkYm5nbGljcW1ocXRkcGl1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ5NDI1OTQsImV4cCI6MjEwMDUxODU5NH0.PEUxb3QIF042a3P7k40-dPSqHwqsa56vOYw1OlHVh2w';
/* ─────────────────────────────────────────────────────────────── */

/* CDN이 차단되거나 키가 비어 있어도 페이지가 죽지 않도록 방어 */
var db = null;
try {
  if (window.supabase && SUPABASE_URL.indexOf('{{') === -1) {
    db = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON);
  } else {
    console.warn('[supabase] 연결 안 됨 — 기본값으로 표시합니다.');
  }
} catch (e) { console.warn('[supabase] init 실패', e); }

async function fetchAll(table, order = 'sort') {
  if (!db) return [];
  const { data, error } = await db.from(table).select('*').order(order, { ascending: true });
  if (error) { console.warn('[fetchAll]', table, error.message); return []; }
  return data || [];
}
async function fetchProfile() {
  if (!db) return null;
  const { data, error } = await db.from('profile').select('data').eq('id', 1).single();
  if (error) { console.warn('[fetchProfile]', error.message); return null; }
  return data ? data.data : null;
}
async function saveProfile(obj) {
  if (!db) return { error: 'no db' };
  return db.from('profile').update({ data: obj }).eq('id', 1);
}
async function insertRow(table, row) { if (!db) return { error: 'no db' }; return db.from(table).insert(row); }
async function updateRow(table, id, row) { if (!db) return { error: 'no db' }; return db.from(table).update(row).eq('id', id); }
async function deleteRow(table, id) { if (!db) return { error: 'no db' }; return db.from(table).delete().eq('id', id); }

/* 테마: profile.data 의 theme-* 키를 CSS 변수로 적용 */
const THEME_KEYS = ['ink','muted','paper','night','night-soft','iris','ice',
                    'rose','sand','mint','night-deep','hero','sheet','page','screen'];
function applyTheme(data) {
  if (!data) return;
  const root = document.documentElement.style;
  THEME_KEYS.forEach(k => {
    const v = data['theme-' + k];
    if (v) root.setProperty('--' + k, v);
  });
}
