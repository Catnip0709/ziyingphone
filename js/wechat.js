/* ============================================
   捡手机文学 · 慕容紫英
   微信应用模块
   ============================================ */

(function () {
  "use strict";

  // 依赖 WeChatComponents 和 MomentsComponents

  // ---------- 微信聊天配置 ----------
  var chatConfigs = [
    {
      name: "菱纱",
      avatar: "纱",
      avatarColor: "#FF6B9D",
      time: "22:15",
      pinned: true,
      txtPath: "text/lingsha_wechat.txt",
      characters: {
        "紫英": { avatarName: "英", avatarColor: "#5B8DB8", isSelf: true },
        "菱纱": { avatarName: "纱", avatarColor: "#FF6B9D", isSelf: false }
      }
    },
    {
      name: "天河",
      avatar: "河",
      avatarColor: "#4A90D9",
      time: "21:30",
      pinned: false,
      txtPath: "text/tianhe_wechat.txt",
      characters: {
        "紫英": { avatarName: "英", avatarColor: "#5B8DB8", isSelf: true },
        "天河": { avatarName: "河", avatarColor: "#4A90D9", isSelf: false }
      }
    },
    {
      name: "梦璃",
      avatar: "璃",
      avatarColor: "#9B7ED8",
      time: "昨天",
      pinned: false,
      txtPath: "text/mengli_wechat.txt",
      characters: {
        "紫英": { avatarName: "英", avatarColor: "#5B8DB8", isSelf: true },
        "梦璃": { avatarName: "璃", avatarColor: "#9B7ED8", isSelf: false }
      }
    },
    {
      name: "四人小群",
      avatar: "群",
      avatarColor: "#07C160",
      time: "昨天",
      pinned: false,
      isGroup: true,
      txtPath: "text/siqun_wechat.txt",
      characters: {
        "紫英": { avatarName: "英", avatarColor: "#5B8DB8", isSelf: true },
        "天河": { avatarName: "河", avatarColor: "#4A90D9", isSelf: false },
        "菱纱": { avatarName: "纱", avatarColor: "#FF6B9D", isSelf: false },
        "梦璃": { avatarName: "璃", avatarColor: "#9B7ED8", isSelf: false }
      }
    },
    {
      name: "琼华派大群",
      avatar: "琼",
      avatarColor: "#2C3E50",
      time: "周一",
      pinned: false,
      isGroup: true,
      txtPath: "text/qionghua_wechat.txt",
      characters: {
        "紫英": { avatarName: "英", avatarColor: "#5B8DB8", isSelf: true },
        "掌门": { avatarName: "掌", avatarColor: "#2C3E50", isSelf: false }
      }
    },
    {
      name: "夙莘师叔",
      avatar: "莘",
      avatarColor: "#E67E22",
      time: "周一",
      pinned: false,
      txtPath: "text/suxin_wechat.txt",
      characters: {
        "紫英": { avatarName: "英", avatarColor: "#5B8DB8", isSelf: true },
        "夙莘师叔": { avatarName: "莘", avatarColor: "#E67E22", isSelf: false }
      }
    }
  ];

  // 存储加载后的聊天数据
  var wechatChats = [];
  var isChatConfigsLoaded = false;

  // ---------- 从txt解析第一条消息 ----------
  function parseFirstMessage(txtContent, config) {
    var lines = txtContent.split('\n');
    var firstMsg = null;
    var currentSender = '';
    
    for (var i = 0; i < lines.length; i++) {
      var line = lines[i].trim();
      if (!line || line.startsWith('#') || line.startsWith('[time]')) continue;
      
      // 检查是否是发送者行
      var senderMatch = line.match(/^(\S+?)>\s*(?:\[text\])?\s*(.+)$/);
      if (senderMatch) {
        currentSender = senderMatch[1];
        var text = senderMatch[2];
        // 跳过类型标记行，取下一行的实际内容
        if (text && !text.startsWith('[')) {
          firstMsg = { sender: currentSender, text: text };
          break;
        }
      } else if (currentSender && line && !line.startsWith('[') && !line.includes('>')) {
        // 这是消息内容行
        firstMsg = { sender: currentSender, text: line };
        break;
      }
    }
    
    if (!firstMsg) {
      firstMsg = { sender: config.name, text: '...' };
    }
    
    return firstMsg;
  }

  // ---------- 加载所有聊天配置 ----------
  function loadChatConfigs() {
    if (isChatConfigsLoaded) return;
    
    wechatChats = chatConfigs.map(function(config) {
      return {
        name: config.name,
        avatar: config.avatar,
        avatarColor: config.avatarColor,
        msg: '...', // 先显示占位符
        time: config.time,
        pinned: config.pinned,
        isGroup: config.isGroup,
        txtPath: config.txtPath,
        characters: config.characters
      };
    });
    
    isChatConfigsLoaded = true;
  }

  // ---------- 异步加载txt文件 ----------
  function loadTxtFiles() {
    chatConfigs.forEach(function(config, index) {
      var controller = new AbortController();
      var timeoutId = setTimeout(function() {
        controller.abort();
        console.warn('[Wechat] 加载聊天文件超时:', config.txtPath);
      }, 10000);
      
      fetch(config.txtPath, { signal: controller.signal })
        .then(function(res) { 
          clearTimeout(timeoutId);
          if (!res.ok) throw new Error('HTTP ' + res.status);
          return res.text(); 
        })
        .then(function(txt) {
          var firstMsg = parseFirstMessage(txt, config);
          var displayText = firstMsg.text;
          
          // 群聊显示发送者名字
          if (config.isGroup && firstMsg.sender !== '紫英') {
            displayText = firstMsg.sender + '：' + displayText;
          }
          
          // 更新数据
          wechatChats[index].msg = displayText;
          
          // 更新DOM
          updateChatListItem(index, displayText);
        })
        .catch(function(err) {
          clearTimeout(timeoutId);
          if (err.name === 'AbortError') {
            console.warn('[Wechat] 加载聊天文件超时:', config.txtPath);
          } else {
            console.warn('[Wechat] 加载聊天文件失败:', config.txtPath, err.message);
          }
        });
    });
  }

  // ---------- 更新列表项显示 ----------
  function updateChatListItem(index, msg) {
    var items = document.querySelectorAll('.wechat-chat-item');
    if (items[index]) {
      var msgEl = items[index].querySelector('.wechat-chat-msg');
      if (msgEl) {
        msgEl.textContent = msg;
      }
    }
  }

  // ---------- 微信渲染 ----------
  function renderWechatApp() {
    // 确保数据已加载（只加载一次）
    loadChatConfigs();

    var html = '<div class="wechat-app">';
    
    // 顶部导航
    html += '<div class="wechat-header">';
    html += '<div style="display:flex;align-items:center;gap:6px">';
    html += '<button class="wechat-back-btn" id="wechatBackBtn" style="background:none;border:none;padding:4px 2px;cursor:pointer;display:flex;align-items:center">';
    html += '<svg viewBox="0 0 12 20" width="10" height="16"><path d="M10 18L2 10l8-8" stroke="#181818" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>';
    html += '</button>';
    html += '<div class="wechat-header-title">微信</div>';
    html += '</div>';
    
    // 聊天列表页
    html += '<div class="wechat-page active" id="wechatPageChat">';
    html += '<div class="wechat-list">';
    
    wechatChats.forEach(function(chat, index) {
      var pinnedClass = chat.pinned ? ' pinned' : '';
      var groupClass = chat.isGroup ? ' group' : '';
      html += '<div class="wechat-chat-item' + pinnedClass + '" data-chat-index="' + index + '">';
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
    // 发现Tab
    html += '<div class="wechat-tab" data-tab="discover">';
    html += '<svg viewBox="0 0 26 26" fill="none" stroke="currentColor" stroke-width="1.6">';
    html += '<circle cx="12" cy="12" r="9"/><path d="M12 3v18M3 12h18"/>';
    html += '</svg>';
    html += '<span>发现</span>';
    html += '</div>';
    html += '</div>';
    
    html += '</div>';
    return html;
  }

  // ---------- 微信Tab切换 ----------
  function bindWechatEvents() {
    // 使用事件委托避免重复绑定
    var wechatApp = document.querySelector('.wechat-app');
    if (!wechatApp) return;
    
    // Tab切换
    wechatApp.addEventListener('click', function(e) {
      var tab = e.target.closest('.wechat-tab');
      if (tab) {
        var tabName = tab.getAttribute('data-tab');
        var tabs = document.querySelectorAll('.wechat-tab');
        tabs.forEach(function(t) { t.classList.remove('active'); });
        tab.classList.add('active');
        
        var chatPage = document.getElementById('wechatPageChat');
        var momentsPage = document.getElementById('wechatPageMoments');
        
        if (tabName === 'chat') {
          chatPage.classList.add('active');
          momentsPage.classList.remove('active');
        } else if (tabName === 'discover') {
          if (!momentsPage.getAttribute('data-loaded') && !momentsPage.getAttribute('data-loading')) {
            momentsPage.setAttribute('data-loading', 'true');
            MomentsTextLoader.open({
              targetElement: momentsPage,
              onLoaded: function() {
                momentsPage.removeAttribute('data-loading');
                momentsPage.setAttribute('data-loaded', 'true');
                bindMomentsEvents();
              }
            });
          }
          chatPage.classList.remove('active');
          momentsPage.classList.add('active');
        }
      }
      
      // 聊天项点击
      var chatItem = e.target.closest('.wechat-chat-item');
      if (chatItem) {
        var index = parseInt(chatItem.getAttribute('data-chat-index'));
        openChatPage(index);
      }
      
      // 返回按钮
      var backBtn = e.target.closest('#wechatBackBtn');
      if (backBtn) {
        AppCore.goHome();
      }
    });

    // 开始异步加载txt文件
    loadTxtFiles();
  }

  function backToList() {
    var appContent = document.getElementById('appContent');
    if (!appContent) return;
    appContent.innerHTML = renderWechatApp();
    bindWechatEvents();
  }

  function openTextChat(chat) {
    if (!window.ChatTextLoader) {
      console.error('[Wechat] ChatTextLoader 未加载');
      return false;
    }
    window.ChatTextLoader.open({
      txtPath: chat.txtPath,
      chatInfo: {
        name: chat.name,
        avatar: chat.avatar,
        avatarColor: chat.avatarColor
      },
      characters: chat.characters
    });
    return true;
  }

  // ---------- 打开聊天页面 ----------
  function openChatPage(chatIndex) {
    var chat = wechatChats[chatIndex];
    if (!chat) return;

    // 使用 txt 文案渲染
    if (chat.txtPath && openTextChat(chat)) {
      return;
    }
  }

  // ---------- 朋友圈事件绑定 ----------
  function bindMomentsEvents() {
    // 使用事件委托
    var momentsPage = document.getElementById('wechatPageMoments');
    if (!momentsPage || momentsPage.getAttribute('data-events-bound')) return;
    
    momentsPage.addEventListener('click', function(e) {
      var btn = e.target.closest('.moments-action-like, .moments-action-comment');
      if (!btn) return;
      
      e.stopPropagation();
      var action = btn.getAttribute('data-action');
      
      if (action === 'like') {
        var likeIcon = btn.querySelector('svg');
        var isLiked = likeIcon.getAttribute('fill') === 'currentColor';
        if (isLiked) {
          likeIcon.setAttribute('fill', 'none');
          likeIcon.style.color = '#181818';
        } else {
          likeIcon.setAttribute('fill', 'currentColor');
          likeIcon.style.color = '#FF2D55';
        }
      } else if (action === 'comment') {
        alert('评论功能开发中...');
      }
    });
    
    momentsPage.setAttribute('data-events-bound', 'true');
  }

  // ---------- 初始化 ----------
  loadChatConfigs();

  // ---------- 注册微信应用 ----------
  if (window.AppCore) {
    window.AppCore.registerApp('wechat', renderWechatApp, bindWechatEvents);
  }

  // ---------- 导出数据供外部使用 ----------
  window.WechatApp = {
    getChats: function() { return wechatChats; },
    openChatPage: openChatPage,
    backToList: backToList
  };
})();
