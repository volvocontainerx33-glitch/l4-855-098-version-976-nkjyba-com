function initMoviePlayer(options) {
  const video = document.getElementById(options.videoId);
  const layer = document.getElementById(options.layerId);
  const streamUrl = options.source;
  let ready = false;

  function prepare() {
    if (ready || !video || !streamUrl) {
      return;
    }
    ready = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      const hls = new Hls({ enableWorker: true });
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      return;
    }

    video.src = streamUrl;
  }

  function play() {
    prepare();
    if (layer) {
      layer.classList.add('is-hidden');
    }
    const promise = video.play();
    if (promise && promise.catch) {
      promise.catch(function () {});
    }
  }

  if (!video) {
    return;
  }

  prepare();

  if (layer) {
    layer.addEventListener('click', play);
  }

  video.addEventListener('play', function () {
    if (layer) {
      layer.classList.add('is-hidden');
    }
  });

  video.addEventListener('click', function () {
    if (video.paused) {
      play();
    }
  });
}
