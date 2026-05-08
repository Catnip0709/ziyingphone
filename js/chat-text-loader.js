/* ============================================
   通用聊天文本加载器
   从 txt 文案读取并渲染微信聊天页面
   ============================================ */

(function () {
  "use strict";

  var DEFAULT_CHARACTERS = {
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
  };

  var DEFAULT_LINGSHA_CONFIG = {
    txtPath: "text/wechat/lingsha_wechat.txt",
    chatInfo: {
      name: "菱纱",
      avatar: "纱",
      avatarColor: "#FF6B9D"
    },
    characters: DEFAULT_CHARACTERS
  };

  var SYSTEM_MESSAGE_TYPES = {
    revoke: true,
    pat: true,
    groupnotice: true,
    memberchange: true
  };

  // ---------- 解析 TXT 文案 ----------
  function parseChatText(text, characters) {
    var messages = [];
    var lines = text.split("\n");
    var characterMap = characters || DEFAULT_CHARACTERS;
    var senderPattern = createSenderPattern(characterMap);
    var i = 0;

    while (i < lines.length) {
      var line = lines[i].trim();

      // 跳过空行和注释
      if (!line || line.startsWith("#")) {
        i++;
        continue;
      }

      // 时间分割线 [time] xxx
      if (line.startsWith("[time]")) {
        var timeStr = line.substring(6).trim();
        messages.push({
          type: "time",
          time: timeStr
        });
        i++;
        continue;
      }

      var systemMatch = line.match(/^\[(\w+)(?::([^\]]*))?\]\s*(.*)$/);
      if (systemMatch && SYSTEM_MESSAGE_TYPES[systemMatch[1]]) {
        var systemType = systemMatch[1];
        var inlineText = systemMatch[3].trim();
        var bodyText = "";
        var nextIndex = i + 1;
        // 仅 groupnotice / memberchange 需要读取后续多行正文
        if (systemType === "groupnotice" || systemType === "memberchange") {
          var systemBody = collectMessageBody(lines, i + 1, senderPattern);
          bodyText = systemBody.text;
          nextIndex = systemBody.nextIndex;
        }
        var systemData = parseSystemMessage(systemType, systemMatch[2] || "", mergeMessageText(inlineText, bodyText));
        messages.push(systemData);
        i = nextIndex;
        continue;
      }

      // 消息行：角色> [类型]内容
      var msgMatch = line.match(senderPattern);
      if (msgMatch) {
        var sender = msgMatch[1];
        var rest = msgMatch[2].trim();
        var charConfig = characterMap[sender];
        var messageBody = collectMessageBody(lines, i + 1, senderPattern);

        if (!charConfig) {
          i = messageBody.nextIndex;
          continue;
        }

        // 解析类型标记和内容
        var msgData = parseMessageContent(rest, messageBody.text);

        messages.push({
          type: "msg",
          msgType: msgData.msgType,
          isSelf: charConfig.isSelf,
          avatarName: charConfig.avatarName,
          avatarColor: charConfig.avatarColor,
          senderName: sender,
          // 根据类型填充对应字段
          text: msgData.text,
          duration: msgData.duration,
          isUnread: msgData.isUnread,
          quoteAuthor: msgData.quoteAuthor,
          quoteText: msgData.quoteText,
          amount: msgData.amount,
          status: msgData.status,
          title: msgData.title,
          typeName: msgData.typeName,
          name: msgData.name,
          address: msgData.address,
          emoji: msgData.emoji,
          url: msgData.url,
          source: msgData.source,
          description: msgData.description,
          fileName: msgData.fileName,
          fileSize: msgData.fileSize,
          actor: msgData.actor,
          target: msgData.target,
          summary: msgData.summary
        });
        i = messageBody.nextIndex;
        continue;
      }

      i++;
    }

    return messages;
  }

  function createSenderPattern(characters) {
    var names = Object.keys(characters || {});
    if (!names.length) {
      return /$a/;
    }
    return new RegExp("^(" + names.map(escapeRegExp).join("|") + ")>\\s*(.*)$");
  }

  function escapeRegExp(text) {
    return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  function collectMessageBody(lines, startIndex, senderPattern) {
    var bodyLines = [];
    var i = startIndex;

    while (i < lines.length) {
      var rawLine = lines[i];
      var trimmedLine = rawLine.trim();

      if (!trimmedLine) {
        if (bodyLines.length > 0) {
          break;
        }
        i++;
        continue;
      }

      if (trimmedLine.startsWith("#") ||
          trimmedLine.startsWith("[time]") ||
          isStandaloneSystemLine(trimmedLine) ||
          senderPattern.test(trimmedLine)) {
        break;
      }

      bodyLines.push(trimmedLine);
      i++;
    }

    return {
      text: bodyLines.join("\n"),
      nextIndex: i
    };
  }

  function isStandaloneSystemLine(line) {
    var match = line.match(/^\[(\w+)(?::([^\]]*))?\]\s*(.*)$/);
    return !!(match && SYSTEM_MESSAGE_TYPES[match[1]]);
  }

  function parseMessageContent(rest, bodyText) {
    var result = {
      msgType: "text",
      text: rest,
      duration: null,
      isUnread: false,
      quoteAuthor: null,
      quoteText: null,
      amount: null,
      status: null,
      title: null,
      typeName: null,
      name: null,
      address: null,
      emoji: null,
      url: null,
      source: null,
      description: null,
      fileName: null,
      fileSize: null,
      actor: null,
      target: null,
      summary: null
    };

    bodyText = bodyText || "";

    // 检查类型标记 [type] 或 [type:参数]
    var typeMatch = rest.match(/^\[(\w+)(?::([^\]]*))?\]\s*(.*)$/);
    if (!typeMatch) {
      // 没有类型标记，默认纯文本
      result.text = mergeMessageText(rest, bodyText);
      return result;
    }

    var type = typeMatch[1];
    var params = typeMatch[2] || "";
    var content = mergeMessageText(typeMatch[3].trim(), bodyText);

    switch (type) {
      case "text":
        result.msgType = "text";
        result.text = content;
        break;

      case "voice":
        result.msgType = "voice";
        result.duration = parseInt(params) || 1;
        result.isUnread = false;
        result.text = content;
        break;

      case "video":
        result.msgType = "video";
        result.duration = params || "0:00";
        result.text = content;
        break;

      case "image":
        result.msgType = "image";
        result.text = content;
        break;

      case "location":
        result.msgType = "location";
        var locParts = params.split(":");
        result.name = locParts[0] || "";
        result.address = locParts[1] || "";
        result.text = content;
        break;

      case "transfer":
        result.msgType = "transfer";
        var transParts = params.split(":");
        result.amount = transParts[0] || "";
        result.status = transParts[1] || "";
        result.text = content;
        break;

      case "redpacket":
        result.msgType = "redpacket";
        var redParts = params.split(":");
        result.title = redParts[0] || "";
        result.typeName = redParts[1] || "";
        result.text = content;
        break;

      case "emoji":
        result.msgType = "emoji";
        result.emoji = content;
        break;

      case "quote":
        result.msgType = "quote";
        var quoteParts = params.split(":");
        result.quoteAuthor = quoteParts[0] || "";
        result.quoteText = quoteParts[1] || "";
        result.text = content;
        break;

      case "file":
        result.msgType = "file";
        var fileParts = params.split(":");
        result.fileName = fileParts[0] || "";
        result.fileSize = fileParts[1] || "";
        result.text = content;
        break;

      case "share":
        result.msgType = "share";
        var shareParts = params.split(":");
        result.title = shareParts[0] || "";
        result.source = shareParts[1] || "";
        result.text = content;
        break;

      case "link":
        result.msgType = "link";
        var linkParts = params.split(":");
        result.title = linkParts[0] || "";
        result.source = linkParts[1] || "";
        result.text = content;
        break;

      case "miniapp":
        result.msgType = "miniapp";
        var miniappParts = params.split(":");
        result.title = miniappParts[0] || "";
        result.source = miniappParts[1] || "";
        result.text = content;
        break;

      case "favorite":
        result.msgType = "favorite";
        var favoriteParts = params.split(":");
        result.title = favoriteParts[0] || "";
        result.source = favoriteParts[1] || "";
        result.text = content;
        break;

      case "groupcollect":
        result.msgType = "groupcollect";
        var collectParts = params.split(":");
        result.title = collectParts[0] || "";
        result.amount = collectParts[1] || "";
        result.status = collectParts[2] || "";
        result.text = content;
        break;

      default:
        result.text = content;
    }

    return result;
  }

  function parseSystemMessage(type, params, content) {
    var data = {
      type: "system",
      systemType: type,
      text: content || "",
      title: "",
      actor: "",
      target: "",
      summary: ""
    };

    switch (type) {
      case "revoke":
        data.actor = params || "";
        data.text = content || (data.actor ? data.actor + " 撤回了一条消息" : "有消息被撤回");
        break;
      case "pat":
        var patParts = (params || "").split(":");
        data.actor = (patParts[0] || "").trim();
        data.target = (patParts[1] || "").trim();
        if (content) {
          data.text = content;
        } else if (data.actor && data.target) {
          data.text = data.actor + " 拍了拍 " + data.target;
        } else {
          data.text = "有人拍了拍群友";
        }
        break;
      case "groupnotice":
        data.title = params || "群公告";
        data.text = content || "";
        break;
      case "memberchange":
        data.summary = params || "";
        data.text = content || "";
        break;
      default:
        data.text = content || "";
    }

    return data;
  }

  function mergeMessageText(inlineText, blockText) {
    if (inlineText && blockText) {
      return inlineText + "\n" + blockText;
    }
    return inlineText || blockText || "";
  }

  // ---------- 加载 TXT 文件 (带超时) ----------
  function loadChatText(txtPath, characters, callback) {
    var controller = new AbortController();
    var timeoutId = setTimeout(function() {
      controller.abort();
      console.error("[ChatTextLoader] 加载超时:", txtPath);
      callback([]);
    }, 10000); // 10秒超时

    fetch(txtPath, { signal: controller.signal })
      .then(function(res) {
        clearTimeout(timeoutId);
        if (!res.ok) {
          throw new Error('HTTP ' + res.status);
        }
        return res.text();
      })
      .then(function(text) {
        var messages = parseChatText(text, characters);
        callback(messages);
      })
      .catch(function(err) {
        clearTimeout(timeoutId);
        if (err.name === 'AbortError') {
          console.error("[ChatTextLoader] 加载超时:", txtPath);
        } else {
          console.error("[ChatTextLoader] 加载文案失败:", err.message, txtPath);
        }
        callback([]);
      });
  }

  // ---------- 渲染聊天页面 ----------
  function renderChatPage(chatInfo, messages) {
    return WeChatComponents.renderChatPage(chatInfo, messages);
  }

  function normalizeOptions(options) {
    var config = options || {};
    return {
      txtPath: config.txtPath || DEFAULT_LINGSHA_CONFIG.txtPath,
      chatInfo: config.chatInfo || DEFAULT_LINGSHA_CONFIG.chatInfo,
      characters: config.characters || DEFAULT_LINGSHA_CONFIG.characters,
      targetId: config.targetId || "appContent",
      onLoaded: typeof config.onLoaded === "function" ? config.onLoaded : null
    };
  }

  // ---------- 打开聊天页面 ----------
  function openChat(options) {
    var config = normalizeOptions(options);
    loadChatText(config.txtPath, config.characters, function (messages) {
      var html = renderChatPage(config.chatInfo, messages);
      // 渲染到 appContent（微信应用外层容器）
      var target = document.getElementById(config.targetId);
      if (target) {
        target.innerHTML = html;
      }
      if (config.onLoaded) {
        config.onLoaded(messages, config);
      }
    });
  }

  // ---------- 导出 ----------
  window.ChatTextLoader = {
    defaults: {
      lingsha: DEFAULT_LINGSHA_CONFIG
    },
    open: openChat,
    parseChatText: parseChatText,
    loadChatText: loadChatText,
    renderChatPage: renderChatPage
  };

  // 兼容旧入口
  window.LingshaChat = {
    open: function () {
      openChat(DEFAULT_LINGSHA_CONFIG);
    },
    parseChatText: function (text) {
      return parseChatText(text, DEFAULT_LINGSHA_CONFIG.characters);
    },
    loadChatText: function (callback) {
      loadChatText(
        DEFAULT_LINGSHA_CONFIG.txtPath,
        DEFAULT_LINGSHA_CONFIG.characters,
        callback
      );
    }
  };

})();
