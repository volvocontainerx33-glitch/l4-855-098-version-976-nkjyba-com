(function () {
  const toggle = document.querySelector('[data-menu-toggle]');
  const mobileNav = document.querySelector('[data-mobile-nav]');

  if (toggle && mobileNav) {
    toggle.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  const hero = document.querySelector('[data-hero]');
  if (hero) {
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    const prev = hero.querySelector('[data-hero-prev]');
    const next = hero.querySelector('[data-hero-next]');
    let index = 0;
    let timer = null;

    function showSlide(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        showSlide(index + 1);
      }, 5200);
    }

    if (slides.length) {
      showSlide(0);
      restart();
    }

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(index + 1);
        restart();
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        showSlide(dotIndex);
        restart();
      });
    });
  }

  const filterForm = document.querySelector('[data-filter-form]');
  if (filterForm) {
    const cards = Array.from(document.querySelectorAll('[data-title]'));
    const empty = document.querySelector('[data-empty-state]');
    const count = document.querySelector('[data-result-count]');
    const params = new URLSearchParams(window.location.search);
    const keyword = filterForm.querySelector('[name="q"]');
    if (keyword && params.get('q')) {
      keyword.value = params.get('q');
    }

    function normalize(value) {
      return (value || '').toString().trim().toLowerCase();
    }

    function applyFilter() {
      const data = new FormData(filterForm);
      const q = normalize(data.get('q'));
      const year = normalize(data.get('year'));
      const type = normalize(data.get('type'));
      const region = normalize(data.get('region'));
      let visible = 0;

      cards.forEach(function (card) {
        const haystack = normalize([
          card.dataset.title,
          card.dataset.region,
          card.dataset.type,
          card.dataset.year,
          card.dataset.genre
        ].join(' '));
        const okKeyword = !q || haystack.includes(q);
        const okYear = !year || normalize(card.dataset.year) === year;
        const okType = !type || normalize(card.dataset.type) === type;
        const okRegion = !region || normalize(card.dataset.region).includes(region);
        const isVisible = okKeyword && okYear && okType && okRegion;
        card.classList.toggle('hide-by-filter', !isVisible);
        if (isVisible) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
      if (count) {
        count.textContent = visible.toString();
      }
    }

    filterForm.addEventListener('input', applyFilter);
    filterForm.addEventListener('submit', function (event) {
      event.preventDefault();
      applyFilter();
    });
    applyFilter();
  }
})();
