(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  ready(function () {
    var toggle = document.querySelector('[data-mobile-toggle]');
    var nav = document.querySelector('[data-nav-links]');
    if (toggle && nav) {
      toggle.addEventListener('click', function () {
        nav.classList.toggle('open');
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
    if (slides.length > 0) {
      var active = 0;
      var show = function (index) {
        active = (index + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle('active', i === active);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle('active', i === active);
        });
      };
      dots.forEach(function (dot, i) {
        dot.addEventListener('click', function () {
          show(i);
        });
      });
      show(0);
      window.setInterval(function () {
        show(active + 1);
      }, 5000);
    }

    Array.prototype.slice.call(document.querySelectorAll('[data-filter-scope]')).forEach(function (scope) {
      var input = scope.querySelector('[data-filter-input]');
      var typeSelect = scope.querySelector('[data-filter-type]');
      var yearSelect = scope.querySelector('[data-filter-year]');
      var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-filter-card]'));
      var count = scope.querySelector('[data-match-count]');

      function filterCards() {
        var keyword = input ? input.value.trim().toLowerCase() : '';
        var type = typeSelect ? typeSelect.value : '';
        var year = yearSelect ? yearSelect.value : '';
        var visible = 0;
        cards.forEach(function (card) {
          var haystack = (card.getAttribute('data-keywords') || '').toLowerCase();
          var cardType = card.getAttribute('data-type') || '';
          var cardYear = card.getAttribute('data-year') || '';
          var matched = (!keyword || haystack.indexOf(keyword) !== -1) && (!type || cardType.indexOf(type) !== -1) && (!year || cardYear === year);
          card.classList.toggle('hidden-by-filter', !matched);
          if (matched) {
            visible += 1;
          }
        });
        if (count) {
          count.textContent = visible + ' 部可见';
        }
      }

      if (input) {
        var params = new URLSearchParams(window.location.search);
        var q = params.get('q');
        if (q) {
          input.value = q;
        }
        input.addEventListener('input', filterCards);
      }
      if (typeSelect) {
        typeSelect.addEventListener('change', filterCards);
      }
      if (yearSelect) {
        yearSelect.addEventListener('change', filterCards);
      }
      filterCards();
    });
  });
})();
