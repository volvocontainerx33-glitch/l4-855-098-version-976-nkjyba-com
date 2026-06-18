(function () {
  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      if (window.Hls) {
        resolve();
        return;
      }
      var script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  function setupPlayer() {
    var video = document.querySelector('[data-movie-player]');
    var button = document.querySelector('[data-play-button]');
    if (!video || !button) {
      return;
    }

    var source = video.getAttribute('data-m3u8');
    var started = false;

    function startPlayback() {
      if (!source) {
        return;
      }
      if (started) {
        video.play();
        return;
      }
      started = true;
      button.style.display = 'none';

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        video.play().catch(function () {});
        return;
      }

      loadScript('https://cdn.jsdelivr.net/npm/hls.js@1.5.18/dist/hls.min.js').then(function () {
        if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(source);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            video.play().catch(function () {});
          });
          hls.on(window.Hls.Events.ERROR, function (event, data) {
            if (!data || !data.fatal) {
              return;
            }
            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
              hls.startLoad();
            } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
              hls.recoverMediaError();
            } else {
              hls.destroy();
            }
          });
          window.__movieHls = hls;
        } else {
          video.src = source;
          video.play().catch(function () {});
        }
      }).catch(function () {
        video.src = source;
        video.play().catch(function () {});
      });
    }

    button.addEventListener('click', startPlayback);
    video.addEventListener('play', function () {
      button.style.display = 'none';
    });
  }

  if (document.readyState !== 'loading') {
    setupPlayer();
  } else {
    document.addEventListener('DOMContentLoaded', setupPlayer);
  }
})();
