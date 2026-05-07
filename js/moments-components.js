/* ============================================
   Moments Components - 朋友圈组件模块
   可复用的朋友圈帖子组件
   ============================================ */

var MomentsComponents = (function() {
  "use strict";

  var DEFAULT_MOMENTS_TXT_PATH = "text/pengyouquan.txt";
  var DEFAULT_USER_INFO = {
    name: "慕容紫英",
    avatarName: "英",
    avatarColor: "#5B8DB8"
  };
  var DEFAULT_MOMENTS_CONFIG = {
    txtPath: DEFAULT_MOMENTS_TXT_PATH,
    targetId: null,
    targetElement: null
  };

  function escapeHtml(text) {
    var div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function formatText(text) {
    return escapeHtml(text || '').replace(/\n/g, '<br>');
  }

  var imgColors = [
    'linear-gradient(135deg,#667eea 0%,#764ba2 100%)',
    'linear-gradient(135deg,#f093fb 0%,#f5576c 100%)',
    'linear-gradient(135deg,#4facfe 0%,#00f2fe 100%)',
    'linear-gradient(135deg,#43e97b 0%,#38f9d7 100%)',
    'linear-gradient(135deg,#fa709a 0%,#fee140 100%)',
    'linear-gradient(135deg,#a18cd1 0%,#fbc2eb 100%)',
    'linear-gradient(135deg,#fccb90 0%,#d57eeb 100%)',
    'linear-gradient(135deg,#e0c3fc 0%,#8ec5fc 100%)',
    'linear-gradient(135deg,#f5576c 0%,#ff6a00 100%)'
  ];

  function renderImages(images) {
    if (!images || images.length === 0) return '';
    var count = images.length;
    var colsClass = 'cols-3';
    if (count === 1) colsClass = 'cols-1';
    else if (count === 2 || count === 4) colsClass = 'cols-2';
    else if (count === 6) colsClass = 'cols-6';

    var html = '<div class="moments-images ' + colsClass + '">';
    images.forEach(function(_, i) {
      var bg = imgColors[i % imgColors.length];
      html += '<div class="moments-img-item" style="background:' + bg + '"></div>';
    });
    html += '</div>';
    return html;
  }

  function renderVideo(duration) {
    var html = '<div class="moments-video">';
    html += '<div class="moments-video-bg" style="background:linear-gradient(135deg,#667eea 0%,#764ba2 100%)">';
    html += '<div class="moments-video-play"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg></div>';
    html += '</div>';
    html += '<div class="moments-video-duration">' + escapeHtml(duration) + '</div>';
    html += '</div>';
    return html;
  }

  function renderLikes(likes) {
    if (!likes || likes.length === 0) return '';
    var html = '<div class="moments-likes">';
    html += '<span class="moments-likes-icon"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg></span>';
    likes.forEach(function(name, i) {
      html += '<span class="moments-like-name">' + escapeHtml(name) + '</span>';
      if (i < likes.length - 1) {
        html += '<span class="moments-like-sep">, </span>';
      }
    });
    html += '</div>';
    return html;
  }

  function renderCommentItem(comment) {
    var html = '<div class="moments-comment-item">';
    html += '<span class="moments-comment-name">' + escapeHtml(comment.author) + '</span>';
    if (comment.replyTo) {
      html += '<span class="moments-comment-text"> \u56de\u590d </span>';
      html += '<span class="moments-comment-reply-name">' + escapeHtml(comment.replyTo) + '</span>';
    }
    html += '<span class="moments-comment-text">\uff1a' + escapeHtml(comment.text) + '</span>';
    html += '</div>';
    return html;
  }

  function renderComments(comments) {
    if (!comments || comments.length === 0) return '';
    var html = '<div class="moments-comments">';
    comments.forEach(function(c) {
      html += renderCommentItem(c);
    });
    html += '</div>';
    return html;
  }

  function renderSocial(likes, comments) {
    var hasLikes = likes && likes.length > 0;
    var hasComments = comments && comments.length > 0;
    if (!hasLikes && !hasComments) return '';
    var html = '<div class="moments-social">';
    if (hasLikes) html += renderLikes(likes);
    if (hasComments) html += renderComments(comments);
    html += '</div>';
    return html;
  }

  function renderActionsButton() {
    var html = '<div class="moments-actions">';
    html += '<button class="moments-actions-btn">';
    html += '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">';
    html += '<circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/>';
    html += '</svg></button></div>';
    return html;
  }

  function renderPost(post) {
    var html = '<div class="moments-post">';
    html += '<div class="moments-post-header">';
    html += '<div class="moments-post-avatar" style="background:' + post.avatarColor + '">' + escapeHtml(post.avatarName) + '</div>';
    html += '<div class="moments-post-body">';
    html += '<div class="moments-post-meta">';
    html += '<span class="moments-post-name">' + escapeHtml(post.name) + '</span>';
    html += '<span class="moments-post-time">' + escapeHtml(post.time) + '</span>';
    html += '</div>';
    if (post.text) {
      html += '<div class="moments-post-text">' + formatText(post.text) + '</div>';
    }
    if (post.remind) {
      html += '<div class="moments-post-remind">' + formatText(post.remind) + '</div>';
    }
    if (post.blocked) {
      html += '<div class="moments-post-blocked">' + formatText(post.blocked) + '</div>';
    }
    if (post.images && post.images.length > 0) {
      html += renderImages(post.images);
    }
    if (post.video) {
      html += renderVideo(post.video);
    }
    html += renderActionsButton();
    html += renderSocial(post.likes, post.comments);
    html += '</div></div></div>';
    return html;
  }

  function renderCover(userInfo) {
    var html = '<div class="moments-cover">';
    html += '<div class="moments-cover-user">';
    html += '<span class="moments-cover-name">' + escapeHtml(userInfo.name) + '</span>';
    html += '<div class="moments-cover-avatar" style="background:' + userInfo.avatarColor + '">' + escapeHtml(userInfo.avatarName) + '</div>';
    html += '</div></div>';
    return html;
  }

  function renderMomentsPage(userInfo, posts) {
    var html = '<div class="wechat-moments">';
    html += renderCover(userInfo);
    html += '<div class="moments-feed">';
    posts.forEach(function(post) {
      html += renderPost(post);
    });
    html += '</div></div>';
    return html;
  }

  function parseMomentsText(text) {
    var lines = text.split("\n");
    var userInfo = {
      name: DEFAULT_USER_INFO.name,
      avatarName: DEFAULT_USER_INFO.avatarName,
      avatarColor: DEFAULT_USER_INFO.avatarColor
    };
    var posts = [];
    var currentSection = "";
    var currentPost = null;

    function pushCurrentPost() {
      if (!currentPost) return;
      currentPost.name = currentPost.name || "未知";
      currentPost.avatarName = currentPost.avatarName || currentPost.name.charAt(0) || "?";
      currentPost.avatarColor = currentPost.avatarColor || "#5B8DB8";
      currentPost.time = currentPost.time || "刚刚";
      currentPost.likes = currentPost.likes || [];
      currentPost.comments = currentPost.comments || [];
      currentPost.images = currentPost.images || [];
      posts.push(currentPost);
      currentPost = null;
    }

    lines.forEach(function(rawLine) {
      var line = rawLine.trim();
      var keyValueMatch;

      if (!line || line.startsWith("#")) {
        return;
      }

      if (line === "[cover]") {
        pushCurrentPost();
        currentSection = "cover";
        return;
      }

      if (line === "[post]") {
        pushCurrentPost();
        currentSection = "post";
        currentPost = {
          likes: [],
          comments: [],
          images: []
        };
        return;
      }

      keyValueMatch = line.match(/^([^=]+)=(.*)$/);
      if (!keyValueMatch) {
        return;
      }

      assignField(
        currentSection,
        keyValueMatch[1].trim(),
        decodeValue(keyValueMatch[2].trim()),
        userInfo,
        currentPost
      );
    });

    pushCurrentPost();

    return {
      userInfo: userInfo,
      posts: posts
    };
  }

  function decodeValue(value) {
    return (value || "").replace(/\\n/g, "\n");
  }

  function assignField(section, key, value, userInfo, currentPost) {
    if (section === "cover") {
      userInfo[key] = value;
      return;
    }

    if (section !== "post" || !currentPost) {
      return;
    }

    switch (key) {
      case "images":
        currentPost.images = createImagePlaceholders(parseInt(value, 10));
        break;
      case "likes":
        currentPost.likes = splitCommaList(value);
        break;
      case "comment":
        currentPost.comments.push(parseComment(value));
        break;
      case "video":
        currentPost.video = value;
        break;
      default:
        currentPost[key] = value;
    }
  }

  function createImagePlaceholders(count) {
    var total = isNaN(count) ? 0 : Math.max(0, count);
    var images = [];
    var i;
    for (i = 0; i < total; i++) {
      images.push({ index: i });
    }
    return images;
  }

  function splitCommaList(value) {
    if (!value) return [];
    return value.split(",").map(function(item) {
      return item.trim();
    }).filter(Boolean);
  }

  function parseComment(value) {
    var parts = value.split("|");
    return {
      author: (parts[0] || "").trim(),
      replyTo: (parts[1] || "").trim(),
      text: parts.slice(2).join("|").trim()
    };
  }

  function loadMomentsText(txtPath, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", txtPath || DEFAULT_MOMENTS_TXT_PATH, true);
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        if (xhr.status === 200 || xhr.status === 0) {
          callback(parseMomentsText(xhr.responseText));
        } else {
          console.error("[MomentsComponents] 加载朋友圈文案失败:", xhr.status, txtPath);
          callback({
            userInfo: DEFAULT_USER_INFO,
            posts: []
          });
        }
      }
    };
    xhr.send();
  }

  function renderMomentsFromData(data) {
    var userInfo = data && data.userInfo ? data.userInfo : DEFAULT_USER_INFO;
    var posts = data && data.posts ? data.posts : [];
    return renderMomentsPage(userInfo, posts);
  }

  function loadMomentsPage(callback, txtPath) {
    loadMomentsText(txtPath || DEFAULT_MOMENTS_TXT_PATH, function(data) {
      callback(renderMomentsFromData(data), data);
    });
  }

  function normalizeLoaderOptions(options) {
    var config = options || {};
    return {
      txtPath: config.txtPath || DEFAULT_MOMENTS_CONFIG.txtPath,
      targetId: config.targetId || DEFAULT_MOMENTS_CONFIG.targetId,
      targetElement: config.targetElement || DEFAULT_MOMENTS_CONFIG.targetElement,
      onLoaded: typeof config.onLoaded === "function" ? config.onLoaded : null
    };
  }

  function openMomentsText(options) {
    var config = normalizeLoaderOptions(options);
    loadMomentsText(config.txtPath, function(data) {
      var html = renderMomentsFromData(data);
      var target = config.targetElement ||
        (config.targetId ? document.getElementById(config.targetId) : null);

      if (target) {
        target.innerHTML = html;
      }

      if (config.onLoaded) {
        config.onLoaded(html, data, config);
      }
    });
  }

  var loaderApi = {
    defaults: {
      moments: DEFAULT_MOMENTS_CONFIG
    },
    open: openMomentsText,
    parse: parseMomentsText,
    load: loadMomentsText,
    render: renderMomentsFromData
  };

  if (typeof window !== "undefined") {
    window.MomentsTextLoader = loaderApi;
  }

  return {
    renderImages: renderImages,
    renderVideo: renderVideo,
    renderLikes: renderLikes,
    renderCommentItem: renderCommentItem,
    renderComments: renderComments,
    renderSocial: renderSocial,
    renderActionsButton: renderActionsButton,
    renderPost: renderPost,
    renderCover: renderCover,
    renderMomentsPage: renderMomentsPage,
    parseMomentsText: parseMomentsText,
    loadMomentsText: loadMomentsText,
    loadMomentsPage: loadMomentsPage,
    renderMomentsFromData: renderMomentsFromData
  };
})();
