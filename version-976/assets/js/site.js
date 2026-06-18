(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var menuToggle = document.querySelector('[data-menu-toggle]');
        var mobileMenu = document.querySelector('[data-mobile-menu]');

        if (menuToggle && mobileMenu) {
            menuToggle.addEventListener('click', function () {
                mobileMenu.classList.toggle('is-open');
            });
        }

        document.querySelectorAll('[data-hero]').forEach(function (hero) {
            var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
            var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
            var current = 0;
            var timer = null;

            function activate(index) {
                if (!slides.length) {
                    return;
                }

                current = (index + slides.length) % slides.length;
                slides.forEach(function (slide, slideIndex) {
                    slide.classList.toggle('is-active', slideIndex === current);
                });
                dots.forEach(function (dot, dotIndex) {
                    dot.classList.toggle('is-active', dotIndex === current);
                });
            }

            function start() {
                stop();
                timer = window.setInterval(function () {
                    activate(current + 1);
                }, 5000);
            }

            function stop() {
                if (timer) {
                    window.clearInterval(timer);
                    timer = null;
                }
            }

            dots.forEach(function (dot, index) {
                dot.addEventListener('click', function () {
                    activate(index);
                    start();
                });
            });

            hero.addEventListener('mouseenter', stop);
            hero.addEventListener('mouseleave', start);
            activate(0);
            start();
        });

        var filterPanel = document.querySelector('[data-filter-panel]');
        if (filterPanel) {
            var input = filterPanel.querySelector('[data-filter-search]');
            var category = filterPanel.querySelector('[data-filter-category]');
            var year = filterPanel.querySelector('[data-filter-year]');
            var type = filterPanel.querySelector('[data-filter-type]');
            var reset = filterPanel.querySelector('[data-filter-reset]');
            var count = document.querySelector('[data-filter-count]');
            var cards = Array.prototype.slice.call(document.querySelectorAll('[data-search-item]'));
            var params = new URLSearchParams(window.location.search);
            var initialQuery = params.get('q') || '';

            if (input && initialQuery) {
                input.value = initialQuery;
            }

            function normalize(value) {
                return String(value || '').trim().toLowerCase();
            }

            function applyFilters() {
                var query = normalize(input && input.value);
                var selectedCategory = normalize(category && category.value);
                var selectedYear = normalize(year && year.value);
                var selectedType = normalize(type && type.value);
                var visibleCount = 0;

                cards.forEach(function (card) {
                    var text = normalize(card.getAttribute('data-search'));
                    var cardCategory = normalize(card.getAttribute('data-category'));
                    var cardYear = normalize(card.getAttribute('data-year'));
                    var cardType = normalize(card.getAttribute('data-type'));
                    var matched = true;

                    if (query && text.indexOf(query) === -1) {
                        matched = false;
                    }
                    if (selectedCategory && cardCategory !== selectedCategory) {
                        matched = false;
                    }
                    if (selectedYear && cardYear !== selectedYear) {
                        matched = false;
                    }
                    if (selectedType && cardType !== selectedType) {
                        matched = false;
                    }

                    card.classList.toggle('is-hidden', !matched);
                    if (matched) {
                        visibleCount += 1;
                    }
                });

                if (count) {
                    count.textContent = visibleCount;
                }
            }

            [input, category, year, type].forEach(function (control) {
                if (!control) {
                    return;
                }
                control.addEventListener('input', applyFilters);
                control.addEventListener('change', applyFilters);
            });

            if (reset) {
                reset.addEventListener('click', function () {
                    if (input) {
                        input.value = '';
                    }
                    if (category) {
                        category.value = '';
                    }
                    if (year) {
                        year.value = '';
                    }
                    if (type) {
                        type.value = '';
                    }
                    applyFilters();
                });
            }

            applyFilters();
        }
    });
})();
