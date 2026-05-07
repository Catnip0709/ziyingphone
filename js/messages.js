/* ============================================
   捡手机文学 · 慕容紫英
   短信应用模块
   ============================================ */

(function () {
  "use strict";

  var MESSAGES_TXT_PATH = "text/messages/inbox.txt";

  function escapeHtml(text) {
    var div = document.createElement("div");
    div.textContent = text || "";
    return div.innerHTML;
  }

  function formatText(text) {
    return escapeHtml(text || "").replace(/\n/g, "<br>");
  }

  function parseMessagesText(text) {
    var records = [];
    var currentRecord = null;

    function pushRecord() {
      if (!currentRecord) return;
      currentRecord.sender = currentRecord.sender || "未知号码";
      currentRecord.time = currentRecord.time || "刚刚";
      currentRecord.type = currentRecord.type || "spam";
      currentRecord.badge = currentRecord.badge || "短信";
      currentRecord.body = currentRecord.body || "";
      records.push(currentRecord);
      currentRecord = null;
    }

    text.split("\n").forEach(function (rawLine) {
      var line = rawLine.trim();
      var match;

      if (!line || line.startsWith("#")) {
        return;
      }

      if (line === "[message]") {
        pushRecord();
        currentRecord = {};
        return;
      }

      if (!currentRecord) {
        return;
      }

      match = line.match(/^([^=]+)=(.*)$/);
      if (!match) {
        return;
      }

      currentRecord[match[1].trim()] = (match[2].trim() || "").replace(/\\n/g, "\n");
    });

    pushRecord();
    return records;
  }

  function getTypeMeta(type) {
    switch (type) {
      case "code":
        return {
          icon: "验",
          iconClass: "code"
        };
      case "trade":
        return {
          icon: "易",
          iconClass: "trade"
        };
      case "bank":
        return {
          icon: "银",
          iconClass: "bank"
        };
      default:
        return {
          icon: "广",
          iconClass: "spam"
        };
    }
  }

  function renderRecord(record) {
    var meta = getTypeMeta(record.type);
    var html = '<div class="messages-item">';
    html += '<div class="messages-item-icon ' + meta.iconClass + '">' + escapeHtml(meta.icon) + '</div>';
    html += '<div class="messages-item-main">';
    html += '<div class="messages-item-top">';
    html += '<div class="messages-item-sender-row">';
    html += '<span class="messages-item-sender">' + escapeHtml(record.sender) + '</span>';
    html += '<span class="messages-item-badge ' + escapeHtml(record.type) + '">' + escapeHtml(record.badge) + "</span>";
    html += "</div>";
    html += '<span class="messages-item-time">' + escapeHtml(record.time) + "</span>";
    html += "</div>";
    html += '<div class="messages-item-body">' + formatText(record.body) + "</div>";
    html += '<div class="messages-item-meta-row">';
    if (record.meta) {
      html += '<span class="messages-item-meta">' + escapeHtml(record.meta) + "</span>";
    }
    if (record.amount) {
      html += '<span class="messages-item-amount">' + escapeHtml(record.amount) + "</span>";
    }
    html += "</div>";
    html += "</div>";
    html += "</div>";
    return html;
  }

  function renderMessagesPage(records) {
    var html = '<div class="messages-app">';
    html += '<div class="messages-header">';
    html += "<h1>短信</h1>";
    html += '<div class="messages-subtitle">修仙界通知、验证码、交易记录与银行卡流水</div>';
    html += "</div>";
    html += '<div class="messages-list">';
    if (!records || !records.length) {
      html += '<div class="messages-empty">暂无短信记录</div>';
    } else {
      records.forEach(function (record) {
        html += renderRecord(record);
      });
    }
    html += "</div>";
    html += "</div>";
    return html;
  }

  function loadMessagesText(txtPath, callback) {
    var controller = new AbortController();
    var timeoutId = setTimeout(function () {
      controller.abort();
      callback([]);
    }, 10000);

    fetch(txtPath || MESSAGES_TXT_PATH, { signal: controller.signal })
      .then(function (res) {
        clearTimeout(timeoutId);
        if (!res.ok) throw new Error("HTTP " + res.status);
        return res.text();
      })
      .then(function (text) {
        callback(parseMessagesText(text));
      })
      .catch(function () {
        clearTimeout(timeoutId);
        callback([]);
      });
  }

  function openMessagesText(options) {
    var config = options || {};
    var targetId = config.targetId || "appContent";
    var txtPath = config.txtPath || MESSAGES_TXT_PATH;

    loadMessagesText(txtPath, function (records) {
      var target = document.getElementById(targetId);
      if (target) {
        target.innerHTML = renderMessagesPage(records);
      }
      if (typeof config.onLoaded === "function") {
        config.onLoaded(records);
      }
    });
  }

  function renderMessagesLoading() {
    return '<div class="messages-app"><div class="messages-header"><h1>短信</h1><div class="messages-subtitle">正在读取短信文案...</div></div><div class="messages-list"><div class="messages-empty">加载中...</div></div></div>';
  }

  function bindMessagesEvents() {
    openMessagesText();
  }

  window.MessagesTextLoader = {
    open: openMessagesText,
    load: loadMessagesText,
    parse: parseMessagesText,
    render: renderMessagesPage
  };

  if (window.AppCore) {
    window.AppCore.registerApp("messages", renderMessagesLoading, bindMessagesEvents);
  }
})();
