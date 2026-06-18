(function () {
  var mobileToggle = document.querySelector('.mobile-toggle');
  var mobileNav = document.querySelector('.mobile-nav');

  if (mobileToggle && mobileNav) {
    mobileToggle.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  function setupHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
    var prev = document.querySelector('.hero-control.prev');
    var next = document.querySelector('.hero-control.next');
    var current = 0;

    if (!slides.length) {
      return;
    }

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === current);
      });
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-slide')) || 0);
      });
    });

    setInterval(function () {
      show(current + 1);
    }, 6500);
  }

  function setupSearch() {
    var panels = Array.prototype.slice.call(document.querySelectorAll('.search-panel'));

    panels.forEach(function (panel) {
      var list = panel.nextElementSibling;
      var input = panel.querySelector('.site-search');
      var buttons = Array.prototype.slice.call(panel.querySelectorAll('.filter-pill'));

      if (!list || !input) {
        return;
      }

      function textOf(item) {
        return [
          item.getAttribute('data-title') || '',
          item.getAttribute('data-genre') || '',
          item.getAttribute('data-tags') || '',
          item.getAttribute('data-region') || '',
          item.getAttribute('data-year') || '',
          item.getAttribute('data-category') || ''
        ].join(' ').toLowerCase();
      }

      function currentFilter() {
        var active = panel.querySelector('.filter-pill.active');
        return active ? (active.getAttribute('data-filter') || '').toLowerCase() : '';
      }

      function apply() {
        var query = input.value.trim().toLowerCase();
        var filter = currentFilter();
        var items = Array.prototype.slice.call(list.children);

        items.forEach(function (item) {
          var haystack = textOf(item);
          var queryMatch = !query || haystack.indexOf(query) !== -1;
          var filterMatch = !filter || haystack.indexOf(filter) !== -1;
          item.classList.toggle('is-hidden', !(queryMatch && filterMatch));
        });
      }

      input.addEventListener('input', apply);
      buttons.forEach(function (button) {
        button.addEventListener('click', function () {
          buttons.forEach(function (item) {
            item.classList.remove('active');
          });
          button.classList.add('active');
          apply();
        });
      });
    });
  }

  function setupPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll('.player-shell[data-stream]'));

    players.forEach(function (shell) {
      var video = shell.querySelector('video');
      var button = shell.querySelector('.play-overlay');
      var stream = shell.getAttribute('data-stream');
      var loaded = false;
      var hlsInstance = null;

      if (!video || !button || !stream) {
        return;
      }

      function load() {
        if (loaded) {
          return;
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = stream;
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(stream);
          hlsInstance.attachMedia(video);
        } else {
          video.src = stream;
        }

        loaded = true;
      }

      function start() {
        load();
        shell.classList.add('is-playing');
        video.setAttribute('controls', 'controls');
        var attempt = video.play();

        if (attempt && typeof attempt.catch === 'function') {
          attempt.catch(function () {});
        }
      }

      button.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        start();
      });

      shell.addEventListener('click', function (event) {
        if (event.target === shell) {
          start();
        }
      });

      video.addEventListener('play', function () {
        shell.classList.add('is-playing');
      });

      window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  }

  setupHero();
  setupSearch();
  setupPlayers();
})();
