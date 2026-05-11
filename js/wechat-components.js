/* ============================================
   WeChat Chat Components - 微信聊天组件模块
   可复用的聊天消息组件，方便后续每个聊天窗口使用
   ============================================ */

var WeChatComponents = (function() {
  "use strict";

  var Icons = {
    voice: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/><path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/></svg>',
    play: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>',
    transfer: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.91s4.18 1.39 4.18 3.91c-.01 1.83-1.38 2.83-3.12 3.16z"/></svg>',
    redpacket: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 6h-2.18c.11-.31.18-.65.18-1 0-1.66-1.34-3-3-3-1.05 0-1.96.54-2.5 1.35l-.5.67-.5-.68C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-5-2c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM9 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm11 15H4v-2h16v2zm0-5H4V8h5.08L7 10.83 8.62 12 11 8.76l1-1.33 1 1.33L15.38 12 17 10.83 14.92 8H20v6z"/></svg>',
    file: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zm0 2.5L18.5 9H14z"/><path d="M8 13h8v1.5H8zm0 3h8V17.5H8z" fill="#fff" opacity=".45"/></svg>',
    link: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3.9 12a5 5 0 015-5h3v2h-3a3 3 0 000 6h3v2h-3a5 5 0 01-5-5zm7.1 1h2V11h-2zm4-6h3a5 5 0 010 10h-3v-2h3a3 3 0 100-6h-3z"/></svg>',
    miniapp: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8.2 5.3a5.4 5.4 0 017.6 0l.7.7-1.4 1.4-.7-.7a3.4 3.4 0 00-4.8 0L8.9 8 7.5 6.6zm7.6 13.4a5.4 5.4 0 01-7.6 0l-.7-.7 1.4-1.4.7.7a3.4 3.4 0 004.8 0l.7-.7 1.4 1.4zm3-7.7l1.4 1.4-.7.7a5.4 5.4 0 01-7.6 0l-1.1-1.1 1.4-1.4 1.1 1.1a3.4 3.4 0 004.8 0zM4.5 11.7a5.4 5.4 0 017.6 0l1.1 1.1-1.4 1.4-1.1-1.1a3.4 3.4 0 00-4.8 0l-.7.7-1.4-1.4z"/></svg>',
    share: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18 16a3 3 0 00-2.4 1.2l-6.8-3.4a3.3 3.3 0 000-1.6l6.8-3.4A3 3 0 1015 7a3.2 3.2 0 00.1.8L8.3 11.2a3 3 0 100 1.6l6.8 3.4A3 3 0 1018 16z"/></svg>',
    megaphone: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 10v4a1 1 0 001 1h2l3.2 4.3a1 1 0 001.8-.6V5.3a1 1 0 00-1.8-.6L6 9H4a1 1 0 00-1 1zm10.5-.7a4.8 4.8 0 010 5.4l1.6 1.1a6.8 6.8 0 000-7.6zm2.8-2a8.1 8.1 0 010 9.4l1.6 1.1a10.1 10.1 0 000-11.6z"/></svg>'
  };

  var CARD_TYPE_LABELS = {
    file: "文件",
    share: "分享",
    link: "链接",
    miniapp: "小程序",
    favorite: "收藏转发"
  };

  var CARD_TYPE_ICONS = {
    file: Icons.file,
    share: Icons.share,
    link: Icons.link,
    miniapp: Icons.miniapp,
    favorite: Icons.share
  };

  function escapeHtml(text) {
    var div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function formatText(text) {
    return highlightMentions(escapeHtml(text || '')).replace(/\n/g, '<br>');
  }

  function highlightMentions(text) {
    return String(text || "").replace(/(^|[\s(])(@[^\s<>&，。！？、,:：]+)/g, function (_, prefix, mention) {
      return prefix + '<span class="wechat-mention">' + mention + '</span>';
    });
  }

  function renderAvatar(name, color, size) {
    size = size || 40;
    return '<div class="wechat-msg-avatar" style="width:' + size + 'px;height:' + size + 'px;background:' + color + '">' + name + '</div>';
  }

  function renderTimeDivider(time) {
    return '<div class="wechat-time-divider"><span>' + time + '</span></div>';
  }

  function renderMessageRow(content, isSelf, avatar, senderName) {
    var rowClass = isSelf ? 'wechat-message-row self' : 'wechat-message-row';
    var html = '<div class="' + rowClass + '">';
    html += avatar;
    html += '<div class="wechat-message-content">';
    if (senderName && !isSelf) {
      html += '<div class="wechat-sender-name">' + senderName + '</div>';
    }
    html += content;
    html += '</div></div>';
    return html;
  }

  function renderTextMessage(text, isSelf) {
    var bubbleClass = isSelf ? 'wechat-bubble self' : 'wechat-bubble other';
    return '<div class="' + bubbleClass + '">' + formatText(text) + '</div>';
  }

  function renderVoiceMessage(duration, text, isSelf, isUnread) {
    var bubbleClass = isSelf ? 'wechat-bubble wechat-bubble-voice self' : 'wechat-bubble wechat-bubble-voice other';
    var html = '<div class="' + bubbleClass + '">';
    html += '<div class="wechat-voice-main">';
    html += '<div class="wechat-voice-icon">' + Icons.voice + '</div>';
    html += '<span class="wechat-voice-duration">' + duration + "\u2033" + '</span>';
    if (isUnread && !isSelf) {
      html += '<div class="wechat-voice-unread"></div>';
    }
    html += '</div>';
    if (text) {
      html += '<div class="wechat-voice-text"><span class="wechat-voice-text-label">转文字</span>' + formatText(text) + '</div>';
    }
    html += '</div>';
    return html;
  }

  function renderQuoteMessage(quoteAuthor, quoteText, content, isSelf) {
    var bubbleClass = isSelf ? 'wechat-bubble wechat-bubble-quote self' : 'wechat-bubble wechat-bubble-quote other';
    var html = '<div class="' + bubbleClass + '">';
    html += '<div class="wechat-quote-box">';
    html += '<div class="wechat-quote-author">' + escapeHtml(quoteAuthor) + '</div>';
    html += '<div class="wechat-quote-text">' + formatText(quoteText) + '</div>';
    html += '</div>';
    html += '<div class="wechat-quote-content">' + formatText(content) + '</div>';
    html += '</div>';
    return html;
  }

  function renderTransferMessage(amount, status) {
    var html = '<div class="wechat-bubble wechat-bubble-transfer">';
    html += '<div class="wechat-transfer-icon">' + Icons.transfer + '</div>';
    html += '<div class="wechat-transfer-info">';
    html += '<div class="wechat-transfer-amount">\u00a5' + amount + '</div>';
    html += '<div class="wechat-transfer-status">' + status + '</div>';
    html += '</div></div>';
    return html;
  }

  function renderRedPacketMessage(title, type) {
    var html = '<div class="wechat-bubble wechat-bubble-redpacket">';
    html += '<div class="wechat-redpacket-icon">' + Icons.redpacket + '</div>';
    html += '<div class="wechat-redpacket-info">';
    html += '<div class="wechat-redpacket-title">' + escapeHtml(title) + '</div>';
    html += '<div class="wechat-redpacket-type">' + type + '</div>';
    html += '</div></div>';
    return html;
  }

  function renderVideoMessage(duration) {
    var html = '<div class="wechat-bubble wechat-bubble-video">';
    html += '<div style="width:100%;height:100%;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);display:flex;align-items:center;justify-content:center;">';
    html += '<div class="wechat-video-play">' + Icons.play + '</div>';
    html += '</div>';
    html += '<div class="wechat-video-duration">' + duration + '</div>';
    html += '</div>';
    return html;
  }

  function renderLocationMessage(name, address) {
    var html = '<div class="wechat-bubble wechat-bubble-location">';
    html += '<div class="wechat-location-map">';
    html += '<div class="wechat-location-pin"></div>';
    html += '</div>';
    html += '<div class="wechat-location-info">';
    html += '<div class="wechat-location-name">' + escapeHtml(name) + '</div>';
    html += '<div class="wechat-location-address">' + escapeHtml(address) + '</div>';
    html += '</div></div>';
    return html;
  }

  function renderStickerMessage() {
    return '<div class="wechat-bubble wechat-bubble-emoji"><div class="wechat-emoji-img">[\u8868\u60c5]</div></div>';
  }

  function renderEmojiMessage(emoji) {
    return '<div class="wechat-bubble wechat-bubble-emoji-text">' + emoji + '</div>';
  }

  function renderImageMessage(isSelf) {
    var bubbleClass = isSelf ? 'wechat-bubble wechat-bubble-image self' : 'wechat-bubble wechat-bubble-image other';
    return '<div class="' + bubbleClass + '"><div style="width:150px;height:200px;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);border-radius:6px;"></div></div>';
  }

  function renderCardMessage(type, title, source, description, isSelf) {
    var bubbleClass = isSelf ? 'wechat-bubble wechat-bubble-card self' : 'wechat-bubble wechat-bubble-card other';
    var html = '<div class="' + bubbleClass + '">';
    html += '<div class="wechat-card-top">';
    html += '<div class="wechat-card-icon type-' + type + '">' + (CARD_TYPE_ICONS[type] || Icons.share) + '</div>';
    html += '<div class="wechat-card-main">';
    html += '<div class="wechat-card-title">' + escapeHtml(title || CARD_TYPE_LABELS[type] || "卡片") + '</div>';
    if (description) {
      html += '<div class="wechat-card-desc">' + formatText(description) + '</div>';
    }
    html += '</div></div>';
    html += '<div class="wechat-card-footer">';
    html += '<span class="wechat-card-type">' + (CARD_TYPE_LABELS[type] || "卡片") + '</span>';
    if (source) {
      html += '<span class="wechat-card-source">' + escapeHtml(source) + '</span>';
    }
    html += '</div></div>';
    return html;
  }

  function renderFileMessage(fileName, fileSize, text, isSelf) {
    var description = fileSize || "";
    if (text) {
      description = description ? description + "\n" + text : text;
    }
    return renderCardMessage("file", fileName, "", description, isSelf);
  }

  function renderShareMessage(title, source, text, isSelf) {
    return renderCardMessage("share", title, source, text, isSelf);
  }

  function renderLinkMessage(title, source, text, isSelf) {
    return renderCardMessage("link", title, source, text, isSelf);
  }

  function renderMiniappMessage(title, source, text, isSelf) {
    return renderCardMessage("miniapp", title, source, text, isSelf);
  }

  function renderFavoriteMessage(title, source, text, isSelf) {
    return renderCardMessage("favorite", title, source, text, isSelf);
  }

  function renderGroupCollectMessage(title, amount, status, text, isSelf) {
    var bubbleClass = isSelf ? 'wechat-bubble wechat-bubble-groupcollect self' : 'wechat-bubble wechat-bubble-groupcollect other';
    var html = '<div class="' + bubbleClass + '">';
    html += '<div class="wechat-groupcollect-title">' + escapeHtml(title || "群收款") + '</div>';
    html += '<div class="wechat-groupcollect-amount">每人 ¥' + escapeHtml(amount || "") + '</div>';
    if (text) {
      html += '<div class="wechat-groupcollect-desc">' + formatText(text) + '</div>';
    }
    if (status) {
      html += '<div class="wechat-groupcollect-status">' + escapeHtml(status) + '</div>';
    }
    html += '</div>';
    return html;
  }

  function renderSystemMessage(msg) {
    if (msg.systemType === "groupnotice") {
      var noticeHtml = '<div class="wechat-system-card wechat-system-notice">';
      noticeHtml += '<div class="wechat-system-card-header"><span class="wechat-system-card-icon">' + Icons.megaphone + '</span><span>群公告</span></div>';
      noticeHtml += '<div class="wechat-system-card-title">' + escapeHtml(msg.title || "群公告") + '</div>';
      if (msg.text) {
        noticeHtml += '<div class="wechat-system-card-text">' + formatText(msg.text) + '</div>';
      }
      noticeHtml += '</div>';
      return noticeHtml;
    }

    if (msg.systemType === "memberchange") {
      var memberHtml = '<div class="wechat-system-card wechat-system-members">';
      memberHtml += '<div class="wechat-system-card-title">' + escapeHtml(msg.summary || "群成员变更") + '</div>';
      if (msg.text) {
        memberHtml += '<div class="wechat-system-card-text">' + formatText(msg.text) + '</div>';
      }
      memberHtml += '</div>';
      return memberHtml;
    }

    return '<div class="wechat-system-text">' + escapeHtml(msg.text || "") + '</div>';
  }

  function renderChatPage(chatInfo, messages) {
    var backHandler = chatInfo.backHandler || 'window.WechatApp ? window.WechatApp.backToList() : AppCore.goHome()';
    var pageClass = chatInfo.pageClass ? ' ' + escapeHtml(chatInfo.pageClass) : '';
    var iconStroke = chatInfo.iconStroke || "#181818";
    messages = Array.isArray(messages) ? messages : [];
    var html = '<div class="wechat-chat-page' + pageClass + '">';

    html += '<div class="wechat-chat-header">';
    html += '<button class="wechat-chat-header-back" onclick="' + backHandler + '">';
    html += '<svg viewBox="0 0 12 20" width="10" height="16"><path d="M10 18L2 10l8-8" stroke="' + iconStroke + '" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>';
    html += '</button>';
    html += '<div class="wechat-chat-header-title">' + escapeHtml(chatInfo.name) + '</div>';
    html += '<button class="wechat-chat-header-more">';
    html += '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="' + iconStroke + '" stroke-width="2"><circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/></svg>';
    html += '</button>';
    html += '</div>';

    html += '<div class="wechat-messages">';
    messages.forEach(function(msg) {
      if (msg.type === 'time') {
        html += renderTimeDivider(msg.time);
      } else if (msg.type === 'system') {
        html += renderSystemMessage(msg);
      } else {
        var content = '';
        switch(msg.msgType) {
          case 'text': content = renderTextMessage(msg.text, msg.isSelf); break;
          case 'voice': content = renderVoiceMessage(msg.duration, msg.text, msg.isSelf, msg.isUnread); break;
          case 'quote': content = renderQuoteMessage(msg.quoteAuthor, msg.quoteText, msg.text, msg.isSelf); break;
          case 'transfer': content = renderTransferMessage(msg.amount, msg.status); break;
          case 'redpacket': content = renderRedPacketMessage(msg.title, msg.typeName); break;
          case 'video': content = renderVideoMessage(msg.duration); break;
          case 'location': content = renderLocationMessage(msg.name, msg.address); break;
          case 'sticker': content = renderStickerMessage(); break;
          case 'emoji': content = renderEmojiMessage(msg.emoji); break;
          case 'image': content = renderImageMessage(msg.isSelf); break;
          case 'file': content = renderFileMessage(msg.fileName, msg.fileSize, msg.text, msg.isSelf); break;
          case 'share': content = renderShareMessage(msg.title, msg.source, msg.text, msg.isSelf); break;
          case 'link': content = renderLinkMessage(msg.title, msg.source, msg.text, msg.isSelf); break;
          case 'miniapp': content = renderMiniappMessage(msg.title, msg.source, msg.text, msg.isSelf); break;
          case 'favorite': content = renderFavoriteMessage(msg.title, msg.source, msg.text, msg.isSelf); break;
          case 'groupcollect': content = renderGroupCollectMessage(msg.title, msg.amount, msg.status, msg.text, msg.isSelf); break;
        }
        if (msg.failed && msg.isSelf) {
          content = '<div class="wechat-failed-wrap"><div class="wechat-message-failed" title="发送失败">!</div>' + content + '</div>';
        }
        var avatar = renderAvatar(msg.avatarName, msg.avatarColor);
        html += renderMessageRow(content, msg.isSelf, avatar, msg.senderName);
      }
    });
    html += '</div>';

    html += '<div class="wechat-input-area">';
    html += '<div class="wechat-input-toolbar">';
    html += '<button class="wechat-input-btn"><svg viewBox="0 0 24 24" fill="none" stroke="#333" stroke-width="2"><circle cx="12" cy="12" r="9"/></svg></button>';
    html += '<button class="wechat-input-btn"><svg viewBox="0 0 24 24" fill="none" stroke="#333" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/></svg></button>';
    html += '<button class="wechat-input-btn"><svg viewBox="0 0 24 24" fill="none" stroke="#333" stroke-width="2"><circle cx="12" cy="12" r="9"/></svg></button>';
    html += '</div>';
    html += '<div class="wechat-input-box">';
    html += '<input type="text" class="wechat-input-text" placeholder="">';
    html += '<button class="wechat-input-send">\u53d1\u9001</button>';
    html += '</div>';
    html += '</div>';

    html += '</div>';
    return html;
  }

  return {
    renderAvatar: renderAvatar,
    renderTimeDivider: renderTimeDivider,
    renderMessageRow: renderMessageRow,
    renderTextMessage: renderTextMessage,
    renderVoiceMessage: renderVoiceMessage,
    renderQuoteMessage: renderQuoteMessage,
    renderTransferMessage: renderTransferMessage,
    renderRedPacketMessage: renderRedPacketMessage,
    renderVideoMessage: renderVideoMessage,
    renderLocationMessage: renderLocationMessage,
    renderStickerMessage: renderStickerMessage,
    renderEmojiMessage: renderEmojiMessage,
    renderImageMessage: renderImageMessage,
    renderFileMessage: renderFileMessage,
    renderShareMessage: renderShareMessage,
    renderLinkMessage: renderLinkMessage,
    renderMiniappMessage: renderMiniappMessage,
    renderFavoriteMessage: renderFavoriteMessage,
    renderGroupCollectMessage: renderGroupCollectMessage,
    renderSystemMessage: renderSystemMessage,
    renderChatPage: renderChatPage
  };
})();
