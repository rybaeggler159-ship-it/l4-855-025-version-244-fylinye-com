const ready = (callback) => {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", callback);
  } else {
    callback();
  }
};

ready(() => {
  const mobileToggle = document.querySelector(".mobile-toggle");
  const mobilePanel = document.querySelector(".mobile-panel");

  if (mobileToggle && mobilePanel) {
    mobileToggle.addEventListener("click", () => {
      mobilePanel.classList.toggle("open");
      mobileToggle.textContent = mobilePanel.classList.contains("open") ? "×" : "☰";
    });
  }

  document.querySelectorAll(".site-search-form").forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const input = form.querySelector('input[name="q"], input[type="search"]');
      const value = input ? input.value.trim() : "";
      if (value) {
        window.location.href = `./search.html?q=${encodeURIComponent(value)}`;
      }
    });
  });

  const carousel = document.querySelector("[data-carousel]");
  if (carousel) {
    const slides = Array.from(carousel.querySelectorAll(".hero-slide"));
    const dots = Array.from(carousel.querySelectorAll(".hero-dots button"));
    let activeIndex = Math.max(0, slides.findIndex((slide) => slide.classList.contains("active")));

    const activate = (index) => {
      activeIndex = (index + slides.length) % slides.length;
      slides.forEach((slide, slideIndex) => {
        slide.classList.toggle("active", slideIndex === activeIndex);
      });
      dots.forEach((dot, dotIndex) => {
        dot.classList.toggle("active", dotIndex === activeIndex);
      });
    };

    dots.forEach((dot, index) => {
      dot.addEventListener("click", () => activate(index));
    });

    if (slides.length > 1) {
      window.setInterval(() => activate(activeIndex + 1), 5200);
    }
  }

  const urlParams = new URLSearchParams(window.location.search);
  const queryFromUrl = urlParams.get("q") || "";
  const filterInput = document.querySelector(".filter-input");
  const container = document.querySelector("[data-card-container]");
  const sortSelect = document.querySelector(".sort-select");

  if (filterInput && queryFromUrl) {
    filterInput.value = queryFromUrl;
  }

  const normalize = (value) => (value || "").toString().trim().toLowerCase();

  const applyCards = () => {
    if (!container) {
      return;
    }

    const value = normalize(filterInput ? filterInput.value : "");
    const cards = Array.from(container.querySelectorAll(".movie-card"));

    cards.forEach((card) => {
      const text = normalize(card.dataset.search);
      card.classList.toggle("hidden-card", Boolean(value) && !text.includes(value));
    });

    if (sortSelect) {
      const mode = sortSelect.value;
      const visibleCards = cards.slice().sort((a, b) => {
        if (mode === "views") {
          return Number(b.dataset.views || 0) - Number(a.dataset.views || 0);
        }
        if (mode === "year") {
          return Number(b.dataset.year || 0) - Number(a.dataset.year || 0);
        }
        if (mode === "title") {
          return (a.dataset.title || "").localeCompare(b.dataset.title || "", "zh-Hans-CN");
        }
        return 0;
      });
      visibleCards.forEach((card) => container.appendChild(card));
    }
  };

  if (filterInput && container) {
    filterInput.addEventListener("input", applyCards);
    applyCards();
  }

  if (sortSelect && container) {
    sortSelect.addEventListener("change", applyCards);
  }

  document.querySelectorAll("[data-filter-key]").forEach((button) => {
    button.addEventListener("click", () => {
      const key = button.dataset.filterKey || "";
      const active = button.classList.toggle("active");
      document.querySelectorAll("[data-filter-key]").forEach((item) => {
        if (item !== button) {
          item.classList.remove("active");
        }
      });
      if (filterInput) {
        filterInput.value = active ? key : "";
        applyCards();
      }
    });
  });

  const video = document.getElementById("movie-video");
  const overlay = document.querySelector(".play-overlay");

  if (video && overlay) {
    const streamElement = video.querySelector("source");
    const streamUrl = streamElement ? streamElement.getAttribute("src") : video.getAttribute("src");
    let started = false;
    let hlsInstance = null;

    const startVideo = async () => {
      if (!streamUrl) {
        return;
      }

      overlay.classList.add("hidden");

      if (started) {
        try {
          await video.play();
        } catch (error) {
          overlay.classList.remove("hidden");
        }
        return;
      }

      started = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
        try {
          await video.play();
        } catch (error) {
          overlay.classList.remove("hidden");
        }
        return;
      }

      try {
        const module = await import("./hls-vendor-dru42stk.js");
        const Hls = module.H;
        if (Hls && Hls.isSupported()) {
          hlsInstance = new Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(streamUrl);
          hlsInstance.attachMedia(video);
          hlsInstance.on(Hls.Events.MANIFEST_PARSED, async () => {
            try {
              await video.play();
            } catch (error) {
              overlay.classList.remove("hidden");
            }
          });
        } else {
          video.src = streamUrl;
          await video.play();
        }
      } catch (error) {
        video.src = streamUrl;
        try {
          await video.play();
        } catch (playError) {
          overlay.classList.remove("hidden");
        }
      }
    };

    overlay.addEventListener("click", startVideo);
    video.addEventListener("click", () => {
      if (video.paused) {
        startVideo();
      }
    });
    video.addEventListener("play", () => overlay.classList.add("hidden"));
    video.addEventListener("pause", () => {
      if (video.currentTime === 0 || video.ended) {
        overlay.classList.remove("hidden");
      }
    });
    window.addEventListener("pagehide", () => {
      if (hlsInstance && typeof hlsInstance.destroy === "function") {
        hlsInstance.destroy();
      }
    });
  }
});
