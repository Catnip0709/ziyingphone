/* ============================================
   捡手机文学 · 慕容紫英
   相册应用模块
   ============================================ */

(function () {
  "use strict";

  var PHOTOS_DIR = "picture/album/";
  var PHOTOS_LIST_PATH = "text/photos/album.txt";
  var PHOTO_EXT_RE = /\.(jpe?g|png|webp|gif)$/i;
  var cachedPhotos = null;
  var currentViewerState = null;
  var currentViewerIndex = -1;
  var eventsBound = false;

  function escapeHtml(text) {
    var div = document.createElement("div");
    div.textContent = text || "";
    return div.innerHTML;
  }

  function formatDate(date) {
    if (!(date instanceof Date) || isNaN(date.getTime())) {
      return "时间未知";
    }
    var y = date.getFullYear();
    var m = String(date.getMonth() + 1).padStart(2, "0");
    var d = String(date.getDate()).padStart(2, "0");
    var hh = String(date.getHours()).padStart(2, "0");
    var mm = String(date.getMinutes()).padStart(2, "0");
    return y + "年" + m + "月" + d + "日 " + hh + ":" + mm;
  }

  function formatFileSize(bytes) {
    if (!bytes || isNaN(bytes)) {
      return "";
    }
    if (bytes < 1024 * 1024) {
      return (bytes / 1024).toFixed(1).replace(/\.0$/, "") + " KB";
    }
    return (bytes / (1024 * 1024)).toFixed(1).replace(/\.0$/, "") + " MB";
  }

  function getPhotoTitle(name) {
    return decodeURIComponent(name || "").replace(/\.[^.]+$/, "");
  }

  function parsePhotoList(text) {
    var photos = [];
    var seen = {};
    var lines = String(text || "").split(/\r?\n/);

    lines.forEach(function (line) {
      var fileName = line.trim();
      if (!fileName || fileName.charAt(0) === "#") return;
      fileName = fileName.split("?")[0].split("#")[0].trim();
      if (!PHOTO_EXT_RE.test(fileName)) return;
      if (seen[fileName]) return;
      seen[fileName] = true;
      photos.push(buildPhoto(fileName));
    });

    return photos;
  }

  function buildPhoto(fileName) {
    return {
      fileName: fileName,
      url: PHOTOS_DIR + encodeURIComponent(fileName),
      title: getPhotoTitle(fileName),
      capturedAt: null,
      modifiedAt: null,
      size: "",
      loadedMeta: false
    };
  }

  // 解析目录自动索引（python http.server / npx serve / nginx autoindex 等）
  // 返回的 HTML 通常包含 <a href="filename.jpg">...</a>
  function parseAutoIndex(html) {
    var photos = [];
    var seen = {};
    var hrefRe = /<a\s+[^>]*href=["']([^"'?#]+)["']/gi;
    var match;
    while ((match = hrefRe.exec(String(html || ""))) !== null) {
      var raw = match[1];
      // 跳过父目录、绝对 URL、子目录
      if (!raw || raw === "../" || raw === "./" || raw.indexOf("://") !== -1) continue;
      // 取最后一段，去掉路径前缀
      var fileName = raw.split("/").filter(Boolean).pop() || "";
      try {
        fileName = decodeURIComponent(fileName);
      } catch (err) {
        // 保持原样
      }
      if (!PHOTO_EXT_RE.test(fileName)) continue;
      if (seen[fileName]) continue;
      seen[fileName] = true;
      photos.push(buildPhoto(fileName));
    }
    return photos;
  }

  function fetchAutoIndex() {
    return fetch(PHOTOS_DIR, { headers: { Accept: "text/html" } })
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

  function fetchPhotoList(callback) {
    fetchAutoIndex().then(function (autoPhotos) {
      if (autoPhotos && autoPhotos.length) {
        callback(autoPhotos);
        return;
      }
      // 回退到 album.txt 清单
      fetch(PHOTOS_LIST_PATH)
        .then(function (res) {
          if (!res.ok) throw new Error("HTTP " + res.status);
          return res.text();
        })
        .then(function (text) {
          callback(parsePhotoList(text));
        })
        .catch(function () {
          callback([]);
        });
    });
  }

  function loadPhotoHead(photo) {
    return fetch(photo.url, { method: "HEAD" })
      .then(function (res) {
        if (!res.ok) throw new Error("HTTP " + res.status);
        var lastModified = res.headers.get("Last-Modified");
        var contentLength = Number(res.headers.get("Content-Length") || 0);
        if (lastModified) {
          photo.modifiedAt = new Date(lastModified);
        }
        photo.size = formatFileSize(contentLength);
        photo.loadedMeta = true;
        return photo;
      })
      .catch(function () {
        photo.loadedMeta = true;
        return photo;
      });
  }

  function getExifDate(buffer) {
    var view = new DataView(buffer);
    var offset = 2;

    function getString(start, length) {
      var out = "";
      var i;
      for (i = 0; i < length; i += 1) {
        out += String.fromCharCode(view.getUint8(start + i));
      }
      return out;
    }

    function readTagValue(tiffStart, entryOffset, littleEndian) {
      var type = view.getUint16(entryOffset + 2, littleEndian);
      var count = view.getUint32(entryOffset + 4, littleEndian);
      var valueOffset = entryOffset + 8;
      var actualOffset = count <= 4 ? valueOffset : tiffStart + view.getUint32(valueOffset, littleEndian);
      var chars = [];
      var i;

      if (type !== 2 || count <= 1) return "";
      for (i = 0; i < count - 1; i += 1) {
        chars.push(String.fromCharCode(view.getUint8(actualOffset + i)));
      }
      return chars.join("");
    }

    function readIfd(tiffStart, dirOffset, littleEndian) {
      var numEntries = view.getUint16(dirOffset, littleEndian);
      var i;
      var entryOffset;
      var tag;
      var exifPointer = 0;

      for (i = 0; i < numEntries; i += 1) {
        entryOffset = dirOffset + 2 + i * 12;
        tag = view.getUint16(entryOffset, littleEndian);
        if (tag === 0x8769) {
          exifPointer = tiffStart + view.getUint32(entryOffset + 8, littleEndian);
        }
      }

      if (!exifPointer) return "";

      numEntries = view.getUint16(exifPointer, littleEndian);
      for (i = 0; i < numEntries; i += 1) {
        entryOffset = exifPointer + 2 + i * 12;
        tag = view.getUint16(entryOffset, littleEndian);
        if (tag === 0x9003 || tag === 0x0132) {
          return readTagValue(tiffStart, entryOffset, littleEndian);
        }
      }

      return "";
    }

    while (offset < view.byteLength) {
      if (view.getUint8(offset) !== 0xFF) break;
      var marker = view.getUint8(offset + 1);
      var size = view.getUint16(offset + 2, false);
      if (marker === 0xE1 && getString(offset + 4, 4) === "Exif") {
        var tiffStart = offset + 10;
        var byteOrder = getString(tiffStart, 2);
        var littleEndian = byteOrder === "II";
        var ifdOffset = view.getUint32(tiffStart + 4, littleEndian);
        var rawDate = readIfd(tiffStart, tiffStart + ifdOffset, littleEndian);
        if (rawDate) {
          var normalized = rawDate.replace(/^(\d{4}):(\d{2}):(\d{2})/, "$1-$2-$3");
          return new Date(normalized);
        }
        break;
      }
      offset += 2 + size;
    }

    return null;
  }

  function loadPhotoExif(photo) {
    if (photo.capturedAt) {
      return Promise.resolve(photo);
    }

    return fetch(photo.url)
      .then(function (res) {
        if (!res.ok) throw new Error("HTTP " + res.status);
        return res.arrayBuffer();
      })
      .then(function (buffer) {
        photo.capturedAt = getExifDate(buffer);
        return photo;
      })
      .catch(function () {
        return photo;
      });
  }

  function renderPhotoCard(photo, index) {
    var html = '<button class="photos-card" type="button" data-photo-index="' + escapeHtml(String(index)) + '" aria-label="' + escapeHtml(photo.title) + '">';
    html += '<img class="photos-thumb" src="' + escapeHtml(photo.url) + '" alt="' + escapeHtml(photo.title) + '" loading="lazy">';
    html += "</button>";
    return html;
  }

  function renderViewer(photo, index, total) {
    var infoLabel = photo.capturedAt ? "拍摄时间 " + formatDate(photo.capturedAt) :
      (photo.modifiedAt ? "文件时间 " + formatDate(photo.modifiedAt) : "时间未知");
    var infoSize = photo.size ? " · " + photo.size : "";
    var canPrev = index > 0;
    var canNext = index < total - 1;
    var html = '<div class="photos-viewer" data-zoom="1">';
    html += '<div class="photos-viewer-topbar">';
    html += '<div class="photos-viewer-counter">' + (index + 1) + ' / ' + total + '</div>';
    html += '<button class="photos-viewer-close" type="button" aria-label="关闭">完成</button>';
    html += '</div>';
    html += '<div class="photos-viewer-stage">';
    html += '<img class="photos-viewer-image" src="' + escapeHtml(photo.url) + '" alt="' + escapeHtml(photo.title) + '">';
    if (canPrev) {
      html += '<button class="photos-viewer-nav photos-viewer-nav-prev" type="button" aria-label="上一张">';
      html += '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>';
      html += '</button>';
    }
    if (canNext) {
      html += '<button class="photos-viewer-nav photos-viewer-nav-next" type="button" aria-label="下一张">';
      html += '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>';
      html += '</button>';
    }
    html += "</div>";
    html += '<div class="photos-viewer-info">';
    html += '<div class="photos-viewer-title">' + escapeHtml(photo.title) + "</div>";
    html += '<div class="photos-viewer-meta">' + escapeHtml(infoLabel) + escapeHtml(infoSize) + "</div>";
    html += "</div>";
    html += "</div>";
    return html;
  }

  function renderPhotosPage(photos) {
    var html = '<div class="photos-app">';
    html += '<div class="photos-header">';
    html += "<h1>相册</h1>";
    html += '<div class="photos-subtitle">自动读取 picture/album 中的图片</div>';
    html += "</div>";
    html += '<div class="photos-grid">';
    if (!photos || !photos.length) {
      html += '<div class="photos-empty">';
      html += '<div class="photos-empty-title">相册里还没有图片</div>';
      html += '<div class="photos-empty-text">把图片放进 `picture/album` 后刷新即可。若服务器未开启目录索引，可在 `text/photos/album.txt` 里追加文件名作为兜底。</div>';
      html += "</div>";
    } else {
      photos.forEach(function (photo, index) {
        html += renderPhotoCard(photo, index);
      });
    }
    html += "</div>";
    html += '<div class="photos-viewer-host"></div>';
    html += "</div>";
    return html;
  }

  function syncViewerTransform(container) {
    if (!currentViewerState || !container) return;
    var img = container.querySelector(".photos-viewer-image");
    if (!img) return;
    img.style.transform = "translate(" + currentViewerState.x + "px, " + currentViewerState.y + "px) scale(" + currentViewerState.scale + ")";
  }

  function resetViewerState() {
    currentViewerState = {
      scale: 1,
      x: 0,
      y: 0,
      startX: 0,
      startY: 0,
      baseScale: 1,
      pinchDistance: 0,
      dragging: false,
      pinching: false
    };
  }

  function getTouchDistance(touches) {
    var dx = touches[0].clientX - touches[1].clientX;
    var dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  function openViewer(index) {
    var appContent = document.getElementById("appContent");
    var host = appContent && appContent.querySelector(".photos-viewer-host");
    var photo = cachedPhotos && cachedPhotos[index];

    if (!host || !photo) return;
    currentViewerIndex = index;
    var total = cachedPhotos.length;

    loadPhotoExif(photo).finally(function () {
      host.innerHTML = renderViewer(photo, index, total);
      resetViewerState();
      syncViewerTransform(host);
    });
  }

  function navigateViewer(delta) {
    if (!cachedPhotos || currentViewerIndex < 0) return;
    var next = currentViewerIndex + delta;
    if (next < 0 || next >= cachedPhotos.length) return;
    openViewer(next);
  }

  function closeViewer() {
    var appContent = document.getElementById("appContent");
    var host = appContent && appContent.querySelector(".photos-viewer-host");
    if (host) {
      host.innerHTML = "";
    }
    currentViewerState = null;
    currentViewerIndex = -1;
  }

  function refreshGrid() {
    var appContent = document.getElementById("appContent");
    if (!appContent || !cachedPhotos) return;
    appContent.innerHTML = renderPhotosPage(cachedPhotos);
  }

  function loadPhotos(callback) {
    fetchPhotoList(function (photos) {
      Promise.all(photos.map(loadPhotoHead)).then(function (loadedPhotos) {
        loadedPhotos.sort(function (a, b) {
          var ta = a.modifiedAt ? a.modifiedAt.getTime() : 0;
          var tb = b.modifiedAt ? b.modifiedAt.getTime() : 0;
          return tb - ta;
        });
        cachedPhotos = loadedPhotos;
        callback(loadedPhotos);
      });
    });
  }

  function renderLoading() {
    return '<div class="photos-app"><div class="photos-header"><h1>相册</h1><div class="photos-subtitle">正在读取 picture/album...</div></div><div class="photos-grid"><div class="photos-empty"><div class="photos-empty-title">正在读取图片</div><div class="photos-empty-text">请稍候。</div></div></div><div class="photos-viewer-host"></div></div>';
  }

  function openPhotosApp(forceReload) {
    var appContent = document.getElementById("appContent");
    if (!appContent) return;

    if (!forceReload && cachedPhotos) {
      appContent.innerHTML = renderPhotosPage(cachedPhotos);
      return;
    }

    appContent.innerHTML = renderLoading();
    loadPhotos(function (photos) {
      appContent.innerHTML = renderPhotosPage(photos);
    });
  }

  function bindViewerEvents() {
    if (eventsBound) return;
    eventsBound = true;

    document.addEventListener("click", function (e) {
      var appContent = document.getElementById("appContent");
      if (!appContent) return;

      var card = e.target.closest(".photos-card");
      if (card && appContent.contains(card)) {
        openViewer(Number(card.getAttribute("data-photo-index")));
        return;
      }

      var prevBtn = e.target.closest(".photos-viewer-nav-prev");
      if (prevBtn && appContent.contains(prevBtn)) {
        e.stopPropagation();
        navigateViewer(-1);
        return;
      }

      var nextBtn = e.target.closest(".photos-viewer-nav-next");
      if (nextBtn && appContent.contains(nextBtn)) {
        e.stopPropagation();
        navigateViewer(1);
        return;
      }

      var closeBtn = e.target.closest(".photos-viewer-close");
      if (closeBtn && appContent.contains(closeBtn)) {
        closeViewer();
      }
    });

    document.addEventListener("dblclick", function (e) {
      var appContent = document.getElementById("appContent");
      var stage = e.target.closest(".photos-viewer-stage");
      var host = appContent && appContent.querySelector(".photos-viewer-host");
      if (!stage || !host || !appContent.contains(stage) || !currentViewerState) return;

      if (currentViewerState.scale > 1) {
        currentViewerState.scale = 1;
        currentViewerState.x = 0;
        currentViewerState.y = 0;
      } else {
        currentViewerState.scale = 2;
      }
      syncViewerTransform(host);
    });

    document.addEventListener("touchstart", function (e) {
      var appContent = document.getElementById("appContent");
      var stage = e.target.closest(".photos-viewer-stage");
      if (!stage || !appContent || !appContent.contains(stage) || !currentViewerState) return;

      if (e.touches.length === 2) {
        currentViewerState.pinching = true;
        currentViewerState.dragging = false;
        currentViewerState.baseScale = currentViewerState.scale;
        currentViewerState.pinchDistance = getTouchDistance(e.touches);
      } else if (e.touches.length === 1) {
        currentViewerState.dragging = true;
        currentViewerState.pinching = false;
        currentViewerState.startX = e.touches[0].clientX - currentViewerState.x;
        currentViewerState.startY = e.touches[0].clientY - currentViewerState.y;
        currentViewerState.swipeStartX = e.touches[0].clientX;
        currentViewerState.swipeStartY = e.touches[0].clientY;
        currentViewerState.swipeDeltaX = 0;
      }
    }, { passive: true });

    document.addEventListener("touchmove", function (e) {
      var appContent = document.getElementById("appContent");
      var stage = e.target.closest(".photos-viewer-stage");
      var host = appContent && appContent.querySelector(".photos-viewer-host");
      if (!stage || !host || !appContent.contains(stage) || !currentViewerState) return;

      if (e.touches.length === 2 && currentViewerState.pinching) {
        var distance = getTouchDistance(e.touches);
        var nextScale = currentViewerState.baseScale * (distance / currentViewerState.pinchDistance);
        currentViewerState.scale = Math.min(4, Math.max(1, nextScale));
        if (currentViewerState.scale === 1) {
          currentViewerState.x = 0;
          currentViewerState.y = 0;
        }
        syncViewerTransform(host);
      } else if (e.touches.length === 1 && currentViewerState.dragging && currentViewerState.scale > 1) {
        currentViewerState.x = e.touches[0].clientX - currentViewerState.startX;
        currentViewerState.y = e.touches[0].clientY - currentViewerState.startY;
        syncViewerTransform(host);
      } else if (e.touches.length === 1 && currentViewerState.scale === 1) {
        currentViewerState.swipeDeltaX = e.touches[0].clientX - (currentViewerState.swipeStartX || 0);
      }
    }, { passive: true });

    document.addEventListener("touchend", function () {
      if (!currentViewerState) return;
      // 触发 swipe 切换
      if (currentViewerState.scale === 1 && Math.abs(currentViewerState.swipeDeltaX || 0) > 60) {
        if (currentViewerState.swipeDeltaX < 0) {
          navigateViewer(1);
        } else {
          navigateViewer(-1);
        }
      }
      currentViewerState.dragging = false;
      currentViewerState.pinching = false;
      currentViewerState.swipeDeltaX = 0;
    });
  }

  window.PhotosApp = {
    open: openPhotosApp,
    closeViewer: closeViewer,
    refresh: function () {
      cachedPhotos = null;
      openPhotosApp(true);
    }
  };

  if (window.AppCore) {
    window.AppCore.registerApp("photos", renderLoading, function () {
      bindViewerEvents();
      openPhotosApp(true);
    });
  }
})();
