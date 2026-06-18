(function () {
  var toggle = document.querySelector("[data-mobile-toggle]");
  var panel = document.querySelector("[data-mobile-panel]");

  if (toggle && panel) {
    toggle.addEventListener("click", function () {
      panel.classList.toggle("is-open");
    });
  }

  var hero = document.querySelector("[data-hero]");
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var previous = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var current = 0;
    var timer = null;

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

    function schedule() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    if (previous) {
      previous.addEventListener("click", function () {
        showSlide(current - 1);
        schedule();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        showSlide(current + 1);
        schedule();
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        showSlide(index);
        schedule();
      });
    });

    showSlide(0);
    schedule();
  }

  var inputs = Array.prototype.slice.call(document.querySelectorAll("[data-search-input]"));
  var cards = Array.prototype.slice.call(document.querySelectorAll(".filter-target"));
  var emptyState = document.getElementById("emptyState");
  var query = new URLSearchParams(window.location.search).get("q") || "";

  function normalize(value) {
    return (value || "").toString().trim().toLowerCase();
  }

  function filterCards(value) {
    var keyword = normalize(value);
    var visible = 0;

    cards.forEach(function (card) {
      var haystack = [
        card.getAttribute("data-title"),
        card.getAttribute("data-tags"),
        card.getAttribute("data-region"),
        card.getAttribute("data-year"),
        card.getAttribute("data-genre")
      ].join(" ").toLowerCase();
      var matched = !keyword || haystack.indexOf(keyword) !== -1;
      card.hidden = !matched;
      if (matched) {
        visible += 1;
      }
    });

    if (emptyState) {
      emptyState.hidden = visible !== 0;
    }
  }

  inputs.forEach(function (input) {
    if (query) {
      input.value = query;
    }

    input.addEventListener("input", function () {
      if (cards.length) {
        filterCards(input.value);
      }
    });

    input.addEventListener("keydown", function (event) {
      if (event.key === "Enter" && !cards.length && input.value.trim()) {
        window.location.href = "./library.html?q=" + encodeURIComponent(input.value.trim());
      }
    });
  });

  if (query && cards.length) {
    filterCards(query);
  }
})();
