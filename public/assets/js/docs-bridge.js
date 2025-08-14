// MindQuantum docs bridge script
// - Sync theme with the main site (localStorage 'theme')
// - Mirror to pydata-sphinx-theme's storage to keep its toggle in sync
// - Minor DOM fixes can be added here in the future if needed
(function () {
  try {
    var root = document.documentElement;
    var saved = localStorage.getItem('theme');
    if (saved === 'light' || saved === 'dark') {
      root.setAttribute('data-theme', saved);
      // Mirror into pydata's keys where applicable
      try {
        localStorage.setItem('mode', saved);
        localStorage.setItem('theme', saved); // ensure consistency
      } catch (e) {}
    }

    // Observe changes to data-theme and persist back to localStorage
    var obs = new MutationObserver(function (mutations) {
      for (var i = 0; i < mutations.length; i++) {
        if (mutations[i].attributeName === 'data-theme') {
          var current = root.getAttribute('data-theme');
          if (current === 'light' || current === 'dark') {
            try {
              localStorage.setItem('theme', current);
              localStorage.setItem('mode', current);
            } catch (e) {}
          }
        }
      }
    });
    obs.observe(root, { attributes: true });

    // Also listen for pydata's toggle if present
    document.addEventListener('click', function (e) {
      var el = e.target;
      if (!el) return;
      var isToggle = el.matches('[data-mode-toggle], .theme-switch-button, button[aria-label*="mode" i]');
      if (isToggle) {
        // Delay read until after pydata updates attribute
        setTimeout(function(){
          var cur = root.getAttribute('data-theme');
          if (cur === 'light' || cur === 'dark') {
            try {
              localStorage.setItem('theme', cur);
              localStorage.setItem('mode', cur);
            } catch (e) {}
          }
        }, 30);
      }
    }, true);

    // --- Inject a compact site bar for unified navigation ---
    var path = location.pathname;
    var idx = path.indexOf('/docs/');
    var siteRoot = idx >= 0 ? path.slice(0, idx + 1) : '/';
    function langFromPath(p){
      var m = p.match(/\/docs\/(zh|en)\//);
      return m ? m[1] : null;
    }
    var curLang = langFromPath(path);

    var sitebar = document.createElement('div');
    sitebar.className = 'mq-sitebar';
    sitebar.innerHTML = ''+
      '<div class="mq-sitebar-inner">' +
      '  <a class="mq-brand" href="' + siteRoot + '">' +
      '    <span class="mq-logo" aria-hidden="true"></span>' +
      '    <span class="mq-brand-text">MindQuantum</span>' +
      '  </a>' +
      '  <nav class="mq-nav" aria-label="Site">' +
      '    <a href="' + siteRoot + '">Home</a>' +
      '    <a href="' + siteRoot + 'docs/zh/"' + (curLang==='zh' ? ' aria-current="page" class="active"' : '') + '>Docs (ZH)</a>' +
      '    <a href="' + siteRoot + 'docs/en/"' + (curLang==='en' ? ' aria-current="page" class="active"' : '') + '>Docs (EN)</a>' +
      '    <a href="' + siteRoot + 'blog/">Blog</a>' +
      '    <a class="mq-btn" href="https://gitee.com/mindspore/mindquantum" rel="noopener">GitHub</a>' +
      '    <button class="mq-theme" title="Toggle theme">🌓</button>' +
      '  </nav>' +
      '</div>';

    var header = document.querySelector('.bd-header');
    if (header && header.parentNode) {
      header.parentNode.insertBefore(sitebar, header);
    } else {
      document.body.insertBefore(sitebar, document.body.firstChild);
    }

    // Measure height and set CSS var to push sticky header
    requestAnimationFrame(function(){
      var h = sitebar.getBoundingClientRect().height;
      if (h && h > 0) {
        root.style.setProperty('--mq-sitebar-h', h + 'px');
      }
    });

    // Theme toggle button in site bar
    var themeBtn = sitebar.querySelector('.mq-theme');
    if (themeBtn) {
      themeBtn.addEventListener('click', function(){
        var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        root.setAttribute('data-theme', next);
        try {
          localStorage.setItem('theme', next);
          localStorage.setItem('mode', next);
        } catch (e) {}
      });
    }
  } catch (e) {
    // no-op
  }
})();
