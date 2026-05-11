/* ============================================
   Timeline App - 时间线应用
   ============================================ */

(function () {
  "use strict";

  var TIMELINE_PATH = "text/timeline/timeline.txt";

  function escapeHtml(text) {
    var div = document.createElement("div");
    div.textContent = text || "";
    return div.innerHTML;
  }

  function formatText(text) {
    return escapeHtml(text || "").replace(/\n/g, "<br>");
  }

  function loadTimelineText(callback) {
    fetch(TIMELINE_PATH)
      .then(function (res) {
        if (!res.ok) throw new Error("HTTP " + res.status);
        return res.text();
      })
      .then(function (text) {
        callback(parseTimelineText(text));
      })
      .catch(function () {
        callback([]);
      });
  }

  function parseTimelineText(text) {
    var events = [];
    var current = null;

    function pushCurrent() {
      if (!current) return;
      current.year = current.year || "";
      current.title = current.title || "未命名事件";
      current.text = current.text || "";
      current.tone = current.tone || "";
      events.push(current);
      current = null;
    }

    String(text || "").split("\n").forEach(function (rawLine) {
      var line = rawLine.trim();
      var match;

      if (!line || line.charAt(0) === "#") return;

      if (line === "[event]") {
        pushCurrent();
        current = {};
        return;
      }

      match = line.match(/^([^=]+)=(.*)$/);
      if (!match || !current) return;
      current[match[1].trim()] = (match[2].trim() || "").replace(/\\n/g, "\n");
    });

    pushCurrent();
    return events;
  }

  function renderLoading() {
    return '<div class="timeline-app"><div class="timeline-loading">正在读取时间线...</div></div>';
  }

  function renderTimeline(events) {
    var html = '<div class="timeline-app">';
    html += '<div class="timeline-hero">';
    html += '<div class="timeline-kicker">2007 - 2027</div>';
    html += '<h1>时间线</h1>';
    html += '<p>琼华陨落之后，菱纱、紫英与鬼界之间的二十年。</p>';
    html += '</div>';

    if (!events.length) {
      html += '<div class="timeline-empty">未读取到时间线内容</div>';
    } else {
      html += '<div class="timeline-list">';
      events.forEach(function (event, index) {
        html += '<article class="timeline-item tone-' + escapeHtml(event.tone) + '">';
        html += '<div class="timeline-node"><span>' + (index + 1) + '</span></div>';
        html += '<div class="timeline-card">';
        html += '<div class="timeline-year">' + escapeHtml(event.year) + '</div>';
        html += '<h2>' + escapeHtml(event.title) + '</h2>';
        html += '<p>' + formatText(event.text) + '</p>';
        html += '</div>';
        html += '</article>';
      });
      html += '</div>';
    }

    html += '</div>';
    return html;
  }

  function bindTimelineEvents() {
    var target = document.getElementById("appContent");
    if (!target) return;

    loadTimelineText(function (events) {
      target.innerHTML = renderTimeline(events);
    });
  }

  if (window.AppCore) {
    window.AppCore.registerApp("timeline", renderLoading, bindTimelineEvents);
  }
})();
