const API_BASE = "http://localhost:8080/api";
const NOTES_STORAGE_KEY = "markdown-reviewer-notes";

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

function readLocalNotes() {
  try {
    const raw = localStorage.getItem(NOTES_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(fallbackNotes));
      return [...fallbackNotes];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [...fallbackNotes];
  } catch {
    return [...fallbackNotes];
  }
}

function writeLocalNotes(list) {
  localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(list));
}

function normalizePayload(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
}

function buildNewId() {
  if (window.crypto?.randomUUID) return window.crypto.randomUUID();
  return String(Date.now());
}

window.notesService = {
  API_BASE,

  async getNotes() {
    try {
      const response = await fetch(`${API_BASE}/notes`);
      if (!response.ok) throw new Error("无法获取笔记列表");
      const payload = await response.json();
      const list = normalizePayload(payload);
      if (list.length) writeLocalNotes(list);
      return list.length ? list : readLocalNotes();
    } catch {
      return readLocalNotes();
    }
  },

  async getNoteById(noteId) {
    try {
      const response = await fetch(`${API_BASE}/notes/${encodeURIComponent(noteId)}`);
      if (!response.ok) throw new Error("获取笔记详情失败");
      return await response.json();
    } catch {
      const localList = readLocalNotes();
      return localList.find((note) => note.id === noteId) || null;
    }
  },

  async saveNote(payload, noteId) {
    const method = noteId ? "PUT" : "POST";
    const endpoint = noteId
      ? `${API_BASE}/notes/${encodeURIComponent(noteId)}`
      : `${API_BASE}/notes`;

    try {
      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("保存笔记失败");
      return await response.json();
    } catch {
      const localList = readLocalNotes();
      if (noteId) {
        const index = localList.findIndex((note) => note.id === noteId);
        if (index >= 0) {
          localList[index] = {
            ...localList[index],
            ...payload,
            id: noteId,
            uploadedAt: new Date().toISOString(),
          };
        }
      } else {
        localList.unshift({
          ...payload,
          id: buildNewId(),
          uploadedAt: new Date().toISOString(),
          fileUrl: "#",
        });
      }
      writeLocalNotes(localList);
      return { message: "已保存到本地数据" };
    }
  },

  async deleteNote(noteId) {
    try {
      const response = await fetch(`${API_BASE}/notes/${encodeURIComponent(noteId)}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("删除笔记失败");
      return true;
    } catch {
      const localList = readLocalNotes().filter((note) => note.id !== noteId);
      writeLocalNotes(localList);
      return true;
    }
  },
};
