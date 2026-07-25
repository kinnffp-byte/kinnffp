/* 관리자 런타임 — 값들은 admin/index.html 이 spec.py 에서 생성해 주입합니다. */
(function () {
  'use strict';

  var TABLES = Object.keys(tableCols);
  var state = {};        // { tableName: [rows] }
  var origIds = {};      // { tableName: [id...] }  삭제 감지용

  /* ── 유틸 ─────────────────────────────────────────────── */
  function el(id) { return document.getElementById(id); }
  function esc(v) {
    return String(v == null ? '' : v).replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function txt(v) {
    if (v == null) return '';
    if (typeof v === 'string') return v;
    if (typeof v === 'number' || typeof v === 'boolean') return String(v);
    if (Array.isArray(v)) return v.join('\n');
    return '';
  }
  var toastT;
  function toast(msg, bad) {
    var t = el('toast');
    t.textContent = msg;
    t.className = 'on' + (bad ? ' bad' : '');
    clearTimeout(toastT);
    toastT = setTimeout(function () { t.className = ''; }, 2600);
  }
  function hasDB() { return typeof db !== 'undefined' && db; }

  /* ── 로그인 ───────────────────────────────────────────── */
  function tryLogin() {
    var v = el('pw').value;
    if (ADMIN_PW.indexOf('{{') === 0) {
      el('pwMsg').textContent =
        'admin/index.html 의 ADMIN_PW 가 아직 자리표시자입니다. 비밀번호를 정해 넣어주세요.';
      return;
    }
    if (v === ADMIN_PW) {
      el('gate').hidden = true;
      boot();
    } else {
      el('pwMsg').textContent = '비밀번호가 다릅니다.';
      el('pw').value = '';
    }
  }
  el('pwBtn').addEventListener('click', tryLogin);
  el('pw').addEventListener('keydown', function (e) { if (e.key === 'Enter') tryLogin(); });

  /* ── 탭 ───────────────────────────────────────────────── */
  function showTab(key) {
    document.querySelectorAll('.tab').forEach(function (b) {
      b.classList.toggle('active', b.dataset.tab === key);
    });
    document.querySelectorAll('.tab-panel').forEach(function (p) {
      p.hidden = p.id !== 'tab-' + key;
    });
    window.scrollTo({ top: 0 });
  }
  document.querySelectorAll('.tab').forEach(function (b) {
    b.addEventListener('click', function () { showTab(b.dataset.tab); });
  });

  /* ── 문구 로드/저장 ───────────────────────────────────── */
  var current = {};

  function fillText() {
    profileKeys.concat(themeKeys).forEach(function (k) {
      var i = el('f-' + k);
      if (!i) return;
      var v = current[k] !== undefined ? current[k] : DEFAULTS[k];
      i.value = txt(v);
    });
    themeKeys.forEach(function (k) {
      var c = el('c-' + k), f = el('f-' + k);
      if (c && f && /^#[0-9a-fA-F]{6}$/.test(f.value)) c.value = f.value;
    });
    refreshThumbs();
    applyPreview();
    fontPreview();
  }

  async function saveText(tabKey) {
    if (!hasDB()) { toast('DB에 연결되지 않아 저장할 수 없습니다.', true); return; }
    var keys = tabKey === 'theme' ? themeKeys : (tabFields[tabKey] || []);
    keys.forEach(function (k) {
      var i = el('f-' + k);
      if (i) current[k] = i.value;
    });
    // 누락 키는 기본값으로 채워 DB에 구멍이 생기지 않게
    profileKeys.concat(themeKeys).forEach(function (k) {
      if (current[k] === undefined) current[k] = DEFAULTS[k];
    });
    var r = await saveProfile(current);
    if (r && r.error) { toast('저장 실패: ' + (r.error.message || r.error), true); return; }
    toast(tabKey === 'theme' ? '테마를 저장했습니다.' : '문구를 저장했습니다.');
    // 주의: 여기서 applyTheme() 를 부르면 사이트 팔레트가 admin 문서의 CSS 변수를
    //       덮어써 관리자 화면 배경·글자색이 저장할 때마다 튄다.
    //       미리보기는 오른쪽 '미리보기' 패널(--pv-*)이 담당하므로 호출하지 않는다.
  }

  document.querySelectorAll('[data-savetext]').forEach(function (b) {
    b.addEventListener('click', function () { saveText(b.dataset.savetext); });
  });

  /* 이미지 미리보기 */
  function refreshThumbs() {
    document.querySelectorAll('.thumb').forEach(function (box) {
      var key = box.id.replace(/^t-/, '');
      var i = el('f-' + key);
      if (!i) return;
      var v = i.value.trim();
      box.innerHTML = v ? '<img src="' + esc(v.indexOf('http') === 0 ? v : '../' + v) +
        '" alt="" referrerpolicy="no-referrer">' : '';
    });
  }
  document.addEventListener('input', function (e) {
    if (e.target.classList.contains('input') && e.target.id.indexOf('f-') === 0) {
      var key = e.target.id.slice(2);
      if (el('t-' + key)) refreshThumbs();
      if (themeKeys.indexOf(key) >= 0) {
        var c = el('c-' + key);
        if (c && /^#[0-9a-fA-F]{6}$/.test(e.target.value)) c.value = e.target.value;
        applyPreview();
      }
    }
  });

  /* ── 테마 ─────────────────────────────────────────────── */
  themeKeys.forEach(function (k) {
    var c = el('c-' + k);
    if (!c) return;
    c.addEventListener('input', function () {
      el('f-' + k).value = c.value;
      applyPreview();
    });
  });

  function applyPreview() {
    var pv = el('themePreview');
    if (!pv) return;
    themeKeys.forEach(function (k) {
      var f = el('f-' + k);
      if (!f) return;
      var short = k.replace('theme-', '');
      pv.style.setProperty('--pv-' + short, f.value);
    });
  }

  /* ── 글자 크기: 슬라이더 ↔ 숫자칸 ↔ 미리보기 ─────────────── */
  function fontPreview() {
    var pv = el('fontPreview');
    fontKeys.forEach(function (k) {
      var f = el('f-' + k);
      if (!f) return;
      var short = k.replace('font-', '');
      var v = parseFloat(f.value);
      if (isNaN(v) || v <= 0) v = 1;
      var r = el('r-' + k); if (r) r.value = v;
      var p = el('p-' + k); if (p) p.textContent = Math.round(v * 100) + '%';
      if (pv) pv.style.setProperty('--pf-' + short, String(v));
    });
  }

  fontKeys.forEach(function (k) {
    var f = el('f-' + k), r = el('r-' + k);
    if (r) r.addEventListener('input', function () { if (f) f.value = r.value; fontPreview(); });
    if (f) f.addEventListener('input', fontPreview);
  });

  var fReset = el('fontReset');
  if (fReset) fReset.addEventListener('click', function () {
    fontKeys.forEach(function (k) { var f = el('f-' + k); if (f) f.value = '1'; });
    fontPreview();
    toast('기본 크기로 되돌렸습니다. (저장을 눌러야 반영됩니다)');
  });

  var reset = el('themeReset');
  if (reset) reset.addEventListener('click', function () {
    themeKeys.forEach(function (k) {
      el('f-' + k).value = DEFAULTS[k];
      var c = el('c-' + k); if (c) c.value = DEFAULTS[k];
    });
    applyPreview();
    toast('기본 색으로 되돌렸습니다. (저장을 눌러야 반영됩니다)');
  });

  /* ── 테이블 편집기 ────────────────────────────────────── */
  function cellInput(tname, idx, cname, ctype, val) {
    var id = 'x-' + tname + '-' + idx + '-' + cname;
    if (ctype === 'tone' || ctype === 'coll') {
      var opts = ctype === 'tone' ? TONES : ['summer', 'ppeukini'];
      var LABEL = { summer: '여름', ppeukini: '쁘키니', ppugini: '쁘키니(구)' };
      if (ctype === 'coll' && String(val) === 'ppugini') opts = opts.concat('ppugini');
      return '<select class="input" id="' + id + '">' + opts.map(function (o) {
        var text = (ctype === 'coll' && LABEL[o]) ? LABEL[o] : o;
        return '<option value="' + o + '"' + (String(val) === o ? ' selected' : '') + '>' + text + '</option>';
      }).join('') + '</select>';
    }
    if (ctype === 'area' || ctype === 'imgs') {
      return '<textarea class="input" id="' + id + '" rows="2">' + esc(txt(val)) + '</textarea>';
    }
    return '<input class="input" id="' + id + '" type="text" value="' + esc(txt(val)) + '">';
  }

  function renderTable(tname) {
    var tb = el('tb-' + tname);
    if (!tb) return;
    var rows = state[tname] || [];
    var cols = tableCols[tname];
    if (!rows.length) {
      tb.innerHTML = '<tr class="empty-row"><td colspan="' + (cols.length + 2) +
        '">아직 줄이 없습니다. 아래 “+ 줄 추가”를 눌러 시작하세요.</td></tr>';
      return;
    }
    tb.innerHTML = rows.map(function (r, i) {
      var tds = cols.map(function (c) {
        return '<td>' + cellInput(tname, i, c[0], c[1], r[c[0]]) + '</td>';
      }).join('');
      return '<tr><td class="ord"><div class="ord-btns">' +
        '<button data-move="' + tname + ':' + i + ':-1" title="위로">▲</button>' +
        '<span style="font-size:11px;color:var(--muted)">' + (i + 1) + '</span>' +
        '<button data-move="' + tname + ':' + i + ':1" title="아래로">▼</button>' +
        '</div></td>' + tds +
        '<td class="del"><button class="del-btn" data-del="' + tname + ':' + i + '" title="삭제">×</button></td></tr>';
    }).join('');
  }

  function collect(tname) {
    var cols = tableCols[tname];
    (state[tname] || []).forEach(function (r, i) {
      cols.forEach(function (c) {
        var f = el('x-' + tname + '-' + i + '-' + c[0]);
        if (!f) return;
        if (c[1] === 'imgs') {
          r[c[0]] = f.value.split('\n').map(function (s) { return s.trim(); })
            .filter(Boolean);
        } else {
          r[c[0]] = f.value;
        }
      });
      r.sort = i;
    });
  }

  async function saveTable(tname) {
    if (!hasDB()) { toast('DB에 연결되지 않아 저장할 수 없습니다.', true); return; }
    collect(tname);
    var rows = state[tname] || [];
    var cols = tableCols[tname].map(function (c) { return c[0]; });
    var keptIds = [];
    try {
      for (var i = 0; i < rows.length; i++) {
        var r = rows[i], payload = { sort: i };
        cols.forEach(function (c) { payload[c] = r[c] === undefined ? '' : r[c]; });
        if (r.id) {
          keptIds.push(r.id);
          var u = await updateRow(tname, r.id, payload);
          if (u && u.error) throw u.error;
        } else {
          var ins = await insertRow(tname, payload);
          if (ins && ins.error) throw ins.error;
        }
      }
      var gone = (origIds[tname] || []).filter(function (id) { return keptIds.indexOf(id) < 0; });
      for (var j = 0; j < gone.length; j++) {
        var d = await deleteRow(tname, gone[j]);
        if (d && d.error) throw d.error;
      }
      await loadTable(tname);
      toast(tname + ' 저장 완료 (' + rows.length + '줄)');
    } catch (err) {
      toast('저장 실패: ' + (err.message || err), true);
    }
  }

  async function loadTable(tname) {
    var rows = hasDB() ? await fetchAll(tname) : [];
    if (!Array.isArray(rows)) rows = [];
    state[tname] = rows;
    origIds[tname] = rows.filter(function (r) { return r.id; }).map(function (r) { return r.id; });
    renderTable(tname);
  }

  document.addEventListener('click', function (e) {
    var add = e.target.closest('[data-add]');
    if (add) {
      var t = add.dataset.add;
      collect(t);
      var blank = {};
      tableCols[t].forEach(function (c) { blank[c[0]] = c[1] === 'imgs' ? [] : ''; });
      if (tableCols[t].some(function (c) { return c[1] === 'tone'; })) blank.tone = TONES[0];
      if (tableCols[t].some(function (c) { return c[1] === 'coll'; })) blank.collection = 'summer';
      (state[t] = state[t] || []).push(blank);
      renderTable(t);
      return;
    }
    var del = e.target.closest('[data-del]');
    if (del) {
      var p = del.dataset.del.split(':');
      collect(p[0]);
      state[p[0]].splice(+p[1], 1);
      renderTable(p[0]);
      return;
    }
    var mv = e.target.closest('[data-move]');
    if (mv) {
      var q = mv.dataset.move.split(':');
      var tn = q[0], i = +q[1], d = +q[2], arr = state[tn];
      if (i + d < 0 || i + d >= arr.length) return;
      collect(tn);
      var tmp = arr[i]; arr[i] = arr[i + d]; arr[i + d] = tmp;
      renderTable(tn);
      return;
    }
    var st = e.target.closest('[data-savetable]');
    if (st) { saveTable(st.dataset.savetable); }
  });

  /* ── 기동 ─────────────────────────────────────────────── */
  async function boot() {
    el('dbWarn').hidden = hasDB();
    if (hasDB()) {
      var prof = await fetchProfile();
      current = (prof && typeof prof === 'object') ? prof : {};
    } else {
      current = {};
    }
    fillText();
    for (var i = 0; i < TABLES.length; i++) await loadTable(TABLES[i]);
    showTab('site');
  }

  // 비번이 자리표시자면 안내만 띄운다
  if (ADMIN_PW.indexOf('{{') === 0) {
    el('pwMsg').textContent =
      'admin/index.html 의 ADMIN_PW 를 먼저 정해주세요. (예: var ADMIN_PW = \'9781\';)';
  }
})();
