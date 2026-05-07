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
    redpacket: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 6h-2.18c.11-.31.18-.65.18-1 0-1.66-1.34-3-3-3-1.05 0-1.96.54-2.5 1.35l-.5.67-.5-.68C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-5-2c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM9 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm11 15H4v-2h16v2zm0-5H4V8h5.08L7 10.83 8.62 12 11 8.76l1-1.33 1 1.33L15.38 12 17 10.83 14.92 8H20v6z"/></svg>'
  };

  function escapeHtml(text) {
    var div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function formatText(text) {
    return escapeHtml(text || '').replace(/\n/g, '<br>');
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

  function renderChatPage(chatInfo, messages) {
    var backHandler = 'window.WechatApp && WechatApp.backToList ? WechatApp.backToList() : AppCore.goHome()';
    messages = Array.isArray(messages) ? messages : [];
    var html = '<div class="wechat-chat-page">';

    html += '<div class="wechat-chat-header">';
    html += '<button class="wechat-chat-header-back" onclick="' + backHandler + '">';
    html += '<svg viewBox="0 0 12 20" width="10" height="16"><path d="M10 18L2 10l8-8" stroke="#181818" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>';
    html += '</button>';
    html += '<div class="wechat-chat-header-title">' + escapeHtml(chatInfo.name) + '</div>';
    html += '<button class="wechat-chat-header-more">';
    html += '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#181818" stroke-width="2"><circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/></svg>';
    html += '</button>';
    html += '</div>';

    html += '<div class="wechat-messages">';
    messages.forEach(function(msg) {
      if (msg.type === 'time') {
        html += renderTimeDivider(msg.time);
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
    renderChatPage: renderChatPage
  };
})();
