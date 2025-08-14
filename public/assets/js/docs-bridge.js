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
  } catch (e) {
    // no-op
  }
})();

