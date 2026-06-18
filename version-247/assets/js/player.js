
(function () {
  var hlsPromise = null;

  function getHls() {
    if (window.Hls) {
      return Promise.resolve(window.Hls);
    }

    if (!hlsPromise) {
      hlsPromise = new Promise(function (resolve, reject) {
        var script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.6.15/dist/hls.min.js';
        script.onload = function () {
          resolve(window.Hls);
        };
        script.onerror = reject;
        document.head.appendChild(script);
      });
    }

    return hlsPromise;
  }

  function attach(video, url) {
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = url;
      return Promise.resolve();
    }

    return getHls().then(function (Hls) {
      if (Hls && Hls.isSupported()) {
        var hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(url);
        hls.attachMedia(video);
        video._hls = hls;
      } else {
        video.src = url;
      }
    });
  }

  function start(block) {
    var video = block.querySelector('video');
    var button = block.querySelector('.play-overlay');
    var url = block.getAttribute('data-video');

    if (!video || !url) {
      return;
    }

    var ready = video.getAttribute('data-ready') === '1'
      ? Promise.resolve()
      : attach(video, url).then(function () {
          video.setAttribute('data-ready', '1');
        });

    ready.then(function () {
      if (button) {
        button.classList.add('is-hidden');
      }
      var playTask = video.play();
      if (playTask && playTask.catch) {
        playTask.catch(function () {});
      }
    });
  }

  Array.prototype.slice.call(document.querySelectorAll('.video-player')).forEach(function (block) {
    var button = block.querySelector('.play-overlay');
    var video = block.querySelector('video');

    if (button) {
      button.addEventListener('click', function () {
        start(block);
      });
    }

    if (video) {
      video.addEventListener('click', function () {
        start(block);
      });
    }
  });
})();
