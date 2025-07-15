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

/**
 * PUBLIC_INTERFACE
 * Home page UI for the Simple Notes App. Minimalistic, light theme, with
 * prominent use of #1976d2 (primary), #f50057 (accent), #ffffff (bg/secondary).
 * Layout: AppBar, sidebar with note list, right pane for view/edit, responsive tweaks.
 * Clean structure and full inline style color consistency.
 */
function App() {
  // Notes state
  const [notes, setNotes] = useState([]); // {id, title, content, ...}
  const [selectedId, setSelectedId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ title: "", content: "" });

  // --- fetch notes on mount ---
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await fetchJSON(`${API_BASE}/notes`);
        setNotes(data.reverse());
        setError("");
      } catch (e) {
        setError("Unable to load notes.");
      }
      setLoading(false);
    })();
  }, []);

  // --- fetch detail when selectedId changes ---
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

  // --- handlers ---
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
  // --- THEME ---
  const THEME = {
    accent: "#f50057",
    primary: "#1976d2",
    secondary: "#ffffff",
    border: "#e0e0e0",
    bgList: "#f8fafd",
    bgPane: "#fff",
    text: "#212529",
    muted: "#adb5bd"
  };

  return (
    <div
      style={{
        background: THEME.secondary,
        color: THEME.text,
        minHeight: "100vh",
        fontFamily: "Inter,sans-serif",
        letterSpacing: "0.02em",
      }}
    >
      {/* HEADER */}
      <header
        style={{
          background: THEME.primary,
          color: "#fff",
          padding: "20px 0 15px 0",
          fontWeight: 700,
          fontSize: "2.1rem",
          textAlign: "center",
          borderBottom: `2px solid ${THEME.accent}05`,
          textShadow: "0px 2px 6px #1976d248",
        }}
      >
        <span style={{
          letterSpacing: "0.04em",
          fontFamily: "inherit",
        }}>
          <span style={{ color: "#fff" }}>Simple</span>
          <span style={{ color: THEME.accent, marginLeft: 6, marginRight: 6, fontWeight: 900 }}>Notes</span>
          <span style={{ color: "#fff" }}>App</span>
        </span>
      </header>

      {/* MAIN - SPLIT LAYOUT */}
      <div
        style={{
          display: "flex",
          minHeight: "calc(100vh - 80px)",
          maxHeight: "100vh",
          background: THEME.bgList,
          borderTop: `1px solid ${THEME.border}`,
        }}
      >
        {/* SIDEBAR: NOTE LIST */}
        <aside
          style={{
            flex: "0 0 260px",
            minWidth: "210px",
            maxWidth: "330px",
            borderRight: `1px solid ${THEME.border}`,
            background: THEME.bgList,
            overflowY: "auto",
            padding: "0",
            display: "flex",
            flexDirection: "column",
            alignItems: "stretch"
          }}
        >
          <button
            style={{
              margin: "28px 18px 14px 18px",
              background: THEME.accent,
              color: "#fff",
              border: "none",
              borderRadius: "9px",
              padding: "11px 0",
              fontWeight: 600,
              fontSize: "1.07rem",
              cursor: "pointer",
              outline: "none",
              boxShadow: "0 2px 10px 0 #f500570f",
              transition: "all 0.14s",
              letterSpacing: "0.01em"
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
              minHeight: "60px",
            }}
          >
            {notes.length === 0 ? (
              <li
                style={{
                  color: THEME.muted,
                  textAlign: "center",
                  paddingTop: "36px",
                  fontSize: "1.08rem",
                  minHeight: "80px"
                }}
              >
                {loading ? "Loading..." : "No notes yet"}
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
                      fontWeight: selectedId === n.id ? 700 : 500,
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
                        "background 0.18s, color 0.18s, border 0.18s",
                      opacity: selectedId === n.id ? 1 : 0.87
                    }}
                  >
                    <span
                      style={{
                        display: "inline-block",
                        maxWidth: "90%",
                        overflow: "hidden",
                        whiteSpace: "nowrap",
                        textOverflow: "ellipsis",
                        fontStyle: !n.title ? "italic" : "normal"
                      }}
                    >
                      {n.title || "(Untitled)"}
                    </span>
                  </button>
                </li>
              ))
            )}
          </ul>
        </aside>

        {/* MAIN PANE: NOTE DETAIL / EDIT */}
        <main
          style={{
            flex: 1,
            background: THEME.bgPane,
            minHeight: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "stretch",
            padding: "48px 44px 30px 44px",
            maxWidth: "850px",
            margin: "0 auto",
            boxSizing: "border-box",
            position: "relative"
          }}
        >

          {error && (
            <div
              style={{
                background: "#fff0f5",
                color: THEME.accent,
                padding: "12px",
                border: `1px solid ${THEME.accent}44`,
                borderRadius: "8px",
                marginBottom: "24px",
                fontWeight: 500,
                fontSize: "1rem",
                boxShadow: "0 2px 8px 0 #f5005733"
              }}
            >
              {error}
            </div>
          )}

          {editMode && (
            <form
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "16px",
                marginTop: "40px",
                maxWidth: "540px",
                width: "100%",
                background: "#f8fafd",
                border: "1px solid #e0e0e0",
                borderRadius: "10px",
                padding: "28px 22px 20px 22px",
                marginLeft: "auto",
                marginRight: "auto",
                boxShadow: "0 2px 14px 0 #1976d203"
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
                  fontSize: "1.37rem",
                  fontWeight: 600,
                  border: `1.1px solid ${THEME.primary}25`,
                  borderRadius: "8px",
                  padding: "12px",
                  outline: "none",
                  background: "#fff",
                  color: THEME.text,
                  boxShadow: "0 1px 3px 0 #1976d211"
                }}
                disabled={loading}
                autoFocus
              />
              <textarea
                name="content"
                required
                placeholder="Type your note content here..."
                rows={9}
                value={form.content}
                onChange={handleChange}
                style={{
                  fontSize: "1.08rem",
                  border: `1.1px solid ${THEME.primary}25`,
                  borderRadius: "8px",
                  padding: "12px",
                  outline: "none",
                  minHeight: "120px",
                  resize: "vertical",
                  background: "#fff",
                  color: THEME.text,
                  boxShadow: "0 1px 7px 0 #1976d107"
                }}
                disabled={loading}
              />
              <div style={{ display: "flex", gap: "10px", marginTop: "4px" }}>
                <button
                  type="submit"
                  style={{
                    background: THEME.primary,
                    color: "#fff",
                    border: "none",
                    borderRadius: "8px",
                    padding: "10px 27px",
                    fontSize: "1.07rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    marginRight: "8px",
                    boxShadow: "0 1px 8px 0 #1976d209"
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
                    background: "#e0e0e086",
                    color: THEME.text,
                    border: "none",
                    borderRadius: "8px",
                    padding: "10px 17px",
                    fontSize: "1.07rem",
                    cursor: "pointer",
                    fontWeight: 500,
                  }}
                  disabled={loading}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* DETAIL VIEW */}
          {!editMode && selectedId && detail && (
            <div
              style={{
                marginTop: "52px",
                display: "flex",
                flexDirection: "column",
                gap: "26px",
                width: "100%",
                maxWidth: "610px",
                marginLeft: "auto",
                marginRight: "auto",
                background: "#fff",
                borderRadius: "11px",
                border: `1.1px solid ${THEME.primary}11`,
                boxShadow: "0 2px 16px 0 #1976d10a",
                padding: "36px 32px 28px 32px"
              }}
            >
              <div
                style={{
                  fontSize: "2.1rem",
                  fontWeight: 700,
                  marginBottom: "4px",
                  paddingBottom: "4px",
                  color: THEME.primary,
                  wordBreak: "break-all"
                }}
              >
                {detail.title || <em style={{ color: THEME.muted }}>(Untitled)</em>}
              </div>
              <div
                style={{
                  fontSize: "1.15rem",
                  whiteSpace: "pre-wrap",
                  color: THEME.text,
                  minHeight: "65px",
                  wordBreak: "break-word",
                  borderLeft: `3px solid ${THEME.primary}33`,
                  paddingLeft: "18px",
                  marginBottom: 0,
                  lineHeight: 1.54
                }}
              >
                {detail.content}
              </div>
              <div style={{ display: "flex", gap: "14px", marginTop: "3px" }}>
                <button
                  onClick={handleEdit}
                  style={{
                    background: THEME.primary,
                    color: "#fff",
                    border: "none",
                    borderRadius: "8px",
                    padding: "8px 20px",
                    fontWeight: 600,
                    fontSize: "1rem",
                    cursor: "pointer",
                    boxShadow: "0 2px 7px 0 #1976d109"
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
                    padding: "8px 20px",
                    fontWeight: 600,
                    fontSize: "1rem",
                    cursor: "pointer",
                    boxShadow: "0 1px 4px 0 #f500570b"
                  }}
                  disabled={loading}
                >
                  Delete
                </button>
              </div>
            </div>
          )}
          {/* EMPTY STATE */}
          {!selectedId && !editMode && (
            <div
              style={{
                textAlign: "center",
                color: THEME.primary,
                opacity: 0.85,
                fontSize: "1.24rem",
                marginTop: "96px",
                fontWeight: 600,
                letterSpacing: "0.01em"
              }}
            >
              {notes.length > 0
                ? "Select a note from the list or create a new note."
                : <>
                Nothing here yet.
                <br />
                <span style={{color: THEME.accent, fontWeight: 700}}>
                  Start by creating your first note!
                </span>
                </>}
            </div>
          )}
        </main>
      </div>
      {/* FOOTER */}
      <footer
        style={{
          background: THEME.bgList,
          color: "#949aa7",
          padding: "14px 4px 16px 4px",
          textAlign: "center",
          fontSize: "0.93em",
          letterSpacing: "0.019em",
          borderTop: `1.2px solid ${THEME.border}`,
          marginTop: "0",
          fontWeight: 400
        }}
      >
        <span role="img" aria-label="leaf" style={{marginRight:6}}>
          🌱
        </span>
        Made with React | Simple Notes Demo
      </footer>
    </div>
  );
}

export default App;
