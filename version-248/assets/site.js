(function () {
  var toggle = document.querySelector(".mobile-toggle");
  var mobileNav = document.querySelector(".mobile-nav");

  if (toggle && mobileNav) {
    toggle.addEventListener("click", function () {
      var isOpen = mobileNav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });
  }

  var slides = Array.prototype.slice.call(
    document.querySelectorAll(".hero-slide"),
  );
  var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
  var current = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    current = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle("active", slideIndex === current);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle("active", dotIndex === current);
    });
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener("click", function () {
      showSlide(index);
    });
  });

  if (slides.length > 1) {
    window.setInterval(function () {
      showSlide(current + 1);
    }, 5600);
  }

  var filterInput = document.querySelector("[data-filter-input]");
  var filterCards = Array.prototype.slice.call(
    document.querySelectorAll("[data-keywords]"),
  );

  if (filterInput && filterCards.length) {
    filterInput.addEventListener("input", function () {
      var keyword = filterInput.value.trim().toLowerCase();

      filterCards.forEach(function (card) {
        var text = card.getAttribute("data-keywords").toLowerCase();
        card.style.display = text.indexOf(keyword) >= 0 ? "" : "none";
      });
    });
  }
})();
