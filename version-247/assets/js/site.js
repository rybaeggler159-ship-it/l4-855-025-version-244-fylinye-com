
(function () {
  var menuButton = document.querySelector('.menu-toggle');
  var mobilePanel = document.querySelector('.mobile-panel');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  var active = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    active = (index + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      slide.classList.toggle('active', i === active);
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle('active', i === active);
    });
  }

  dots.forEach(function (dot, i) {
    dot.addEventListener('click', function () {
      showSlide(i);
    });
  });

  if (slides.length > 1) {
    setInterval(function () {
      showSlide(active + 1);
    }, 5200);
  }

  var searchInput = document.getElementById('pageSearch');
  var yearFilter = document.getElementById('yearFilter');
  var regionFilter = document.getElementById('regionFilter');
  var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));

  function applyFilters() {
    var keyword = searchInput ? searchInput.value.trim().toLowerCase() : '';
    var year = yearFilter ? yearFilter.value : '';
    var region = regionFilter ? regionFilter.value : '';

    cards.forEach(function (card) {
      var haystack = [
        card.getAttribute('data-title'),
        card.getAttribute('data-tags'),
        card.getAttribute('data-year'),
        card.getAttribute('data-region'),
        card.getAttribute('data-category')
      ].join(' ').toLowerCase();

      var okKeyword = !keyword || haystack.indexOf(keyword) !== -1;
      var okYear = !year || card.getAttribute('data-year') === year;
      var okRegion = !region || (card.getAttribute('data-region') || '').indexOf(region) !== -1;
      card.classList.toggle('hidden-by-filter', !(okKeyword && okYear && okRegion));
    });
  }

  [searchInput, yearFilter, regionFilter].forEach(function (el) {
    if (el) {
      el.addEventListener('input', applyFilters);
      el.addEventListener('change', applyFilters);
    }
  });

  var params = new URLSearchParams(window.location.search);
  var q = params.get('q');
  if (q && searchInput) {
    searchInput.value = q;
    applyFilters();
  }
})();
