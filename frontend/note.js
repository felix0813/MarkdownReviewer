const urlParams = new URLSearchParams(window.location.search);
const noteId = urlParams.get("noteId");

const noteTitle = document.getElementById("noteTitle");
const noteMeta = document.getElementById("noteMeta");
const noteContent = document.getElementById("noteContent");
const editBtn = document.getElementById("editBtn");
const deleteBtn = document.getElementById("deleteBtn");
const detailStatus = document.getElementById("detailStatus");

function setStatus(message, isError = false) {
  detailStatus.textContent = message;
  detailStatus.classList.toggle("error", isError);
}

function formatDate(isoTime) {
  const date = new Date(isoTime);
  if (Number.isNaN(date.getTime())) return "未知时间";
  return date.toLocaleString("zh-CN", { hour12: false });
}

function renderMarkdown(markdownText) {
  const escaped = markdownText
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  const html = escaped
    .replace(/^### (.*$)/gim, "<h3>$1</h3>")
    .replace(/^## (.*$)/gim, "<h2>$1</h2>")
    .replace(/^# (.*$)/gim, "<h1>$1</h1>")
    .replace(/\*\*(.*?)\*\*/gim, "<strong>$1</strong>")
    .replace(/^\- (.*$)/gim, "<li>$1</li>");

  return html
    .replace(/(<li>.*<\/li>\n?)+/gim, (match) => `<ul>${match}</ul>`)
    .split(/\n{2,}/)
    .map((block) => {
      const trimmed = block.trim();
      if (!trimmed) return "";
      if (/^<(h1|h2|h3|ul)/i.test(trimmed)) return trimmed;
      return `<p>${trimmed.replace(/\n/g, "<br/>")}</p>`;
    })
    .join("\n");
}

async function loadNote() {
  if (!noteId) {
    noteTitle.textContent = "缺少笔记 ID";
    setStatus("请从首页选择笔记后再查看详情", true);
    editBtn.href = "editor.html";
    return;
  }

  const note = await window.notesService.getNoteById(noteId);
  if (!note) {
    noteTitle.textContent = "笔记不存在";
    setStatus("未找到对应笔记，可能已删除", true);
    editBtn.href = "editor.html";
    deleteBtn.disabled = true;
    return;
  }

  noteTitle.textContent = note.title || "未命名笔记";
  noteMeta.textContent = `分类：${note.category || "未分类"} · 更新时间：${formatDate(
    note.uploadedAt
  )}`;
  noteContent.innerHTML = renderMarkdown(note.content || "暂无内容");
  editBtn.href = `editor.html?noteId=${encodeURIComponent(noteId)}`;
}

async function deleteCurrentNote() {
  if (!noteId) return;

  const confirmed = window.confirm("确认删除这条笔记吗？删除后不可恢复。");
  if (!confirmed) return;

  try {
    await window.notesService.deleteNote(noteId);
    setStatus("删除成功，正在返回首页...");
    setTimeout(() => {
      window.location.href = "index.html";
    }, 400);
  } catch (error) {
    setStatus(`删除失败：${error.message}`, true);
  }
}

deleteBtn.addEventListener("click", deleteCurrentNote);
loadNote();
