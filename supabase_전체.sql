-- ═══════════════════════════════════════════════════════════════
--  김쁘피 여름 보상 아카이브 — Supabase 전체 설치 SQL
--  사용법: Supabase → SQL Editor → 새 쿼리 → 전체 붙여넣고 Run (한 번에)
--  ⚠️ 한 프로젝트 = 한 사람. 다른 사람 프로젝트 재사용 금지.
-- ═══════════════════════════════════════════════════════════════

-- ✅ 이 파일은 몇 번 돌려도 안전합니다.
--    없는 것만 만들고, 이미 들어있는 데이터는 절대 건드리지 않습니다.
--    (관리자에서 고친 순서·이름·문구가 초기화되지 않습니다)
--
--    ⚠️ 정말 전부 초기화하고 싶을 때만 아래 7줄의 주석을 지우고 돌리세요.
-- drop table if exists outfits cascade;
-- drop table if exists merch cascade;
-- drop table if exists goods_tiers cascade;
-- drop table if exists roulette cascade;
-- drop table if exists fixed_rewards cascade;
-- drop table if exists promises cascade;
-- drop table if exists profile cascade;

-- ── 1. 모든 문구·색 (한 줄에 전부 담김) ─────────────────────────
create table if not exists profile (
  id   int primary key,
  data jsonb not null default '{}'::jsonb
);

