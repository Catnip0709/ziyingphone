/* ============================================
   Health App - 健康应用（iOS 健康风格）
   ============================================ */

(function () {
  "use strict";

  var HEALTH_PATH = "text/health/health.txt";

  function escapeHtml(text) {
    var div = document.createElement("div");
    div.textContent = text || "";
    return div.innerHTML;
  }

  function formatText(text) {
    return escapeHtml(text || "").replace(/\n/g, "<br>");
  }

  function loadHealthText(callback) {
    fetch(HEALTH_PATH)
      .then(function (res) {
        if (!res.ok) throw new Error("HTTP " + res.status);
        return res.text();
      })
      .then(function (text) {
        callback(parseHealthText(text));
      })
      .catch(function () {
        callback({ profile: null, entries: [] });
      });
  }

  function parseHealthText(text) {
    var profile = null;
    var entries = [];
    var current = null;
    var currentType = null;

    function pushCurrent() {
      if (!current) return;
      if (currentType === "profile") {
        profile = current;
      } else if (currentType === "entry") {
        entries.push(current);
      }
      current = null;
      currentType = null;
    }

    String(text || "").split("\n").forEach(function (rawLine) {
      var line = rawLine.trim();
      var match;

      if (!line || line.charAt(0) === "#") return;

      if (line === "[profile]") {
        pushCurrent();
        current = {};
        currentType = "profile";
        return;
      }
      if (line === "[entry]") {
        pushCurrent();
        current = {};
        currentType = "entry";
        return;
      }

      match = line.match(/^([^=]+)=(.*)$/);
      if (!match || !current) return;
      current[match[1].trim()] = (match[2].trim() || "").replace(/\\n/g, "\n");
    });

    pushCurrent();
    return { profile: profile, entries: entries };
  }

  // SVG 图标
  var ICONS = {
    sleep: '<svg viewBox="0 0 24 24" fill="none"><path d="M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z" fill="currentColor"/></svg>',
    qi:    '<svg viewBox="0 0 24 24" fill="none"><path d="M12 2.5c-3 4-5 6.5-5 9.5a5 5 0 0010 0c0-3-2-5.5-5-9.5z" fill="currentColor"/></svg>',
    heart: '<svg viewBox="0 0 24 24" fill="none"><path d="M12 20.3l-1.5-1.4C5.4 14.4 2 11.3 2 7.6 2 4.6 4.4 2.2 7.5 2.2c1.7 0 3.4.8 4.5 2.1 1.1-1.3 2.8-2.1 4.5-2.1 3.1 0 5.5 2.4 5.5 5.4 0 3.7-3.4 6.8-8.5 11.3L12 20.3z" fill="currentColor"/></svg>',
    training: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 4l5.5 5.5-10 10L4.5 14z"/><path d="M3 21l3-3"/><path d="M16 8l-4-4"/></svg>',
    mood:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><circle cx="9" cy="10" r="0.8" fill="currentColor"/><circle cx="15" cy="10" r="0.8" fill="currentColor"/></svg>'
  };

  var TONE_LABEL = {
    good:     { text: "稳定", color: "#34C759" },
    normal:   { text: "正常", color: "#5AC8FA" },
    warn:     { text: "亏损", color: "#FF9500" },
    poor:     { text: "低迷", color: "#FF3B30" },
    critical: { text: "危急", color: "#AF52DE" }
  };

  function renderLoading() {
    return '<div class="health-app"><div class="health-loading">加载中…</div></div>';
  }

  function renderHero(profile) {
    if (!profile) return "";
    var initial = (profile.name || "紫").charAt(0);
    var html = '<div class="hh-hero">';

    html += '<div class="hh-hero-row">';
    html += '<div class="hh-avatar">' + escapeHtml(initial) + '</div>';
    html += '<div class="hh-hero-meta">';
    html += '<div class="hh-name">' + escapeHtml(profile.name || "") + '</div>';
    html += '<div class="hh-sub">' + escapeHtml(profile.subtitle || "") + '</div>';
    html += '</div>';
    html += '</div>';

    if (profile.headline || profile.summary) {
      html += '<div class="hh-today">';
      if (profile.headline) {
        html += '<div class="hh-today-head">' + escapeHtml(profile.headline) + '</div>';
      }
      if (profile.summary) {
        html += '<div class="hh-today-text">' + formatText(profile.summary) + '</div>';
      }
      html += '</div>';
    }

    html += '</div>';
    return html;
  }

  function metricTile(icon, label, value, modifier) {
    if (!value) return "";
    return '<div class="hh-tile hh-tile-' + modifier + '">' +
      '<div class="hh-tile-head">' +
        '<span class="hh-tile-icon">' + icon + '</span>' +
        '<span class="hh-tile-label">' + escapeHtml(label) + '</span>' +
      '</div>' +
      '<div class="hh-tile-value">' + escapeHtml(value) + '</div>' +
    '</div>';
  }

  function renderEntry(entry, index) {
    var tone = entry.tone || "normal";
    var toneInfo = TONE_LABEL[tone] || TONE_LABEL.normal;

    var html = '<article class="hh-entry tone-' + escapeHtml(tone) + '">';

    // 顶部条：日期 + 状态徽章
    html += '<header class="hh-entry-head">';
    html += '<div class="hh-entry-titles">';
    html += '<div class="hh-entry-date">' + escapeHtml(entry.date || "") + '</div>';
    if (entry.period) {
      html += '<div class="hh-entry-period">' + escapeHtml(entry.period) + '</div>';
    }
    html += '</div>';
    html += '<span class="hh-tone-badge" style="background:' + toneInfo.color + '">' +
      escapeHtml(toneInfo.text) + '</span>';
    html += '</header>';

    // 4 宫格指标
    html += '<div class="hh-grid">';
    html += metricTile(ICONS.sleep, "睡眠", entry.sleep, "sleep");
    html += metricTile(ICONS.qi,    "灵力", entry.qi, "qi");
    html += metricTile(ICONS.heart, "心率", entry.heart, "heart");
    html += metricTile(ICONS.mood,  "心情", entry.mood, "mood");
    html += '</div>';

    // 训练单独一行
    if (entry.training) {
      html += '<div class="hh-training">' +
        '<span class="hh-training-icon">' + ICONS.training + '</span>' +
        '<span class="hh-training-label">训练</span>' +
        '<span class="hh-training-value">' + escapeHtml(entry.training) + '</span>' +
      '</div>';
    }

    // 备注
    if (entry.note) {
      html += '<div class="hh-note">' + formatText(entry.note) + '</div>';
    }

    html += '</article>';
    return html;
  }

  function renderHealth(data) {
    var html = '<div class="health-app">';
    html += renderHero(data.profile);

    html += '<div class="hh-section">';
    html += '<div class="hh-section-title">健康记录</div>';
    html += '<div class="hh-section-sub">从琼华陨落到现在</div>';
    html += '</div>';

    if (!data.entries.length) {
      html += '<div class="hh-empty">没有记录</div>';
    } else {
      html += '<div class="hh-list">';
      data.entries.forEach(function (entry, i) {
        html += renderEntry(entry, i);
      });
      html += '</div>';
    }

    html += '</div>';
    return html;
  }

  function bindHealthEvents() {
    var target = document.getElementById("appContent");
    if (!target) return;

    loadHealthText(function (data) {
      target.innerHTML = renderHealth(data);
    });
  }

  if (window.AppCore) {
    window.AppCore.registerApp("health", renderLoading, bindHealthEvents);
  }
})();
