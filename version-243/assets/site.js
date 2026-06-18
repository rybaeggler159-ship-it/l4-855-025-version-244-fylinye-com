(() => {
    const menuButton = document.querySelector('[data-menu-button]');
    const mobileNav = document.querySelector('[data-mobile-nav]');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', () => {
            mobileNav.classList.toggle('open');
        });
    }

    const heroSlides = Array.from(document.querySelectorAll('[data-hero-slide]'));
    const heroDots = Array.from(document.querySelectorAll('[data-hero-dot]'));
    let heroIndex = 0;

    function showHero(index) {
        if (!heroSlides.length) {
            return;
        }
        heroIndex = (index + heroSlides.length) % heroSlides.length;
        heroSlides.forEach((slide, current) => {
            slide.classList.toggle('active', current === heroIndex);
        });
        heroDots.forEach((dot, current) => {
            dot.classList.toggle('active', current === heroIndex);
        });
    }

    heroDots.forEach((dot) => {
        dot.addEventListener('click', () => {
            showHero(Number(dot.dataset.heroDot));
        });
    });

    if (heroSlides.length > 1) {
        setInterval(() => showHero(heroIndex + 1), 5200);
    }

    const searchInput = document.querySelector('[data-page-search]');
    const filterScope = document.querySelector('[data-filter-scope]');

    if (searchInput && filterScope) {
        const cards = Array.from(filterScope.children);
        searchInput.addEventListener('input', () => {
            const keyword = searchInput.value.trim().toLowerCase();
            cards.forEach((card) => {
                const text = [
                    card.dataset.title,
                    card.dataset.region,
                    card.dataset.type,
                    card.dataset.year,
                    card.dataset.tags,
                    card.textContent
                ].join(' ').toLowerCase();
                card.classList.toggle('is-filtered-out', keyword && !text.includes(keyword));
            });
        });
    }

    function loadScript(src) {
        return new Promise((resolve, reject) => {
            const existing = document.querySelector(`script[src="${src}"]`);
            if (existing) {
                existing.addEventListener('load', resolve, { once: true });
                if (window.Hls) {
                    resolve();
                }
                return;
            }
            const script = document.createElement('script');
            script.src = src;
            script.async = true;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    async function initPlayer(video) {
        const source = video.dataset.src;
        if (!source || video.dataset.loaded === 'true') {
            return;
        }
        video.dataset.loaded = 'true';

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
            await video.play().catch(() => {});
            return;
        }

        try {
            await loadScript('https://cdn.jsdelivr.net/npm/hls.js@latest');
            if (window.Hls && window.Hls.isSupported()) {
                const hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(source);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.MANIFEST_PARSED, () => {
                    video.play().catch(() => {});
                });
            } else {
                video.src = source;
                await video.play().catch(() => {});
            }
        } catch (error) {
            video.src = source;
            await video.play().catch(() => {});
        }
    }

    const video = document.querySelector('[data-player]');
    const playButton = document.querySelector('[data-play-button]');

    if (video && playButton) {
        playButton.addEventListener('click', async () => {
            playButton.classList.add('is-hidden');
            await initPlayer(video);
        });

        video.addEventListener('play', () => {
            playButton.classList.add('is-hidden');
        });
    }
})();
