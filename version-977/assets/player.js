async function loadHlsModule() {
  try {
    var module = await import('./video-ngrwgkzw.js');
    return module.H;
  } catch (error) {
    console.warn('HLS module loading failed:', error);
    return null;
  }
}

async function initializePlayer(player) {
  var video = player.querySelector('video');
  var button = player.querySelector('.player-play');
  var status = player.querySelector('[data-player-status]');
  var source = player.dataset.source;

  if (!video || !source || player.dataset.ready === 'true') {
    return;
  }

  player.dataset.ready = 'true';

  if (status) {
    status.textContent = '正在初始化播放器...';
  }

  if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = source;
  } else {
    var Hls = await loadHlsModule();

    if (Hls && Hls.isSupported()) {
      var hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });

      hls.loadSource(source);
      hls.attachMedia(video);

      hls.on(Hls.Events.ERROR, function (_event, data) {
        if (status) {
          status.textContent = '播放源连接异常，正在尝试恢复...';
        }

        if (data && data.fatal) {
          if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
          } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
          } else {
            hls.destroy();
          }
        }
      });
    } else {
      video.src = source;
    }
  }

  video.controls = true;
  player.classList.add('is-playing');

  try {
    await video.play();
    if (status) {
      status.textContent = '正在播放';
    }
  } catch (error) {
    if (status) {
      status.textContent = '播放器已就绪，请再次点击视频播放';
    }
    if (button) {
      button.style.display = 'none';
    }
  }
}

function setupPlayers() {
  var players = document.querySelectorAll('[data-player]');

  players.forEach(function (player) {
    var button = player.querySelector('.player-play');

    if (button) {
      button.addEventListener('click', function () {
        initializePlayer(player);
      });
    }
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setupPlayers);
} else {
  setupPlayers();
}
