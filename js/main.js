/* ============================================
   捡手机文学 · 慕容紫英
   主交互逻辑
   ============================================ */

(function () {
  "use strict";

  // ---------- DOM ----------
  const statusTime  = document.getElementById("statusTime");
  const pageHome    = document.getElementById("pageHome");
  const pageApp     = document.getElementById("pageApp");
  const backBtn     = document.getElementById("backBtn");
  const appTitle    = document.getElementById("appTitle");
  const appContent  = document.getElementById("appContent");
  const appIcons    = document.querySelectorAll(".app-icon");

  const APP_NAMES = {
    notes:    "备忘录",
    wechat:   "微信",
    weibo:    "微博",
    phone:    "电话",
    messages: "短信",
    photos:   "相册",
  };

  // ---------- 备忘录数据 ----------
  const notesData = [
    {
      id: 1,
      title: "菱纱的寒症发作时间",
      date: "2024年5月7日",
      preview: "记录菱纱近一年来寒症发作的情况，每次发作时的症状与持续时间...",
      content: [
        {
          date: "2024年5月3日",
          text: "今日丑时，菱纱寒症再次发作。她面色苍白如纸，双手冰凉，整个人蜷缩在床角颤抖不止。我以灵力为她驱寒，约莫一个时辰后才稍有好转。她说这次发作比上次更难受，胸口像被冰针刺穿一般。"
        },
        {
          date: "2024年4月18日",
          text: "清明过后，菱纱的身体似乎更差了些。今日申时便开始发作，比往常早了许多。她强撑着不让我担心，但我分明看到她额头的冷汗和微微发紫的唇色。寒气侵入骨髓，我怕是..."
        },
        {
          date: "2024年3月21日",
          text: "春分。本该是阳气渐盛之时，菱纱却在寅时被寒症折磨醒。她说这次发作时，眼前出现了许多幻象，都是些已经离去的故人。我握着她的手，感受着那刺骨的寒意，心中隐隐作痛。"
        },
        {
          date: "2024年2月14日",
          text: "元宵刚过，菱纱的寒症又发作了。这次持续了将近两个时辰，比以往任何一次都要长。她虚弱地靠在我肩上，轻声说：「紫英，我是不是...活不过这个春天了？」我紧紧握住她的手，不知该如何作答。"
        },
        {
          date: "2024年1月28日",
          text: "除夕夜，本该是团圆喜庆之时，菱纱却在亥时发作。她强忍着疼痛，不想破坏大家的兴致。我找了个借口带她离开，在雪地里为她运功驱寒。她笑着说：「紫英，有你在身边，再冷的寒症我也不怕。」"
        },
        {
          date: "2023年12月15日",
          text: "入冬以来，菱纱的寒症发作愈发频繁。今日已是本月第三次。她的身体每况愈下，我能做的却只有以灵力暂时压制。望舒剑的寒气与她的体质相冲，这是早已注定的宿命，可我..."
        },
        {
          date: "2023年11月8日",
          text: "立冬。菱纱今日未时便开始发作，比预想中更早。她说最近总是感到疲惫，连御剑飞行都觉得吃力。我暗自决定，要更加密切地关注她的身体状况。"
        },
        {
          date: "2023年10月1日",
          text: "今日菱纱寒症发作，恰逢我们途经一处温泉。我带她在温泉边休息，温热的水汽似乎让她的症状缓解了不少。她靠在我肩上，轻声说：「紫英，如果可以，我真想就这样一直待下去...」"
        }
      ]
    }
  ];

  // ---------- 状态栏时钟 ----------
  function updateClock() {
    const now = new Date();
    const h = now.getHours();
    const m = String(now.getMinutes()).padStart(2, "0");
    statusTime.textContent = h + ":" + m;
  }
  updateClock();
  setInterval(updateClock, 10000);

  // ---------- 页面切换 ----------
  function openApp(name) {
    appTitle.textContent = APP_NAMES[name] || name;
    loadAppContent(name);
    pageHome.classList.remove("active");
    pageHome.classList.add("hidden-left");
    pageApp.classList.remove("hidden-right");
    pageApp.classList.add("active");
  }

  function goHome() {
    pageApp.classList.remove("active");
    pageApp.classList.add("hidden-right");
    pageHome.classList.remove("hidden-left");
    pageHome.classList.add("active");
    appContent.innerHTML = "";
  }

  // ---------- 备忘录列表页 ----------
  function renderNotesList() {
    var html = '<div class="notes-list">';
    html += '<div class="notes-list-header">';
    html += '<h1>备忘录</h1>';
    html += '<div class="notes-search-wrapper">';
    html += '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">';
    html += '<circle cx="7" cy="7" r="5"/><path d="M11 11l3 3"/></svg>';
    html += '<input type="text" class="notes-search" placeholder="搜索">';
    html += '</div></div>';
    html += '<div class="notes-group-title">iCloud</div>';
    
    notesData.forEach(function(note) {
      html += '<div class="notes-item" data-note-id="' + note.id + '">';
      html += '<div class="notes-item-title">' + note.title + '</div>';
      html += '<div class="notes-item-preview">' + note.preview + '</div>';
      html += '<div class="notes-item-date">' + note.date + '</div>';
      html += '</div>';
    });
    
    html += '</div>';
    return html;
  }

  // ---------- 备忘录详情页 ----------
  function renderNotesDetail(noteId) {
    var note = notesData.find(function(n) { return n.id === noteId; });
    if (!note) return '';
    
    var html = '<div class="notes-detail">';
    html += '<div class="notes-detail-header">';
    html += '<div class="notes-detail-title">' + note.title + '</div>';
    html += '<div class="notes-detail-meta">' + note.date + '</div>';
    html += '</div>';
    html += '<div class="notes-detail-content">';
    
    note.content.forEach(function(item) {
      html += '<p class="date-line">' + item.date + '</p>';
      html += '<p class="note-text">' + item.text + '</p>';
    });
    
    html += '</div></div>';
    return html;
  }

  // ---------- APP 内容加载 ----------
  function loadAppContent(name) {
    appContent.innerHTML = "";
    var html = "";
    switch (name) {
      case "notes":    html = renderNotesList(); break;
      case "wechat":   html = placeholder("微信");   break;
      case "weibo":    html = placeholder("微博");   break;
      case "phone":    html = placeholder("电话");   break;
      case "messages": html = placeholder("短信");   break;
      case "photos":   html = placeholder("相册");   break;
      default:         html = placeholder(name);
    }
    appContent.innerHTML = html;
    
    // 绑定备忘录点击事件
    if (name === "notes") {
      bindNotesEvents();
    }
  }

  // ---------- 备忘录事件绑定 ----------
  function bindNotesEvents() {
    var items = document.querySelectorAll(".notes-item");
    items.forEach(function(item) {
      item.addEventListener("click", function() {
        var noteId = parseInt(this.getAttribute("data-note-id"));
        appTitle.textContent = "备忘录";
        appContent.innerHTML = renderNotesDetail(noteId);
      });
    });
  }

  function placeholder(name) {
    return '<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;padding:40px;text-align:center">'
      + '<div style="width:72px;height:72px;border-radius:18px;background:rgba(255,255,255,0.06);margin-bottom:16px"></div>'
      + '<p style="color:rgba(255,255,255,0.4);font-size:14px;line-height:1.6">' + name + ' · 暂无内容</p>'
      + '</div>';
  }

  // ---------- 事件绑定 ----------
  appIcons.forEach(function (icon) {
    icon.addEventListener("click", function () {
      var name = this.getAttribute("data-app");
      if (name) openApp(name);
    });
  });

  backBtn.addEventListener("click", goHome);

  console.log("[捡手机文学] 慕容紫英的手机已启动");
})();
