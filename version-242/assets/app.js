(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function initMenu() {
    var button = document.querySelector(".menu-button");
    var nav = document.querySelector(".mobile-nav");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      button.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  function initHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === index);
      });
    }

    function start() {
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        window.clearInterval(timer);
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        start();
      });
    });
    start();
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function initFilters() {
    var panels = Array.prototype.slice.call(document.querySelectorAll("[data-filter-panel]"));
    panels.forEach(function (panel) {
      var root = panel.parentElement || document;
      var cards = Array.prototype.slice.call(root.querySelectorAll("[data-card]"));
      var searchInputs = Array.prototype.slice.call(panel.querySelectorAll("[data-local-search]"));
      var chips = Array.prototype.slice.call(panel.querySelectorAll("[data-filter]"));
      var activeFilter = "all";

      function queryText() {
        var q = searchInputs.map(function (input) {
          return input.value;
        }).join(" ");
        return normalize(q);
      }

      function apply() {
        var q = queryText();
        cards.forEach(function (card) {
          var haystack = normalize(card.getAttribute("data-search"));
          var filterOk = activeFilter === "all" || haystack.indexOf(normalize(activeFilter)) !== -1;
          var queryOk = !q || haystack.indexOf(q) !== -1;
          card.classList.toggle("hidden-card", !(filterOk && queryOk));
        });
      }

      chips.forEach(function (chip) {
        chip.addEventListener("click", function () {
          activeFilter = chip.getAttribute("data-filter") || "all";
          chips.forEach(function (item) {
            item.classList.toggle("active", item === chip);
          });
          apply();
        });
      });

      searchInputs.forEach(function (input) {
        input.addEventListener("input", apply);
      });

      var params = new URLSearchParams(window.location.search);
      var q = params.get("q");
      if (q) {
        searchInputs.forEach(function (input) {
          input.value = q;
        });
      }
      apply();
    });
  }

  ready(function () {
    initMenu();
    initHero();
    initFilters();
  });
}());
