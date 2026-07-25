/* KIMFP 여름 보상 아카이브 — 런타임
   DEFAULT_TEXT / DEFAULT_THEME / DEFAULT_DATA 는 index.html 에서 주입됩니다.
   DB(Supabase)가 없거나 실패해도 기본값으로 정상 동작합니다. */
(function () {
  'use strict';

  var T = Object.assign({}, DEFAULT_TEXT);
  var D = JSON.parse(JSON.stringify(DEFAULT_DATA));
  var ORDER = ['main', 'promise', 'reward', 'goods', 'outfit'];
  var current = 'main';
  var activeCollection = 'summer';

  /* ── 안전 유틸 (DB 값이 배열/객체로 와도 깨지지 않게) ───────────── */
  function txt(v) {
    if (v === null || v === undefined) return '';
    if (typeof v === 'string') return v;
    if (typeof v === 'number' || typeof v === 'boolean') return String(v);
    if (Array.isArray(v)) return v.map(txt).filter(Boolean).join(', ');
    return '';
  }
  function esc(v) {
    return txt(v).replace(/&/g, '&amp;').replace(/</g, '&lt;')
                 .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  /* 줄바꿈만 허용하고 나머지 태그는 무력화 */
  function safeHTML(v) {
    return esc(v).replace(/&lt;br\s*\/?&gt;/gi, '<br>');
  }
  function list(v) { return Array.isArray(v) ? v : []; }
  function el(id) { return document.getElementById(id); }
  function pad(n) { return String(n).padStart(2, '0'); }

  /* ── 텍스트 훅 적용 ─────────────────────────────────────────── */
  /* 프사 주소: 직접 지정(loader-image)이 있으면 그것, 없으면 SOOP 아이디에서 파생 */
  function avatarUrl() {
    var direct = txt(T['loader-image']).trim();
    if (direct) return direct;
    var id = txt(T['soop-id']).trim().toLowerCase();
    if (!id) return '';
    return 'https://profile.img.sooplive.co.kr/LOGO/' + id.slice(0, 2) + '/' + id + '/' + id + '.jpg';
  }

  /* 예전에 저장된 ppugini-* 파일명을 새 이름으로 넘겨준다 */
  function fixName(u) { return txt(u).replace('ppugini-outfits', 'ppeukini-outfits'); }

  function applyText() {
    document.querySelectorAll('[data-hook]').forEach(function (node) {
      var key = node.getAttribute('data-hook');
      if (!(key in T)) return;
      node.innerHTML = safeHTML(T[key]);
    });
    document.title = txt(T['site-title']);
    var d = document.querySelector('meta[name="description"]');
    if (d) d.setAttribute('content', txt(T['site-desc']));
    var av = avatarUrl();
    var icon = document.querySelector('link[rel="icon"]');
    if (icon && av) icon.setAttribute('href', av);
    var ci = el('cover-img');
    if (ci) {
      if (av) { ci.src = av; ci.style.display = ''; }
      else { ci.removeAttribute('src'); ci.style.display = 'none'; }
    }
    var pi = txt(T['page-image']).trim();
    document.documentElement.style.setProperty('--page-image',
      pi ? 'url("' + pi.replace(/"/g, '%22') + '")' : 'none');

    /* 로고: 값이 있으면 이미지, 비우면 글자로 되돌아간다 */
    var lg = el('brandLogo'), bn = el('brandName');
    var lgSrc = txt(T['logo-image']).trim();
    if (lg) {
      if (lgSrc) { lg.src = lgSrc; lg.alt = txt(T['brand-name']); lg.hidden = false; if (bn) bn.hidden = true; }
      else { lg.hidden = true; if (bn) bn.hidden = false; }
    }
    /* 엠블럼: 섹션 제목 옆 장식 링 안에 배경으로 얹는다 */
    var emSrc = txt(T['logo-emblem']).trim();
    document.documentElement.style.setProperty('--logo-emblem',
      emSrc ? 'url("' + emSrc.replace(/"/g, '%22') + '")' : 'none');

    var sl = el('soopLink');
    if (sl) {
      var su = txt(T['soop-url']).trim();
      if (su) { sl.href = su; sl.hidden = false; } else { sl.hidden = true; }
    }
  }

  /* ── 렌더러 ─────────────────────────────────────────────────── */
  /* 메인 미리보기: 두 컬렉션을 대각선으로 갈라 얹고, 마우스를 올린 쪽이 넓어진다. */
  function renderMainLooks() {
    var box = el('mainLooks'); if (!box) return;
    var keys = ['summer', 'ppeukini'];
    box.innerHTML = [1, 2].map(function (i) {
      var side = i === 1 ? 'a' : 'b';
      return '<button type="button" class="look-half look-' + side +
        '" data-look="' + keys[i - 1] + '" aria-label="' + esc(T['col' + i + '-title']) + ' 보기">' +
        '<img src="' + esc(fixName(T['col' + i + '-cover'])) + '" alt="' +
        esc(T['col' + i + '-title']) + '" referrerpolicy="no-referrer">' +
        '<span class="look-meta"><b>' + esc(T['col' + i + '-index']) + '</b>' +
        '<em>' + esc(T['col' + i + '-eyebrow']) + '</em>' +
        '<strong>' + esc(T['col' + i + '-title']) + '</strong></span></button>';
    }).join('') + '<span class="look-seam" aria-hidden="true"></span>' +
      '<span class="look-hint">눌러서 크게 보기</span>';
  }

  function renderMiniRewards() {
    var box = el('miniRewards'); if (!box) return;
    box.innerHTML = list(D.fixed).map(function (r, i) {
      return '<div><span>' + pad(i + 1) + '</span><strong>' + esc(r.count) +
        '</strong><p>' + esc(r.title) + '</p></div>';
    }).join('');
  }

  function renderPromises() {
    var road = el('promiseRoad'); if (!road) return;
    var cur = parseFloat(txt(T['promise-current'])) || 0;
    var fin = parseFloat(txt(T['promise-final'])) || 300;
    var pct = Math.min((cur / fin) * 100, 100);
    road.style.setProperty('--promise-progress', pct + '%');
    var pc = el('promisePct'); if (pc) pc.textContent = Math.round(pct) + '%';

    var rows = list(D.promises);
    var html = '<div class="promise-track" aria-hidden="true"><span></span></div>';
    html += rows.map(function (p, i) {
      var mile = parseFloat(txt(p.amount).replace(/[^0-9.]/g, '')) || 0;
      var prev = i === 0 ? 0 : (parseFloat(txt(rows[i - 1].amount).replace(/[^0-9.]/g, '')) || 0);
      var done = cur >= mile;
      var next = cur < mile && (i === 0 || cur >= prev);
      return '<article class="promise-node' + (done ? ' completed' : '') +
        (next ? ' next' : '') + '"><span>' + pad(i + 1) + '</span><i aria-hidden="true"></i>' +
        '<strong>' + esc(p.amount) + '</strong><h3>' + esc(p.title) + '</h3></article>';
    }).join('');
    road.innerHTML = html;
  }

  function renderFixed() {
    var box = el('fixedList'); if (!box) return;
    box.innerHTML = list(D.fixed).map(function (r) {
      return '<article class="fixed-reward ' + esc(r.tone || 'pink') + '"><strong>' +
        esc(r.count) + '</strong><span>' + esc(r.title) + '</span></article>';
    }).join('');
  }

  function renderRoulette() {
    var box = el('rouletteCols'); if (!box) return;
    var rows = list(D.roulette);
    var per = parseInt(txt(T['roulette-percol']), 10) || 9;
    var cols = [];
    for (var i = 0; i < rows.length; i += per) cols.push(rows.slice(i, i + per));
    if (!cols.length) cols = [[]];
    box.innerHTML = cols.map(function (col) {
      return '<div class="roulette-list">' + col.map(function (r) {
        return '<div><span>' + esc(r.title) + '</span><strong>' + esc(r.chance) + '</strong></div>';
      }).join('') + '</div>';
    }).join('');
  }

  function renderTiers() {
    var box = el('tierGrid'); if (!box) return;
    box.innerHTML = list(D.tiers).map(function (t) {
      var imgs = list(t.images);
      return '<article class="goods-tier ' + esc(t.tone || 'pink') + '">' +
        '<div class="goods-tier-copy"><small>' + esc(t.label) + '</small><strong>' +
        esc(t.count) + '</strong><h3>' + esc(t.title) + '</h3><p>' +
        esc(t.description) + '</p></div>' +
        '<div class="goods-tier-image goods-count-' + imgs.length + '" tabindex="0">' +
        imgs.map(function (src) {
          return '<div class="goods-product-thumb"><img src="' + esc(src) +
            '" alt="' + esc(t.title) + '" referrerpolicy="no-referrer" loading="lazy"></div>';
        }).join('') + '</div></article>';
    }).join('');
  }

  function renderMerch() {
    var box = el('merchGrid'); if (!box) return;
    box.innerHTML = list(D.merch).map(function (m) {
      return '<figure><div><img src="' + esc(m.image_url) + '" alt="' + esc(m.name) +
        '" referrerpolicy="no-referrer" loading="lazy"></div><figcaption>' +
        esc(m.name) + '</figcaption></figure>';
    }).join('');
  }

  function collections() {
    return [
      { key: 'summer', tone: 'blue', n: 1 },
      { key: 'ppeukini', tone: 'pink', n: 2, alias: 'ppugini' }
    ].map(function (c) {
      return {
        key: c.key, tone: c.tone,
        index: txt(T['col' + c.n + '-index']),
        eyebrow: txt(T['col' + c.n + '-eyebrow']),
        title: txt(T['col' + c.n + '-title']),
        note: txt(T['col' + c.n + '-note']),
        cover: fixName(T['col' + c.n + '-cover']),
        /* alias: 예전에 저장된 'ppugini' 값도 계속 인식한다(마이그레이션 없이도 동작) */
        posters: list(D.outfits).filter(function (o) {
          return o.collection === c.key || (c.alias && o.collection === c.alias);
        })
      };
    });
  }

  function renderOutfit() {
    var cols = collections();
    var active = cols.filter(function (c) { return c.key === activeCollection; })[0] || cols[0];
    activeCollection = active.key;

    var grid = el('lookGrid');
    if (grid) {
      grid.innerHTML = cols.map(function (c) {
        var sel = c.key === active.key;
        return '<article class="lookbook-card ' + c.tone + (sel ? ' selected' : '') + '">' +
          '<div class="lookbook-label"><span>' + esc(c.index) + '</span>' +
          '<div><small>' + esc(c.eyebrow) + '</small><h3>' + esc(c.title) + '</h3></div>' +
          '<b class="lookbook-flag">' + (sel ? 'ON AIR' : pad(c.posters.length) + '종') + '</b></div>' +
          '<button type="button" class="lookbook-image" data-coll="' + esc(c.key) +
          '" aria-pressed="' + sel + '" aria-label="' + esc(c.title) + ' 포스터 보기">' +
          '<img src="' + esc(c.cover) + '" alt="' + esc(c.title) + '" referrerpolicy="no-referrer">' +
          '<span class="lookbook-cue">' + (sel ? '◈ 아래에서 송출 중' : '포스터 ' +
          pad(c.posters.length) + '종 보기 ↓') + '</span></button>' +
          '<p>' + esc(c.note) + '</p></article>';
      }).join('');
    }

    var total = pad(active.posters.length);
    if (el('posterKicker')) el('posterKicker').textContent = active.eyebrow + ' · FRAME';
    if (el('posterTitle')) el('posterTitle').textContent = active.title + ' 원본 ' + active.posters.length + '종';
    if (el('posterCount')) el('posterCount').textContent = total;
    if (el('posterTotal')) el('posterTotal').textContent = '/ ' + total;

    var sw = el('posterSwitch');
    if (sw) {
      sw.innerHTML = cols.map(function (c) {
        return '<button type="button" role="tab" data-coll="' + esc(c.key) + '" aria-selected="' +
          (c.key === active.key) + '" class="' + (c.key === active.key ? 'active' : '') + '">' +
          esc(c.title) + '</button>';
      }).join('');
    }

    var pg = el('posterGrid');
    if (!pg) return;
    if (!active.posters.length) {
      pg.innerHTML = '<p class="poster-empty">' + esc(T['empty-outfit']) + '</p>';
      return;
    }
    pg.innerHTML = active.posters.map(function (p, i) {
      return '<button type="button" class="poster-tile" data-zoom="' + i + '" style="--poster-delay:' +
        (i * 55) + 'ms" aria-label="' + esc(p.name) + ' 크게 보기">' +
        '<span class="poster-grid-lines" aria-hidden="true"></span>' +
        '<img src="' + esc(p.image_url) + '" alt="' + esc(p.name) +
        '" referrerpolicy="no-referrer" loading="lazy">' +
        '<span class="poster-frame-line" aria-hidden="true"></span>' +
        '<span class="poster-top"><span class="poster-serial">' + pad(i + 1) +
        '</span><span class="poster-badge">' +
        esc(active.eyebrow.split(' ')[0]) + '</span></span>' +
        '<span class="poster-bottom"><span class="poster-rule" aria-hidden="true"></span>' +
        '<strong>' + esc(p.name) + '</strong><em>ZOOM ↗</em></span></button>';
    }).join('');
  }

  function renderAll() {
    applyText();
    renderMainLooks(); renderMiniRewards(); renderPromises();
    renderFixed(); renderRoulette(); renderTiers(); renderMerch(); renderOutfit();
  }

  /* ── 뷰 전환 + 커버 연출 ─────────────────────────────────────── */
  function navLabel(key) {
    var i = ORDER.indexOf(key) + 1;
    return { label: txt(T['nav' + i + '-label']), eyebrow: txt(T['nav' + i + '-eyebrow']) };
  }

  /* ── URL 해시 라우팅 ─────────────────────────────────────────
     단일 파일이라 새로고침하면 첫 화면으로 돌아가던 문제를 해결.
     #outfit 처럼 URL에 뷰를 남겨 새로고침·뒤로가기·링크공유가 된다. */
  function keyFromHash() {
    var h = (location.hash || '').replace(/^#\/?/, '').trim();
    return ORDER.indexOf(h) >= 0 ? h : null;
  }

  function writeHash(key, replace) {
    var target = '#' + key;
    if (location.hash === target) return;
    try {
      if (replace) history.replaceState(null, '', target);
      else history.pushState(null, '', target);
    } catch (e) {
      location.hash = target;      // pushState 불가 환경(file:// 등) 폴백
    }
  }

  function showPanel(key) {
    current = key;
    document.querySelectorAll('[data-view-panel]').forEach(function (p) {
      p.hidden = p.getAttribute('data-view-panel') !== key;
    });
    document.querySelectorAll('[data-go]').forEach(function (b) {
      b.classList.toggle('active', b.getAttribute('data-go') === key);
    });
    var meta = navLabel(key);
    if (el('mobLabel')) el('mobLabel').textContent = meta.label;
    if (el('mobEyebrow')) el('mobEyebrow').textContent = meta.eyebrow;
    var area = document.querySelector('.ipad-scroll-area');
    if (area) area.scrollTo({ top: 0, behavior: 'auto' });
    window.scrollTo({ top: 0, behavior: 'auto' });
  }

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function navigate(key, opts) {
    opts = opts || {};
    if (key === current) return;
    if (!opts.fromHistory) writeHash(key, false);
    if (reduced) { showPanel(key); return; }
    var cover = el('cover');
    var label = el('cover-label');
    if (label) label.textContent = txt(T['trans-prefix']) + navLabel(key).label;
    if (!cover) { showPanel(key); return; }
    cover.classList.add('on');
    window.setTimeout(function () {
      showPanel(key);
      window.setTimeout(function () { cover.classList.remove('on'); }, 210);
    }, 300);
  }

  /* ── 포스터 확대 뷰어 ───────────────────────────────────────── */
  var zoomIndex = null;
  function posters() {
    var cols = collections();
    var a = cols.filter(function (c) { return c.key === activeCollection; })[0] || cols[0];
    return a;
  }
  function renderViewer() {
    var old = document.querySelector('.poster-viewer');
    if (old) old.remove();
    if (zoomIndex === null) return;
    var a = posters(), p = a.posters[zoomIndex];
    if (!p) { zoomIndex = null; return; }
    var wrap = document.createElement('div');
    wrap.className = 'poster-viewer';
    wrap.setAttribute('role', 'dialog');
    wrap.setAttribute('aria-modal', 'true');
    wrap.innerHTML =
      '<div class="poster-viewer-inner">' +
      '<button type="button" class="poster-viewer-nav" data-step="-1" aria-label="이전">←</button>' +
      '<figure><img src="' + esc(p.image_url) + '" alt="' + esc(p.name) +
      '" referrerpolicy="no-referrer"><figcaption><span>' + esc(a.eyebrow) +
      '</span><strong>' + esc(p.name) + '</strong><em>' + pad(zoomIndex + 1) + ' / ' +
      pad(a.posters.length) + '</em>' +
      (p.origin_url ? '<a href="' + esc(p.origin_url) + '" target="_blank" rel="noreferrer">원본 열기 ↗</a>' : '') +
      '</figcaption></figure>' +
      '<button type="button" class="poster-viewer-nav" data-step="1" aria-label="다음">→</button>' +
      '<button type="button" class="poster-viewer-close" aria-label="닫기">✕</button></div>';
    document.body.appendChild(wrap);
  }
  function stepZoom(d) {
    var n = posters().posters.length;
    if (!n || zoomIndex === null) return;
    zoomIndex = (zoomIndex + d + n) % n;
    renderViewer();
  }

  /* ── 이미지 확대(일반) ──────────────────────────────────────── */
  function openImage(src, alt) {
    var m = el('imgModal'); if (!m) return;
    el('imgModalImg').src = src;
    el('imgModalImg').alt = alt || '확대 이미지';
    m.hidden = false;
  }
  function closeImage() { var m = el('imgModal'); if (m) m.hidden = true; }

  /* ── 다크모드 ───────────────────────────────────────────────── */
  function syncDark() {
    var on = document.body.classList.contains('dark');
    var t = el('darkToggle');
    if (t) { t.classList.toggle('on', on); t.setAttribute('aria-pressed', on); }
  }
  function toggleDark() {
    var on = document.body.classList.toggle('dark');
    localStorage.setItem('theme', on ? 'dark' : 'light');
    syncDark();
  }

  /* ── 이벤트 (위임) ─────────────────────────────────────────── */
  document.addEventListener('click', function (e) {
    var go = e.target.closest('[data-go]');
    if (go) { navigate(go.getAttribute('data-go')); return; }

    var dk = e.target.closest('#darkToggle');
    if (dk) { toggleDark(); return; }

    var look = e.target.closest('[data-look]');
    if (look) {
      var key = look.getAttribute('data-look');
      var split = look.closest('.look-split');
      var side = look.classList.contains('look-a') ? 'a' : 'b';

      /* 마우스가 없는 기기: 첫 탭은 확대만, 같은 쪽을 다시 누르면 이동 */
      var noHover = window.matchMedia('(hover: none)').matches;
      if (noHover && split && split.getAttribute('data-open') !== side) {
        split.setAttribute('data-open', side);
        return;
      }

      activeCollection = key;
      renderOutfit();          /* 변수만 바꾸면 화면은 그대로 → 다시 렌더 */
      zoomIndex = null;
      renderViewer();
      navigate('outfit');
      return;
    }

    var coll = e.target.closest('[data-coll]');
    if (coll) { activeCollection = coll.getAttribute('data-coll'); zoomIndex = null; renderViewer(); renderOutfit(); return; }

    var tile = e.target.closest('[data-zoom]');
    if (tile) { zoomIndex = parseInt(tile.getAttribute('data-zoom'), 10); renderViewer(); return; }

    var step = e.target.closest('[data-step]');
    if (step) { stepZoom(parseInt(step.getAttribute('data-step'), 10)); return; }

    if (e.target.closest('.poster-viewer-close') || e.target.classList.contains('poster-viewer')) {
      zoomIndex = null; renderViewer(); return;
    }
    if (e.target.closest('.image-modal-close') || e.target.classList.contains('image-modal')) {
      closeImage(); return;
    }
    // 버튼 안이 아닌 일반 이미지는 확대
    var img = e.target;
    if (img.tagName === 'IMG' && !img.closest('button') && !img.closest('.poster-viewer')
        && !img.closest('.image-modal') && img.closest('.content-sheet')) {
      openImage(img.currentSrc || img.src, img.alt);
    }
  });

  document.addEventListener('keydown', function (e) {
    if (zoomIndex !== null) {
      if (e.key === 'Escape') { zoomIndex = null; renderViewer(); }
      if (e.key === 'ArrowLeft') stepZoom(-1);
      if (e.key === 'ArrowRight') stepZoom(1);
      return;
    }
    if (e.key === 'Escape') closeImage();
  });

  window.addEventListener('hashchange', function () {
    var k = keyFromHash() || 'main';
    if (k !== current) navigate(k, { fromHistory: true });
  });

  /* ── 기동 ───────────────────────────────────────────────────── */
  function ready() { document.body.classList.add('ready'); }

  async function boot() {
    renderAll();
    syncDark();
    var start = keyFromHash() || 'main';
    showPanel(start);
    writeHash(start, true);   // 주소창 정리 (뒤로가기 히스토리는 더럽히지 않음)
    try {
      if (typeof fetchProfile === 'function') {
        var prof = await fetchProfile();
        if (prof && typeof prof === 'object') {
          Object.keys(T).forEach(function (k) {
            if (prof[k] !== undefined && prof[k] !== null && prof[k] !== '') T[k] = prof[k];
          });
          if (typeof applyTheme === 'function') applyTheme(prof);
        }
      }
      if (typeof fetchAll === 'function') {
        var map = { promises: 'promises', fixed: 'fixed_rewards', roulette: 'roulette',
                    tiers: 'goods_tiers', merch: 'merch', outfits: 'outfits' };
        for (var key in map) {
          var rows = await fetchAll(map[key]);
          if (Array.isArray(rows) && rows.length) D[key] = rows;
        }
      }
      renderAll();
    } catch (err) {
      console.warn('[boot] DB 미연결 — 기본값으로 표시합니다.', err);
    }
    ready();
  }

  window.setTimeout(ready, 1600);   // FOUC 폴백
  if (document.readyState !== 'loading') boot();
  else document.addEventListener('DOMContentLoaded', boot);
})();
