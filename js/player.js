/* ============================================
   Player App - 媒体播放器
   ============================================ */

(function () {
  "use strict";

  var MEDIA_DIR = "media/";
  var MEDIA_LIST_PATH = "text/player/player.txt";
  var MEDIA_EXT_RE = /\.(mp4|mp3|wav|webm|m4a|aac|ogg|flac|mov|mkv)$/i;
  var AUDIO_EXT_RE = /\.(mp3|wav|m4a|aac|ogg|flac)$/i;
  var cachedFiles = null;
  var currentMedia = null;
  var currentEl = null;
  var eventsBound = false;
  var SPEED_OPTIONS = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];
  var playbackRate = 1.0;

  function formatSpeedLabel(rate) {
    var s = Number(rate).toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
    return s + "×";
  }

  function cycleSpeed() {
    var idx = SPEED_OPTIONS.indexOf(playbackRate);
    if (idx === -1) idx = SPEED_OPTIONS.indexOf(1.0);
    var next = SPEED_OPTIONS[(idx + 1) % SPEED_OPTIONS.length];
    playbackRate = next;
    if (currentEl) {
      currentEl.playbackRate = playbackRate;
    }
    var btn = document.getElementById("pfSpeedBtn");
    if (btn) btn.textContent = formatSpeedLabel(playbackRate);
  }

  function escapeHtml(text) {
    var div = document.createElement("div");
    div.textContent = text || "";
    return div.innerHTML;
  }

  function formatDuration(seconds) {
    if (typeof seconds !== "number" || isNaN(seconds) || !isFinite(seconds)) return "--:--";
    var s = Math.round(seconds);
    var m = Math.floor(s / 60);
    var sec = s % 60;
    return m + ":" + (sec < 10 ? "0" : "") + sec;
  }

  function getFileName(raw) {
    try {
      return decodeURIComponent(raw);
    } catch (e) {
      return raw;
    }
  }

  function getTitle(name) {
    return name.replace(/\.[^.]+$/, "");
  }

  function isAudio(name) {
    return AUDIO_EXT_RE.test(name);
  }

  function isVideo(name) {
    return MEDIA_EXT_RE.test(name) && !isAudio(name);
  }

  function buildFileEntry(fileName) {
    return {
      fileName: fileName,
      url: MEDIA_DIR + encodeURIComponent(fileName),
      title: getTitle(fileName),
      isAudio: isAudio(fileName),
      isVideo: isVideo(fileName),
      loadedMeta: false,
      duration: null,
      size: ""
    };
  }

  // 解析 media/ 目录自动索引
  function parseAutoIndex(html) {
    var files = [];
    var seen = {};
    var hrefRe = /<a\s+[^>]*href=["']([^"'?#]+)["']/gi;
    var match;
    while ((match = hrefRe.exec(String(html || ""))) !== null) {
      var raw = match[1];
      if (!raw || raw === "../" || raw === "./" || raw.indexOf("://") !== -1) continue;
      var fileName = raw.split("/").filter(Boolean).pop() || "";
      fileName = getFileName(fileName);
      if (!MEDIA_EXT_RE.test(fileName)) continue;
      if (seen[fileName]) continue;
      seen[fileName] = true;
      files.push(buildFileEntry(fileName));
    }
    return files;
  }

  function fetchAutoIndex() {
    return fetch(MEDIA_DIR, { headers: { Accept: "text/html" } })
      .then(function (res) {
        if (!res.ok) return [];
        var contentType = res.headers.get("Content-Type") || "";
        if (contentType.indexOf("text/html") === -1) return [];
        return res.text().then(parseAutoIndex);
      })
      .catch(function () {
        return [];
      });
  }

  function parseListText(text) {
    var files = [];
    var seen = {};
    String(text || "").split(/\r?\n/).forEach(function (line) {
      var fileName = line.trim();
      if (!fileName || fileName.charAt(0) === "#") return;
      fileName = fileName.split("?")[0].split("#")[0].trim();
      if (!MEDIA_EXT_RE.test(fileName)) return;
      if (seen[fileName]) return;
      seen[fileName] = true;
      files.push(buildFileEntry(fileName));
    });
    return files;
  }

  function fetchFileList(callback) {
    fetchAutoIndex().then(function (autoFiles) {
      if (autoFiles && autoFiles.length) {
        callback(autoFiles);
        return;
      }
      fetch(MEDIA_LIST_PATH)
        .then(function (res) {
          if (!res.ok) throw new Error("HTTP " + res.status);
          return res.text();
        })
        .then(function (text) {
          callback(parseListText(text));
        })
        .catch(function () {
          callback([]);
        });
    });
  }

  function loadFileMeta(file) {
    return fetch(file.url, { method: "HEAD" })
      .then(function (res) {
        if (!res.ok) throw new Error("HTTP " + res.status);
        var cl = Number(res.headers.get("Content-Length") || 0);
        if (cl > 0) {
          if (cl < 1024 * 1024) {
            file.size = (cl / 1024).toFixed(1).replace(/\.0$/, "") + " KB";
          } else {
            file.size = (cl / (1024 * 1024)).toFixed(1).replace(/\.0$/, "") + " MB";
          }
        }
        file.loadedMeta = true;
        return file;
      })
      .catch(function () {
        file.loadedMeta = true;
        return file;
      });
  }

  function renderFileRow(file, index) {
    var icon = file.isAudio ?
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><rect x="6" y="3" width="12" height="18" rx="2"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r="1.2" fill="currentColor"/></svg>' :
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><polygon points="10 8 16 12 10 16 10 8" fill="currentColor" stroke="none"/></svg>';

    var label = file.isAudio ? "音频" : "视频";
    var tagClass = file.isAudio ? "player-tag-audio" : "player-tag-video";
    var meta = [];
    if (file.size) meta.push(escapeHtml(file.size));
    if (file.duration) meta.push(formatDuration(file.duration));

    return '<button class="player-file-row" type="button" data-player-index="' + escapeHtml(String(index)) + '">' +
      '<div class="player-file-icon">' + icon + '</div>' +
      '<div class="player-file-info">' +
        '<div class="player-file-title">' + escapeHtml(file.title) + '</div>' +
        '<div class="player-file-meta">' +
          '<span class="player-tag ' + tagClass + '">' + label + '</span>' +
          (meta.length ? '<span class="player-file-size">' + meta.join(" · ") + '</span>' : '') +
        '</div>' +
      '</div>' +
      '<div class="player-file-chevron">' +
        '<svg viewBox="0 0 8 14" width="8" height="14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M1 1l6 6-6 6"/></svg>' +
      '</div>' +
    '</button>';
  }

  function renderPlayerPage(files) {
    var html = '<div class="player-app">';
    if (currentMedia) {
      html += renderNowPlaying();
      html += '<div class="player-section">';
      html += '<div class="player-section-title">媒体库</div>';
      html += '</div>';
    }
    html += '<div class="player-list">';
    if (!files || !files.length) {
      html += '<div class="player-empty">';
      html += '<div class="player-empty-title">媒体库中没有文件</div>';
      html += '<div class="player-empty-text">把音视频文件放入 media/ 目录，或在 text/player/player.txt 中添加文件名。</div>';
      html += '</div>';
    } else {
      files.forEach(function (file, i) {
        html += renderFileRow(file, i);
      });
    }
    html += '</div>';
    html += '<div class="player-nowplaying-host"></div>';
    html += '</div>';
    return html;
  }

  function renderNowPlaying() {
    if (!currentMedia) return "";
    var isAudio = currentMedia.isAudio;
    var html = '<div class="player-nowplaying" id="nowPlayingBar">';

    html += '<div class="np-info">';
    html += '<div class="np-art">';
    if (isAudio) {
      html += '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><rect x="6" y="3" width="12" height="18" rx="2"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/></svg>';
    } else {
      html += '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><polygon points="10 8 16 12 10 16 10 8" fill="currentColor" stroke="none"/></svg>';
    }
    html += '</div>';
    html += '<div class="np-title-wrap">';
    html += '<div class="np-title">' + escapeHtml(currentMedia.title || currentMedia.fileName) + '</div>';
    html += '<div class="np-time" id="npTime">--:-- / --:--</div>';
    html += '</div>';
    html += '<button class="np-stop" type="button" id="npStopBtn" title="关闭">';
    html += '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>';
    html += '</button>';
    html += '</div>';

    html += '<div class="np-controls">';
    html += '<button class="np-btn np-btn-rewind" type="button" id="npRewindBtn">';
    html += '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 19 2 12 11 5 11 19"/><line x1="22" y1="5" x2="22" y2="19"/></svg>';
    html += '</button>';

    html += '<button class="np-btn np-btn-play" type="button" id="npPlayBtn">';
    html += '<svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor" stroke="none"><polygon points="6 3 20 12 6 21 6 3"/></svg>';
    html += '</button>';

    html += '<button class="np-btn np-btn-forward" type="button" id="npForwardBtn">';
    html += '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 5 22 12 13 19 13 5"/><line x1="2" y1="5" x2="2" y2="19"/></svg>';
    html += '</button>';
    html += '</div>';

    html += '<div class="np-progress">';
    html += '<span class="np-current" id="npCurrent">0:00</span>';
    html += '<div class="np-bar-wrap" id="npBarWrap">';
    html += '<div class="np-bar-track">';
    html += '<div class="np-bar-fill" id="npBarFill"></div>';
    html += '</div>';
    html += '<div class="np-bar-thumb" id="npBarThumb"></div>';
    html += '</div>';
    html += '<span class="np-duration" id="npDuration">--:--</span>';
    html += '</div>';

    // 隐藏的 media element
    html += '<div id="npMediaHost"></div>';

    html += '</div>';
    return html;
  }

  function renderFullPlayer(file) {
    var isAudio = file.isAudio;
    var html = '<div class="player-full">';

    html += '<div class="pf-header">';
    html += '<button class="pf-back" type="button" id="pfBackBtn">';
    html += '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M15 18l-6-6 6-6"/></svg>';
    html += '</button>';
    html += '<div class="pf-title">' + escapeHtml(file.title || file.fileName) + '</div>';
    html += '<button class="pf-speed" type="button" id="pfSpeedBtn" aria-label="倍速">' + formatSpeedLabel(playbackRate) + '</button>';
    html += '</div>';

    html += '<div class="pf-media-wrap" id="pfMediaWrap">';
    if (isAudio) {
      html += '<div class="pf-audio-visual">';
      html += '<div class="pf-audio-art">';
      html += '<svg viewBox="0 0 24 24" width="80" height="80" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"><rect x="6" y="3" width="12" height="18" rx="2"/><circle cx="12" cy="12" r="5"/></svg>';
      html += '</div>';
      html += '<div class="pf-audio-title">' + escapeHtml(file.title || file.fileName) + '</div>';
      html += '</div>';
      html += '<audio id="pfMedia" src="' + escapeHtml(file.url) + '" preload="metadata"></audio>';
    } else {
      html += '<video id="pfMedia" src="' + escapeHtml(file.url) + '" preload="metadata" playsinline controlsList="nodownload"></video>';
    }
    html += '</div>';

    html += '<div class="pf-progress" id="pfProgress">';
    html += '<span class="pf-current" id="pfCurrent">0:00</span>';
    html += '<div class="pf-bar-wrap" id="pfBarWrap">';
    html += '<div class="pf-bar-track">';
    html += '<div class="pf-bar-fill" id="pfBarFill"></div>';
    html += '</div>';
    html += '<div class="pf-bar-thumb" id="pfBarThumb"></div>';
    html += '</div>';
    html += '<span class="pf-duration" id="pfDuration">--:--</span>';
    html += '</div>';

    html += '<div class="pf-controls">';
    html += '<button class="pf-btn pf-btn-rewind" type="button" id="pfRewind">';
    html += '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 19 2 12 11 5 11 19"/><line x1="22" y1="5" x2="22" y2="19"/></svg>';
    html += '</button>';

    html += '<button class="pf-btn pf-btn-play" type="button" id="pfPlay">';
    html += '<svg viewBox="0 0 24 24" width="36" height="36" fill="currentColor" stroke="none"><polygon points="6 3 20 12 6 21 6 3"/></svg>';
    html += '</button>';

    html += '<button class="pf-btn pf-btn-forward" type="button" id="pfForward">';
    html += '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 5 22 12 13 19 13 5"/><line x1="2" y1="5" x2="2" y2="19"/></svg>';
    html += '</button>';
    html += '</div>';

    html += '</div>';
    return html;
  }

  function bindPlayerEvents() {
    if (eventsBound) return;
    eventsBound = true;

    document.addEventListener("click", function (e) {
      var appContent = document.getElementById("appContent");
      if (!appContent) return;

      var row = e.target.closest(".player-file-row");
      if (row && appContent.contains(row)) {
        var index = Number(row.getAttribute("data-player-index"));
        openPlayer(index);
        return;
      }

      var backBtn = e.target.closest("#pfBackBtn");
      if (backBtn && appContent.contains(backBtn)) {
        closePlayer();
        return;
      }

      // 播放/暂停
      var playBtn = e.target.closest("#pfPlay");
      if (playBtn && appContent.contains(playBtn)) {
        togglePlay();
        return;
      }

      // 快退快进
      if (e.target.closest("#pfRewind") && appContent.contains(e.target.closest("#pfRewind"))) {
        seekRelative(-10);
        return;
      }
      if (e.target.closest("#pfForward") && appContent.contains(e.target.closest("#pfForward"))) {
        seekRelative(10);
        return;
      }

      // 倍速循环切换
      var speedBtn = e.target.closest("#pfSpeedBtn");
      if (speedBtn && appContent.contains(speedBtn)) {
        cycleSpeed();
        return;
      }
    });

    // 进度条点击/拖动（用 pointer events + setPointerCapture 避免被 video 拦截）
    document.addEventListener("pointerdown", function (e) {
      var barWrap = e.target.closest("#pfBarWrap");
      if (!barWrap) return;
      var appContent = document.getElementById("appContent");
      if (!appContent || !appContent.contains(barWrap)) return;
      if (!currentEl) return;

      e.preventDefault();
      try { barWrap.setPointerCapture(e.pointerId); } catch (err) {}
      updateProgressFromPointer(e);

      function onMove(ev) {
        ev.preventDefault();
        updateProgressFromPointer(ev);
      }

      function onUp(ev) {
        try { barWrap.releasePointerCapture(ev.pointerId); } catch (err) {}
        barWrap.removeEventListener("pointermove", onMove);
        barWrap.removeEventListener("pointerup", onUp);
        barWrap.removeEventListener("pointercancel", onUp);
      }

      barWrap.addEventListener("pointermove", onMove);
      barWrap.addEventListener("pointerup", onUp);
      barWrap.addEventListener("pointercancel", onUp);
    });
  }

  function updateProgressFromPointer(e) {
    if (!currentEl) return;
    var barWrap = document.getElementById("pfBarWrap");
    if (!barWrap) return;
    var rect = barWrap.getBoundingClientRect();
    var clientX = e.touches ? e.touches[0].clientX : e.clientX;
    var ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    if (currentEl.duration) {
      currentEl.currentTime = ratio * currentEl.duration;
    }
  }

  function togglePlay() {
    if (!currentEl) return;
    if (currentEl.paused) {
      currentEl.play().catch(function () {});
    } else {
      currentEl.pause();
    }
  }

  function seekRelative(seconds) {
    if (!currentEl) return;
    var t = Math.max(0, Math.min(currentEl.duration || 0, currentEl.currentTime + seconds));
    currentEl.currentTime = t;
  }

  function openPlayer(index) {
    var file = cachedFiles && cachedFiles[index];
    if (!file) return;

    if (file.loadedMeta && typeof file.duration === "number" && file.duration > 0) {
      renderFullScreen(file);
      return;
    }

    var tempEl = document.createElement(file.isVideo ? "video" : "audio");
    tempEl.preload = "metadata";
    tempEl.src = file.url;
    tempEl.onloadedmetadata = function () {
      file.duration = tempEl.duration;
      file.loadedMeta = true;
      renderFullScreen(file);
      tempEl = null;
    };
    tempEl.onerror = function () {
      file.loadedMeta = true;
      renderFullScreen(file);
      tempEl = null;
    };
  }

  function renderFullScreen(file) {
    var appContent = document.getElementById("appContent");
    if (!appContent) return;

    currentMedia = file;
    appContent.innerHTML = renderFullPlayer(file);

    // 绑定 media element
    var el = document.getElementById("pfMedia");
    if (!el) return;
    currentEl = el;
    el.playbackRate = playbackRate;

    el.addEventListener("loadedmetadata", function () {
      updateDuration();
      updateProgress();
      updateTimeDisplay();
    });

    el.addEventListener("timeupdate", function () {
      updateProgress();
      updateTimeDisplay();
    });

    el.addEventListener("play", updatePlayButton);
    el.addEventListener("pause", updatePlayButton);
    el.addEventListener("ended", function () {
      updatePlayButton();
    });

    el.addEventListener("error", function () {
      console.warn("[Player] 播放出错:", file.url);
    });

    // 自动播放
    el.play().catch(function () {});
    updatePlayButton();
  }

  function closePlayer() {
    if (currentEl) {
      currentEl.pause();
      currentEl.src = "";
      currentEl.load();
      currentEl = null;
    }
    currentMedia = null;
    refreshApp();
  }

  function updateDuration() {
    var durEl = document.getElementById("pfDuration");
    if (durEl && currentEl && currentEl.duration) {
      durEl.textContent = formatDuration(currentEl.duration);
    }
  }

  function updateTimeDisplay() {
    var curEl = document.getElementById("pfCurrent");
    var durEl = document.getElementById("pfDuration");
    if (!currentEl) return;
    if (curEl) curEl.textContent = formatDuration(currentEl.currentTime);
    if (durEl && currentEl.duration && isFinite(currentEl.duration)) {
      durEl.textContent = formatDuration(currentEl.duration);
    }
  }

  function updateProgress() {
    var fillEl = document.getElementById("pfBarFill");
    if (!currentEl || !currentEl.duration) return;
    var pct = isFinite(currentEl.duration) ? (currentEl.currentTime / currentEl.duration) * 100 : 0;
    if (fillEl) fillEl.style.width = pct + "%";
  }

  function updatePlayButton() {
    var btn = document.getElementById("pfPlay");
    if (!btn) return;
    var isPlaying = currentEl && !currentEl.paused && !currentEl.ended;
    btn.innerHTML = isPlaying ?
      '<svg viewBox="0 0 24 24" width="36" height="36" fill="currentColor" stroke="none"><rect x="6" y="5" width="3" height="14" rx="1"/><rect x="15" y="5" width="3" height="14" rx="1"/></svg>' :
      '<svg viewBox="0 0 24 24" width="36" height="36" fill="currentColor" stroke="none"><polygon points="6 3 20 12 6 21 6 3"/></svg>';
  }

  function renderLoading() {
    return '<div class="player-app"><div class="player-empty"><div class="player-empty-title">正在读取媒体库...</div></div></div>';
  }

  function refreshApp() {
    var appContent = document.getElementById("appContent");
    if (!appContent) return;
    appContent.innerHTML = renderPlayerPage(cachedFiles);
  }

  function openPlayerApp(forceReload) {
    var appContent = document.getElementById("appContent");
    if (!appContent) return;

    if (currentMedia) {
      closePlayer();
      return;
    }

    if (!forceReload && cachedFiles) {
      appContent.innerHTML = renderPlayerPage(cachedFiles);
      return;
    }

    appContent.innerHTML = renderLoading();
    fetchFileList(function (files) {
      Promise.all(files.map(loadFileMeta)).then(function (loaded) {
        cachedFiles = loaded;
        appContent.innerHTML = renderPlayerPage(loaded);
      });
    });
  }

  function resetState() {
    if (currentEl) {
      currentEl.pause();
      currentEl.src = "";
      currentEl.load();
      currentEl = null;
    }
    currentMedia = null;
  }

  window.PlayerApp = {
    open: openPlayerApp,
    close: function () {
      resetState();
      cachedFiles = null;
      openPlayerApp(true);
    },
    reset: resetState
  };

  if (window.AppCore) {
    window.AppCore.registerApp("player", function () {
      return '<div class="player-app"><div class="player-empty"><div class="player-empty-title">媒体库</div><div class="player-empty-text">正在载入...</div></div></div>';
    }, function () {
      bindPlayerEvents();
      openPlayerApp(true);
    });
  }
})();