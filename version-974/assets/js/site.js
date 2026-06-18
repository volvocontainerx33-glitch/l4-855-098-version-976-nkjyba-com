(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
        });
    }

    document.querySelectorAll('[data-hero]').forEach(function (hero) {
        var slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
        var index = 0;

        function showSlide(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
            });
        });

        if (slides.length > 1) {
            window.setInterval(function () {
                showSlide(index + 1);
            }, 5200);
        }
    });

    document.querySelectorAll('[data-filter-scope]').forEach(function (form) {
        var section = form.closest('section') || document;
        var input = form.querySelector('[data-filter-input]');
        var category = form.querySelector('[data-filter-category]');
        var year = form.querySelector('[data-filter-year]');
        var cards = Array.from(section.querySelectorAll('[data-movie-card]'));
        var empty = section.querySelector('[data-empty-state]');

        function normalize(value) {
            return String(value || '').trim().toLowerCase();
        }

        function applyFilter() {
            var keyword = normalize(input ? input.value : '');
            var categoryValue = normalize(category ? category.value : '');
            var yearValue = normalize(year ? year.value : '');
            var visibleCount = 0;

            cards.forEach(function (card) {
                var searchable = normalize([
                    card.getAttribute('data-title'),
                    card.getAttribute('data-genre'),
                    card.getAttribute('data-category'),
                    card.getAttribute('data-year')
                ].join(' '));
                var cardCategory = normalize(card.getAttribute('data-category'));
                var cardYear = normalize(card.getAttribute('data-year'));
                var matched = true;

                if (keyword && searchable.indexOf(keyword) === -1) {
                    matched = false;
                }
                if (categoryValue && cardCategory !== categoryValue) {
                    matched = false;
                }
                if (yearValue && cardYear !== yearValue) {
                    matched = false;
                }

                card.hidden = !matched;
                if (matched) {
                    visibleCount += 1;
                }
            });

            if (empty) {
                empty.hidden = visibleCount !== 0;
            }
        }

        ['input', 'change'].forEach(function (eventName) {
            form.addEventListener(eventName, applyFilter);
        });

        form.addEventListener('reset', function () {
            window.setTimeout(applyFilter, 0);
        });
    });

    document.querySelectorAll('[data-player]').forEach(function (shell) {
        var video = shell.querySelector('video');
        var playButton = shell.querySelector('[data-play-button]');
        var hlsInstance = null;

        if (!video || !playButton) {
            return;
        }

        function attachSource() {
            var src = video.getAttribute('data-src');
            if (!src || video.getAttribute('data-loaded') === 'true') {
                return;
            }

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = src;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(src);
                hlsInstance.attachMedia(video);
            } else {
                video.src = src;
            }

            video.setAttribute('data-loaded', 'true');
        }

        function startPlayback() {
            attachSource();
            shell.classList.add('is-playing');
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function () {
                    shell.classList.remove('is-playing');
                });
            }
        }

        playButton.addEventListener('click', function (event) {
            event.preventDefault();
            event.stopPropagation();
            startPlayback();
        });

        shell.addEventListener('click', function (event) {
            if (event.target === video && !video.paused) {
                return;
            }
            startPlayback();
        });

        video.addEventListener('play', function () {
            shell.classList.add('is-playing');
        });

        video.addEventListener('pause', function () {
            if (!video.seeking && video.currentTime > 0) {
                shell.classList.remove('is-playing');
            }
        });

        window.addEventListener('beforeunload', function () {
            if (hlsInstance && typeof hlsInstance.destroy === 'function') {
                hlsInstance.destroy();
            }
        });
    });
})();
