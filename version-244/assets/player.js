var JellyPlayer = (function () {
    var players = new Map();

    function attach(video, stream) {
        if (video.dataset.ready === "1") {
            return;
        }
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = stream;
        } else if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90
            });
            hls.loadSource(stream);
            hls.attachMedia(video);
            players.set(video.id, hls);
        } else {
            video.src = stream;
        }
        video.dataset.ready = "1";
    }

    function play(videoId, cover, stream) {
        var video = document.getElementById(videoId);
        if (!video || !stream) {
            return;
        }
        attach(video, stream);
        if (cover) {
            cover.classList.add("is-hidden");
        }
        var promise = video.play();
        if (promise && promise.catch) {
            promise.catch(function () {});
        }
    }

    function bind() {
        var covers = Array.prototype.slice.call(document.querySelectorAll("[data-play-target]"));
        covers.forEach(function (cover) {
            cover.addEventListener("click", function () {
                play(cover.getAttribute("data-play-target"), cover, cover.getAttribute("data-stream"));
            });
        });
    }

    if (document.readyState !== "loading") {
        bind();
    } else {
        document.addEventListener("DOMContentLoaded", bind);
    }

    return {
        play: play
    };
})();
