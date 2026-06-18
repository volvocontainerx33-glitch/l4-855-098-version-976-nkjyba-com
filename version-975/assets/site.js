document.addEventListener("DOMContentLoaded", function () {
    initImages();
    initMenu();
    initSearch();
    initHero();
    initFilters();
    initPlayers();
});

function rootPath() {
    return document.body.getAttribute("data-root") || "";
}

function initImages() {
    document.querySelectorAll("img").forEach(function (img) {
        img.addEventListener("error", function () {
            img.classList.add("image-missing");
            img.removeAttribute("srcset");
        }, { once: true });
    });
}

function initMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var menu = document.querySelector("[data-mobile-menu]");
    if (!toggle || !menu) {
        return;
    }
    toggle.addEventListener("click", function () {
        menu.classList.toggle("is-open");
    });
}

function normalizeText(value) {
    return String(value || "").toLowerCase().trim();
}

function initSearch() {
    var input = document.querySelector("[data-global-search]");
    var panel = document.querySelector("[data-search-panel]");
    var index = window.MOVIE_SEARCH_INDEX || [];
    if (!input || !panel || !index.length) {
        return;
    }

    function closePanel() {
        panel.classList.remove("is-open");
        panel.innerHTML = "";
    }

    function renderResults(keyword) {
        var q = normalizeText(keyword);
        if (!q) {
            closePanel();
            return;
        }

        var tokens = q.split(/\s+/).filter(Boolean);
        var results = index.filter(function (item) {
            var haystack = normalizeText([
                item.title,
                item.year,
                item.region,
                item.genre,
                item.category
            ].join(" "));
            return tokens.every(function (token) {
                return haystack.indexOf(token) !== -1;
            });
        }).slice(0, 12);

        if (!results.length) {
            panel.innerHTML = '<div class="search-empty">没有找到匹配内容</div>';
            panel.classList.add("is-open");
            return;
        }

        var root = rootPath();
        panel.innerHTML = results.map(function (item) {
            return [
                '<a class="search-result" href="', root, item.url, '">',
                '<img src="', root, item.cover, '" alt="', escapeHtml(item.title), '">',
                '<span>',
                '<strong>', escapeHtml(item.title), '</strong>',
                '<span>', escapeHtml(item.category), ' · ', escapeHtml(item.region), ' · ', escapeHtml(item.year), '</span>',
                '</span>',
                '</a>'
            ].join("");
        }).join("");
        panel.classList.add("is-open");
    }

    input.addEventListener("input", function () {
        renderResults(input.value);
    });

    input.addEventListener("focus", function () {
        renderResults(input.value);
    });

    document.addEventListener("click", function (event) {
        if (!panel.contains(event.target) && event.target !== input) {
            closePanel();
        }
    });
}

function escapeHtml(value) {
    return String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function initHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
        return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    if (slides.length < 2) {
        return;
    }

    var index = 0;
    var timer = null;

    function activate(nextIndex) {
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
            slide.classList.toggle("is-active", i === index);
            slide.setAttribute("aria-hidden", i === index ? "false" : "true");
        });
        dots.forEach(function (dot, i) {
            dot.classList.toggle("is-active", i === index);
            dot.setAttribute("aria-current", i === index ? "true" : "false");
        });
    }

    function start() {
        timer = window.setInterval(function () {
            activate(index + 1);
        }, 5000);
    }

    function restart() {
        if (timer) {
            window.clearInterval(timer);
        }
        start();
    }

    dots.forEach(function (dot, i) {
        dot.addEventListener("click", function () {
            activate(i);
            restart();
        });
    });

    activate(0);
    start();
}

function initFilters() {
    var keyword = document.querySelector("[data-card-filter]");
    var year = document.querySelector("[data-filter-year]");
    var region = document.querySelector("[data-filter-region]");
    var state = document.querySelector("[data-filter-state]");
    var cards = Array.prototype.slice.call(document.querySelectorAll(".filterable-grid .movie-card"));
    if (!cards.length || (!keyword && !year && !region)) {
        return;
    }

    function valueOf(el) {
        return el ? normalizeText(el.value) : "";
    }

    function applyFilter() {
        var q = valueOf(keyword);
        var selectedYear = valueOf(year);
        var selectedRegion = valueOf(region);
        var visible = 0;

        cards.forEach(function (card) {
            var haystack = normalizeText([
                card.dataset.title,
                card.dataset.genre,
                card.dataset.tags,
                card.dataset.region,
                card.dataset.year
            ].join(" "));
            var matchKeyword = !q || haystack.indexOf(q) !== -1;
            var matchYear = !selectedYear || normalizeText(card.dataset.year) === selectedYear;
            var matchRegion = !selectedRegion || normalizeText(card.dataset.region).indexOf(selectedRegion) !== -1;
            var show = matchKeyword && matchYear && matchRegion;
            card.hidden = !show;
            if (show) {
                visible += 1;
            }
        });

        if (state) {
            state.textContent = "当前显示 " + visible + " 部";
        }
    }

    [keyword, year, region].forEach(function (control) {
        if (control) {
            control.addEventListener("input", applyFilter);
            control.addEventListener("change", applyFilter);
        }
    });

    applyFilter();
}

var hlsScriptPromise = null;

function ensureHls() {
    if (window.Hls) {
        return Promise.resolve(window.Hls);
    }
    if (hlsScriptPromise) {
        return hlsScriptPromise;
    }
    hlsScriptPromise = new Promise(function (resolve, reject) {
        var script = document.createElement("script");
        script.src = "https://cdn.jsdelivr.net/npm/hls.js@1/dist/hls.min.js";
        script.async = true;
        script.onload = function () {
            resolve(window.Hls);
        };
        script.onerror = reject;
        document.head.appendChild(script);
    });
    return hlsScriptPromise;
}

function initPlayers() {
    document.querySelectorAll("[data-player]").forEach(function (player) {
        var video = player.querySelector("video");
        var button = player.querySelector(".play-overlay");
        if (!video || !button) {
            return;
        }

        function start() {
            startPlayer(player, video, button);
        }

        button.addEventListener("click", function (event) {
            event.preventDefault();
            event.stopPropagation();
            start();
        });

        player.addEventListener("click", function (event) {
            if (event.target === video && player.dataset.ready === "true") {
                return;
            }
            if (event.target.closest(".play-overlay")) {
                return;
            }
            if (player.dataset.ready !== "true") {
                start();
            }
        });
    });
}

function startPlayer(player, video, button) {
    var src = video.getAttribute("data-src");
    if (!src) {
        return;
    }

    button.classList.add("is-hidden");
    player.dataset.ready = "true";

    function playVideo() {
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") {
            playPromise.catch(function () {
                button.classList.remove("is-hidden");
                player.dataset.ready = "false";
            });
        }
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
        if (video.src !== src) {
            video.src = src;
        }
        playVideo();
        return;
    }

    ensureHls().then(function (Hls) {
        if (Hls && Hls.isSupported()) {
            if (!player._hls) {
                player._hls = new Hls({
                    enableWorker: true,
                    lowLatencyMode: false
                });
                player._hls.attachMedia(video);
            }
            player._hls.loadSource(src);
            player._hls.once(Hls.Events.MANIFEST_PARSED, playVideo);
        } else {
            video.src = src;
            playVideo();
        }
    }).catch(function () {
        video.src = src;
        playVideo();
    });
}
