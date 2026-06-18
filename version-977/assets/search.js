(function () {
  var movies = window.MOVIES || [];

  function getPoster(movie) {
    return './' + movie.poster + '.jpg';
  }

  function getDetail(movie) {
    return movie.detailPath;
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function createCard(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');

    return '' +
      '<article class="movie-card">' +
        '<a class="poster-frame" href="' + escapeHtml(getDetail(movie)) + '">' +
          '<img src="' + escapeHtml(getPoster(movie)) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy" onerror="this.closest(\'.poster-frame\').classList.add(\'poster-missing\'); this.remove();">' +
          '<span class="play-chip">▶ 观看</span>' +
        '</a>' +
        '<div class="movie-card-body">' +
          '<div class="movie-meta-line">' +
            '<span>' + escapeHtml(movie.year) + '</span>' +
            '<span>' + escapeHtml(movie.region) + '</span>' +
            '<span>' + escapeHtml(movie.type) + '</span>' +
          '</div>' +
          '<h3><a href="' + escapeHtml(getDetail(movie)) + '">' + escapeHtml(movie.title) + '</a></h3>' +
          '<p>' + escapeHtml(movie.oneLine) + '</p>' +
          '<div class="tag-row">' + tags + '</div>' +
          '<div class="card-actions">' +
            '<strong>' + escapeHtml(movie.rating) + ' 分</strong>' +
            '<a href="' + escapeHtml(getDetail(movie)) + '">详情</a>' +
          '</div>' +
        '</div>' +
      '</article>';
  }

  function matchMovie(movie, filters) {
    var text = [
      movie.title,
      movie.region,
      movie.type,
      movie.year,
      movie.genre,
      movie.oneLine,
      (movie.tags || []).join(' ')
    ].join(' ').toLowerCase();

    if (filters.q && text.indexOf(filters.q) === -1) {
      return false;
    }

    if (filters.type && movie.type !== filters.type) {
      return false;
    }

    if (filters.region && String(movie.region).indexOf(filters.region) === -1) {
      return false;
    }

    if (filters.year && String(movie.year) !== filters.year) {
      return false;
    }

    return true;
  }

  function readFilters(form) {
    var data = new FormData(form);

    return {
      q: String(data.get('q') || '').trim().toLowerCase(),
      type: String(data.get('type') || '').trim(),
      region: String(data.get('region') || '').trim(),
      year: String(data.get('year') || '').trim()
    };
  }

  function applyQueryToForm(form) {
    var params = new URLSearchParams(window.location.search);
    ['q', 'type', 'region', 'year'].forEach(function (name) {
      if (params.has(name) && form.elements[name]) {
        form.elements[name].value = params.get(name);
      }
    });
  }

  function render() {
    var form = document.querySelector('[data-search-form]');
    var results = document.querySelector('[data-search-results]');
    var summary = document.querySelector('[data-search-summary]');

    if (!form || !results || !summary) {
      return;
    }

    var filters = readFilters(form);
    var matched = movies.filter(function (movie) {
      return matchMovie(movie, filters);
    });
    var limited = matched.slice(0, 96);

    results.innerHTML = limited.map(createCard).join('');
    summary.textContent = '找到 ' + matched.length + ' 部相关影片，当前显示前 ' + limited.length + ' 部。';
  }

  function setup() {
    var form = document.querySelector('[data-search-form]');

    if (!form) {
      return;
    }

    applyQueryToForm(form);

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      render();
    });

    form.addEventListener('input', render);
    form.addEventListener('change', render);
    render();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setup);
  } else {
    setup();
  }
})();
