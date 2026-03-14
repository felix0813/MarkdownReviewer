const API_BASE = "http://localhost:8080/api";

const fallbackNotes = [
  {
    id: "1",
    title: "产品需求整理",
    category: "工作/产品",
    content: "# 产品需求\n\n梳理新版 Markdown Review 功能。",
    uploadedAt: "2026-03-10T10:15:00Z",
    fileUrl: "#",
  },
  {
    id: "2",
    title: "前端学习清单",
    category: "学习/前端",
    content: "- 学习 fetch\n- 学习模块化",
    uploadedAt: "2026-03-13T08:20:00Z",
    fileUrl: "#",
  },
  {
    id: "3",
    title: "旅行计划",
    category: "生活/出行",
    content: "## 旅行路线\n\n计划周末去爬山。",
    uploadedAt: "2026-03-12T14:00:00Z",
    fileUrl: "#",
  },
];

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
  noteSummary.textContent = getSummary(note.content);

  viewBtn.href = note.fileUrl || "#";
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
      note.content.toLowerCase().includes(keyword) ||
      note.category.toLowerCase().includes(keyword)
    );
  });
}

async function fetchNotes() {
  try {
    const response = await fetch(`${API_BASE}/notes`);
    if (!response.ok) throw new Error("无法获取笔记列表");
    const payload = await response.json();
    notes = Array.isArray(payload) ? payload : payload.data ?? fallbackNotes;
  } catch (error) {
    console.warn("加载后端数据失败，使用前端示例数据。", error);
    notes = fallbackNotes;
  }

  renderNotes(notes);
  renderRecent(notes);
}

searchInput.addEventListener("input", () => {
  renderNotes(filterNotes(searchInput.value));
});

renderCategories();
fetchNotes();
