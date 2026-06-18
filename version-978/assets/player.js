(function () {
  function initMoviePlayer(videoUrl) {
    var video = document.getElementById("moviePlayer");
    var overlay = document.getElementById("playerOverlay");
    var playButton = document.getElementById("playerPlay");
    var loaded = false;
    var hls = null;

    if (!video || !overlay || !playButton || !videoUrl) {
      return;
    }

    function attachSource(done) {
      if (loaded) {
        done();
        return;
      }

      loaded = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = videoUrl;
        video.addEventListener("loadedmetadata", done, { once: true });
        window.setTimeout(done, 900);
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(videoUrl);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, done);
        window.setTimeout(done, 1200);
        return;
      }

      video.src = videoUrl;
      video.addEventListener("loadedmetadata", done, { once: true });
      window.setTimeout(done, 900);
    }

    function playVideo() {
      attachSource(function () {
        overlay.classList.add("is-hidden");
        video.controls = true;
        var promise = video.play();
        if (promise && promise.catch) {
          promise.catch(function () {
            overlay.classList.remove("is-hidden");
          });
        }
      });
    }

    overlay.addEventListener("click", playVideo);
    playButton.addEventListener("click", function (event) {
      event.stopPropagation();
      playVideo();
    });
    video.addEventListener("click", function () {
      if (video.paused) {
        playVideo();
      } else {
        video.pause();
      }
    });
  }

  window.initMoviePlayer = initMoviePlayer;
})();
