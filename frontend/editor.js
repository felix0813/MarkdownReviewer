const titleInput = document.getElementById("titleInput");
const categoryInput = document.getElementById("categoryInput");
const markdownInput = document.getElementById("markdownInput");
const preview = document.getElementById("preview");
const uploadInput = document.getElementById("uploadInput");
const uploadBtn = document.getElementById("uploadBtn");
const saveBtn = document.getElementById("saveBtn");
const statusMessage = document.getElementById("statusMessage");

const urlParams = new URLSearchParams(window.location.search);
const noteId = urlParams.get("noteId");

function setStatus(message, isError = false) {
  statusMessage.textContent = message;
  statusMessage.classList.toggle("error", isError);
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

function syncPreview() {
  preview.innerHTML = renderMarkdown(markdownInput.value);
}

async function loadNote() {
  if (!noteId) return;

  const note = await window.notesService.getNoteById(noteId);
  if (!note) {
    setStatus("加载笔记失败：未找到笔记", true);
    return;
  }

  titleInput.value = note.title ?? "";
  categoryInput.value = note.category ?? "";
  markdownInput.value = note.content ?? "";
  syncPreview();
  setStatus("笔记已加载");
}

async function saveNote() {
  const payload = {
    title: titleInput.value.trim() || "未命名笔记",
    category: categoryInput.value,
    content: markdownInput.value,
  };

  try {
    const result = await window.notesService.saveNote(payload, noteId);
    setStatus(`保存成功：${result.message ?? "笔记已同步"}`);
  } catch (error) {
    setStatus(`保存失败：${error.message}`, true);
  }
}

async function uploadMarkdown() {
  const file = uploadInput.files?.[0];
  if (!file) {
    setStatus("请先选择要上传的 Markdown 文件", true);
    return;
  }

  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await fetch(`${window.notesService.API_BASE}/notes/upload`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) throw new Error("上传失败");

    const payload = await response.json();
    titleInput.value = payload.title ?? titleInput.value;
    categoryInput.value = payload.category ?? categoryInput.value;
    markdownInput.value = payload.content ?? markdownInput.value;
    syncPreview();
    setStatus("上传成功，内容已填充到编辑器");
  } catch (error) {
    setStatus(`上传失败：${error.message}`, true);
  }
}

markdownInput.addEventListener("input", syncPreview);
saveBtn.addEventListener("click", saveNote);
uploadBtn.addEventListener("click", uploadMarkdown);

syncPreview();
loadNote();
