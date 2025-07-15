import React, { useEffect, useState } from "react";
import "./App.css";

/*
Minimalistic Notes App
- Light theme (primary: #1976d2, secondary: #ffffff, accent: #f50057)
- Layout: Header (top), Left: Notes list, Right: Note view/edit/create
- Features: List, Create, Edit, Delete notes via backend API
*/

// Backend API base URL (adjust as needed)
const API_BASE = process.env.REACT_APP_BACKEND_URL || "http://localhost:8000";

// Util: Fetch JSON with error handling
const fetchJSON = async (url, opts = {}) => {
  const res = await fetch(url, opts);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || res.statusText);
  }
  return res.json();
};

// PUBLIC_INTERFACE
function App() {
  // Notes state
  const [notes, setNotes] = useState([]); // {id, title, content, ...}
  const [selectedId, setSelectedId] = useState(null); // selected note id
  const [detail, setDetail] = useState(null); // {id, title, content}
  const [editMode, setEditMode] = useState(false); // edit/create mode
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ title: "", content: "" });

  // Load all notes initially
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await fetchJSON(`${API_BASE}/notes`);
        setNotes(data.reverse());
        setError("");
      } catch (e) {
        setError("Could not load notes.");
      }
      setLoading(false);
    })();
  }, []);

  // Load detail when selectedId changes (unless creating new)
  useEffect(() => {
    if (!selectedId) {
      setDetail(null);
      setEditMode(false);
      return;
    }
    (async () => {
      setLoading(true);
      try {
        const data = await fetchJSON(`${API_BASE}/notes/${selectedId}`);
        setDetail(data);
        setEditMode(false);
        setError("");
      } catch (e) {
        setError("Failed to load note.");
      }
      setLoading(false);
    })();
  }, [selectedId]);

  // Handlers
  const handleSelect = (id) => {
    setSelectedId(id);
    setForm({ title: "", content: "" });
    setError("");
  };
  const handleStartCreate = () => {
    setSelectedId(null);
    setDetail(null);
    setEditMode(true);
    setForm({ title: "", content: "" });
    setError("");
  };
  const handleEdit = () => {
    if (detail) {
      setEditMode(true);
      setForm({ title: detail.title, content: detail.content });
    }
  };
  const handleDelete = async () => {
    if (!detail?.id || !window.confirm("Delete this note?")) return;
    setLoading(true);
    try {
      await fetchJSON(`${API_BASE}/notes/${detail.id}`, { method: "DELETE" });
      setNotes((ns) => ns.filter((n) => n.id !== detail.id));
      setSelectedId(null);
      setDetail(null);
      setEditMode(false);
      setForm({ title: "", content: "" });
      setError("");
    } catch (e) {
      setError("Failed to delete note.");
    }
    setLoading(false);
  };
  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  // Save new or edited note
  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) {
      setError("Title and content cannot be empty.");
      return;
    }
    setLoading(true);
    try {
      let note;
      if (detail && editMode) {
        // Update existing
        note = await fetchJSON(`${API_BASE}/notes/${detail.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: form.title, content: form.content }),
        });
        setNotes((ns) =>
          ns.map((n) => (n.id === note.id ? note : n))
        );
        setDetail(note);
        setSelectedId(note.id);
      } else if (!detail && editMode) {
        // Create new
        note = await fetchJSON(`${API_BASE}/notes`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: form.title, content: form.content }),
        });
        setNotes((ns) => [note, ...ns]);
        setSelectedId(note.id);
        setDetail(note);
      }
      setForm({ title: "", content: "" });
      setEditMode(false);
      setError("");
    } catch (e) {
      setError("Failed to save note.");
    }
    setLoading(false);
  };

  // Theme colors
  const THEME = {
    accent: "#f50057",
    primary: "#1976d2",
    secondary: "#ffffff",
    border: "#e0e0e0",
    bgList: "#f7f9fc",
    bgPane: "#fff",
    text: "#222",
  };

  return (
    <div
      style={{
        background: THEME.secondary,
        color: THEME.text,
        minHeight: "100vh",
        fontFamily: "Inter, system-ui, sans-serif",
      }}
    >
      {/* App Header */}
      <header
        style={{
          background: THEME.primary,
          color: "#fff",
          padding: "24px",
          fontWeight: "bold",
          fontSize: "2rem",
          letterSpacing: "0.03em",
          boxShadow: "0 2px 8px rgba(23,118,210,0.04)",
        }}
      >
        Simple Minimal Notes
      </header>

      {/* Main Layout: Flex Horizontal */}
      <div
        style={{
          display: "flex",
          height: "calc(100vh - 80px)",
          background: THEME.bgList,
          borderTop: `1px solid ${THEME.border}`,
        }}
      >
        {/* Left: Notes List */}
        <aside
          style={{
            flex: "0 0 260px",
            borderRight: `1px solid ${THEME.border}`,
            background: THEME.bgList,
            overflowY: "auto",
            padding: "0",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <button
            style={{
              margin: "24px 20px 18px 20px",
              background: THEME.accent,
              color: "#fff",
              border: "none",
              borderRadius: "10px",
              padding: "12px 0",
              fontWeight: 600,
              fontSize: "1rem",
              cursor: "pointer",
              outline: "none",
              boxShadow: "0 2px 6px rgba(245,0,87,0.04)",
              transition: "background 0.18s",
            }}
            onClick={handleStartCreate}
            disabled={loading}
          >
            + New Note
          </button>
          <ul
            style={{
              listStyle: "none",
              padding: 0,
              margin: 0,
              flex: 1,
            }}
          >
            {notes.length === 0 ? (
              <li
                style={{
                  color: "#aaa",
                  textAlign: "center",
                  paddingTop: "36px",
                  fontSize: "1.1rem",
                }}
              >
                {loading ? "Loading..." : "No notes"}
              </li>
            ) : (
              notes.map((n) => (
                <li key={n.id}>
                  <button
                    aria-current={selectedId === n.id}
                    onClick={() => handleSelect(n.id)}
                    style={{
                      width: "100%",
                      textAlign: "left",
                      padding: "16px 20px",
                      border: "none",
                      background:
                        selectedId === n.id
                          ? THEME.primary
                          : THEME.bgList,
                      color:
                        selectedId === n.id
                          ? "#fff"
                          : THEME.text,
                      fontWeight: 500,
                      fontSize: "1rem",
                      cursor: "pointer",
                      outline: "none",
                      borderRight:
                        selectedId === n.id
                          ? `4px solid ${THEME.accent}`
                          : "none",
                      borderRadius: "0",
                      margin: 0,
                      borderBottom: `1px solid ${THEME.border}`,
                      transition:
                        "background 0.15s, color 0.15s",
                    }}
                  >
                    <span
                      style={{
                        display: "inline-block",
                        maxWidth: "92%",
                        overflow: "hidden",
                        whiteSpace: "nowrap",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {n.title || <em>(Untitled)</em>}
                    </span>
                  </button>
                </li>
              ))
            )}
          </ul>
        </aside>

        {/* Right: Note detail / edit pane */}
        <main
          style={{
            flex: 1,
            background: THEME.bgPane,
            minHeight: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "stretch",
            padding: "40px 40px",
            maxWidth: "800px",
            margin: "0 auto",
            boxSizing: "border-box",
          }}
        >
          {/* Error message */}
          {error && (
            <div
              style={{
                background: "#fff0f5",
                color: THEME.accent,
                padding: "12px",
                border: `1px solid ${THEME.accent}55`,
                borderRadius: "8px",
                marginBottom: "24px",
                fontWeight: 500,
                fontSize: "1rem",
              }}
            >
              {error}
            </div>
          )}

          {/* Empty: create mode */}
          {editMode && (
            <form
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "16px",
                marginTop: "36px",
                maxWidth: "500px",
                width: "100%",
              }}
              onSubmit={handleSave}
            >
              <input
                name="title"
                required
                placeholder="Note title"
                value={form.title}
                onChange={handleChange}
                style={{
                  fontSize: "1.4rem",
                  fontWeight: 600,
                  border: `1px solid ${THEME.border}`,
                  borderRadius: "8px",
                  padding: "14px",
                  outline: "none",
                }}
                disabled={loading}
                autoFocus
              />
              <textarea
                name="content"
                required
                placeholder="Note content"
                rows={9}
                value={form.content}
                onChange={handleChange}
                style={{
                  fontSize: "1.08rem",
                  border: `1px solid ${THEME.border}`,
                  borderRadius: "8px",
                  padding: "14px",
                  outline: "none",
                  minHeight: "130px",
                  resize: "vertical",
                }}
                disabled={loading}
              />
              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  type="submit"
                  style={{
                    background: THEME.primary,
                    color: "#fff",
                    border: "none",
                    borderRadius: "8px",
                    padding: "11px 32px",
                    fontSize: "1.08rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    marginRight: "10px",
                  }}
                  disabled={loading}
                >
                  {detail ? "Save" : "Create"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditMode(false);
                    setError("");
                    if (!detail) setForm({ title: "", content: "" });
                  }}
                  style={{
                    background: "#e0e0e088",
                    color: THEME.text,
                    border: "none",
                    borderRadius: "8px",
                    padding: "11px 16px",
                    fontSize: "1.08rem",
                    cursor: "pointer",
                  }}
                  disabled={loading}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* View and Edit/Delete buttons */}
          {!editMode && selectedId && detail && (
            <div
              style={{
                marginTop: "36px",
                display: "flex",
                flexDirection: "column",
                gap: "28px",
                width: "100%",
                maxWidth: "650px",
              }}
            >
              <div
                style={{
                  fontSize: "2rem",
                  fontWeight: 700,
                  marginBottom: "7px",
                  color: THEME.primary,
                  wordBreak: "break-word",
                }}
              >
                {detail.title || <em>(Untitled)</em>}
              </div>
              <div
                style={{
                  fontSize: "1.18rem",
                  whiteSpace: "pre-wrap",
                  color: THEME.text,
                  minHeight: "72px",
                  wordBreak: "break-word",
                  borderLeft: `3px solid ${THEME.primary}44`,
                  paddingLeft: "14px",
                }}
              >
                {detail.content}
              </div>
              <div style={{ display: "flex", gap: "12px" }}>
                <button
                  onClick={handleEdit}
                  style={{
                    background: THEME.primary,
                    color: "#fff",
                    border: "none",
                    borderRadius: "8px",
                    padding: "9px 24px",
                    fontWeight: 600,
                    fontSize: "1rem",
                    cursor: "pointer",
                  }}
                  disabled={loading}
                >
                  Edit
                </button>
                <button
                  onClick={handleDelete}
                  style={{
                    background: THEME.accent,
                    color: "#fff",
                    border: "none",
                    borderRadius: "8px",
                    padding: "9px 24px",
                    fontWeight: 600,
                    fontSize: "1rem",
                    cursor: "pointer",
                  }}
                  disabled={loading}
                >
                  Delete
                </button>
              </div>
            </div>
          )}

          {/* Start: prompt to select or create */}
          {!selectedId && !editMode && (
            <div
              style={{
                textAlign: "center",
                color: "#888",
                opacity: 0.88,
                fontSize: "1.25rem",
                marginTop: "88px",
              }}
            >
              {notes.length > 0
                ? "Select a note from the list or create a new note."
                : "Nothing here yet: start by creating your first note!"}
            </div>
          )}
        </main>
      </div>
      <footer
        style={{
          background: THEME.bgList,
          color: "#afafaf",
          padding: "10px",
          textAlign: "center",
          fontSize: "0.98em",
          letterSpacing: "0.02em",
          borderTop: `1px solid ${THEME.border}`,
          marginTop: "0",
        }}
      >
        Powered by React. Demonstration app.
      </footer>
    </div>
  );
}

export default App;
