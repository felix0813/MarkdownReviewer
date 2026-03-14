const notes = [
  {
    id: crypto.randomUUID(),
    title: "示例笔记",
    markdown: "# 欢迎使用\n\n- 左侧可搜索笔记\n- 右侧可编辑与预览",
  },
];

let selectedId = notes[0].id;

const notesList = document.getElementById("notesList");
const searchInput = document.getElementById("searchInput");
const titleInput = document.getElementById("titleInput");
const markdownInput = document.getElementById("markdownInput");
const preview = document.getElementById("preview");
const saveBtn = document.getElementById("saveBtn");

function renderMarkdown(markdownText) {
  return markdownText
    .replace(/^### (.*$)/gim, "<h3>$1</h3>")
    .replace(/^## (.*$)/gim, "<h2>$1</h2>")
    .replace(/^# (.*$)/gim, "<h1>$1</h1>")
    .replace(/^\- (.*$)/gim, "<li>$1</li>")
    .replace(/\*\*(.*)\*\*/gim, "<strong>$1</strong>")
    .replace(/\n{2,}/gim, "<br/><br/>");
}

function getSelectedNote() {
  return notes.find((note) => note.id === selectedId) || notes[0];
}

function renderList() {
  const query = searchInput.value.trim().toLowerCase();
  const filtered = notes.filter(
    (note) =>
      note.title.toLowerCase().includes(query) ||
      note.markdown.toLowerCase().includes(query)
  );

  notesList.innerHTML = filtered
    .map(
      (note) =>
        `<li data-id="${note.id}" class="${note.id === selectedId ? "active" : ""}">
          <strong>${note.title || "未命名笔记"}</strong>
        </li>`
    )
    .join("");
}

function renderEditor() {
  const note = getSelectedNote();
  titleInput.value = note.title;
  markdownInput.value = note.markdown;
  preview.innerHTML = renderMarkdown(note.markdown);
}

notesList.addEventListener("click", (event) => {
  const item = event.target.closest("li[data-id]");
  if (!item) return;
  selectedId = item.dataset.id;
  renderList();
  renderEditor();
});

searchInput.addEventListener("input", renderList);

markdownInput.addEventListener("input", () => {
  preview.innerHTML = renderMarkdown(markdownInput.value);
});

saveBtn.addEventListener("click", () => {
  const title = titleInput.value.trim();
  const markdown = markdownInput.value;

  const note = getSelectedNote();
  note.title = title || "未命名笔记";
  note.markdown = markdown;

  renderList();
  renderEditor();
});

renderList();
renderEditor();