-- ── 📈 공약 목록 ─────────────────────────────────────
create table if not exists promises (
  id   bigserial primary key,
  amount       text default '',   -- 금액
  title        text default '',   -- 공약 내용
  sort int not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists promises_sort_idx on promises (sort);

-- ── 🎯 확정 방셀 단가 ─────────────────────────────────────
create table if not exists fixed_rewards (
  id   bigserial primary key,
  count        text default '',   -- 개수
  title        text default '',   -- 보상 내용
  tone         text default '',   -- 색
  sort int not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists fixed_rewards_sort_idx on fixed_rewards (sort);

-- ── 🎲 룰렛 항목 ─────────────────────────────────────
create table if not exists roulette (
  id   bigserial primary key,
  title        text default '',   -- 항목
  chance       text default '',   -- 확률
  sort int not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists roulette_sort_idx on roulette (sort);

-- ── 🎁 굿즈 단계 ─────────────────────────────────────
create table if not exists goods_tiers (
  id   bigserial primary key,
  count        text default '',   -- 개수
  label        text default '',   -- 영문 라벨
  title        text default '',   -- 이름
  description  text default '',   -- 설명
  images       jsonb default '[]'::jsonb,   -- 사진 주소(줄바꿈)
  tone         text default '',   -- 색
  sort int not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists goods_tiers_sort_idx on goods_tiers (sort);

-- ── 🖼 굿즈 갤러리 ─────────────────────────────────────
create table if not exists merch (
  id   bigserial primary key,
  image_url    text default '',   -- 사진 주소
  name         text default '',   -- 상품 이름
  sort int not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists merch_sort_idx on merch (sort);

-- ── 👗 의상 포스터 ─────────────────────────────────────
create table if not exists outfits (
  id   bigserial primary key,
  collection   text default '',   -- 컬렉션
  name         text default '',   -- 이름
  image_url    text default '',   -- 포스터 사진(3:4)
  origin_url   text default '',   -- 원본 사진(선택)
  sort int not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists outfits_sort_idx on outfits (sort);

-- ── 2. 접근 권한 (RLS) ────────────────────────────────────────
--  이 사이트는 로그인 없이 anon 키로 읽고, 관리자 페이지도 같은 anon 키로 씁니다.
--  즉 anon 에게 읽기+쓰기를 모두 허용해야 관리자 저장이 동작합니다.
--  관리자 페이지는 비밀번호로 가려져 있지만, 키가 노출되면 누구나 쓸 수 있습니다.
--  → 관리자 비밀번호는 반드시 '버리는 비번'을 쓰세요.
alter table profile enable row level security;
drop policy if exists "profile_read" on profile;
create policy "profile_read"   on profile for select using (true);
drop policy if exists "profile_insert" on profile;
create policy "profile_insert" on profile for insert with check (true);
drop policy if exists "profile_update" on profile;
create policy "profile_update" on profile for update using (true) with check (true);
drop policy if exists "profile_delete" on profile;
create policy "profile_delete" on profile for delete using (true);
alter table promises enable row level security;
drop policy if exists "promises_read" on promises;
create policy "promises_read"   on promises for select using (true);
drop policy if exists "promises_insert" on promises;
create policy "promises_insert" on promises for insert with check (true);
drop policy if exists "promises_update" on promises;
create policy "promises_update" on promises for update using (true) with check (true);
drop policy if exists "promises_delete" on promises;
create policy "promises_delete" on promises for delete using (true);
alter table fixed_rewards enable row level security;
drop policy if exists "fixed_rewards_read" on fixed_rewards;
create policy "fixed_rewards_read"   on fixed_rewards for select using (true);
drop policy if exists "fixed_rewards_insert" on fixed_rewards;
create policy "fixed_rewards_insert" on fixed_rewards for insert with check (true);
drop policy if exists "fixed_rewards_update" on fixed_rewards;
create policy "fixed_rewards_update" on fixed_rewards for update using (true) with check (true);
drop policy if exists "fixed_rewards_delete" on fixed_rewards;
create policy "fixed_rewards_delete" on fixed_rewards for delete using (true);
alter table roulette enable row level security;
drop policy if exists "roulette_read" on roulette;
create policy "roulette_read"   on roulette for select using (true);
drop policy if exists "roulette_insert" on roulette;
create policy "roulette_insert" on roulette for insert with check (true);
drop policy if exists "roulette_update" on roulette;
create policy "roulette_update" on roulette for update using (true) with check (true);
drop policy if exists "roulette_delete" on roulette;
create policy "roulette_delete" on roulette for delete using (true);
alter table goods_tiers enable row level security;
drop policy if exists "goods_tiers_read" on goods_tiers;
create policy "goods_tiers_read"   on goods_tiers for select using (true);
drop policy if exists "goods_tiers_insert" on goods_tiers;
create policy "goods_tiers_insert" on goods_tiers for insert with check (true);
drop policy if exists "goods_tiers_update" on goods_tiers;
create policy "goods_tiers_update" on goods_tiers for update using (true) with check (true);
drop policy if exists "goods_tiers_delete" on goods_tiers;
create policy "goods_tiers_delete" on goods_tiers for delete using (true);
alter table merch enable row level security;
drop policy if exists "merch_read" on merch;
create policy "merch_read"   on merch for select using (true);
drop policy if exists "merch_insert" on merch;
create policy "merch_insert" on merch for insert with check (true);
drop policy if exists "merch_update" on merch;
create policy "merch_update" on merch for update using (true) with check (true);
drop policy if exists "merch_delete" on merch;
create policy "merch_delete" on merch for delete using (true);
alter table outfits enable row level security;
drop policy if exists "outfits_read" on outfits;
create policy "outfits_read"   on outfits for select using (true);
drop policy if exists "outfits_insert" on outfits;
create policy "outfits_insert" on outfits for insert with check (true);
drop policy if exists "outfits_update" on outfits;
create policy "outfits_update" on outfits for update using (true) with check (true);
drop policy if exists "outfits_delete" on outfits;
create policy "outfits_delete" on outfits for delete using (true);

-- ── 3. 기본값 넣기 ────────────────────────────────────────────
insert into profile (id, data) values (1, '{"site-title": "김쁘피 여름 보상 아카이브", "site-desc": "김쁘피의 누적공약, 방셀룰렛, 한정 굿즈와 여름 의상을 한눈에 확인하세요.", "brand-name": "KIMFP", "brand-sub": "REWARD ARCHIVE", "status-time": "9:41", "status-title": "김쁘피 보상 아카이브", "side-kicker": "SUMMER CHANNEL 26", "side-title": "여름 한정 편성<br>보상 안내", "mobile-brand": "김쁘피", "footer-left": "KIMFP · REWARD ARCHIVE", "footer-right": "SUMMER 2026", "soop-id": "gurm01", "soop-url": "https://www.sooplive.com/station/gurm01", "loader-image": "", "trans-prefix": "김쁘피 · ", "nav1-eyebrow": "ON AIR", "nav1-label": "메인", "nav1-mark": "✦", "nav2-eyebrow": "SIGNAL POWER", "nav2-label": "누적공약", "nav2-mark": "↗", "nav3-eyebrow": "FRAME INDEX", "nav3-label": "방셀보상", "nav3-mark": "◈", "nav4-eyebrow": "SUPPLY DROP", "nav4-label": "굿즈", "nav4-mark": "□", "nav5-eyebrow": "LOOKBOOK", "nav5-label": "의상", "nav5-mark": "♡", "hero-overline-l": "KIMFP ARCHIVE", "hero-overline-r": "2026 / SUMMER", "hero-title-a": "KIM", "hero-title-b": "FP", "hero-title-sub": "후원 보상 컬렉션", "hero-lead": "누적공약부터 한정 방셀, 룰렛, 굿즈와 의상까지. 이번 시즌의 모든 보상을 하나의 아카이브로 정리했습니다.", "hero-btn1": "REWARD INDEX", "hero-btn2": "VIEW LOOKBOOK", "signal-text": "VIRTUAL SIGNAL ONLINE", "signal-channel": "SUMMER CHANNEL · 26", "hero-ghost": "SUMMER", "idx1-small": "CUMULATIVE PROMISE", "idx1-strong": "누적공약", "idx1-em": "10만 — 300만", "idx2-small": "REWARD & ROULETTE", "idx2-strong": "방셀보상", "idx2-em": "100개 · 11연차", "idx3-small": "LIMITED MERCHANDISE", "idx3-strong": "굿즈보상", "idx3-em": "6 TIERS", "lookbook-kicker": "CURATED LOOKS", "lookbook-title": "이번 여름의 두 가지 무드", "lookbook-btn": "FULL LOOKBOOK", "ledger-kicker": "FIXED REWARD", "ledger-title": "확정 방셀 단가", "ledger-btn": "DETAIL", "goodsfeat-kicker": "MERCHANDISE / 06", "goodsfeat-title": "취향으로 완성하는<br>리워드 셀렉션", "goodsfeat-desc": "블랙과 크림, 낮과 밤. 단계별 한정 굿즈를 확인해보세요.", "goodsfeat-btn": "EXPLORE GOODS", "promise-kicker": "CUMULATIVE PROMISE", "promise-title": "누적공약", "promise-desc": "누적으로 함께 채워가는 김쁘피의 장기 공약이에요.", "promise-live": "LIVE PROGRESS", "promise-current": "0", "promise-final": "300", "promise-note": "완료된 구간은 진하게, 다음 목표는 포인트 색으로 표시됩니다.", "promise-foot-strong": "40만 달성 시 이전 공약 모두 이행", "promise-foot-desc": "정확한 진행 일정과 세부 방식은 방송 공지를 기준으로 확인해주세요.", "reward-kicker": "PERSONAL REWARD", "reward-title": "방셀보상", "reward-desc": "확정 방셀 단가와 룰렛 확률을 함께 확인할 수 있습니다.", "rp1-num": "02", "rp1-small": "FIXED REWARD", "rp1-title": "확정 방셀 단가", "rp1-note": "삼국지 한정 방셀 및 히든 방셀은 룰렛에서만 구매 가능해요.", "rp2-num": "01", "rp2-small": "DOPAMINE ROULETTE", "rp2-title": "100개 방셀룰렛", "roulette-badge-num": "11", "roulette-badge-text": "1000개 시 연차", "roulette-percol": "9", "goods-kicker": "LIMITED MERCHANDISE", "goods-title": "굿즈보상", "goods-desc": "선택형 굿즈부터 모든 색상 풀세트까지 단계별로 정리했습니다.", "goods-caution-strong": "굿즈 풀세트 제외 안내", "goods-caution-text": "버인 바람막이와 버인 방셀은 굿즈 풀세트에서 제외돼요.", "merch-kicker": "MERCH GALLERY", "merch-title": "전체 굿즈 보기", "merch-note": "상품 사진은 비율에 맞춰 카드 안에 자동으로 정리돼요.", "outfit-kicker": "SUMMER LOOKBOOK", "outfit-title": "한정의상", "outfit-desc": "사진을 누르면 해당 컬렉션의 방셀 포스터 5종이 아래에 펼쳐집니다.", "col1-index": "01", "col1-eyebrow": "SUMMER LIMITED", "col1-title": "여름 한정 의상", "col1-note": "초선 한정의상은 룰렛에서만 구매 가능해요.", "col1-cover": "assets/summer-outfits.png", "col2-index": "02", "col2-eyebrow": "PPEUKINI LIMITED", "col2-title": "쁘키니 한정 의상", "col2-note": "각 의상의 디테일과 포즈를 천천히 확인해보세요.", "col2-cover": "assets/ppeukini-outfits.png", "empty-outfit": "이 컬렉션에는 아직 송출된 프레임이 없어요.", "theme-ink": "#243447", "theme-muted": "#526B85", "theme-paper": "#F7FAFC", "theme-sheet": "#EFF5FA", "theme-night": "#2C4A63", "theme-night-soft": "#3A5C77", "theme-iris": "#1F6A97", "theme-ice": "#CDEAF7", "theme-rose": "#F6DCE2", "theme-sand": "#F0C43C", "theme-mint": "#D8EDE4", "theme-night-deep": "#1E3448", "theme-hero": "#2C4A63", "theme-page": "#E8F4FB", "theme-screen": "#FBFDFE", "logo-image": "assets/logo-wordmark-white.png", "logo-emblem": "assets/logo-emblem.png", "page-image": ""}')
  on conflict (id) do nothing;   -- 이미 있으면 그대로 둔다(수정분 보존)

-- 공약 목록 (10개)
insert into promises (amount, title, sort)
select * from (values
  ('10만', '엔더 하드코어 노방종', 0),
  ('20만', '종겜 똥겜 핀볼', 1),
  ('30만', '항마력 딸리는 일식 노래 커버하기', 2),
  ('40만', '이전 단계 공약 모두 이행', 3),
  ('50만', '오리지널곡 제작', 4),
  ('60만', '마크서버 만들기', 5),
  ('70만', '오리지널곡 + 3D 뮤직비디오 제작', 6),
  ('90만', '호룰 만지기 VLOG', 7),
  ('100만', '미니콘서트 (feat. 버인초청?)', 8),
  ('300만', '보스한테 언니 시집보내기', 9)
) as v(amount, title, sort)
where not exists (select 1 from promises);

-- 확정 방셀 단가 (5개)
insert into fixed_rewards (count, title, tone, sort)
select * from (values
  ('1111', '여름 랜덤 단컷', 'pink', 0),
  ('2222', '여름 선택 2컷', 'blue', 1),
  ('3333', '쁘키니 랜덤 2컷', 'yellow', 2),
  ('4999', '버인방셀 + 버인바람막이', 'mint', 3),
  ('5555', '쁘키니 선택 2종 2컷', 'lavender', 4)
) as v(count, title, tone, sort)
where not exists (select 1 from fixed_rewards);

-- 룰렛 항목 (18개)
insert into roulette (title, chance, sort)
select * from (values
  ('여름 A', '0.8%', 0),
  ('여름 B', '0.8%', 1),
  ('여름 C', '0.8%', 2),
  ('여름 D', '0.8%', 3),
  ('삼국지 한정 초선', '0.4%', 4),
  ('쁘키니 A', '0.3%', 5),
  ('쁘키니 B', '0.3%', 6),
  ('쁘키니 C', '0.3%', 7),
  ('쁘키니 D', '0.3%', 8),
  ('쁘키니 히든', '0.1%', 9),
  ('여름랜덤방셀', '3%', 10),
  ('김', '3%', 11),
  ('쁘', '3%', 12),
  ('피', '3%', 13),
  ('다음 룰렛 2배 (글자 적용 X)', '20%', 14),
  ('쿼쁘', '5%', 15),
  ('쁘독', '4%', 16),
  ('용캐지원금', '54.1%', 17)
) as v(title, chance, sort)
where not exists (select 1 from roulette);

-- 굿즈 단계 (6개)
insert into goods_tiers (count, label, title, description, images, tone, sort)
select * from (values
  ('582개', 'MINI', '미니굿즈', '미니 아크릴 키링', '["assets/keyring.png"]'::jsonb, 'pink', 0),
  ('1182개', 'A GOODS', 'A 굿즈', '티셔츠(블랙/화이트) 또는 장패드(밤/낮) 중 택 1', '["assets/tshirt-black.png", "assets/tshirt-white.png", "assets/deskmat-night.png", "assets/deskmat-day.png"]'::jsonb, 'blue', 1),
  ('1482개', 'B GOODS', 'B 굿즈', '텀블러(블랙/크림) 또는 키캡 또는 쿠션 중 택 1', '["assets/tumbler-black.png", "assets/tumbler-cream.png", "assets/keycaps.png", "assets/keycap-case.png", "assets/cushion.png"]'::jsonb, 'yellow', 2),
  ('2882개', 'SET', '굿즈세트', '미니굿즈 + A 굿즈 중 택 1 + B 굿즈 중 택 1', '["assets/keyring.png", "assets/tshirt-black.png", "assets/tshirt-white.png", "assets/deskmat-night.png", "assets/deskmat-day.png", "assets/tumbler-black.png", "assets/tumbler-cream.png", "assets/keycaps.png", "assets/keycap-case.png", "assets/cushion.png"]'::jsonb, 'mint', 3),
  ('4999개', 'SPECIAL', '버인굿즈', '버인 바람막이와 버인 방셀', '["assets/windbreaker-models.png", "assets/windbreaker-black.png", "assets/windbreaker-white.png"]'::jsonb, 'lavender', 4),
  ('12482개', 'FULL SET', '굿즈 풀세트', '모든 굿즈·모든 색상 풀세트 + 손편지', '["assets/keyring.png", "assets/tshirt-black.png", "assets/tshirt-white.png", "assets/deskmat-night.png", "assets/deskmat-day.png", "assets/tumbler-black.png", "assets/tumbler-cream.png", "assets/keycaps.png", "assets/keycap-case.png", "assets/cushion.png"]'::jsonb, 'pink', 5)
) as v(count, label, title, description, images, tone, sort)
where not exists (select 1 from goods_tiers);

-- 굿즈 갤러리 (12개)
insert into merch (image_url, name, sort)
select * from (values
  ('assets/tshirt-black.png', '블랙 티셔츠', 0),
  ('assets/tshirt-white.png', '화이트 티셔츠', 1),
  ('assets/deskmat-night.png', '밤 장패드', 2),
  ('assets/deskmat-day.png', '낮 장패드', 3),
  ('assets/tumbler-black.png', '블랙 텀블러', 4),
  ('assets/tumbler-cream.png', '크림 텀블러', 5),
  ('assets/keycaps.png', '캐릭터 키캡', 6),
  ('assets/keycap-case.png', '키캡 패키지', 7),
  ('assets/cushion.png', '쁘키니 쿠션', 8),
  ('assets/keyring.png', '미니 아크릴 키링', 9),
  ('assets/windbreaker-black.png', '블랙 바람막이', 10),
  ('assets/windbreaker-white.png', '화이트 바람막이', 11)
) as v(image_url, name, sort)
where not exists (select 1 from merch);

-- 의상 포스터 (10개)
insert into outfits (collection, name, image_url, origin_url, sort)
select * from (values
  ('summer', '삼국지 초선 한정', 'assets/poster/summer-pose-02.webp', 'assets/summer-pose-02.png', 0),
  ('summer', '여름 A', 'assets/poster/summer-pose-10.webp', 'assets/summer-pose-10.png', 1),
  ('summer', '여름 B', 'assets/poster/summer-pose-08.webp', 'assets/summer-pose-08.png', 2),
  ('summer', '여름 C', 'assets/poster/summer-pose-01.webp', 'assets/summer-pose-01.png', 3),
  ('summer', '여름 D', 'assets/poster/summer-pose-07.webp', 'assets/summer-pose-07.png', 4),
  ('ppeukini', '쁘키니 히든', 'assets/poster/summer-pose-03.webp', 'assets/summer-pose-03.png', 5),
  ('ppeukini', '쁘키니 A', 'assets/poster/summer-pose-04.webp', 'assets/summer-pose-04.png', 6),
  ('ppeukini', '쁘키니 B', 'assets/poster/summer-pose-06.webp', 'assets/summer-pose-06.png', 7),
  ('ppeukini', '쁘키니 C', 'assets/poster/summer-pose-05.webp', 'assets/summer-pose-05.png', 8),
  ('ppeukini', '쁘키니 D', 'assets/poster/summer-pose-09.webp', 'assets/summer-pose-09.png', 9)
) as v(collection, name, image_url, origin_url, sort)
where not exists (select 1 from outfits);

-- ── 4. 확인 ───────────────────────────────────────────────────
select 'profile' as t, count(*) from profile
union all select 'promises', count(*) from promises
union all select 'fixed_rewards', count(*) from fixed_rewards
union all select 'roulette', count(*) from roulette
union all select 'goods_tiers', count(*) from goods_tiers
union all select 'merch', count(*) from merch
union all select 'outfits', count(*) from outfits;
--  기대값: profile 1 / promises 10 / fixed_rewards 5 / roulette 18
--          goods_tiers 6 / merch 12 / outfits 10


-- ═══════════════════════════════════════════════════════════════
--  [추가 패치] 이미 위 SQL을 한 번 돌렸다면 전체를 다시 돌리지 말고
--  아래 블록만 따로 Run 하세요. (전체 재실행은 데이터를 초기화합니다)
-- ═══════════════════════════════════════════════════════════════
update profile
   set data = data || jsonb_build_object(
         'soop-id',  'gurm01',
         'soop-url', 'https://www.sooplive.com/station/gurm01')
 where id = 1;

-- loader-image 키가 없거나 옛 자리표시 주소면 비워서 soop-id 자동 파생을 쓰게 함
update profile
   set data = jsonb_set(data, '{loader-image}', '""'::jsonb)
 where id = 1
   and (not data ? 'loader-image' or data->>'loader-image' = 'https://profile.img.sooplive.co.kr/LOGO/ki/kimfp/kimfp.jpg');

select data->>'soop-id' as soop_id,
       data->>'soop-url' as soop_url,
       data->>'loader-image' as loader_override
  from profile where id = 1;

-- ── [추가 패치 2] 뒷배경 테마 키 (전체 재실행 대신 이 블록만 Run) ──
update profile
   set data = data || jsonb_build_object(
         'theme-page',   '#dff4f3',
         'theme-screen', '#fffaf0')
 where id = 1;

update profile
   set data = jsonb_set(data, '{page-image}', '""'::jsonb)
 where id = 1 and not data ? 'page-image';

select data->>'theme-page' as page, data->>'theme-screen' as screen,
       data->>'page-image' as page_image from profile where id = 1;


-- ═══════════════════════════════════════════════════════════════
--  [추가 패치 3] 이름 오타 일괄 수정  뿌기니 → 쁘키니
--  이미 DB에 들어간 값은 위 시드가 건드리지 않으므로(보존 설계),
--  이 블록만 따로 한 번 Run 하면 전부 바뀝니다. 여러 번 돌려도 안전.
-- ═══════════════════════════════════════════════════════════════

-- 1) 모든 문구(profile.data) — col2-title, col2-eyebrow 포함 통째로 치환
update profile
   set data = replace(replace(data::text, '뿌기니', '쁘키니'),
                      'PPUGINI', 'PPEUKINI')::jsonb
 where id = 1
   and (data::text like '%뿌기니%' or data::text like '%PPUGINI%');

-- 2) 의상 목록
update outfits       set name  = replace(name,  '뿌기니', '쁘키니') where name  like '%뿌기니%';

-- 3) 룰렛
update roulette      set title = replace(title, '뿌기니', '쁘키니') where title like '%뿌기니%';

-- 4) 확정 방셀 단가
update fixed_rewards set title = replace(title, '뿌기니', '쁘키니') where title like '%뿌기니%';

-- 5) 굿즈 갤러리
update merch         set name  = replace(name,  '뿌기니', '쁘키니') where name  like '%뿌기니%';

-- 6) 굿즈 단계
update goods_tiers
   set title       = replace(title,       '뿌기니', '쁘키니'),
       description = replace(description, '뿌기니', '쁘키니')
 where title like '%뿌기니%' or description like '%뿌기니%';

