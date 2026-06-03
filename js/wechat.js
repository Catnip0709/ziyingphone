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
      txtPath: "text/wechat/lingsha_wechat.txt",
      characters: {
        "紫英": { avatarName: "紫", avatarColor: "#5B8DB8", isSelf: true },
        "菱纱": { avatarName: "纱", avatarColor: "#FF6B9D", isSelf: false }
      }
    },
    {
      name: "月桂坊阿福",
      avatar: "🧁",
      avatarColor: "#D9B65D",
      time: "4月27日",
      pinned: false,
      txtPath: "text/wechat/guihuagao_wechat.txt",
      characters: {
        "紫英": { avatarName: "紫", avatarColor: "#5B8DB8", isSelf: true },
        "月桂坊阿福": { avatarName: "🧁", avatarColor: "#D9B65D", isSelf: false }
      }
    },
    {
      name: "朱记糖球摊",
      avatar: "🍡",
      avatarColor: "#E85D75",
      time: "4月25日",
      pinned: false,
      txtPath: "text/wechat/tanghulu_wechat.txt",
      characters: {
        "紫英": { avatarName: "紫", avatarColor: "#5B8DB8", isSelf: true },
        "朱记糖球摊": { avatarName: "🍡", avatarColor: "#E85D75", isSelf: false }
      }
    },
    {
      name: "暖瓷粥记",
      avatar: "🥣",
      avatarColor: "#C88C5A",
      time: "4月29日",
      pinned: false,
      txtPath: "text/wechat/zhoupu_wechat.txt",
      characters: {
        "紫英": { avatarName: "紫", avatarColor: "#5B8DB8", isSelf: true },
        "暖瓷粥记": { avatarName: "🥣", avatarColor: "#C88C5A", isSelf: false }
      }
    },
    {
      name: "回春堂老周",
      avatar: "🌿",
      avatarColor: "#6B8E5A",
      time: "5月20日",
      pinned: false,
      txtPath: "text/wechat/yaopu_wechat.txt",
      characters: {
        "紫英": { avatarName: "紫", avatarColor: "#5B8DB8", isSelf: true },
        "回春堂老周": { avatarName: "🌿", avatarColor: "#6B8E5A", isSelf: false }
      }
    },
    {
      name: "天河",
      avatar: "河",
      avatarColor: "#4A90D9",
      time: "21:30",
      pinned: false,
      txtPath: "text/wechat/tianhe_wechat.txt",
      characters: {
        "紫英": { avatarName: "紫", avatarColor: "#5B8DB8", isSelf: true },
        "天河": { avatarName: "河", avatarColor: "#4A90D9", isSelf: false }
      }
    },
    {
      name: "梦璃",
      avatar: "璃",
      avatarColor: "#9B7ED8",
      time: "昨天",
      pinned: false,
      txtPath: "text/wechat/mengli_wechat.txt",
      characters: {
        "紫英": { avatarName: "紫", avatarColor: "#5B8DB8", isSelf: true },
        "梦璃": { avatarName: "璃", avatarColor: "#9B7ED8", isSelf: false }
      }
    },
    {
      name: "四人小群(4)",
      avatar: "群",
      avatarColor: "#07C160",
      time: "昨天",
      pinned: false,
      isGroup: true,
      txtPath: "text/wechat/siqun_wechat.txt",
      characters: {
        "紫英": { avatarName: "紫", avatarColor: "#5B8DB8", isSelf: true },
        "天河": { avatarName: "河", avatarColor: "#4A90D9", isSelf: false },
        "菱纱": { avatarName: "纱", avatarColor: "#FF6B9D", isSelf: false },
        "梦璃": { avatarName: "璃", avatarColor: "#9B7ED8", isSelf: false }
      }
    },
    {
      name: "琼华派大群(432)",
      avatar: "琼",
      avatarColor: "#2C3E50",
      time: "周一",
      pinned: false,
      isGroup: true,
      txtPath: "text/wechat/qionghua_wechat.txt",
      characters: {
        "紫英": { avatarName: "紫", avatarColor: "#5B8DB8", isSelf: true },
        "掌门": { avatarName: "掌", avatarColor: "#2C3E50", isSelf: false },
        "长老甲": { avatarName: "甲", avatarColor: "#7F8C8D", isSelf: false },
        "长老乙": { avatarName: "乙", avatarColor: "#95A5A6", isSelf: false },
        "怀朔": { avatarName: "怀", avatarColor: "#4E7D62", isSelf: false }
      }
    },
    {
      name: "夙莘师叔",
      avatar: "莘",
      avatarColor: "#E67E22",
      time: "周一",
      pinned: false,
      txtPath: "text/wechat/suxin_wechat.txt",
      characters: {
        "紫英": { avatarName: "紫", avatarColor: "#5B8DB8", isSelf: true },
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

  // ---------- 我的页面 ----------
  var meProfile = {
    nickname: "霜刃未改",
    wechatId: "murongziying",
    region: "昆仑山琼华派",
    avatarName: "紫",
    avatarColor: "#5B8DB8",
    statusEmoji: "🌧",
    statusText: "夜雨",
    favorites: [
      { type: "image", title: "九龙缚丝剑穗", source: "来自 菱纱", time: "1月12日" },
      { type: "voice", title: "语音 12'' · 紫英你不要老往危险的地方跑啦！", source: "来自 菱纱", time: "1月20日" },
      { type: "link", title: "体寒女子四季调养方", source: "回春堂公众号", time: "2月03日" },
      { type: "file", title: "煎药口诀.pdf", source: "来自 回春堂老周", time: "2月10日" },
      { type: "image", title: "雪后初晴的院角梅枝", source: "本人保存", time: "3月18日" },
      { type: "text", title: "桂花酿圆子真好吃，下次还要带我去。", source: "来自 菱纱", time: "4月05日" },
      { type: "voice", title: "语音 6'' · 紫英……", source: "来自 菱纱", time: "5月09日" }
    ]
  };

  var FAV_ICONS = {
    image: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="10" r="1.5"/><path d="M21 17l-5-5-9 9"/></svg>',
    voice: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="9" y="3" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0014 0M12 18v3"/></svg>',
    link: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M10 14a4 4 0 005.7 0l3-3a4 4 0 10-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 00-5.7 0l-3 3a4 4 0 105.7 5.7l1-1"/></svg>',
    file: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8z"/><path d="M14 3v5h5"/></svg>',
    text: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M5 5h14v10H9l-4 4z"/></svg>'
  };

  function escapeHtmlText(text) {
    var div = document.createElement('div');
    div.textContent = String(text == null ? '' : text);
    return div.innerHTML;
  }

  function renderMeRow(icon, label, value, opts) {
    opts = opts || {};
    var attr = opts.action ? ' data-me-action="' + escapeHtmlText(opts.action) + '"' : '';
    var html = '<div class="wechat-me-row' + (opts.first ? ' first' : '') + '"' + attr + '>';
    if (icon) {
      html += '<span class="wechat-me-row-icon">' + icon + '</span>';
    }
    html += '<span class="wechat-me-row-label">' + escapeHtmlText(label) + '</span>';
    if (value) {
      html += '<span class="wechat-me-row-value">' + escapeHtmlText(value) + '</span>';
    }
    html += '<svg class="wechat-me-row-arrow" viewBox="0 0 12 20" width="8" height="14"><path d="M2 2l8 8-8 8" stroke="#C7C7CC" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>';
    html += '</div>';
    return html;
  }

  function renderMePage() {
    var html = '<div class="wechat-me">';

    // 顶部资料卡
    html += '<div class="wechat-me-profile">';
    var meAvatarStyle = window.AvatarUtil
      ? window.AvatarUtil.backgroundStyle(meProfile.avatarName, meProfile.avatarColor, meProfile.nickname)
      : 'background:' + meProfile.avatarColor;
    var meAvatarInner = window.AvatarUtil
      ? window.AvatarUtil.text(meProfile.avatarName, meProfile.nickname)
      : escapeHtmlText(meProfile.avatarName);
    html += '<div class="wechat-me-avatar" style="' + meAvatarStyle + '">' + escapeHtmlText(meAvatarInner) + '</div>';
    html += '<div class="wechat-me-info">';
    html += '<div class="wechat-me-name">' + escapeHtmlText(meProfile.nickname) + '</div>';
    html += '<div class="wechat-me-id">微信号：' + escapeHtmlText(meProfile.wechatId) + '</div>';
    html += '<div class="wechat-me-region">' + escapeHtmlText(meProfile.region) + '</div>';
    html += '</div>';
    html += '<div class="wechat-me-qr">';
    html += '<svg viewBox="0 0 24 24" fill="none" stroke="#C7C7CC" stroke-width="1.6"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3h-3zM18 18h3v3h-3z"/></svg>';
    html += '<svg class="wechat-me-row-arrow" viewBox="0 0 12 20" width="8" height="14"><path d="M2 2l8 8-8 8" stroke="#C7C7CC" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>';
    html += '</div>';
    html += '</div>';

    // 状态
    html += '<div class="wechat-me-section">';
    html += '<div class="wechat-me-row first">';
    html += '<span class="wechat-me-status-icon">' + escapeHtmlText(meProfile.statusEmoji) + '</span>';
    html += '<span class="wechat-me-row-label">状态</span>';
    html += '<span class="wechat-me-row-value">+ ' + escapeHtmlText(meProfile.statusText) + '</span>';
    html += '<svg class="wechat-me-row-arrow" viewBox="0 0 12 20" width="8" height="14"><path d="M2 2l8 8-8 8" stroke="#C7C7CC" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>';
    html += '</div>';
    html += '</div>';

    // 服务区块（收藏夹、相册、卡包、表情）
    var blockIcons = {
      favorite: '<svg viewBox="0 0 24 24" fill="#FFB800" stroke="none"><path d="M12 3l2.6 5.6 6.4.6-4.8 4.4 1.4 6.4L12 16.8 6.4 20l1.4-6.4L3 9.2l6.4-.6z"/></svg>',
      album: '<svg viewBox="0 0 24 24" fill="none" stroke="#3CB371" stroke-width="1.6"><rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="10" r="1.5"/><path d="M21 17l-5-5-9 9"/></svg>',
      card: '<svg viewBox="0 0 24 24" fill="none" stroke="#5B8DB8" stroke-width="1.6"><rect x="3" y="6" width="18" height="12" rx="2"/><path d="M3 10h18"/></svg>',
      sticker: '<svg viewBox="0 0 24 24" fill="none" stroke="#E67E22" stroke-width="1.6"><circle cx="12" cy="12" r="9"/><path d="M9 10h.01M15 10h.01M9 15c.8.7 1.8 1 3 1s2.2-.3 3-1"/></svg>'
    };
    html += '<div class="wechat-me-section">';
    html += renderMeRow(blockIcons.favorite, '收藏', meProfile.favorites.length + ' 项', { first: true, action: 'open-favorites' });
    html += renderMeRow(blockIcons.album, '相册', '', {});
    html += renderMeRow(blockIcons.card, '卡包', '', {});
    html += renderMeRow(blockIcons.sticker, '表情', '', {});
    html += '</div>';

    // 设置
    var settingIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="#7B7B7B" stroke-width="1.6"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.8-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 11-4 0v-.1a1.7 1.7 0 00-1.1-1.5 1.7 1.7 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.8 1.7 1.7 0 00-1.5-1H3a2 2 0 110-4h.1a1.7 1.7 0 001.5-1.1 1.7 1.7 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.8.3H9a1.7 1.7 0 001-1.5V3a2 2 0 114 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.8V9a1.7 1.7 0 001.5 1H21a2 2 0 110 4h-.1a1.7 1.7 0 00-1.5 1z"/></svg>';
    html += '<div class="wechat-me-section">';
    html += renderMeRow(settingIcon, '设置', '', { first: true });
    html += '</div>';

    html += '</div>';
    return html;
  }

  // ---------- 收藏夹页面 ----------
  function renderFavoritesPage() {
    var html = '<div class="wechat-favorites-page">';

    // 头部（返回按钮 + 标题 + 搜索/+号）
    html += '<div class="wechat-chat-header wechat-favorites-header">';
    html += '<div class="wechat-chat-back" data-action="back-from-favorites">';
    html += '<svg viewBox="0 0 12 20" width="10" height="16"><path d="M10 2L2 10l8 8" stroke="#181818" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>';
    html += '<span>我</span>';
    html += '</div>';
    html += '<div class="wechat-chat-header-title">收藏</div>';
    html += '<div class="wechat-chat-header-actions">';
    html += '<svg viewBox="0 0 24 24" fill="none" stroke="#181818" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>';
    html += '</div>';
    html += '</div>';

    // 列表
    html += '<div class="wechat-favorites-body">';
    if (!meProfile.favorites.length) {
      html += '<div class="wechat-favorites-empty">暂无收藏</div>';
    } else {
      html += '<div class="wechat-favorites-list">';
      meProfile.favorites.forEach(function (fav) {
        var icon = FAV_ICONS[fav.type] || FAV_ICONS.text;
        html += '<div class="wechat-fav-item">';
        html += '<div class="wechat-fav-icon type-' + escapeHtmlText(fav.type) + '">' + icon + '</div>';
        html += '<div class="wechat-fav-main">';
        html += '<div class="wechat-fav-title">' + escapeHtmlText(fav.title) + '</div>';
        html += '<div class="wechat-fav-meta"><span>' + escapeHtmlText(fav.source) + '</span><span>' + escapeHtmlText(fav.time) + '</span></div>';
        html += '</div>';
        html += '</div>';
      });
      html += '</div>';
    }
    html += '</div>';

    html += '</div>';
    return html;
  }

  function openFavoritesPage() {
    var appContent = document.getElementById('appContent');
    if (!appContent) return;
    appContent.innerHTML = renderFavoritesPage();
    var backBtn = appContent.querySelector('[data-action="back-from-favorites"]');
    if (backBtn) {
      backBtn.addEventListener('click', function () {
        backToList();
        // 回到「我」tab
        setTimeout(function () {
          var meTab = document.querySelector('.wechat-tab[data-tab="me"]');
          if (meTab) meTab.click();
        }, 0);
      });
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
    html += '<div class="wechat-header-title" id="wechatHeaderTitle">微信</div>';
    html += '</div>';
    html += '</div>';
    
    // 聊天列表页
    html += '<div class="wechat-page active" id="wechatPageChat">';
    html += '<div class="wechat-list">';
    
    wechatChats.forEach(function(chat, index) {
      var pinnedClass = chat.pinned ? ' pinned' : '';
      var groupClass = chat.isGroup ? ' group' : '';
      html += '<div class="wechat-chat-item' + pinnedClass + '" data-chat-index="' + index + '">';
      var avatarStyle = window.AvatarUtil
        ? window.AvatarUtil.backgroundStyle(chat.avatar, chat.avatarColor, chat.name)
        : 'background:' + chat.avatarColor;
      var avatarInner = window.AvatarUtil
        ? window.AvatarUtil.text(chat.avatar, chat.name)
        : chat.avatar;
      html += '<div class="wechat-avatar' + groupClass + '" style="' + avatarStyle + '">';
      html += avatarInner;
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

    // 我的页
    html += '<div class="wechat-page" id="wechatPageMe">' + renderMePage() + '</div>';

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
    // 我的Tab
    html += '<div class="wechat-tab" data-tab="me">';
    html += '<svg viewBox="0 0 26 26" fill="none" stroke="currentColor" stroke-width="1.6">';
    html += '<circle cx="13" cy="9" r="4"/>';
    html += '<path d="M5 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/>';
    html += '</svg>';
    html += '<span>我</span>';
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
        var mePage = document.getElementById('wechatPageMe');
        var headerTitle = document.getElementById('wechatHeaderTitle');

        if (chatPage) chatPage.classList.remove('active');
        if (momentsPage) momentsPage.classList.remove('active');
        if (mePage) mePage.classList.remove('active');

        if (tabName === 'chat') {
          if (chatPage) chatPage.classList.add('active');
          if (headerTitle) headerTitle.textContent = '微信';
        } else if (tabName === 'discover') {
          if (momentsPage && !momentsPage.getAttribute('data-loaded') && !momentsPage.getAttribute('data-loading')) {
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
          if (momentsPage) momentsPage.classList.add('active');
          if (headerTitle) headerTitle.textContent = '发现';
        } else if (tabName === 'me') {
          if (mePage) mePage.classList.add('active');
          if (headerTitle) headerTitle.textContent = '我';
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

      // 「我」页面里的行点击
      var meRow = e.target.closest('[data-me-action]');
      if (meRow) {
        var act = meRow.getAttribute('data-me-action');
        if (act === 'open-favorites') {
          openFavoritesPage();
        }
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
