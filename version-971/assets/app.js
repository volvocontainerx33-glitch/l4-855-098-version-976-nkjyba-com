(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupNavigation() {
    var toggle = document.querySelector(".nav-toggle");
    var menu = document.querySelector(".mobile-nav");
    if (!toggle || !menu) {
      return;
    }

    toggle.addEventListener("click", function () {
      var open = menu.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  function setupHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    var prev = document.querySelector(".hero-prev");
    var next = document.querySelector(".hero-next");
    if (!slides.length) {
      return;
    }

    var index = slides.findIndex(function (slide) {
      return slide.classList.contains("is-active");
    });

    if (index < 0) {
      index = 0;
    }

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, itemIndex) {
        slide.classList.toggle("is-active", itemIndex === index);
      });
      dots.forEach(function (dot, itemIndex) {
        dot.classList.toggle("is-active", itemIndex === index);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        var target = Number(dot.getAttribute("data-slide") || 0);
        show(target);
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
      });
    }

    window.setInterval(function () {
      show(index + 1);
    }, 5200);
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function setupFilters() {
    var search = document.getElementById("movieSearch");
    var genre = document.getElementById("genreFilter");
    var year = document.getElementById("yearFilter");
    var cards = Array.prototype.slice.call(document.querySelectorAll(".js-movie-card"));
    var empty = document.querySelector(".empty-state");
    if (!cards.length || (!search && !genre && !year)) {
      return;
    }

    function apply() {
      var query = normalize(search ? search.value : "");
      var genreValue = normalize(genre ? genre.value : "");
      var yearValue = normalize(year ? year.value : "");
      var visible = 0;

      cards.forEach(function (card) {
        var title = normalize(card.getAttribute("data-title"));
        var genreText = normalize(card.getAttribute("data-genre"));
        var region = normalize(card.getAttribute("data-region"));
        var cardYear = normalize(card.getAttribute("data-year"));
        var category = normalize(card.getAttribute("data-category"));
        var text = [title, genreText, region, cardYear, category].join(" ");
        var matched = true;

        if (query && text.indexOf(query) === -1) {
          matched = false;
        }

        if (genreValue && genreText.indexOf(genreValue) === -1) {
          matched = false;
        }

        if (yearValue && cardYear !== yearValue) {
          matched = false;
        }

        card.classList.toggle("is-filter-hidden", !matched);
        if (matched) {
          visible += 1;
        }
      });

      if (empty) {
        empty.hidden = visible !== 0;
      }
    }

    [search, genre, year].forEach(function (control) {
      if (control) {
        control.addEventListener("input", apply);
        control.addEventListener("change", apply);
      }
    });
  }

  ready(function () {
    setupNavigation();
    setupHero();
    setupFilters();
  });
})();
