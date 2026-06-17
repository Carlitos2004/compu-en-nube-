// ─── TaskModal.jsx ────────────────────────────────────────────────────────────
// Modal de creación y edición de tareas. Se activa desde openAdd() u openEdit().
// No recibe props: lee y escribe todo desde AppContext.

import React from "react";
import { useApp } from "../../context/AppContext";
import { CAT_COLOR } from "../../utils/mockData";

export default function TaskModal() {
  const {
    showModal, setModal,
    editId, fTitle, setFTitle, fDate, setFDate, fNotes, setFNotes, fCat, setFCat,
    saveTask,
  } = useApp();

  if (!showModal) return null;

  return (
    <div className="modal-overlay" onClick={() => setModal(false)}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>

        {/* ─ Encabezado ─ */}
        <div style={{ fontSize: "20px", fontWeight: 700, color: "var(--color-text-primary)", marginBottom: "26px", display: "flex", alignItems: "center", gap: "10px" }}>
          <i className={editId !== null ? "ti ti-pencil" : "ti ti-plus"} style={{ color: "var(--color-text-info)" }}></i>
          {editId !== null ? "Editar tarea" : "Nueva tarea"}
        </div>

        {/* ─ Título ─ */}
        <div>
          <label className="form-label">Título de la tarea</label>
          <input className="form-input" placeholder="Ej: Comprar el pan..." value={fTitle} autoFocus
            onChange={(e) => setFTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && saveTask()}
          />
        </div>

        {/* ─ Fecha + Categoría ─ */}
        <div style={{ display: "flex", gap: "16px" }}>
          <div style={{ flex: 1 }}>
            <label className="form-label">Fecha límite</label>
            <input type="date" className="form-input" value={fDate} onChange={(e) => setFDate(e.target.value)} />
          </div>
          <div style={{ flex: 1 }}>
            <label className="form-label">Categoría</label>
            <select className="form-input" value={fCat} onChange={(e) => setFCat(e.target.value)}>
              {Object.keys(CAT_COLOR).map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        {/* ─ Notas ─ */}
        <div>
          <label className="form-label">Notas o detalles</label>
          <textarea className="form-input" placeholder="Agrega información adicional..." value={fNotes}
            onChange={(e) => setFNotes(e.target.value)} style={{ resize: "vertical", minHeight: "90px" }}
          />
        </div>

        {/* ─ Botones ─ */}
        <div style={{ display: "flex", gap: "12px", marginTop: "16px" }}>
          <button onClick={() => setModal(false)} style={{ flex: 1, padding: "12px", background: "var(--color-background-secondary)", border: "1px solid var(--color-border-primary)", borderRadius: "var(--border-radius-sm)", color: "var(--color-text-secondary)", fontWeight: 600, cursor: "pointer" }}>
            Cancelar
          </button>
          <button onClick={saveTask} style={{ flex: 2, padding: "12px", background: "var(--color-background-info)", border: "1px solid var(--color-border-info)", borderRadius: "var(--border-radius-sm)", color: "var(--color-text-info)", fontWeight: 700, cursor: "pointer" }}>
            {editId !== null ? "Guardar cambios" : "Crear Tarea"}
          </button>
        </div>
      </div>
    </div>
  );
}