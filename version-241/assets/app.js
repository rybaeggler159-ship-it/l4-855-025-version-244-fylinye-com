(function () {
  function selectAll(selector, parent) {
    return Array.prototype.slice.call((parent || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function initNav() {
    var toggle = document.querySelector('[data-nav-toggle]');
    var links = document.querySelector('[data-nav-links]');
    if (!toggle || !links) {
      return;
    }
    toggle.addEventListener('click', function () {
      links.classList.toggle('is-open');
    });
  }

  function initHero() {
    var carousel = document.querySelector('[data-hero-carousel]');
    if (!carousel) {
      return;
    }
    var slides = selectAll('[data-hero-slide]', carousel);
    var dots = selectAll('[data-hero-dot]', carousel);
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function start() {
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        window.clearInterval(timer);
        show(Number(dot.getAttribute('data-hero-dot') || 0));
        start();
      });
    });

    show(0);
    start();
  }

  function initFilters() {
    var input = document.querySelector('[data-filter-input]');
    var region = document.querySelector('[data-filter-region]');
    var type = document.querySelector('[data-filter-type]');
    var category = document.querySelector('[data-filter-category]');
    var cards = selectAll('.movie-card[data-title]');
    var emptyStates = selectAll('[data-empty-state]');

    if (!input && !region && !type && !category) {
      return;
    }

    function cardMatches(card) {
      var query = normalize(input && input.value);
      var regionValue = normalize(region && region.value);
      var typeValue = normalize(type && type.value);
      var categoryValue = normalize(category && category.value);
      var haystack = normalize([
        card.getAttribute('data-title'),
        card.getAttribute('data-region'),
        card.getAttribute('data-type'),
        card.getAttribute('data-year'),
        card.getAttribute('data-tags'),
        card.getAttribute('data-category')
      ].join(' '));
      var okQuery = !query || haystack.indexOf(query) !== -1;
      var okRegion = !regionValue || normalize(card.getAttribute('data-region')).indexOf(regionValue) !== -1;
      var okType = !typeValue || normalize(card.getAttribute('data-type')).indexOf(typeValue) !== -1;
      var okCategory = !categoryValue || normalize(card.getAttribute('data-category')).indexOf(categoryValue) !== -1;
      return okQuery && okRegion && okType && okCategory;
    }

    function apply() {
      var visible = 0;
      cards.forEach(function (card) {
        var show = cardMatches(card);
        card.hidden = !show;
        if (show) {
          visible += 1;
        }
      });
      emptyStates.forEach(function (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      });
    }

    [input, region, type, category].forEach(function (control) {
      if (control) {
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      }
    });
  }

  window.SitePlayer = {
    init: function (source) {
      var video = document.querySelector('[data-player-video]');
      var button = document.querySelector('[data-player-button]');
      if (!video || !source) {
        return;
      }
      var attached = false;
      var hls = null;

      function attach() {
        if (attached) {
          return Promise.resolve();
        }
        attached = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
          return Promise.resolve();
        }
        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({ enableWorker: true });
          hls.loadSource(source);
          hls.attachMedia(video);
          return new Promise(function (resolve) {
            hls.on(window.Hls.Events.MANIFEST_PARSED, resolve);
            window.setTimeout(resolve, 1200);
          });
        }
        video.src = source;
        return Promise.resolve();
      }

      function play() {
        if (button) {
          button.classList.add('is-hidden');
        }
        attach().then(function () {
          var playing = video.play();
          if (playing && playing.catch) {
            playing.catch(function () {});
          }
        });
      }

      if (button) {
        button.addEventListener('click', play);
      }
      video.addEventListener('click', function () {
        if (video.paused) {
          play();
        }
      });
      video.addEventListener('play', function () {
        if (button) {
          button.classList.add('is-hidden');
        }
      });
      window.addEventListener('pagehide', function () {
        if (hls && hls.destroy) {
          hls.destroy();
        }
      });
    }
  };

  document.addEventListener('DOMContentLoaded', function () {
    initNav();
    initHero();
    initFilters();
  });
})();