-- ── 확인: 아래가 전부 0 이면 성공 ──
select '문구'   as t, count(*) from profile       where data::text like '%뿌기니%'
union all select '의상',   count(*) from outfits       where name  like '%뿌기니%'
union all select '룰렛',   count(*) from roulette      where title like '%뿌기니%'
union all select '단가',   count(*) from fixed_rewards where title like '%뿌기니%'
union all select '굿즈',   count(*) from merch         where name  like '%뿌기니%'
union all select '단계',   count(*) from goods_tiers   where title like '%뿌기니%';

-- ── [추가 패치 3-2] 내부 키·파일명까지 정리 ──────────────────────
--  안 돌려도 사이트는 정상 동작합니다(구 값도 인식하도록 만들어둠).
--  깔끔하게 맞추고 싶으면 이 블록도 같이 Run 하세요. 여러 번 안전.

update outfits set collection = 'ppeukini' where collection = 'ppugini';

update profile
   set data = jsonb_set(data, '{col2-cover}', '"assets/ppeukini-outfits.png"'::jsonb)
 where id = 1 and data->>'col2-cover' like '%ppugini-outfits%';

-- 확인: 둘 다 0 이면 완료
select 'outfits' as t, count(*) from outfits where collection = 'ppugini'
union all
select 'cover',  count(*) from profile where data->>'col2-cover' like '%ppugini%';

