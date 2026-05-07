/* ============================================
   Moments Components - 朋友圈组件模块
   可复用的朋友圈帖子组件
   ============================================ */

var MomentsComponents = (function() {
  "use strict";

  function escapeHtml(text) {
    var div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
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
    images.forEach(function(img, i) {
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
      html += '<div class="moments-post-text">' + escapeHtml(post.text) + '</div>';
    }
    if (post.remind) {
      html += '<div class="moments-post-remind">' + escapeHtml(post.remind) + '</div>';
    }
    if (post.blocked) {
      html += '<div class="moments-post-blocked">' + escapeHtml(post.blocked) + '</div>';
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
    renderMomentsPage: renderMomentsPage
  };
})();
