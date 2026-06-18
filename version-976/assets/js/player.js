(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    function loadHlsLibrary(callback) {
        if (window.Hls) {
            callback();
            return;
        }

        var existing = document.querySelector('script[data-hls-loader]');
        if (existing) {
            existing.addEventListener('load', callback, { once: true });
            existing.addEventListener('error', callback, { once: true });
            return;
        }

        var script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/hls.js@latest';
        script.async = true;
        script.setAttribute('data-hls-loader', 'true');
        script.addEventListener('load', callback, { once: true });
        script.addEventListener('error', callback, { once: true });
        document.head.appendChild(script);
    }

    function initializePlayer(frame) {
        var video = frame.querySelector('video[data-hls]');
        var button = frame.querySelector('[data-play-button]');
        var message = frame.querySelector('[data-player-message]');

        if (!video) {
            return;
        }

        var hlsUrl = video.getAttribute('data-hls');
        var started = false;
        var hlsInstance = null;

        function setMessage(text) {
            if (message) {
                message.textContent = text || '';
            }
        }

        function hideButton() {
            if (button) {
                button.classList.add('is-hidden');
            }
        }

        function playVideo() {
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function () {
                    setMessage('浏览器阻止自动播放，请再次点击播放器播放。');
                });
            }
        }

        function start() {
            if (started) {
                playVideo();
                return;
            }

            started = true;
            hideButton();
            setMessage('正在加载播放源...');

            if (!hlsUrl) {
                setMessage('当前影片缺少播放源。');
                return;
            }

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = hlsUrl;
                video.addEventListener('loadedmetadata', function () {
                    setMessage('');
                    playVideo();
                }, { once: true });
                video.load();
                return;
            }

            loadHlsLibrary(function () {
                if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true,
                        backBufferLength: 90
                    });
                    hlsInstance.loadSource(hlsUrl);
                    hlsInstance.attachMedia(video);
                    hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        setMessage('');
                        playVideo();
                    });
                    hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                        if (!data || !data.fatal) {
                            return;
                        }

                        if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                            setMessage('网络异常，正在重新加载播放源...');
                            hlsInstance.startLoad();
                            return;
                        }

                        if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                            setMessage('媒体解码异常，正在恢复播放...');
                            hlsInstance.recoverMediaError();
                            return;
                        }

                        setMessage('播放源加载失败，请刷新页面后重试。');
                        hlsInstance.destroy();
                    });
                } else {
                    video.src = hlsUrl;
                    video.load();
                    setMessage('已切换为浏览器原生播放模式。');
                    playVideo();
                }
            });
        }

        if (button) {
            button.addEventListener('click', start);
        }

        video.addEventListener('click', function () {
            if (!started) {
                start();
            }
        });

        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }

    ready(function () {
        document.querySelectorAll('[data-player-frame]').forEach(initializePlayer);
    });
})();