-- ── [추가 패치 4] 룰렛 이름 뿌 → 쁘 ─────────────────────────────
--  '뿌기니'는 패치 3에서 이미 처리됩니다. 여기는 나머지 3항목입니다.
update roulette set title = '쁘'   where title = '뿌';
update roulette set title = '쿼쁘' where title = '쿼뿌';
update roulette set title = '쁘독' where title = '뿌독';

-- 확인: 0 이면 완료
select count(*) as remaining from roulette where title like '%뿌%';

-- ── [추가 패치 5] 히어로 지표 4개 제거 ──────────────────────────
update profile
   set data = data - 'metric1-num' - 'metric1-label' - 'metric2-num' - 'metric2-label'
                   - 'metric3-num' - 'metric3-label' - 'metric4-num' - 'metric4-label'
 where id = 1;

select count(*) as remaining_metric_keys
  from jsonb_object_keys((select data from profile where id = 1)) k
 where k like 'metric%';

-- ── [추가 패치 6] 공약 문구 · 패널 번호 ─────────────────────────
update promises set title = '이전 단계 공약 모두 이행' where title = '위 공약 모두 이행';

update profile
   set data = data || jsonb_build_object('rp1-num', '02', 'rp2-num', '01')
 where id = 1;

select (select title from promises where amount = '40만') as p40,
       data->>'rp1-num' as fixed_no, data->>'rp2-num' as roulette_no
  from profile where id = 1;

-- ── [추가 패치 7] 로고 + 로고 톤 팔레트 ─────────────────────────
update profile
   set data = data || jsonb_build_object(
         'logo-image',  'assets/logo-wordmark-white.png',
         'logo-emblem', 'assets/logo-emblem.png',
         'theme-ink', '#243447', 'theme-muted', '#526B85', 'theme-paper', '#F7FAFC', 'theme-sheet', '#EFF5FA', 'theme-night', '#2C4A63', 'theme-night-soft', '#3A5C77', 'theme-night-deep', '#1E3448', 'theme-hero', '#2C4A63', 'theme-iris', '#1F6A97', 'theme-ice', '#CDEAF7', 'theme-rose', '#F6DCE2', 'theme-sand', '#F0C43C', 'theme-mint', '#D8EDE4', 'theme-page', '#E8F4FB', 'theme-screen', '#FBFDFE')
 where id = 1;

select data->>'logo-image' as logo, data->>'theme-night' as night,
       data->>'theme-iris' as iris from profile where id = 1;
