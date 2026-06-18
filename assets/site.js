(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }

    function setupMenu() {
        var toggle = document.querySelector(".nav-toggle");
        var nav = document.querySelector(".site-nav");
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener("click", function () {
            nav.classList.toggle("is-open");
        });
    }

    function setupHero() {
        var slider = document.querySelector("[data-hero-slider]");
        if (!slider) {
            return;
        }
        var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
        if (!slides.length) {
            return;
        }
        var current = 0;
        var timer = null;
        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === current);
            });
        }
        function start() {
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }
        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                if (timer) {
                    window.clearInterval(timer);
                }
                show(index);
                start();
            });
        });
        start();
    }

    function setupSearch() {
        var panels = Array.prototype.slice.call(document.querySelectorAll(".search-panel"));
        panels.forEach(function (panel) {
            var input = panel.querySelector("[data-search-input]");
            var chips = Array.prototype.slice.call(panel.querySelectorAll("[data-filter]"));
            var area = panel.parentElement.querySelector("[data-search-area]") || document.querySelector("[data-search-area]");
            if (!area) {
                return;
            }
            var cards = Array.prototype.slice.call(area.querySelectorAll("[data-title]"));
            var activeFilter = "all";
            function apply() {
                var query = input ? input.value.trim().toLowerCase() : "";
                cards.forEach(function (card) {
                    var text = [
                        card.getAttribute("data-title") || "",
                        card.getAttribute("data-tags") || "",
                        card.getAttribute("data-genre") || "",
                        card.getAttribute("data-year") || "",
                        card.textContent || ""
                    ].join(" ").toLowerCase();
                    var matchQuery = !query || text.indexOf(query) !== -1;
                    var matchFilter = activeFilter === "all" || text.indexOf(activeFilter.toLowerCase()) !== -1;
                    card.classList.toggle("is-hidden-card", !(matchQuery && matchFilter));
                });
            }
            if (input) {
                input.addEventListener("input", apply);
            }
            chips.forEach(function (chip) {
                chip.addEventListener("click", function () {
                    activeFilter = chip.getAttribute("data-filter") || "all";
                    chips.forEach(function (item) {
                        item.classList.toggle("is-active", item === chip);
                    });
                    apply();
                });
            });
        });
    }

    ready(function () {
        setupMenu();
        setupHero();
        setupSearch();
    });
})();
