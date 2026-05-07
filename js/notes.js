/* ============================================
   Notes App - 备忘录应用
   ============================================ */

(function() {
  "use strict";

  var NOTES_INDEX_PATH = "text/note/notes_index.txt";
  var NOTES_BASE_PATH = "text/note/";
  var notesIndex = [];
  var noteDetailCache = {};
  var notesIndexLoaded = false;
  var notesEventsBound = false;

  function escapeHtml(text) {
    var div = document.createElement("div");
    div.textContent = text || "";
    return div.innerHTML;
  }

  function formatText(text) {
    return escapeHtml(text || "").replace(/\n/g, "<br>");
  }

  function loadTextFile(path, callback) {
    var controller = new AbortController();
    var timeoutId = setTimeout(function() {
      controller.abort();
      callback("");
    }, 10000);

    fetch(path, { signal: controller.signal })
      .then(function(res) {
        clearTimeout(timeoutId);
        if (!res.ok) {
          throw new Error("HTTP " + res.status);
        }
        return res.text();
      })
      .then(function(text) {
        callback(text);
      })
      .catch(function() {
        clearTimeout(timeoutId);
        callback("");
      });
  }

  function parseNotesIndex(text) {
    var notes = [];
    var currentNote = null;

    function pushCurrentNote() {
      if (!currentNote) return;
      currentNote.id = parseInt(currentNote.id, 10) || Date.now();
      currentNote.title = currentNote.title || "未命名备忘录";
      currentNote.date = currentNote.date || "";
      currentNote.preview = currentNote.preview || "";
      currentNote.file = currentNote.file || "";
      notes.push(currentNote);
      currentNote = null;
    }

    text.split("\n").forEach(function(rawLine) {
      var line = rawLine.trim();
      var match;

      if (!line || line.startsWith("#")) {
        return;
      }

      if (line === "[note]") {
        pushCurrentNote();
        currentNote = {};
        return;
      }

      match = line.match(/^([^=]+)=(.*)$/);
      if (!match || !currentNote) {
        return;
      }

      currentNote[match[1].trim()] = (match[2].trim() || "").replace(/\\n/g, "\n");
    });

    pushCurrentNote();
    return notes;
  }

  function parseNoteDetail(text) {
    var note = {
      title: "",
      date: "",
      content: []
    };
    var currentEntry = null;

    function pushEntry() {
      if (!currentEntry) return;
      note.content.push({
        date: currentEntry.date || "",
        text: currentEntry.text || ""
      });
      currentEntry = null;
    }

    text.split("\n").forEach(function(rawLine) {
      var line = rawLine.trim();
      var match;

      if (!line || line.startsWith("#")) {
        return;
      }

      if (line === "[entry]") {
        pushEntry();
        currentEntry = {};
        return;
      }

      match = line.match(/^([^=]+)=(.*)$/);
      if (!match) {
        return;
      }

      var key = match[1].trim();
      var value = (match[2].trim() || "").replace(/\\n/g, "\n");

      if (currentEntry) {
        currentEntry[key] = value;
      } else {
        note[key] = value;
      }
    });

    pushEntry();
    return note;
  }

  function renderLoadingState() {
    return '<div class="notes-list"><div class="notes-list-header"><h1>备忘录</h1><div class="notes-search-wrapper"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="7" cy="7" r="5"/><path d="M11 11l3 3"/></svg><input type="text" class="notes-search" placeholder="搜索"></div></div><div class="notes-group-title">iCloud</div><div class="notes-item"><div class="notes-item-title">正在加载</div><div class="notes-item-preview">正在读取备忘录文本内容...</div><div class="notes-item-date"></div></div></div>';
  }

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

    notesIndex.forEach(function(note) {
      html += '<div class="notes-item" data-note-id="' + note.id + '">';
      html += '<div class="notes-item-title">' + escapeHtml(note.title) + '</div>';
      html += '<div class="notes-item-preview">' + escapeHtml(note.preview) + '</div>';
      html += '<div class="notes-item-date">' + escapeHtml(note.date) + '</div>';
      html += '</div>';
    });

    html += '</div>';
    return html;
  }

  function renderNotesDetail(noteId) {
    var note = noteDetailCache[noteId];
    if (!note) return "";

    var html = '<div class="notes-detail">';
    html += '<div class="notes-detail-header">';
    html += '<div class="notes-detail-title">' + escapeHtml(note.title) + '</div>';
    html += '<div class="notes-detail-meta">' + escapeHtml(note.date) + '</div>';
    html += '</div>';
    html += '<div class="notes-detail-content">';

    note.content.forEach(function(item) {
      html += '<p class="date-line">' + escapeHtml(item.date) + '</p>';
      html += '<p class="note-text">' + formatText(item.text) + '</p>';
    });

    html += '</div></div>';
    return html;
  }

  function loadNotesIndex(callback) {
    if (notesIndexLoaded) {
      callback(notesIndex);
      return;
    }

    loadTextFile(NOTES_INDEX_PATH, function(text) {
      notesIndex = parseNotesIndex(text);
      notesIndexLoaded = true;
      callback(notesIndex);
    });
  }

  function loadNoteDetail(noteId, callback) {
    if (noteDetailCache[noteId]) {
      callback(noteDetailCache[noteId]);
      return;
    }

    var noteMeta = notesIndex.find(function(note) {
      return note.id === noteId;
    });

    if (!noteMeta || !noteMeta.file) {
      callback(null);
      return;
    }

    loadTextFile(NOTES_BASE_PATH + noteMeta.file, function(text) {
      var detail = parseNoteDetail(text);
      detail.id = noteId;
      noteDetailCache[noteId] = detail;
      callback(detail);
    });
  }

  function renderNotesApp() {
    if (!notesIndexLoaded) {
      return renderLoadingState();
    }
    return renderNotesList();
  }

  function openNotesList() {
    var appContent = document.getElementById("appContent");
    if (!appContent) return;

    appContent.innerHTML = renderLoadingState();
    loadNotesIndex(function() {
      appContent.innerHTML = renderNotesList();
    });
  }

  function openNotesDetail(noteId) {
    var appContent = document.getElementById("appContent");
    if (!appContent) return;

    appContent.innerHTML = '<div class="notes-detail"><div class="notes-detail-header"><div class="notes-detail-title">正在加载</div><div class="notes-detail-meta"></div></div><div class="notes-detail-content"><p class="note-text">正在读取备忘录正文...</p></div></div>';

    loadNoteDetail(noteId, function(note) {
      if (!note) return;
      document.getElementById("appTitle").textContent = "备忘录";
      appContent.innerHTML = renderNotesDetail(noteId);
    });
  }

  function bindNotesEvents() {
    if (!notesEventsBound) {
      notesEventsBound = true;

      document.addEventListener("click", function(e) {
        var noteItem = e.target.closest(".notes-item");
        var appContent = document.getElementById("appContent");
        if (!noteItem || !appContent || !appContent.contains(noteItem)) {
          return;
        }

        var noteId = parseInt(noteItem.getAttribute("data-note-id"), 10);
        if (isNaN(noteId)) {
          return;
        }
        openNotesDetail(noteId);
      });
    }

    openNotesList();
  }

  window.NotesTextLoader = {
    loadIndex: loadNotesIndex,
    loadDetail: loadNoteDetail,
    parseIndex: parseNotesIndex,
    parseDetail: parseNoteDetail
  };

  // 注册到AppCore
  window.AppCore.registerApp("notes", renderNotesApp, bindNotesEvents);
})();
