// Site runtime: theme management and nav interactions
(function(){
  var root = document.documentElement;
  function setTheme(initial){
    root.setAttribute('data-theme', initial);
    try { localStorage.setItem('theme', initial); } catch(e){}
  }
  function getSaved(){ try { return localStorage.getItem('theme'); } catch(e){ return null; } }
  function prefersDark(){ return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches; }

  var initial = getSaved() || (prefersDark() ? 'dark' : 'light');
  setTheme(initial);
  window.__toggleTheme = function(){ setTheme(root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark'); };
  // Header theme button
  function initThemeBtn(){
    var t = document.querySelector('[data-theme-toggle]');
    if (!t) return;
    t.addEventListener('click', function(){ window.__toggleTheme(); });
  }

  // Mobile nav toggle
  function initNav(){
    var btn = document.querySelector('.nav-toggle');
    var nav = document.getElementById('primary-nav');
    if (!btn || !nav) return;
    btn.addEventListener('click', function(){
      var open = nav.getAttribute('data-open') === 'true';
      nav.setAttribute('data-open', String(!open));
      btn.setAttribute('aria-expanded', String(!open));
    });
  }
  function ready(fn){ if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn); else fn(); }
  ready(initNav);
  ready(initThemeBtn);
})();
