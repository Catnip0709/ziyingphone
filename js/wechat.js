/* ============================================
   捡手机文学 · 慕容紫英
   微信应用模块
   ============================================ */

(function () {
  "use strict";

  // 依赖 WeChatComponents 和 MomentsComponents

  // ---------- 微信聊天数据 ----------
  var wechatChats = [
    {
      name: "菱纱",
      avatar: "纱",
      avatarColor: "#FF6B9D",
      msg: "紫英，今晚月色好美，陪我看看好不好？",
      time: "22:15",
      pinned: true,
      unread: 0,
      chatLoaderOptions: {
        txtPath: "text/lingsha_wechat.txt",
        chatInfo: {
          name: "菱纱",
          avatar: "纱",
          avatarColor: "#FF6B9D"
        },
        characters: {
          "紫英": {
            avatarName: "英",
            avatarColor: "#5B8DB8",
            isSelf: true
          },
          "菱纱": {
            avatarName: "纱",
            avatarColor: "#FF6B9D",
            isSelf: false
          }
        }
      }
    },
    {
      name: "天河",
      avatar: "河",
      avatarColor: "#4A90D9",
      msg: "紫英！我新练了一招，明天给你看看！",
      time: "21:30",
      pinned: false,
      unread: 3,
      chatLoaderOptions: {
        txtPath: "text/tianhe_wechat.txt",
        chatInfo: {
          name: "天河",
          avatar: "河",
          avatarColor: "#4A90D9"
        },
        characters: {
          "紫英": {
            avatarName: "英",
            avatarColor: "#5B8DB8",
            isSelf: true
          },
          "天河": {
            avatarName: "河",
            avatarColor: "#4A90D9",
            isSelf: false
          }
        }
      }
    },
    {
      name: "梦璃",
      avatar: "璃",
      avatarColor: "#9B7ED8",
      msg: "紫英，菱纱最近身体怎么样？",
      time: "昨天",
      pinned: false,
      unread: 1
    },
    {
      name: "四人小群",
      avatar: "群",
      avatarColor: "#07C160",
      msg: "天河：明天一起去山下集市吧！",
      time: "昨天",
      pinned: false,
      unread: 12,
      isGroup: true
    },
    {
      name: "琼华派大群",
      avatar: "琼",
      avatarColor: "#2C3E50",
      msg: "掌门：本月弟子考核安排已出，请各长老查阅",
      time: "周一",
      pinned: false,
      unread: 36,
      isGroup: true
    },
    {
      name: "夙莘师叔",
      avatar: "莘",
      avatarColor: "#E67E22",
      msg: "小紫英，师叔给你带了好吃的！",
      time: "周一",
      pinned: false,
      unread: 2
    }
  ];

  var chatMessagesMap = {
    "天河": [
      { type: "time", time: "今天 10:16" },
      { type: "msg", msgType: "text", isSelf: false, avatarName: "河", avatarColor: "#4A90D9", senderName: "天河", text: "紫英！我新练了一招，明天给你看看！" },
      { type: "msg", msgType: "text", isSelf: true, avatarName: "英", avatarColor: "#5B8DB8", senderName: "紫英", text: "别在人多的地方乱试，明早我去看看。" },
      { type: "msg", msgType: "text", isSelf: false, avatarName: "河", avatarColor: "#4A90D9", senderName: "天河", text: "好耶！" }
    ],
    "梦璃": [
      { type: "time", time: "昨天" },
      { type: "msg", msgType: "text", isSelf: false, avatarName: "璃", avatarColor: "#9B7ED8", senderName: "梦璃", text: "紫英，菱纱最近身体怎么样？" },
      { type: "msg", msgType: "text", isSelf: true, avatarName: "英", avatarColor: "#5B8DB8", senderName: "紫英", text: "今日气色还好，已经陪她下山走了走。" },
      { type: "msg", msgType: "text", isSelf: false, avatarName: "璃", avatarColor: "#9B7ED8", senderName: "梦璃", text: "那便好，若有需要记得告诉我。" }
    ],
    "四人小群": [
      { type: "time", time: "昨天" },
      { type: "msg", msgType: "text", isSelf: false, avatarName: "河", avatarColor: "#4A90D9", senderName: "天河", text: "明天一起去山下集市吧！" },
      { type: "msg", msgType: "text", isSelf: false, avatarName: "璃", avatarColor: "#9B7ED8", senderName: "梦璃", text: "我想买些香料和花种。" },
      { type: "msg", msgType: "text", isSelf: true, avatarName: "英", avatarColor: "#5B8DB8", senderName: "紫英", text: "我午后有空，可以同行。" },
      { type: "msg", msgType: "text", isSelf: false, avatarName: "纱", avatarColor: "#FF6B9D", senderName: "菱纱", text: "那就说定啦，我负责吃遍整条街。" }
    ],
    "琼华派大群": [
      { type: "time", time: "周一" },
      { type: "msg", msgType: "text", isSelf: false, avatarName: "琼", avatarColor: "#2C3E50", senderName: "掌门", text: "本月弟子考核安排已出，请各长老查阅。" },
      { type: "msg", msgType: "quote", isSelf: true, avatarName: "英", avatarColor: "#5B8DB8", senderName: "紫英", quoteAuthor: "掌门", quoteText: "本月弟子考核安排已出，请各长老查阅。", text: "已收到，我会按时到场。" }
    ],
    "夙莘师叔": [
      { type: "time", time: "周一" },
      { type: "msg", msgType: "text", isSelf: false, avatarName: "莘", avatarColor: "#E67E22", senderName: "夙莘师叔", text: "小紫英，师叔给你带了好吃的！" },
      { type: "msg", msgType: "text", isSelf: true, avatarName: "英", avatarColor: "#5B8DB8", senderName: "紫英", text: "多谢师叔，我晚些去取。" }
    ]
  };

  // ---------- 微信渲染 ----------
  function renderWechatApp() {
    var html = '<div class="wechat-app">';
    
    // 顶部导航
    html += '<div class="wechat-header" style="position:relative">';
    html += '<div style="display:flex;align-items:center;gap:6px">';
    html += '<button class="wechat-back-btn" id="wechatBackBtn" style="background:none;border:none;padding:4px 2px;cursor:pointer;display:flex;align-items:center">';
    html += '<svg viewBox="0 0 12 20" width="10" height="16"><path d="M10 18L2 10l8-8" stroke="#181818" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>';
    html += '</button>';
    html += '<div class="wechat-header-title">微信</div>';
    html += '</div>';
    html += '<div class="wechat-header-actions">';
    html += '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.35-4.35"/></svg>';
    html += '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/></svg>';
    html += '</div></div>';
    
    // 搜索栏
    html += '<div class="wechat-search">';
    html += '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="7" cy="7" r="5"/><path d="M11 11l3 3"/></svg>';
    html += '<span>搜索</span>';
    html += '</div>';
    
    // 聊天列表页
    html += '<div class="wechat-page active" id="wechatPageChat">';
    html += '<div class="wechat-list">';
    
    wechatChats.forEach(function(chat) {
      var pinnedClass = chat.pinned ? ' pinned' : '';
      var groupClass = chat.isGroup ? ' group' : '';
      html += '<div class="wechat-chat-item' + pinnedClass + '" data-chat-index="' + wechatChats.indexOf(chat) + '">';
      html += '<div class="wechat-avatar' + groupClass + '" style="background:' + chat.avatarColor + '">';
      html += chat.avatar;
      if (chat.pinned) {
        html += '<div class="wechat-pin-icon"></div>';
      }
      html += '</div>';
      html += '<div class="wechat-chat-info">';
      html += '<div class="wechat-chat-top">';
      html += '<span class="wechat-chat-name">' + chat.name + '</span>';
      html += '<span class="wechat-chat-time">' + chat.time + '</span>';
      html += '</div>';
      html += '<div style="display:flex;align-items:center">';
      html += '<span class="wechat-chat-msg">' + chat.msg + '</span>';
      if (chat.unread > 0) {
        html += '<div class="wechat-badge">' + (chat.unread > 99 ? '99+' : chat.unread) + '</div>';
      }
      html += '</div></div></div>';
    });
    
    html += '</div></div>';
    
    // 朋友圈页
    html += '<div class="wechat-page" id="wechatPageMoments"></div>';
    
    // 底部Tab栏
    html += '<div class="wechat-tabbar">';
    // 聊天Tab
    html += '<div class="wechat-tab active" data-tab="chat">';
    html += '<svg viewBox="0 0 26 26" fill="none" stroke="currentColor" stroke-width="1.6">';
    html += '<path d="M5 4h16a2 2 0 012 2v10a2 2 0 01-2 2h-3l-3 3v-3H5a2 2 0 01-2-2V6a2 2 0 012-2z"/>';
    html += '<circle cx="9" cy="11" r="1" fill="currentColor" stroke="none"/>';
    html += '<circle cx="13" cy="11" r="1" fill="currentColor" stroke="none"/>';
    html += '<circle cx="17" cy="11" r="1" fill="currentColor" stroke="none"/>';
    html += '</svg>';
    html += '<span>聊天</span>';
    html += '</div>';
    // 通讯录Tab
    html += '<div class="wechat-tab" data-tab="contacts">';
    html += '<svg viewBox="0 0 26 26" fill="none" stroke="currentColor" stroke-width="1.6">';
    html += '<circle cx="13" cy="8" r="4"/><path d="M5 22c0-4.4 3.6-8 8-8s8 3.6 8 8"/>';
    html += '</svg>';
    html += '<span>通讯录</span>';
    html += '</div>';
    // 发现Tab
    html += '<div class="wechat-tab" data-tab="discover">';
    html += '<svg viewBox="0 0 26 26" fill="none" stroke="currentColor" stroke-width="1.6">';
    html += '<circle cx="12" cy="12" r="9"/><path d="M12 3v18M3 12h18"/>';
    html += '</svg>';
    html += '<span>发现</span>';
    html += '</div>';
    // 我Tab
    html += '<div class="wechat-tab" data-tab="me">';
    html += '<svg viewBox="0 0 26 26" fill="none" stroke="currentColor" stroke-width="1.6">';
    html += '<circle cx="13" cy="8" r="4"/><path d="M5 22c0-4.4 3.6-8 8-8s8 3.6 8 8"/>';
    html += '</svg>';
    html += '<span>我</span>';
    html += '</div>';
    html += '</div>';
    
    html += '</div>';
    return html;
  }

  // ---------- 微信Tab切换 ----------
  function bindWechatEvents() {
    var tabs = document.querySelectorAll(".wechat-tab");
    tabs.forEach(function(tab) {
      tab.addEventListener("click", function() {
        var tabName = this.getAttribute("data-tab");
        tabs.forEach(function(t) { t.classList.remove("active"); });
        this.classList.add("active");
        
        // 切换页面内容
        var chatPage = document.getElementById("wechatPageChat");
        var momentsPage = document.getElementById("wechatPageMoments");
        
        if (tabName === "chat") {
          chatPage.classList.add("active");
          momentsPage.classList.remove("active");
        } else if (tabName === "discover") {
          // 懒加载朋友圈
          if (!momentsPage.getAttribute("data-loaded")) {
            momentsPage.innerHTML = MomentsComponents.renderMomentsPage();
            momentsPage.setAttribute("data-loaded", "true");
            bindMomentsEvents();
          }
          chatPage.classList.remove("active");
          momentsPage.classList.add("active");
        }
      });
    });
    
    // 聊天项点击
    var chatItems = document.querySelectorAll(".wechat-chat-item");
    chatItems.forEach(function(item) {
      item.addEventListener("click", function() {
        var index = parseInt(this.getAttribute("data-chat-index"));
        openChatPage(index);
      });
    });
    
    // 返回按钮
    var wechatBack = document.getElementById("wechatBackBtn");
    if (wechatBack) {
      wechatBack.addEventListener("click", function() {
        AppCore.goHome();
      });
    }
  }

  function backToList() {
    var appContent = document.getElementById("appContent");
    if (!appContent) return;
    appContent.innerHTML = renderWechatApp();
    bindWechatEvents();
  }

  function getChatMessages(chat) {
    return chatMessagesMap[chat.name] || [
      { type: "time", time: "刚刚" },
      { type: "msg", msgType: "text", isSelf: false, avatarName: chat.avatar, avatarColor: chat.avatarColor, senderName: chat.name, text: chat.msg }
    ];
  }

  function openTextChat(chat) {
    if (!window.ChatTextLoader || !chat.chatLoaderOptions) return false;
    window.ChatTextLoader.open(chat.chatLoaderOptions);
    return true;
  }

  // ---------- 打开聊天页面 ----------
  function openChatPage(chatIndex) {
    var chat = wechatChats[chatIndex];
    if (!chat) return;

    // 配置型聊天使用 txt 文案渲染
    if (chat.chatLoaderOptions && openTextChat(chat)) {
      return;
    }

    // 其他聊天使用默认渲染
    var html = WeChatComponents.renderChatPage(chat, getChatMessages(chat));
    document.getElementById("appContent").innerHTML = html;
  }

  // ---------- 朋友圈事件绑定 ----------
  function bindMomentsEvents() {
    // 点赞/评论按钮
    var actionBtns = document.querySelectorAll(".moments-action-like, .moments-action-comment");
    actionBtns.forEach(function(btn) {
      btn.addEventListener("click", function(e) {
        e.stopPropagation();
        var action = this.getAttribute("data-action");
        
        if (action === "like") {
          var likeIcon = this.querySelector("svg");
          var isLiked = likeIcon.getAttribute("fill") === "currentColor";
          if (isLiked) {
            likeIcon.setAttribute("fill", "none");
            likeIcon.style.color = "#181818";
          } else {
            likeIcon.setAttribute("fill", "currentColor");
            likeIcon.style.color = "#FF2D55";
          }
        } else if (action === "comment") {
          // 评论输入提示
          alert("评论功能开发中...");
        }
      });
    });
  }

  // ---------- 注册微信应用 ----------
  if (window.AppCore) {
    window.AppCore.registerApp("wechat", renderWechatApp, bindWechatEvents);
  }

  // ---------- 导出数据供外部使用 ----------
  window.WechatApp = {
    getChats: function() { return wechatChats; },
    openChatPage: openChatPage,
    backToList: backToList
  };
})();
