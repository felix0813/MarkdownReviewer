const categoryTreeData = [
  {
    name: "工作",
    children: ["产品", "会议", "项目文档"],
  },
  {
    name: "学习",
    children: ["前端", "后端", "算法"],
  },
  {
    name: "生活",
    children: ["出行", "阅读", "清单"],
  },
  {
    name: "归档",
    children: ["2025", "2026"],
  },
];

const notesList = document.getElementById("notesList");
const recentList = document.getElementById("recentList");
const categoryTree = document.getElementById("categoryTree");
const searchInput = document.getElementById("searchInput");
const noteItemTemplate = document.getElementById("noteItemTemplate");

let notes = [];

function formatDate(isoTime) {
  const date = new Date(isoTime);
  if (Number.isNaN(date.getTime())) return "未知时间";
  return date.toLocaleString("zh-CN", { hour12: false });
}

function getSummary(text) {
  return text.replace(/[#>*`\-]/g, "").slice(0, 70) || "暂无内容";
}

function renderCategories() {
  categoryTree.innerHTML = "";

  categoryTreeData.forEach((rootCategory) => {
    const node = document.createElement("li");
    node.className = "category-node";

    const toggle = document.createElement("button");
    toggle.className = "category-toggle";
    toggle.type = "button";
    toggle.innerHTML = `<span>${rootCategory.name}</span><span>▾</span>`;

    const childrenList = document.createElement("ul");
    childrenList.className = "category-children";
    rootCategory.children.forEach((child) => {
      const childLi = document.createElement("li");
      childLi.textContent = child;
      childrenList.appendChild(childLi);
    });

    toggle.addEventListener("click", () => {
      childrenList.classList.toggle("expanded");
    });

    node.append(toggle, childrenList);
    categoryTree.appendChild(node);
  });
}

function buildNoteItem(note) {
  const fragment = noteItemTemplate.content.cloneNode(true);
  const noteItem = fragment.querySelector(".note-item");
  const noteTitle = fragment.querySelector(".note-title");
  const noteCategory = fragment.querySelector(".note-category");
  const noteSummary = fragment.querySelector(".note-summary");
  const viewBtn = fragment.querySelector('[data-role="view"]');
  const editBtn = fragment.querySelector('[data-role="edit"]');

  noteTitle.textContent = note.title;
  noteCategory.textContent = note.category;
  noteSummary.textContent = getSummary(note.content || "");

  viewBtn.href = `note.html?noteId=${encodeURIComponent(note.id)}`;
  editBtn.href = `editor.html?noteId=${encodeURIComponent(note.id)}`;

  return noteItem;
}

function renderNotes(filteredNotes) {
  notesList.innerHTML = "";

  if (!filteredNotes.length) {
    notesList.innerHTML = "<li class='note-item'>未找到符合条件的笔记。</li>";
    return;
  }

  filteredNotes.forEach((note) => {
    notesList.appendChild(buildNoteItem(note));
  });
}

function renderRecent(list) {
  recentList.innerHTML = "";
  const sorted = [...list]
    .sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt))
    .slice(0, 5);

  sorted.forEach((note) => {
    const li = document.createElement("li");
    li.className = "recent-item";
    li.innerHTML = `<strong>${note.title}</strong><p>${formatDate(note.uploadedAt)}</p>`;
    recentList.appendChild(li);
  });
}

function filterNotes(query) {
  const keyword = query.trim().toLowerCase();
  if (!keyword) return notes;

  return notes.filter((note) => {
    return (
      note.title.toLowerCase().includes(keyword) ||
      (note.content || "").toLowerCase().includes(keyword) ||
      (note.category || "").toLowerCase().includes(keyword)
    );
  });
}

async function fetchNotes() {
  notes = await window.notesService.getNotes();
  renderNotes(notes);
  renderRecent(notes);
}

searchInput.addEventListener("input", () => {
  renderNotes(filterNotes(searchInput.value));
});

renderCategories();
fetchNotes();
