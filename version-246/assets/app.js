(function () {
  function selectAll(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  function bindNavigation() {
    var toggle = document.querySelector(".nav-toggle");
    var panel = document.querySelector(".mobile-panel");

    if (!toggle || !panel) {
      return;
    }

    toggle.addEventListener("click", function () {
      panel.classList.toggle("is-open");
    });
  }

  function bindHero() {
    var hero = document.getElementById("heroSlider");

    if (!hero) {
      return;
    }

    var slides = selectAll(".hero-slide", hero);
    var dots = selectAll(".hero-dots button", hero);
    var next = hero.querySelector(".hero-next");
    var prev = hero.querySelector(".hero-prev");
    var active = 0;
    var timer;

    function show(index) {
      active = (index + slides.length) % slides.length;

      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === active);
      });

      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === active);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(active + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (next) {
      next.addEventListener("click", function () {
        show(active + 1);
        start();
      });
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(active - 1);
        start();
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
        start();
      });
    });

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function bindFilters() {
    var input = document.querySelector(".filter-input");
    var list = document.querySelector(".filter-list");

    if (!input || !list) {
      return;
    }

    var cards = selectAll(".movie-card", list);
    var chips = selectAll(".filter-chip");
    var empty = document.querySelector(".empty-state");
    var params = new URLSearchParams(window.location.search);
    var query = params.get("q") || "";
    var activeFilter = "全部";

    if (query) {
      input.value = query;
    }

    chips.forEach(function (chip) {
      if (chip.classList.contains("is-active")) {
        activeFilter = chip.getAttribute("data-filter") || "全部";
      }
    });

    function normalize(value) {
      return (value || "").toString().trim().toLowerCase();
    }

    function apply() {
      var keyword = normalize(input.value);
      var visible = 0;

      cards.forEach(function (card) {
        var searchText = normalize(card.getAttribute("data-search"));
        var category = card.getAttribute("data-category") || "";
        var matchesKeyword = !keyword || searchText.indexOf(keyword) !== -1;
        var matchesFilter = activeFilter === "全部" || searchText.indexOf(normalize(activeFilter)) !== -1 || category === activeFilter;
        var shouldShow = matchesKeyword && matchesFilter;

        card.hidden = !shouldShow;

        if (shouldShow) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle("is-visible", visible === 0);
      }
    }

    input.addEventListener("input", apply);

    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        activeFilter = chip.getAttribute("data-filter") || "全部";
        chips.forEach(function (item) {
          item.classList.toggle("is-active", item === chip);
        });
        apply();
      });
    });

    apply();
  }

  document.addEventListener("DOMContentLoaded", function () {
    bindNavigation();
    bindHero();
    bindFilters();
  });
}());

function initMoviePlayer(sourceUrl) {
  var video = document.getElementById("moviePlayer");
  var trigger = document.querySelector(".play-layer");
  var attached = false;
  var hlsInstance = null;

  if (!video || !sourceUrl) {
    return;
  }

  function reveal() {
    if (trigger) {
      trigger.classList.add("is-hidden");
    }
  }

  function restore() {
    if (trigger) {
      trigger.classList.remove("is-hidden");
    }
  }

  function playVideo() {
    reveal();
    var result = video.play();

    if (result && typeof result.catch === "function") {
      result.catch(function () {
        restore();
      });
    }
  }

  function attach() {
    if (attached) {
      playVideo();
      return;
    }

    attached = true;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = sourceUrl;
      playVideo();
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({ enableWorker: true });
      hlsInstance.loadSource(sourceUrl);
      hlsInstance.attachMedia(video);
      hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
        playVideo();
      });
      hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
        if (data && data.fatal) {
          restore();
        }
      });
      return;
    }

    video.src = sourceUrl;
    playVideo();
  }

  if (trigger) {
    trigger.addEventListener("click", attach);
  }

  video.addEventListener("click", function () {
    if (video.paused) {
      attach();
    }
  });

  window.addEventListener("pagehide", function () {
    if (hlsInstance) {
      hlsInstance.destroy();
      hlsInstance = null;
    }
  });
}
