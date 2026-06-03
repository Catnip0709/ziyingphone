/* ============================================
   捡手机文学 · 慕容紫英
   电话应用模块
   ============================================ */

(function () {
  "use strict";

  var PHONE_TXT_PATH = "text/phone/call_history.txt";

  function escapeHtml(text) {
    var div = document.createElement("div");
    div.textContent = text || "";
    return div.innerHTML;
  }

  function formatText(text) {
    return escapeHtml(text || "").replace(/\n/g, "<br>");
  }

  function parsePhoneText(text) {
    var records = [];
    var currentRecord = null;

    function pushRecord() {
      if (!currentRecord) return;
      currentRecord.name = currentRecord.name || "未知来电";
      currentRecord.avatarName = currentRecord.avatarName || currentRecord.name.charAt(0) || "?";
      currentRecord.avatarColor = currentRecord.avatarColor || "#5B8DB8";
      currentRecord.time = currentRecord.time || "刚刚";
      currentRecord.type = currentRecord.type || "answered";
      records.push(currentRecord);
      currentRecord = null;
    }

    text.split("\n").forEach(function (rawLine) {
      var line = rawLine.trim();
      var match;

      if (!line || line.startsWith("#")) {
        return;
      }

      if (line === "[call]") {
        pushRecord();
        currentRecord = {};
        return;
      }

      match = line.match(/^([^=]+)=(.*)$/);
      if (!match || !currentRecord) {
        return;
      }

      currentRecord[match[1].trim()] = (match[2].trim() || "").replace(/\\n/g, "\n");
    });

    pushRecord();
    return records;
  }

  function getTypeMeta(type) {
    switch (type) {
      case "missed":
        return {
          badge: "未接",
          badgeClass: "missed",
          icon: "↓"
        };
      case "voicemail":
        return {
          badge: "留言",
          badgeClass: "voicemail",
          icon: "留"
        };
      case "outgoing":
        return {
          badge: "拨出",
          badgeClass: "outgoing",
          icon: "↑"
        };
      default:
        return {
          badge: "已接",
          badgeClass: "answered",
          icon: "通"
        };
    }
  }

  function renderPhoneRecord(record) {
    var meta = getTypeMeta(record.type);
    var html = '<div class="phone-record-item">';
    var phoneAvatarStyle = window.AvatarUtil
      ? window.AvatarUtil.backgroundStyle(record.avatarName, record.avatarColor, record.name)
      : 'background:' + escapeHtml(record.avatarColor);
    var phoneAvatarInner = window.AvatarUtil
      ? window.AvatarUtil.text(record.avatarName, record.name)
      : escapeHtml(record.avatarName);
    html += '<div class="phone-record-avatar" style="' + phoneAvatarStyle + '">' + escapeHtml(phoneAvatarInner) + '</div>';
    html += '<div class="phone-record-main">';
    html += '<div class="phone-record-top">';
    html += '<div class="phone-record-name-row">';
    html += '<span class="phone-record-name">' + escapeHtml(record.name) + '</span>';
    html += '<span class="phone-record-badge ' + meta.badgeClass + '">' + meta.badge + '</span>';
    html += '</div>';
    html += '<span class="phone-record-time">' + escapeHtml(record.time) + '</span>';
    html += '</div>';
    html += '<div class="phone-record-meta">';
    html += '<span class="phone-record-icon ' + meta.badgeClass + '">' + meta.icon + '</span>';
    html += '<span class="phone-record-status">' + escapeHtml(record.status || "") + '</span>';
    if (record.duration) {
      html += '<span class="phone-record-sep">·</span>';
      html += '<span class="phone-record-duration">' + escapeHtml(record.duration) + '</span>';
    }
    html += '</div>';
    if (record.summary) {
      html += '<div class="phone-record-summary">' + formatText(record.summary) + '</div>';
    }
    if (record.transcript) {
      html += '<div class="phone-voicemail-box">';
      html += '<div class="phone-voicemail-label">语音转写</div>';
      html += '<div class="phone-voicemail-text">' + formatText(record.transcript) + '</div>';
      html += '</div>';
    }
    html += '</div></div>';
    return html;
  }

  function renderPhonePage(records) {
    var html = '<div class="phone-app">';
    html += '<div class="phone-list-header">';
    html += '<h1>最近通话</h1>';
    html += '<div class="phone-list-subtitle">已接来电、未接来电与语音留言</div>';
    html += '</div>';
    html += '<div class="phone-record-list">';
    if (!records || !records.length) {
      html += '<div class="phone-empty">暂无通话记录</div>';
    } else {
      records.forEach(function (record) {
        html += renderPhoneRecord(record);
      });
    }
    html += '</div></div>';
    return html;
  }

  function loadPhoneText(txtPath, callback) {
    var controller = new AbortController();
    var timeoutId = setTimeout(function () {
      controller.abort();
      callback([]);
    }, 10000);

    fetch(txtPath || PHONE_TXT_PATH, { signal: controller.signal })
      .then(function (res) {
        clearTimeout(timeoutId);
        if (!res.ok) throw new Error("HTTP " + res.status);
        return res.text();
      })
      .then(function (text) {
        callback(parsePhoneText(text));
      })
      .catch(function () {
        clearTimeout(timeoutId);
        callback([]);
      });
  }

  function openPhoneText(options) {
    var config = options || {};
    var targetId = config.targetId || "appContent";
    var txtPath = config.txtPath || PHONE_TXT_PATH;
    loadPhoneText(txtPath, function (records) {
      var html = renderPhonePage(records);
      var target = document.getElementById(targetId);
      if (target) {
        target.innerHTML = html;
      }
      if (typeof config.onLoaded === "function") {
        config.onLoaded(records);
      }
    });
  }

  function renderPhoneLoading() {
    return '<div class="phone-app"><div class="phone-list-header"><h1>最近通话</h1><div class="phone-list-subtitle">正在加载通话记录...</div></div><div class="phone-record-list"><div class="phone-empty">正在读取电话文案</div></div></div>';
  }

  function bindPhoneEvents() {
    openPhoneText();
  }

  window.PhoneTextLoader = {
    open: openPhoneText,
    load: loadPhoneText,
    parse: parsePhoneText,
    render: renderPhonePage
  };

  if (window.AppCore) {
    window.AppCore.registerApp("phone", renderPhoneLoading, bindPhoneEvents);
  }
})();
