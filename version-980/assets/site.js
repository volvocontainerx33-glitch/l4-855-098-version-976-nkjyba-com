(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupNavigation() {
    var toggle = document.querySelector("[data-nav-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function () {
      panel.classList.toggle("is-open");
    });
  }

  function setupSearchForms() {
    document.querySelectorAll("[data-search-form]").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = form.querySelector("input[name='q']");
        var query = input ? input.value.trim() : "";
        var target = "./search.html";
        if (query) {
          target += "?q=" + encodeURIComponent(query);
        }
        window.location.href = target;
      });
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
        start();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function normalize(value) {
    return (value || "").toString().trim().toLowerCase();
  }

  function setupFilters() {
    document.querySelectorAll("[data-filter-scope]").forEach(function (scope) {
      var input = scope.querySelector(".js-local-search");
      var chips = Array.prototype.slice.call(scope.querySelectorAll("[data-filter-chip]"));
      var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card"));
      var activeFilter = "all";

      function apply() {
        var query = normalize(input ? input.value : "");
        cards.forEach(function (card) {
          var searchText = normalize(card.getAttribute("data-search"));
          var filterText = normalize(card.getAttribute("data-filter"));
          var matchesQuery = !query || searchText.indexOf(query) !== -1;
          var matchesFilter = activeFilter === "all" || filterText.indexOf(normalize(activeFilter)) !== -1;
          card.classList.toggle("is-hidden", !(matchesQuery && matchesFilter));
        });
      }

      if (input) {
        input.addEventListener("input", apply);
        if (input.hasAttribute("data-query-input")) {
          var params = new URLSearchParams(window.location.search);
          var initial = params.get("q") || "";
          input.value = initial;
        }
      }

      chips.forEach(function (chip) {
        chip.addEventListener("click", function () {
          activeFilter = chip.getAttribute("data-filter-chip") || "all";
          chips.forEach(function (other) {
            other.classList.toggle("active", other === chip);
          });
          apply();
        });
      });

      apply();
    });
  }

  function attachPlayer(wrap) {
    var video = wrap.querySelector("[data-player]");
    var button = wrap.querySelector("[data-player-button]");
    if (!video) {
      return;
    }
    var stream = video.getAttribute("data-stream");
    var hls = null;

    function load() {
      if (!stream || video.dataset.loaded === "1") {
        return;
      }
      video.dataset.loaded = "1";
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(stream);
        hls.attachMedia(video);
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = stream;
      }
    }

    function play() {
      load();
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {});
      }
    }

    if (button) {
      button.addEventListener("click", play);
    }

    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      }
    });

    video.addEventListener("play", function () {
      wrap.classList.add("is-playing");
    });

    video.addEventListener("pause", function () {
      wrap.classList.remove("is-playing");
    });

    video.addEventListener("loadedmetadata", function () {
      wrap.classList.add("is-ready");
    });

    video.addEventListener("emptied", function () {
      if (hls) {
        hls.destroy();
        hls = null;
      }
    });
  }

  function setupPlayers() {
    document.querySelectorAll("[data-player-wrap]").forEach(attachPlayer);
  }

  ready(function () {
    setupNavigation();
    setupSearchForms();
    setupHero();
    setupFilters();
    setupPlayers();
  });
})();
