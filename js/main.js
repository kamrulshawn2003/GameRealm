/* ============================================================
   游戏天地 Game Realm — 全站共享脚本（扩展版）
   功能：移动端导航、主题切换、全站搜索、阅读进度条、
        计数动画、栏目筛选、文章评分、随机推荐、订阅表单、
        滚动显现、回到顶部、导航高亮
   ============================================================ */

(function () {
  'use strict';

  /* 主题：尽早应用，避免闪烁 */
  var savedTheme = localStorage.getItem('gamerealm_theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);

  document.addEventListener('DOMContentLoaded', function () {

    /* ---------- 移动端汉堡菜单 ---------- */
    var toggle = document.querySelector('.nav-toggle');
    var menu = document.querySelector('.nav-menu');
    if (toggle && menu) {
      toggle.addEventListener('click', function () {
        toggle.classList.toggle('open');
        menu.classList.toggle('open');
      });
      menu.querySelectorAll('a').forEach(function (a) {
        a.addEventListener('click', function () {
          toggle.classList.remove('open');
          menu.classList.remove('open');
        });
      });
    }

    /* ---------- 注入导航工具按钮（搜索 / 主题） ---------- */
    if (menu && !document.getElementById('siteSearchBtn')) {
      var sb = document.createElement('button');
      sb.type = 'button'; sb.id = 'siteSearchBtn'; sb.className = 'nav-icon-btn';
      sb.textContent = '🔍';
      sb.setAttribute('data-i18n-title', 'search.title');

      var tb = document.createElement('button');
      tb.type = 'button'; tb.id = 'themeBtn'; tb.className = 'nav-icon-btn';
      tb.textContent = '🌓';
      tb.setAttribute('data-i18n-title', 'theme.toggle');

      var langToggle = menu.querySelector('.lang-toggle');
      if (langToggle) {
        menu.insertBefore(sb, langToggle);
        menu.insertBefore(tb, langToggle);
      } else {
        menu.appendChild(sb);
        menu.appendChild(tb);
      }
    }

    /* ---------- 搜索打开 / 关闭 ---------- */
    var searchBtn = document.getElementById('siteSearchBtn');
    if (searchBtn) {
      searchBtn.addEventListener('click', function () {
        if (window.openSearch) window.openSearch();
      });
    }
    var searchClose = document.getElementById('searchClose');
    if (searchClose) {
      searchClose.addEventListener('click', function () {
        if (window.closeSearch) window.closeSearch();
      });
    }
    var overlayEl = document.getElementById('searchOverlay');
    if (overlayEl) {
      overlayEl.addEventListener('click', function (e) {
        if (e.target === overlayEl && window.closeSearch) window.closeSearch();
      });
    }

    /* ---------- 主题切换 ---------- */
    var themeBtn = document.getElementById('themeBtn');
    if (themeBtn) {
      themeBtn.addEventListener('click', function () {
        savedTheme = savedTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', savedTheme);
        localStorage.setItem('gamerealm_theme', savedTheme);
      });
    }

    /* ---------- 键盘快捷键（Ctrl+K / Esc / “/”） ---------- */
    document.addEventListener('keydown', function (e) {
      if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        if (window.openSearch) window.openSearch();
      } else if (e.key === 'Escape') {
        if (window.closeSearch) window.closeSearch();
      } else if (e.key === '/' && !/^(INPUT|TEXTAREA)$/i.test(document.activeElement.tagName)) {
        e.preventDefault();
        if (window.openSearch) window.openSearch();
      }
    });

    /* ---------- 阅读进度条（文章页） ---------- */
    if (document.querySelector('.article-body')) {
      var bar = document.createElement('div');
      bar.id = 'readingBar'; bar.className = 'reading-bar';
      document.body.appendChild(bar);
      var onScrollBar = function () {
        var doc = document.documentElement;
        var max = doc.scrollHeight - window.innerHeight;
        var p = max > 0 ? Math.min(window.scrollY / max, 1) : 0;
        bar.style.width = (p * 100).toFixed(1) + '%';
      };
      window.addEventListener('scroll', onScrollBar, { passive: true });
      onScrollBar();
    }

    /* ---------- 数字滚动动画 ---------- */
    function animateCount(el) {
      var txt = el.textContent.trim();
      var m = txt.match(/^(\d+)(.*)$/);
      if (!m) return; /* 如 ∞ 跳过 */
      var target = parseInt(m[1], 10);
      var suffix = m[2] || '';
      var dur = 900, start = null;
      function step(ts) {
        if (!start) start = ts;
        var p = Math.min((ts - start) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * eased) + suffix;
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }
    var counterBoxes = document.querySelectorAll('.stat-box .num');
    if (counterBoxes.length) {
      if ('IntersectionObserver' in window) {
        var counterIO = new IntersectionObserver(function (entries) {
          entries.forEach(function (en) {
            if (en.isIntersecting) { animateCount(en.target); counterIO.unobserve(en.target); }
          });
        }, { threshold: 0.4 });
        counterBoxes.forEach(function (el) { counterIO.observe(el); });
      } else {
        counterBoxes.forEach(animateCount);
      }
    }

    /* ---------- 栏目分类筛选 ---------- */
    var chips = document.querySelectorAll('.cat-chips a');
    var gridCards = document.querySelectorAll('.grid a.card');
    if (chips.length && gridCards.length) {
      chips.forEach(function (chip) {
        chip.addEventListener('click', function (e) {
          e.preventDefault();
          chips.forEach(function (c) { c.classList.remove('active'); });
          chip.classList.add('active');
          var filterHref = chip.getAttribute('href') || '';
          var pageName = location.pathname.split('/').pop() || '';
          var isAll = filterHref === pageName || filterHref === '';
          gridCards.forEach(function (card) {
            var href = card.getAttribute('href') || '';
            card.style.display = (isAll || href.indexOf(filterHref) === 0) ? '' : 'none';
          });
        });
      });
    }

    /* ---------- 文章评分（1–5 星，localStorage 记忆） ---------- */
    var articleBody = document.querySelector('.article-body');
    if (articleBody && articleBody.querySelector('.pager') && !articleBody.querySelector('.rating-widget')) {
      var widget = document.createElement('div');
      widget.className = 'rating-widget';
      widget.setAttribute('data-i18n-title', 'rating.title');

      var label = document.createElement('p');
      label.className = 'rating-label';
      label.setAttribute('data-i18n', 'rating.title');
      label.textContent = 'Rate this article';

      var stars = document.createElement('div');
      stars.className = 'rating-stars';
      stars.setAttribute('role', 'slider');
      stars.setAttribute('aria-label', 'Rating');
      stars.setAttribute('aria-valuemin', '1');
      stars.setAttribute('aria-valuemax', '5');
      stars.setAttribute('aria-valuenow', '0');
      var i;
      for (i = 1; i <= 5; i++) {
        var s = document.createElement('span');
        s.textContent = '★';
        s.setAttribute('data-r', String(i));
        stars.appendChild(s);
      }
      var text = document.createElement('p');
      text.className = 'rating-text';

      widget.appendChild(label);
      widget.appendChild(stars);
      widget.appendChild(text);
      var pager = articleBody.querySelector('.pager');
      articleBody.insertBefore(widget, pager);

      var RKEY = 'gamerealm_rating_' + location.pathname;
      function setRatingUI(n) {
        var dict = I18N[currentLang] || I18N.en;
        stars.querySelectorAll('span').forEach(function (sp) {
          sp.classList.toggle('on', parseInt(sp.getAttribute('data-r'), 10) <= n);
        });
        stars.setAttribute('aria-valuenow', String(n));
        text.textContent = (dict['rating.your'] || 'Your rating:') + ' ' + n + '/5';
      }
      var savedRating = parseInt(localStorage.getItem(RKEY) || '0', 10);
      if (savedRating >= 1) setRatingUI(savedRating);
      stars.addEventListener('click', function (e) {
        var t = e.target;
        if (t && t.getAttribute('data-r')) {
          var n = parseInt(t.getAttribute('data-r'), 10);
          localStorage.setItem(RKEY, String(n));
          setRatingUI(n);
        }
      });
    }

    /* ---------- 随机推荐按钮 ---------- */
    var surprise = document.getElementById('surpriseBtn');
    if (surprise) {
      surprise.addEventListener('click', function () {
        var cards = document.querySelectorAll('.grid a.card');
        if (!cards.length) return;
        var pick = cards[Math.floor(Math.random() * cards.length)];
        location.href = pick.getAttribute('href');
      });
    }

    /* ---------- 订阅表单（校验 + 成功提示） ---------- */
    var subForms = document.querySelectorAll('.subscribe-form');
    subForms.forEach(function (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var input = form.querySelector('.sub-email');
        var msg = form.parentElement.querySelector('.sub-msg');
        if (!input || !msg) return;
        var dict = I18N[currentLang] || I18N.en;
        var val = (input.value || '').trim();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
          msg.textContent = dict['sub.err'] || 'Invalid email.';
          msg.className = 'sub-msg err';
          input.focus();
          return;
        }
        localStorage.setItem('gamerealm_subscribed', val);
        msg.textContent = dict['sub.ok'] || 'Subscribed!';
        msg.className = 'sub-msg ok';
        input.value = '';
        var btn = form.querySelector('.sub-btn');
        if (btn) btn.disabled = true;
      });
    });

    /* ---------- 重新翻译注入组件 ---------- */
    if (typeof applyLang === 'function') applyLang(currentLang);

    /* ---------- 滚动显现动画 ---------- */
    var reveals = document.querySelectorAll('.reveal');
    if ('IntersectionObserver' in window && reveals.length) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
        });
      }, { threshold: 0.12 });
      reveals.forEach(function (el) { io.observe(el); });
    } else {
      reveals.forEach(function (el) { el.classList.add('visible'); });
    }

    /* ---------- 回到顶部 ---------- */
    var backTop = document.getElementById('backTop');
    if (backTop) {
      window.addEventListener('scroll', function () {
        if (window.scrollY > 400) backTop.classList.add('show');
        else backTop.classList.remove('show');
      });
      backTop.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

    /* ---------- 导航当前页高亮 ---------- */
    var path = location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-menu a').forEach(function (a) {
      var href = a.getAttribute('href');
      if (href === path) { a.classList.add('active'); }
      if (path && href && href.indexOf('index.html') !== -1) {
        var col = href.split('/')[0];
        if (col && location.pathname.indexOf('/' + col + '/') !== -1) { a.classList.add('active'); }
      }
    });

    /* ---------- 页脚年份 ---------- */
    var yr = document.getElementById('year');
    if (yr) yr.textContent = new Date().getFullYear();
  });
})();