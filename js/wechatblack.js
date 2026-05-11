/* ============================================
   鬼界微信应用模块
   ============================================ */

(function () {
  "use strict";

  var blackChatConfigs = [
    {
      name: "鬼界微信使用说明",
      avatar: "令",
      avatarColor: "#345E4A",
      time: "置顶",
      pinned: true,
      txtPath: "text/wechatblack/guide.txt",
      characters: {
        "紫英": { avatarName: "紫", avatarColor: "#5B8DB8", isSelf: true },
        "鬼界微信使用说明": { avatarName: "令", avatarColor: "#345E4A", isSelf: false }
      }
    },
    {
      name: "菱纱",
      avatar: "纱",
      avatarColor: "#6F3D57",
      time: "未激活",
      pinned: true,
      inactive: true,
      txtPath: "text/wechatblack/lingsha_inactive.txt",
      characters: {
        "紫英": { avatarName: "紫", avatarColor: "#5B8DB8", isSelf: true }
      }
    },
    {
      name: "韩北旷",
      avatar: "旷",
      avatarColor: "#6A5844",
      time: "七月半",
      txtPath: "text/wechatblack/hanbeikuang.txt",
      characters: {
        "紫英": { avatarName: "紫", avatarColor: "#5B8DB8", isSelf: true },
        "韩北旷": { avatarName: "旷", avatarColor: "#6A5844", isSelf: false }
      }
    },
    {
      name: "风雅颂",
      avatar: "风",
      avatarColor: "#596477",
      time: "三更",
      txtPath: "text/wechatblack/fengyasong.txt",
      characters: {
        "紫英": { avatarName: "紫", avatarColor: "#5B8DB8", isSelf: true },
        "风雅颂": { avatarName: "风", avatarColor: "#596477", isSelf: false }
      }
    },
    {
      name: "壬癸",
      avatar: "癸",
      avatarColor: "#3F5F63",
      time: "执勤中",
      txtPath: "text/wechatblack/rengui.txt",
      characters: {
        "紫英": { avatarName: "紫", avatarColor: "#5B8DB8", isSelf: true },
        "壬癸": { avatarName: "癸", avatarColor: "#3F5F63", isSelf: false }
      }
    },
    {
      name: "云天青",
      avatar: "青",
      avatarColor: "#416A8A",
      time: "忘川边",
      txtPath: "text/wechatblack/yuntianqing.txt",
      characters: {
        "紫英": { avatarName: "紫", avatarColor: "#5B8DB8", isSelf: true },
        "云天青": { avatarName: "青", avatarColor: "#416A8A", isSelf: false }
      }
    },
    {
      name: "冥河摆渡",
      avatar: "渡",
      avatarColor: "#254B42",
      time: "06:06",
      txtPath: "text/wechatblack/ferry.txt",
      characters: {
        "紫英": { avatarName: "紫", avatarColor: "#5B8DB8", isSelf: true },
        "冥河摆渡": { avatarName: "渡", avatarColor: "#254B42", isSelf: false }
      }
    },
    {
      name: "纸钱签收站",
      avatar: "签",
      avatarColor: "#7A5A35",
      time: "12:00",
      txtPath: "text/wechatblack/paper_receipt.txt",
      characters: {
        "紫英": { avatarName: "紫", avatarColor: "#5B8DB8", isSelf: true },
        "纸钱签收站": { avatarName: "签", avatarColor: "#7A5A35", isSelf: false }
      }
    }
  ];

  var blackChats = [];
  var isLoaded = false;

  var meProfile = {
    nickname: "霜刃未改",
    wechatId: "ghost-murongziying",
    region: "人间 / 琼华派",
    avatarName: "紫",
    avatarColor: "#5B8DB8",
    statusEmoji: "🕯",
    statusText: "魂灯稳定",
    favorites: [
      { type: "file", title: "鬼界微信通信契约.pdf", source: "鬼界微信使用说明", time: "今日" },
      { type: "link", title: "未激活账号状态查询", source: "壬癸", time: "昨日" },
      { type: "text", title: "若只发送，不求回应，也会消耗？", source: "本人保存", time: "2015年" },
      { type: "share", title: "那些留在人间的人，后来怎样了", source: "风雅颂", time: "三更" }
    ]
  };

  function escapeHtml(text) {
    var div = document.createElement("div");
    div.textContent = String(text == null ? "" : text);
    return div.innerHTML;
  }

  function loadChatConfigs() {
    if (isLoaded) return;
    blackChats = blackChatConfigs.map(function (config) {
      return {
        name: config.name,
        avatar: config.avatar,
        avatarColor: config.avatarColor,
        msg: config.inactive ? "对应账号未激活" : "...",
        time: config.time,
        pinned: !!config.pinned,
        inactive: !!config.inactive,
        txtPath: config.txtPath,
        characters: config.characters
      };
    });
    isLoaded = true;
  }

  function parseFirstMessage(text, config) {
    var senderPattern = new RegExp("^(" + Object.keys(config.characters).map(function (name) {
      return name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    }).join("|") + ")>\\s*(.*)$");
    var currentSender = "";
    var firstMsg = null;

    text.split("\n").some(function (raw) {
      var line = raw.trim();
      var match;
      if (!line || line.charAt(0) === "#" || line.indexOf("[time]") === 0) return false;
      match = line.match(senderPattern);
      if (match) {
        currentSender = match[1];
        if (match[2] && match[2].charAt(0) !== "[") {
          firstMsg = { sender: currentSender, text: match[2] };
          return true;
        }
        return false;
      }
      if (currentSender && line.charAt(0) !== "[" && line.indexOf(">") === -1) {
        firstMsg = { sender: currentSender, text: line };
        return true;
      }
      return false;
    });

    return firstMsg || { sender: config.name, text: config.inactive ? "对应账号未激活" : "..." };
  }

  function loadTxtFiles() {
    blackChatConfigs.forEach(function (config, index) {
      fetch(config.txtPath)
        .then(function (res) {
          if (!res.ok) throw new Error("HTTP " + res.status);
          return res.text();
        })
        .then(function (text) {
          var firstMsg = parseFirstMessage(text, config);
          var displayText = config.inactive ? "[未送达] " + firstMsg.text : firstMsg.text;
          blackChats[index].msg = displayText;
          updateChatListItem(index, displayText);
        })
        .catch(function () {});
    });
  }

  function updateChatListItem(index, msg) {
    var item = document.querySelector('.wechat-black-app .wechat-chat-item[data-chat-index="' + index + '"]');
    if (!item) return;
    var msgEl = item.querySelector(".wechat-chat-msg");
    if (msgEl) msgEl.textContent = msg;
  }

  function renderMeRow(icon, label, value, opts) {
    opts = opts || {};
    var attr = opts.action ? ' data-me-action="' + escapeHtml(opts.action) + '"' : '';
    var html = '<div class="wechat-me-row"' + attr + '>';
    html += '<span class="wechat-me-row-icon">' + icon + '</span>';
    html += '<span class="wechat-me-row-label">' + escapeHtml(label) + '</span>';
    if (value) html += '<span class="wechat-me-row-value">' + escapeHtml(value) + '</span>';
    html += '<svg class="wechat-me-row-arrow" viewBox="0 0 12 20" width="8" height="14"><path d="M2 2l8 8-8 8" stroke="#58676A" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>';
    html += '</div>';
    return html;
  }

  function renderMePage() {
    var starIcon = '<svg viewBox="0 0 24 24" fill="#D0B36A"><path d="M12 3l2.6 5.6 6.4.6-4.8 4.4 1.4 6.4L12 16.8 6.4 20l1.4-6.4L3 9.2l6.4-.6z"/></svg>';
    var cardIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="#6BB099" stroke-width="1.6"><rect x="3" y="6" width="18" height="12" rx="2"/><path d="M3 10h18"/></svg>';
    var html = '<div class="wechat-me wechat-black-me">';
    html += '<div class="wechat-me-profile">';
    html += '<div class="wechat-me-avatar" style="background:' + meProfile.avatarColor + '">' + escapeHtml(meProfile.avatarName) + '</div>';
    html += '<div class="wechat-me-info">';
    html += '<div class="wechat-me-name">' + escapeHtml(meProfile.nickname) + '</div>';
    html += '<div class="wechat-me-id">鬼界微信号：' + escapeHtml(meProfile.wechatId) + '</div>';
    html += '<div class="wechat-me-region">' + escapeHtml(meProfile.region) + '</div>';
    html += '</div></div>';
    html += '<div class="wechat-me-section"><div class="wechat-me-row first"><span class="wechat-me-status-icon">' + escapeHtml(meProfile.statusEmoji) + '</span><span class="wechat-me-row-label">状态</span><span class="wechat-me-row-value">+ ' + escapeHtml(meProfile.statusText) + '</span></div></div>';
    html += '<div class="wechat-me-section">';
    html += renderMeRow(starIcon, "收藏", meProfile.favorites.length + " 项", { action: "open-favorites" });
    html += renderMeRow(cardIcon, "魂灯", "稳定但持续损耗");
    html += '</div>';
    html += '</div>';
    return html;
  }

  function renderFavoritesPage() {
    var html = '<div class="wechat-favorites-page wechat-black-favorites-page">';
    html += '<div class="wechat-chat-header wechat-favorites-header">';
    html += '<div class="wechat-chat-back" data-action="back-from-black-favorites">';
    html += '<svg viewBox="0 0 12 20" width="10" height="16"><path d="M10 2L2 10l8 8" stroke="#D7E7DF" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>';
    html += '<span>我</span>';
    html += '</div>';
    html += '<div class="wechat-chat-header-title">收藏</div>';
    html += '<div class="wechat-chat-header-actions">';
    html += '<svg viewBox="0 0 24 24" fill="none" stroke="#D7E7DF" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>';
    html += '</div></div>';
    html += '<div class="wechat-favorites-body"><div class="wechat-favorites-list">';
    meProfile.favorites.forEach(function (fav) {
      html += '<div class="wechat-fav-item"><div class="wechat-fav-main">';
      html += '<div class="wechat-fav-title">' + escapeHtml(fav.title) + '</div>';
      html += '<div class="wechat-fav-meta"><span>' + escapeHtml(fav.source) + '</span><span>' + escapeHtml(fav.time) + '</span></div>';
      html += '</div></div>';
    });
    html += '</div></div></div>';
    return html;
  }

  function openFavoritesPage() {
    var appContent = document.getElementById("appContent");
    var backBtn;
    if (!appContent) return;
    appContent.innerHTML = renderFavoritesPage();
    backBtn = appContent.querySelector('[data-action="back-from-black-favorites"]');
    if (backBtn) {
      backBtn.addEventListener("click", function () {
        backToList();
        setTimeout(function () {
          var meTab = document.querySelector('.wechat-black-app .wechat-tab[data-tab="me"]');
          if (meTab) meTab.click();
        }, 0);
      });
    }
  }

  function renderWechatBlackApp() {
    loadChatConfigs();
    var html = '<div class="wechat-app wechat-black-app">';
    html += '<div class="wechat-header"><div style="display:flex;align-items:center;gap:6px"><button class="wechat-back-btn" id="wechatBlackBackBtn"><svg viewBox="0 0 12 20" width="10" height="16"><path d="M10 18L2 10l8-8" stroke="#D7E7DF" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg></button><div class="wechat-header-title" id="wechatBlackHeaderTitle">鬼界微信</div></div></div>';
    html += '<div class="wechat-page active" id="wechatBlackPageChat"><div class="wechat-list">';
    blackChats.forEach(function (chat, index) {
      var pinnedClass = chat.pinned ? ' pinned' : '';
      var inactiveClass = chat.inactive ? ' inactive' : '';
      html += '<div class="wechat-chat-item' + pinnedClass + inactiveClass + '" data-chat-index="' + index + '">';
      html += '<div class="wechat-avatar" style="background:' + chat.avatarColor + '">' + escapeHtml(chat.avatar);
      if (chat.pinned) html += '<div class="wechat-pin-icon"></div>';
      html += '</div><div class="wechat-chat-info"><div class="wechat-chat-top"><span class="wechat-chat-name">' + escapeHtml(chat.name) + '</span><span class="wechat-chat-time">' + escapeHtml(chat.time) + '</span></div>';
      html += '<div style="display:flex;align-items:center"><span class="wechat-chat-msg">' + escapeHtml(chat.msg) + '</span></div></div></div>';
    });
    html += '</div></div>';
    html += '<div class="wechat-page" id="wechatBlackPageMoments"></div>';
    html += '<div class="wechat-page" id="wechatBlackPageMe">' + renderMePage() + '</div>';
    html += '<div class="wechat-tabbar">';
    html += '<div class="wechat-tab active" data-tab="chat"><svg viewBox="0 0 26 26" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M5 4h16a2 2 0 012 2v10a2 2 0 01-2 2h-3l-3 3v-3H5a2 2 0 01-2-2V6a2 2 0 012-2z"/><circle cx="9" cy="11" r="1" fill="currentColor" stroke="none"/><circle cx="13" cy="11" r="1" fill="currentColor" stroke="none"/><circle cx="17" cy="11" r="1" fill="currentColor" stroke="none"/></svg><span>聊天</span></div>';
    html += '<div class="wechat-tab" data-tab="discover"><svg viewBox="0 0 26 26" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="9"/><path d="M12 3v18M3 12h18"/></svg><span>发现</span></div>';
    html += '<div class="wechat-tab" data-tab="me"><svg viewBox="0 0 26 26" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="13" cy="9" r="4"/><path d="M5 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/></svg><span>我</span></div>';
    html += '</div></div>';
    return html;
  }

  function bindWechatBlackEvents() {
    var app = document.querySelector(".wechat-black-app");
    if (!app) return;

    app.addEventListener("click", function (e) {
      var tab = e.target.closest(".wechat-tab");
      var chatItem;
      if (tab) {
        switchTab(tab.getAttribute("data-tab"), tab);
        return;
      }
      chatItem = e.target.closest(".wechat-chat-item");
      if (chatItem) {
        openChatPage(parseInt(chatItem.getAttribute("data-chat-index"), 10));
        return;
      }
      if (e.target.closest('[data-me-action="open-favorites"]')) {
        openFavoritesPage();
        return;
      }
      if (e.target.closest("#wechatBlackBackBtn")) {
        AppCore.goHome();
      }
    });

    loadTxtFiles();
  }

  function switchTab(tabName, tabEl) {
    var tabs = document.querySelectorAll(".wechat-black-app .wechat-tab");
    var chatPage = document.getElementById("wechatBlackPageChat");
    var momentsPage = document.getElementById("wechatBlackPageMoments");
    var mePage = document.getElementById("wechatBlackPageMe");
    var headerTitle = document.getElementById("wechatBlackHeaderTitle");
    tabs.forEach(function (item) { item.classList.remove("active"); });
    if (tabEl) tabEl.classList.add("active");
    if (chatPage) chatPage.classList.remove("active");
    if (momentsPage) momentsPage.classList.remove("active");
    if (mePage) mePage.classList.remove("active");

    if (tabName === "chat") {
      if (chatPage) chatPage.classList.add("active");
      if (headerTitle) headerTitle.textContent = "鬼界微信";
    } else if (tabName === "discover") {
      if (momentsPage && !momentsPage.getAttribute("data-loaded") && window.MomentsTextLoader) {
        MomentsTextLoader.open({
          txtPath: "text/wechatblack/pengyouquan.txt",
          targetElement: momentsPage,
          onLoaded: function () {
            momentsPage.setAttribute("data-loaded", "true");
          }
        });
      }
      if (momentsPage) momentsPage.classList.add("active");
      if (headerTitle) headerTitle.textContent = "发现";
    } else if (tabName === "me") {
      if (mePage) mePage.classList.add("active");
      if (headerTitle) headerTitle.textContent = "我";
    }
  }

  function openChatPage(index) {
    var chat = blackChats[index];
    if (!chat || !window.ChatTextLoader || !window.WeChatComponents) return;
    window.ChatTextLoader.loadChatText(chat.txtPath, chat.characters, function (messages) {
      if (chat.inactive) {
        messages.forEach(function (msg) {
          if (msg.type === "msg" && msg.isSelf) msg.failed = true;
        });
      }
      document.getElementById("appContent").innerHTML = window.WeChatComponents.renderChatPage({
        name: chat.name,
        pageClass: "wechat-black-chat-page",
        iconStroke: "#D7E7DF",
        backHandler: "window.WechatBlackApp.backToList()"
      }, messages);
      bindChatBackButton();
    });
  }

  function bindChatBackButton() {
    var backBtn = document.querySelector(".wechat-black-chat-page .wechat-chat-header-back");
    if (!backBtn) return;
    backBtn.onclick = function (event) {
      if (event) {
        event.preventDefault();
        event.stopPropagation();
      }
      backToList();
      return false;
    };
  }

  function backToList() {
    var appContent = document.getElementById("appContent");
    if (!appContent) return;
    appContent.innerHTML = renderWechatBlackApp();
    bindWechatBlackEvents();
  }

  if (window.AppCore) {
    window.AppCore.registerApp("wechatblack", renderWechatBlackApp, bindWechatBlackEvents);
  }

  window.WechatBlackApp = {
    backToList: backToList,
    openChatPage: openChatPage
  };
})();
