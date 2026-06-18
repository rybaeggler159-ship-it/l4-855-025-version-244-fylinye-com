(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  ready(function () {
    var menuButton = document.querySelector(".menu-toggle");
    var mobileNav = document.querySelector(".mobile-nav");
    if (menuButton && mobileNav) {
      menuButton.addEventListener("click", function () {
        mobileNav.classList.toggle("is-open");
      });
    }

    var slider = document.querySelector(".hero-slider");
    if (slider) {
      var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
      var dots = Array.prototype.slice.call(slider.querySelectorAll(".hero-dot"));
      var current = 0;
      var timer = null;
      var activate = function (index) {
        if (!slides.length) {
          return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("is-active", slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("is-active", dotIndex === current);
        });
      };
      var next = function () {
        activate(current + 1);
      };
      var start = function () {
        timer = window.setInterval(next, 5000);
      };
      var stop = function () {
        if (timer) {
          window.clearInterval(timer);
          timer = null;
        }
      };
      var prevButton = slider.querySelector(".hero-prev");
      var nextButton = slider.querySelector(".hero-next");
      if (prevButton) {
        prevButton.addEventListener("click", function () {
          stop();
          activate(current - 1);
          start();
        });
      }
      if (nextButton) {
        nextButton.addEventListener("click", function () {
          stop();
          activate(current + 1);
          start();
        });
      }
      dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
          stop();
          activate(Number(dot.getAttribute("data-slide")) || 0);
          start();
        });
      });
      activate(0);
      start();
    }

    Array.prototype.slice.call(document.querySelectorAll(".site-search")).forEach(function (input) {
      var scope = input.closest("[data-search-scope]") || document;
      var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card"));
      input.addEventListener("input", function () {
        var value = input.value.trim().toLowerCase();
        cards.forEach(function (card) {
          var haystack = (card.getAttribute("data-search") || card.textContent || "").toLowerCase();
          card.classList.toggle("is-filter-hidden", value && haystack.indexOf(value) === -1);
        });
      });
    });
  });
})();
