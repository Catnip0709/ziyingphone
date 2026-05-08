/* ============================================
   捡手机文学 · 慕容紫英
   核心交互模块 (AppCore)
   ============================================ */

(function () {
  "use strict";

  // ---------- DOM ----------
  var statusTime = document.getElementById("statusTime");
  var pageHome    = document.getElementById("pageHome");
  var pageApp     = document.getElementById("pageApp");
  var backBtn     = document.getElementById("backBtn");
  var appTitle    = document.getElementById("appTitle");
  var appContent  = document.getElementById("appContent");
  var appIcons    = document.querySelectorAll(".app-icon");

  // ---------- 应用名称映射 ----------
  var APP_NAMES = {
    notes:        "备忘录",
    wechat:       "微信",
    wechatbook:   "微信读书",
    deepseek:     "DeepSeek",
    weibo:        "微博",
    phone:        "电话",
    messages:     "短信",
    photos:       "相册"
  };

  // ---------- 埋点 ----------
  var ANALYTICS_WEBHOOK_URL = "https://bytedance.sg.larkoffice.com/base/automation/webhook/event/BURZaFzXlwRUddh529tlykBxgOc";
  var ANONYMOUS_USER_ID_KEY = "ziyingphone_anonymous_user_id";

  function createAnonymousUserId() {
    if (window.crypto && typeof window.crypto.randomUUID === "function") {
      return "user_" + window.crypto.randomUUID().replace(/-/g, "").slice(0, 12);
    }
    return "user_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  function getAnonymousUserId() {
    var userId = "";
    try {
      userId = window.localStorage.getItem(ANONYMOUS_USER_ID_KEY) || "";
      if (!userId) {
        userId = createAnonymousUserId();
        window.localStorage.setItem(ANONYMOUS_USER_ID_KEY, userId);
      }
      return userId;
    } catch (error) {
      if (!AppCore._memoryUserId) {
        AppCore._memoryUserId = createAnonymousUserId();
      }
      return AppCore._memoryUserId;
    }
  }

  function reportAppOpen(appName) {
    var payload = {
      app: appName,
      user_id: getAnonymousUserId()
    };
    var body = JSON.stringify(payload);

    try {
      if (navigator.sendBeacon) {
        // 直接发送字符串，浏览器会使用 text/plain，避免 localhost 下跨域预检失败。
        if (navigator.sendBeacon(ANALYTICS_WEBHOOK_URL, body)) {
          return;
        }
      }
    } catch (error) {
      // sendBeacon 失败时降级到 fetch
    }

    try {
      fetch(ANALYTICS_WEBHOOK_URL, {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "text/plain;charset=UTF-8"
        },
        body: body,
        keepalive: true
      }).catch(function () {
        // 静默失败，不影响 UI
      });
    } catch (error) {
      // 静默失败，不影响 UI
    }
  }

  // ---------- AppCore 核心 ----------
  var AppCore = window.AppCore = {
    // 已注册的应用 { name: { render, bindEvents } }
    _apps: {},
    _currentApp: null,
    _hasReportedForCurrentEntry: false,
    _memoryUserId: "",

    // 注册应用
    registerApp: function(name, renderFn, bindEventsFn) {
      this._apps[name] = {
        render: renderFn,
        bindEvents: bindEventsFn
      };
      console.log("[AppCore] 应用已注册: " + name);
    },

    // 打开应用
    openApp: function(name) {
      var app = this._apps[name];
      if (!app) {
        console.warn("[AppCore] 应用不存在: " + name);
        return;
      }

      var cameFromHome = pageHome.classList.contains("active");

      try {
        appTitle.textContent = APP_NAMES[name] || name;
        
        // 渲染内容
        var html = app.render();
        appContent.innerHTML = html;

        // 切换页面动画
        pageHome.classList.remove("active");
        pageHome.classList.add("hidden-left");
        pageApp.classList.remove("hidden-right");
        pageApp.classList.add("active");

        // 微信自带导航，隐藏通用导航栏
        var appNav = document.querySelector(".app-nav");
        if (name === "wechat") {
          appNav.style.display = "none";
        } else {
          appNav.style.display = "flex";
        }

        // 绑定应用事件
        if (app.bindEvents) {
          app.bindEvents();
        }
      } catch (error) {
        console.error("[AppCore] 打开应用失败: " + name, error);
        return;
      }

      this._currentApp = name;
      if (cameFromHome && !this._hasReportedForCurrentEntry) {
        reportAppOpen(name);
        this._hasReportedForCurrentEntry = true;
      }
    },

    // 返回主页
    goHome: function() {
      pageApp.classList.remove("active");
      pageApp.classList.add("hidden-right");
      pageHome.classList.remove("hidden-left");
      pageHome.classList.add("active");
      appContent.innerHTML = "";
      appTitle.textContent = "";
      this._currentApp = null;
      this._hasReportedForCurrentEntry = false;

      // 恢复导航栏
      var appNav = document.querySelector(".app-nav");
      appNav.style.display = "flex";
    }
  };

  // ---------- 状态栏时钟 ----------
  function updateClock() {
    var now = new Date();
    var h = now.getHours();
    var m = String(now.getMinutes()).padStart(2, "0");
    statusTime.textContent = h + ":" + m;
  }
  updateClock();
  setInterval(updateClock, 10000);

  // ---------- 事件绑定 ----------
  appIcons.forEach(function(icon) {
    icon.addEventListener("click", function() {
      var name = this.getAttribute("data-app");
      if (name) AppCore.openApp(name);
    });
  });

  backBtn.addEventListener("click", function() {
    AppCore.goHome();
  });

  console.log(" 慕容紫英的手机已启动");
})();
