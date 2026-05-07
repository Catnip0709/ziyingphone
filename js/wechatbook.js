/* ============================================
   捡手机文学 · 慕容紫英
   微信读书应用
   ============================================ */

(function () {
  "use strict";

  var books = [
    { title: "《太清御剑要诀》", meta: "剑诀总纲 · 上卷", desc: "记载琼华上乘御剑心法与运气门径，重在稳息守意。" },
    { title: "《琼华派山门纪略》", meta: "门派史志", desc: "梳理琼华历代掌门、门规更替与迁峰旧闻，考据颇详。" },
    { title: "《寒铁铸锋录》", meta: "铸剑杂记", desc: "专述寒铁、玄晶与百炼火候，对铸剑工序记述细密。" },
    { title: "《昆仑矿脉图考》", meta: "矿石图谱", desc: "记录昆仑周边矿脉走向与矿石性质，可用于炼器择材。" },
    { title: "《三十六路承影剑式》", meta: "剑法谱录", desc: "以图解形式拆分剑路，重心法衔接与步法起落。" },
    { title: "《灵石淬刃法》", meta: "炼器心得", desc: "讨论灵石入炉、淬火与护刃之法，兼记失败案例。" },
    { title: "《琼华旧事拾遗》", meta: "逸闻别录", desc: "收录门中前辈行止、试剑典故与几处未入正史的传闻。" },
    { title: "《玄霜剑气论》", meta: "心法札记", desc: "从剑气流转、寒意聚散入手，辨析出剑前后的气机控制。" },
    { title: "《百矿识真》", meta: "矿材辨析", desc: "分门别类讲述赤铜、乌金、青冥砂等矿材的纹理与用途。" },
    { title: "《金瓶梅》", meta: "奇书异卷", desc: "……" }
  ];

  function escapeHtml(text) {
    var div = document.createElement("div");
    div.textContent = text || "";
    return div.innerHTML;
  }

  function renderWechatBookApp() {
    var html = '<div class="weread-app">';
    html += '<div class="weread-header">';
    html += '<h1>书架</h1>';
    html += '<div class="weread-subtitle">微信读书 · 我的藏书</div>';
    html += '</div>';
    html += '<div class="weread-list">';

    books.forEach(function (book, index) {
      html += '<div class="weread-book-card ' + (index === books.length - 1 ? "is-easter-egg" : "") + '">';
      html += '<div class="weread-book-cover">' + escapeHtml(String(index + 1).padStart(2, "0")) + '</div>';
      html += '<div class="weread-book-main">';
      html += '<div class="weread-book-title">' + escapeHtml(book.title) + '</div>';
      html += '<div class="weread-book-meta">' + escapeHtml(book.meta) + '</div>';
      html += '<div class="weread-book-desc">' + escapeHtml(book.desc) + '</div>';
      html += '</div></div>';
    });

    html += '</div></div>';
    return html;
  }

  if (window.AppCore) {
    window.AppCore.registerApp("wechatbook", renderWechatBookApp, function () {});
  }
})();
