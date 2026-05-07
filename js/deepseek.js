/* ============================================
   慕容紫英的手机
   DeepSeek 应用
   ============================================ */

(function () {
  "use strict";

  var DEEPSEEK_PATH = "text/deepseek/ziying_ai.txt";
  var cachedQaList = null;
  var eventsBound = false;

  function escapeHtml(text) {
    var div = document.createElement("div");
    div.textContent = text || "";
    return div.innerHTML;
  }

  function formatText(text) {
    return escapeHtml(text || "").replace(/\n/g, "<br>");
  }

  function parseDeepseekText(text) {
    var qaList = [];
    var currentQa = null;

    function pushQa() {
      if (!currentQa) return;
      qaList.push({
        qTime: currentQa.qTime || currentQa.time || "",
        aTime: currentQa.aTime || currentQa.time || "",
        q: currentQa.q || "",
        a: currentQa.a || ""
      });
      currentQa = null;
    }

    text.split("\n").forEach(function (rawLine) {
      var line = rawLine.trim();
      var match;

      if (!line || line.startsWith("#")) {
        return;
      }

      if (line === "[qa]") {
        pushQa();
        currentQa = {};
        return;
      }

      if (!currentQa) {
        return;
      }

      match = line.match(/^([^=]+)=(.*)$/);
      if (!match) {
        return;
      }

      currentQa[match[1].trim()] = (match[2].trim() || "").replace(/\\n/g, "\n");
    });

    pushQa();
    return qaList;
  }

  function loadDeepseekText(callback) {
    var controller = new AbortController();
    var timeoutId = setTimeout(function () {
      controller.abort();
      callback(null);
    }, 10000);

    fetch(DEEPSEEK_PATH, { signal: controller.signal })
      .then(function (res) {
        clearTimeout(timeoutId);
        if (!res.ok) {
          throw new Error("HTTP " + res.status);
        }
        return res.text();
      })
      .then(function (text) {
        cachedQaList = parseDeepseekText(text);
        callback(cachedQaList);
      })
      .catch(function () {
        clearTimeout(timeoutId);
        callback(null);
      });
  }

  function renderQaList(qaList) {
    var html = '<div class="deepseek-app">';
    html += '<div class="deepseek-list">';

    if (!qaList || !qaList.length) {
      html += '<div class="deepseek-empty">暂无对话记录</div>';
    } else {
      qaList.forEach(function (item) {
        html += '<div class="deepseek-thread">';
        html += '<div class="deepseek-question">';
        if (item.qTime) {
          html += '<div class="deepseek-time user">' + escapeHtml(item.qTime) + '</div>';
        }
        html += '<div class="deepseek-bubble user">' + formatText(item.q) + '</div>';
        html += '</div>';
        html += '<div class="deepseek-answer">';
        if (item.aTime) {
          html += '<div class="deepseek-time ai">' + escapeHtml(item.aTime) + '</div>';
        }
        html += '<div class="deepseek-bubble ai">' + formatText(item.a) + '</div>';
        html += '</div>';
        html += '</div>';
      });
    }

    html += '</div>';
    html += '<div class="deepseek-composer">';
    html += '<button class="deepseek-composer-action" type="button" aria-label="更多功能">+</button>';
    html += '<div class="deepseek-composer-input">输入消息...</div>';
    html += '<button class="deepseek-send-btn" type="button">发送</button>';
    html += '</div>';
    html += '</div>';
    return html;
  }

  function renderLoading() {
    return '<div class="deepseek-app"><div class="deepseek-list"><div class="deepseek-empty">加载中...</div></div><div class="deepseek-composer"><button class="deepseek-composer-action" type="button" aria-label="更多功能">+</button><div class="deepseek-composer-input">继续追问紫英关心的问题...</div><button class="deepseek-send-btn" type="button">发送</button></div></div>';
  }

  function openDeepseekApp(forceReload) {
    var appContent = document.getElementById("appContent");
    if (!appContent) return;

    if (!forceReload && cachedQaList) {
      appContent.innerHTML = renderQaList(cachedQaList);
      return;
    }

    appContent.innerHTML = renderLoading();
    loadDeepseekText(function (qaList) {
      if (!qaList) {
        appContent.innerHTML = '<div class="deepseek-app"><div class="deepseek-list"><div class="deepseek-empty">文案加载失败，请稍后重试。<button class="deepseek-retry-btn" type="button">重新加载</button></div></div><div class="deepseek-composer"><button class="deepseek-composer-action" type="button" aria-label="更多功能">+</button><div class="deepseek-composer-input">继续追问紫英关心的问题...</div><button class="deepseek-send-btn" type="button">发送</button></div></div>';
        return;
      }
      appContent.innerHTML = renderQaList(qaList);
    });
  }

  function bindDeepseekEvents() {
    if (!eventsBound) {
      eventsBound = true;
      document.addEventListener("click", function (e) {
        var retryButton = e.target.closest(".deepseek-retry-btn");
        var appContent = document.getElementById("appContent");
        if (!retryButton || !appContent || !appContent.contains(retryButton)) {
          return;
        }
        openDeepseekApp(true);
      });
    }

    openDeepseekApp(false);
  }

  window.DeepSeekTextLoader = {
    parse: parseDeepseekText,
    open: openDeepseekApp
  };

  if (window.AppCore) {
    window.AppCore.registerApp("deepseek", renderLoading, bindDeepseekEvents);
  }
})();
