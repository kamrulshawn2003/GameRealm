/* ============================================================
   游戏天地 Game Realm — 全站双语搜索
   用法：nav 中 🔍 按钮 / Ctrl+K / “/” 打开；Esc 关闭
   支持中英文标题同时匹配（输入任意语言均可搜到）
   ============================================================ */

(function () {
  'use strict';

  var INDEX = [
    { url: 'index.html', t: 'nav.home', c: 'nav.home' },
    { url: 'news/index.html', t: 'news.eyebrow', c: 'nav.news' },
    { url: 'news/detail-wukong.html', t: 'wukong.title', c: 'nav.news' },
    { url: 'news/detail-genshin.html', t: 'genshin.title', c: 'nav.news' },
    { url: 'news/detail-eldenring.html', t: 'elden.title', c: 'nav.news' },
    { url: 'guides/index.html', t: 'guides.eyebrow', c: 'nav.guides' },
    { url: 'guides/guide-eldenring.html', t: 'gElden.title', c: 'nav.guides' },
    { url: 'guides/guide-genshin.html', t: 'gGenshin.title', c: 'nav.guides' },
    { url: 'guides/guide-cyberpunk.html', t: 'gCyb.title', c: 'nav.guides' },
    { url: 'research/index.html', t: 'research.eyebrow', c: 'nav.research' },
    { url: 'research/research-narrative.html', t: 'rNarr.title', c: 'nav.research' },
    { url: 'research/research-mechanics.html', t: 'rMech.title', c: 'nav.research' },
    { url: 'research/research-industry.html', t: 'rInd.title', c: 'nav.research' },
    { url: 'about.html', t: 'nav.about', c: 'nav.about' }
  ];

  /* 子目录页面需要 ../ 前缀，使结果链接相对当前页面正确 */
  function base() {
    var p = location.pathname;
    return /^\/(news|guides|research)\//.test(p) ? '../' : '';
  }

  function dict() { return I18N[currentLang] || I18N.en; }

  function buildOverlay() {
    if (document.getElementById('searchOverlay')) return;
    var ov = document.createElement('div');
    ov.className = 'search-overlay';
    ov.id = 'searchOverlay';
    ov.setAttribute('hidden', '');
    ov.setAttribute('role', 'dialog');
    ov.setAttribute('aria-modal', 'true');
    ov.innerHTML =
      '<div class="search-panel">' +
        '<div class="search-head">' +
          '<span class="search-icon">🔍</span>' +
          '<input class="search-input" type="search" data-i18n-ph="search.ph" placeholder="Search…" aria-label="Search">' +
          '<button class="search-close" id="searchClose" type="button" aria-label="Close">✕</button>' +
        '</div>' +
        '<div class="search-results" role="listbox"></div>' +
        '<div class="search-hint" data-i18n="search.hint">Tip: press Ctrl+K</div>' +
      '</div>';
    document.body.appendChild(ov);
  }

  function render(q) {
    var box = document.querySelector('.search-results');
    if (!box) return;
    box.innerHTML = '';
    q = (q || '').trim().toLowerCase();
    if (!q) {
      box.innerHTML = '<p class="search-none" data-i18n="search.type">Start typing…</p>';
      if (typeof applyLang === 'function') applyLang(currentLang);
      return;
    }
    var hits = INDEX.filter(function (it) {
      var en = (I18N.en[it.t] || '').toLowerCase();
      var zh = (I18N.zh[it.t] || '').toLowerCase();
      var ce = (I18N.en[it.c] || '').toLowerCase();
      var cz = (I18N.zh[it.c] || '').toLowerCase();
      return en.indexOf(q) !== -1 || zh.indexOf(q) !== -1 || ce.indexOf(q) !== -1 || cz.indexOf(q) !== -1;
    }).slice(0, 8);
    if (!hits.length) {
      box.innerHTML = '<p class="search-none" data-i18n="search.none">No results found.</p>';
      if (typeof applyLang === 'function') applyLang(currentLang);
      return;
    }
    var b = base();
    var d = dict();
    hits.forEach(function (it) {
      var a = document.createElement('a');
      a.className = 'search-result';
      a.href = b + it.url;
      a.setAttribute('role', 'option');
      var cat = document.createElement('span');
      cat.className = 'sr-cat';
      cat.textContent = d[it.c] || '';
      var title = document.createElement('span');
      title.className = 'sr-title';
      title.textContent = d[it.t] || '';
      a.appendChild(cat);
      a.appendChild(title);
      box.appendChild(a);
    });
  }

  window.openSearch = function () {
    var ov = document.getElementById('searchOverlay');
    if (!ov) { buildOverlay(); ov = document.getElementById('searchOverlay'); }
    ov.removeAttribute('hidden');
    var inp = ov.querySelector('.search-input');
    inp.value = '';
    render('');
    setTimeout(function () { inp.focus(); }, 30);
  };

  window.closeSearch = function () {
    var ov = document.getElementById('searchOverlay');
    if (ov) ov.setAttribute('hidden', '');
  };

  document.addEventListener('DOMContentLoaded', function () {
    buildOverlay();
    var inp = document.querySelector('.search-input');
    if (inp) {
      inp.addEventListener('input', function () { render(inp.value); });
      inp.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
          var first = document.querySelector('.search-result');
          if (first) location.href = first.getAttribute('href');
        }
      });
    }
    if (typeof applyLang === 'function') applyLang(currentLang);
  });
})();