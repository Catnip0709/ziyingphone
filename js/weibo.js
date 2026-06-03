/* ============================================
   捡手机文学 · 慕容紫英
   微博应用模块
   ============================================ */

(function () {
  "use strict";

  var WEIBO_PATHS = {
    home: "text/weibo/feed.txt",
    hot: "text/weibo/hot.txt",
    profile: "text/weibo/profile.txt"
  };

  var weiboState = {
    currentTab: "home",
    cache: {
      home: null,
      hot: null,
      profile: null
    },
    eventsBound: false
  };

  function escapeHtml(text) {
    var div = document.createElement("div");
    div.textContent = text || "";
    return div.innerHTML;
  }

  function formatText(text) {
    return escapeHtml(text || "").replace(/\n/g, "<br>");
  }

  function renderImageGrid(count) {
    var html = '<div class="weibo-image-grid image-count-' + count + '">';
    for (var i = 0; i < count; i += 1) {
      html += '<div class="weibo-image-tile">图' + (i + 1) + "</div>";
    }
    html += "</div>";
    return html;
  }

  function getActionIcon(action) {
    if (action === "repost") {
      return '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M7 4H15L12.4 1.6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M13 16H5L7.6 18.4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M15 4V9.2C15 10.4 14 11.4 12.8 11.4H5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M5 16V10.8C5 9.6 6 8.6 7.2 8.6H15" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    }
    if (action === "comment") {
      return '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4.5 5.5H15.5C16.6 5.5 17.5 6.4 17.5 7.5V12C17.5 13.1 16.6 14 15.5 14H9L5 17V14H4.5C3.4 14 2.5 13.1 2.5 12V7.5C2.5 6.4 3.4 5.5 4.5 5.5Z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>';
    }
    return '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 16.8L4.6 11.8C3.2 10.5 3 8.3 4.3 6.8C5.6 5.3 7.8 5.1 9.3 6.4L10 7L10.7 6.4C12.2 5.1 14.4 5.3 15.7 6.8C17 8.3 16.8 10.5 15.4 11.8L10 16.8Z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>';
  }

  function renderActionButton(action, count, active, postIndex) {
    var labelMap = {
      repost: "转发",
      comment: "评论",
      like: "点赞"
    };
    var html = '<button class="weibo-action-btn ' + (active ? "active " : "") + action + '" data-action="' + action + '" data-post-index="' + postIndex + '" type="button">';
    html += '<span class="weibo-action-icon">' + getActionIcon(action) + "</span>";
    html += '<span class="weibo-action-label">' + labelMap[action] + "</span>";
    html += '<span class="weibo-action-count">' + escapeHtml(String(count || 0)) + "</span>";
    html += "</button>";
    return html;
  }

  function renderFeedPost(post, postIndex) {
    var uiState = post.uiState || {};
    var html = '<div class="weibo-card" data-post-card="' + postIndex + '">';
    html += '<div class="weibo-post-header">';
    var weiboPostStyle = window.AvatarUtil
      ? window.AvatarUtil.backgroundStyle(post.avatarName, post.avatarColor || "#5B8DB8", post.user)
      : 'background:' + escapeHtml(post.avatarColor || "#5B8DB8");
    var weiboPostInner = window.AvatarUtil
      ? window.AvatarUtil.text(post.avatarName, post.user)
      : escapeHtml(post.avatarName || "?");
    html += '<div class="weibo-post-avatar" style="' + weiboPostStyle + '">' + escapeHtml(weiboPostInner) + "</div>";
    html += '<div class="weibo-post-user">';
    html += '<div class="weibo-post-name-row">';
    html += '<span class="weibo-post-name">' + escapeHtml(post.user) + "</span>";
    html += '<span class="weibo-post-handle">' + escapeHtml(post.handle) + "</span>";
    html += "</div>";
    html += '<div class="weibo-post-meta">' + escapeHtml(post.time) + " · " + escapeHtml(post.from || "微博") + "</div>";
    html += "</div></div>";
    html += '<div class="weibo-post-content">' + formatText(post.content) + "</div>";
    if (post.images > 0) {
      html += renderImageGrid(post.images);
    }
    if (post.repostUser || post.repostText) {
      html += '<div class="weibo-repost-box">';
      html += '<div class="weibo-repost-user">@' + escapeHtml(post.repostUser || "") + "</div>";
      html += '<div class="weibo-repost-text">' + formatText(post.repostText || "") + "</div>";
      html += "</div>";
    }
    html += '<div class="weibo-action-row">';
    html += renderActionButton("repost", post.reposts || 0, !!uiState.reposted, postIndex);
    html += renderActionButton("comment", post.comments || 0, !!uiState.commenting, postIndex);
    html += renderActionButton("like", post.likes || 0, !!uiState.liked, postIndex);
    html += "</div>";
    if (post.commentList && post.commentList.length) {
      html += '<div class="weibo-comment-box ' + (uiState.commenting ? "active" : "") + '">';
      post.commentList.forEach(function (comment) {
        html += '<div class="weibo-comment-line"><span class="weibo-comment-user">' + escapeHtml(comment.user) + "：</span>" + formatText(comment.text) + "</div>";
      });
      html += "</div>";
    }
    html += "</div>";
    return html;
  }

  function renderHotTopic(topic) {
    var tagClass = "";
    var tagIcon = "";
    if (topic.tag === "爆") {
      tagClass = "tag-boom";
      tagIcon = '<span class="weibo-hot-tag-icon">🔥</span>';
    } else if (topic.tag === "热") {
      tagClass = "tag-hot";
    } else if (topic.tag === "公告") {
      tagClass = "tag-notice";
    } else if (topic.tag === "新") {
      tagClass = "tag-new";
    }
    var html = '<div class="weibo-hot-item">';
    html += '<div class="weibo-hot-rank">' + escapeHtml(String(topic.rank || "")) + "</div>";
    html += '<div class="weibo-hot-main">';
    html += '<div class="weibo-hot-title-row">';
    html += '<div class="weibo-hot-title">' + escapeHtml(topic.title) + "</div>";
    if (topic.tag) {
      html += '<span class="weibo-hot-tag ' + tagClass + '">' + tagIcon + '<span>' + escapeHtml(topic.tag) + "</span></span>";
    }
    html += "</div>";
    html += '<div class="weibo-hot-heat">' + escapeHtml(topic.heat || "") + "</div>";
    html += '<div class="weibo-hot-summary">' + formatText(topic.summary || "") + "</div>";
    html += "</div></div>";
    return html;
  }

  function renderProfileCard(profile) {
    var html = '<div class="weibo-profile-card">';
    html += '<div class="weibo-profile-top">';
    var weiboProfileName = profile.name || "慕容紫英";
    var weiboProfileStyle = window.AvatarUtil
      ? window.AvatarUtil.backgroundStyle(profile.avatarName, profile.avatarColor || "#5B8DB8", weiboProfileName)
      : 'background:' + escapeHtml(profile.avatarColor || "#5B8DB8");
    var weiboProfileInner = window.AvatarUtil
      ? window.AvatarUtil.text(profile.avatarName, weiboProfileName)
      : escapeHtml(profile.avatarName || "英");
    html += '<div class="weibo-profile-avatar" style="' + weiboProfileStyle + '">' + escapeHtml(weiboProfileInner) + "</div>";
    html += '<div class="weibo-profile-main">';
    html += '<div class="weibo-profile-name">' + escapeHtml(profile.name || "慕容紫英") + "</div>";
    html += '<div class="weibo-profile-handle">' + escapeHtml(profile.handle || "") + "</div>";
    html += '<div class="weibo-profile-bio">' + formatText(profile.bio || "") + "</div>";
    html += "</div></div>";
    html += '<div class="weibo-profile-stats">';
    html += '<div class="weibo-profile-stat"><strong>' + escapeHtml(String(profile.following || 0)) + '</strong><span>关注</span></div>';
    html += '<div class="weibo-profile-stat"><strong>' + escapeHtml(String(profile.followers || 0)) + '</strong><span>粉丝</span></div>';
    html += '<div class="weibo-profile-stat"><strong>' + escapeHtml(String(profile.likes || 0)) + '</strong><span>获赞</span></div>';
    html += "</div></div>";
    return html;
  }

  function renderProfileSection(title, items, isLikeSection) {
    var html = '<div class="weibo-section">';
    html += '<div class="weibo-section-title">' + escapeHtml(title) + "</div>";
    if (!items || !items.length) {
      html += '<div class="weibo-section-empty">暂无内容</div>';
    } else {
      items.forEach(function (item) {
        html += '<div class="weibo-card weibo-profile-post">';
        html += '<div class="weibo-profile-post-time">' + escapeHtml(item.time || "") + "</div>";
        html += '<div class="weibo-post-content">' + formatText(item.content || "") + "</div>";
        if (item.images > 0) {
          html += renderImageGrid(item.images);
        }
        if (item.meta) {
          html += '<div class="weibo-profile-post-meta ' + (isLikeSection ? "is-like" : "") + '">' + formatText(item.meta) + "</div>";
        }
        html += "</div>";
      });
    }
    html += "</div>";
    return html;
  }

  function renderTabHeader(tab) {
    if (tab === "hot") {
      return '<div class="weibo-tab-header"><h2>琼华热搜</h2><p>门派内部热点、八卦与公告</p></div>';
    }
    if (tab === "profile") {
      return '<div class="weibo-tab-header"><h2>我的微博</h2><p>状态：在线</p></div>';
    }
    return '<div class="weibo-tab-header"><h2>推荐</h2><p>为你推荐琼华派最新动态</p></div>';
  }

  function renderHomeTab(data) {
    var html = renderTabHeader("home");
    (data || []).forEach(function (post, index) {
      html += renderFeedPost(post, index);
    });
    return html;
  }

  function renderHotTab(data) {
    var html = renderTabHeader("hot");
    (data || []).forEach(function (topic) {
      html += renderHotTopic(topic);
    });
    return html;
  }

  function renderProfileTab(data) {
    var html = renderTabHeader("profile");
    html += renderProfileCard(data || {});
    html += renderProfileSection("个人微博", data.posts || [], false);
    html += renderProfileSection("点赞记录", data.likesList || [], true);
    return html;
  }

  function parseFeedText(text) {
    var posts = [];
    var currentPost = null;

    function pushPost() {
      if (!currentPost) return;
      currentPost.images = parseInt(currentPost.images, 10) || 0;
      currentPost.likes = parseInt(currentPost.likes, 10) || 0;
      currentPost.comments = parseInt(currentPost.comments, 10) || 0;
      currentPost.reposts = parseInt(currentPost.reposts, 10) || 0;
      currentPost.commentList = currentPost.commentList || [];
      currentPost.uiState = currentPost.uiState || {
        liked: false,
        reposted: false,
        commenting: false
      };
      posts.push(currentPost);
      currentPost = null;
    }

    text.split("\n").forEach(function (rawLine) {
      var line = rawLine.trim();
      var match;
      if (!line || line.startsWith("#")) return;
      if (line === "[post]") {
        pushPost();
        currentPost = { commentList: [] };
        return;
      }
      if (!currentPost) return;
      match = line.match(/^([^=]+)=(.*)$/);
      if (!match) return;
      var key = match[1].trim();
      var value = (match[2].trim() || "").replace(/\\n/g, "\n");
      if (key === "comment") {
        var parts = value.split("|");
        currentPost.commentList.push({
          user: parts[0] || "",
          text: parts.slice(1).join("|") || ""
        });
      } else {
        currentPost[key] = value;
      }
    });

    pushPost();
    return posts;
  }

  function parseHotText(text) {
    var topics = [];
    var currentTopic = null;

    function pushTopic() {
      if (!currentTopic) return;
      topics.push(currentTopic);
      currentTopic = null;
    }

    text.split("\n").forEach(function (rawLine) {
      var line = rawLine.trim();
      var match;
      if (!line || line.startsWith("#")) return;
      if (line === "[topic]") {
        pushTopic();
        currentTopic = {};
        return;
      }
      if (!currentTopic) return;
      match = line.match(/^([^=]+)=(.*)$/);
      if (!match) return;
      currentTopic[match[1].trim()] = (match[2].trim() || "").replace(/\\n/g, "\n");
    });

    pushTopic();
    return topics;
  }

  function parseProfileText(text) {
    var profile = {
      posts: [],
      likesList: []
    };
    var currentSection = null;

    function pushSection() {
      if (!currentSection) return;
      currentSection.images = parseInt(currentSection.images, 10) || 0;
      if (currentSection.type === "post") {
        profile.posts.push(currentSection);
      } else if (currentSection.type === "like") {
        profile.likesList.push(currentSection);
      }
      currentSection = null;
    }

    text.split("\n").forEach(function (rawLine) {
      var line = rawLine.trim();
      var match;
      if (!line || line.startsWith("#")) return;
      if (line === "[post]") {
        pushSection();
        currentSection = { type: "post" };
        return;
      }
      if (line === "[like]") {
        pushSection();
        currentSection = { type: "like" };
        return;
      }
      match = line.match(/^([^=]+)=(.*)$/);
      if (!match) return;
      var key = match[1].trim();
      var value = (match[2].trim() || "").replace(/\\n/g, "\n");
      if (currentSection) {
        currentSection[key] = value;
      } else {
        profile[key] = value;
      }
    });

    pushSection();
    return profile;
  }

  function loadText(path, parser, callback) {
    var controller = new AbortController();
    var timeoutId = setTimeout(function () {
      controller.abort();
      callback({
        ok: false,
        error: "timeout"
      });
    }, 10000);

    fetch(path, { signal: controller.signal })
      .then(function (res) {
        clearTimeout(timeoutId);
        if (!res.ok) throw new Error("HTTP " + res.status);
        return res.text();
      })
      .then(function (text) {
        callback({
          ok: true,
          data: parser(text)
        });
      })
      .catch(function (error) {
        clearTimeout(timeoutId);
        callback({
          ok: false,
          error: error && error.message ? error.message : "load_failed"
        });
      });
  }

  function setContentLoading(tab) {
    var content = document.querySelector(".weibo-tab-content");
    if (!content) return;
    content.innerHTML = renderTabHeader(tab) + '<div class="weibo-loading">正在加载微博内容...</div>';
  }

  function setContentError(tab) {
    var content = document.querySelector(".weibo-tab-content");
    if (!content) return;
    content.innerHTML = renderTabHeader(tab) + '<div class="weibo-loading is-error">内容加载失败，点按重试。<button class="weibo-retry-btn" type="button" data-retry-tab="' + tab + '">重新加载</button></div>';
  }

  function renderTabContent(tab, data) {
    if (tab === "hot") return renderHotTab(data || []);
    if (tab === "profile") return renderProfileTab(data || { posts: [], likesList: [] });
    return renderHomeTab(data || []);
  }

  function updateTabUI(tab, data) {
    var content = document.querySelector(".weibo-tab-content");
    var buttons = document.querySelectorAll(".weibo-tabbar-item");
    if (!content) return;
    content.innerHTML = renderTabContent(tab, data);
    buttons.forEach(function (button) {
      button.classList.toggle("active", button.getAttribute("data-tab") === tab);
    });
  }

  function openWeiboTab(tab, forceReload) {
    var parser = tab === "hot" ? parseHotText : (tab === "profile" ? parseProfileText : parseFeedText);
    weiboState.currentTab = tab;

    if (!forceReload && weiboState.cache[tab]) {
      updateTabUI(tab, weiboState.cache[tab]);
      return;
    }

    setContentLoading(tab);
    loadText(WEIBO_PATHS[tab], parser, function (result) {
      if (!result || !result.ok) {
        weiboState.cache[tab] = null;
        setContentError(tab);
        return;
      }
      weiboState.cache[tab] = result.data || (tab === "profile" ? { posts: [], likesList: [] } : []);
      updateTabUI(tab, weiboState.cache[tab]);
    });
  }

  function rerenderHomeTab() {
    if (weiboState.currentTab === "home" && weiboState.cache.home) {
      updateTabUI("home", weiboState.cache.home);
    }
  }

  function renderWeiboShell() {
    return '' +
      '<div class="weibo-app">' +
        '<div class="weibo-tab-content"></div>' +
        '<div class="weibo-tabbar">' +
          '<button class="weibo-tabbar-item active" data-tab="home">主页</button>' +
          '<button class="weibo-tabbar-item" data-tab="hot">热搜</button>' +
          '<button class="weibo-tabbar-item" data-tab="profile">我的</button>' +
        '</div>' +
      '</div>';
  }

  function bindWeiboEvents() {
    if (!weiboState.eventsBound) {
      weiboState.eventsBound = true;
      document.addEventListener("click", function (e) {
        var retryButton = e.target.closest(".weibo-retry-btn");
        var tabButton = e.target.closest(".weibo-tabbar-item");
        var actionButton = e.target.closest(".weibo-action-btn");
        var appContent = document.getElementById("appContent");
        if (!appContent) {
          return;
        }

        if (retryButton && appContent.contains(retryButton)) {
          openWeiboTab(retryButton.getAttribute("data-retry-tab"), true);
          return;
        }

        if (tabButton && appContent.contains(tabButton)) {
          openWeiboTab(tabButton.getAttribute("data-tab"));
          return;
        }

        if (actionButton && appContent.contains(actionButton)) {
          var action = actionButton.getAttribute("data-action");
          var postIndex = parseInt(actionButton.getAttribute("data-post-index"), 10);
          var homeFeed = weiboState.cache.home;
          var post = homeFeed && homeFeed[postIndex];
          if (!post) {
            return;
          }

          post.uiState = post.uiState || {
            liked: false,
            reposted: false,
            commenting: false
          };

          if (action === "like") {
            post.uiState.liked = !post.uiState.liked;
            post.likes += post.uiState.liked ? 1 : -1;
          } else if (action === "repost") {
            post.uiState.reposted = !post.uiState.reposted;
            post.reposts += post.uiState.reposted ? 1 : -1;
          } else if (action === "comment") {
            post.uiState.commenting = !post.uiState.commenting;
          }

          rerenderHomeTab();
        }
      });
    }

    openWeiboTab(weiboState.currentTab || "home");
  }

  window.WeiboTextLoader = {
    paths: WEIBO_PATHS,
    openTab: openWeiboTab,
    parseFeed: parseFeedText,
    parseHot: parseHotText,
    parseProfile: parseProfileText
  };

  if (window.AppCore) {
    window.AppCore.registerApp("weibo", renderWeiboShell, bindWeiboEvents);
  }
})();
