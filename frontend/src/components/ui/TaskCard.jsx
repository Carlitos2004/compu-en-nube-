// ─── TaskCard.jsx ─────────────────────────────────────────────────────────────
// Tarjeta de tarea individual. Acciones: completar, editar, eliminar.
// Props: t (objeto tarea)

import React from "react";
import { useApp } from "../../context/AppContext";
import { CAT_COLOR, CAT_ICON } from "../../utils/mockData";
import { fmtDateStr, getBucket } from "../../utils/dateHelpers";

export default function TaskCard({ t }) {
  const { toggleTask, openEdit, deleteTask } = useApp();

  return (
    <div className="tc" style={{ borderLeft: `4px solid ${CAT_COLOR[t.category]}`, opacity: t.completed ? 0.6 : 1 }}>

      {/* ─ Chips de categoría y estado ─ */}
      <div style={{ display: "flex", alignItems: "center", gap: "7px", marginBottom: "12px" }}>
        <span className="chip" style={{ background: `${CAT_COLOR[t.category]}20`, color: CAT_COLOR[t.category] }}>
          <i className={`ti ${CAT_ICON[t.category] || "ti-tag"}`} style={{ fontSize: "12px", marginRight: "4px" }}></i>
          {t.category}
        </span>
        {t.completed && (
          <span className="chip" style={{ background: "var(--color-background-success)", color: "var(--color-text-success)", marginLeft: "auto" }}>
            <i className="ti ti-check" style={{ fontSize: "11px", marginRight: "3px" }}></i>Hecho
          </span>
        )}
        {!t.completed && getBucket(t.dueDate) === "vencidas" && (
          <span className="chip" style={{ background: "var(--color-background-danger)", color: "var(--color-text-danger)", marginLeft: "auto" }}>
            <i className="ti ti-alert-triangle" style={{ fontSize: "11px", marginRight: "3px" }}></i>Vencida
          </span>
        )}
      </div>

      {/* ─ Título y notas ─ */}
      <div style={{ fontSize: "15px", fontWeight: 600, color: t.completed ? "var(--color-text-tertiary)" : "var(--color-text-primary)", textDecoration: t.completed ? "line-through" : "none", marginBottom: "6px", lineHeight: 1.4 }}>
        {t.title}
      </div>
      <div style={{ fontSize: "13px", color: "var(--color-text-secondary)", marginBottom: "16px", lineHeight: 1.5 }}>
        {t.notes}
      </div>

      {/* ─ Footer: fecha + botones ─ */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "auto" }}>
        <span style={{ fontSize: "12px", color: "var(--color-text-tertiary)", display: "flex", alignItems: "center", gap: "5px" }}>
          <i className="ti ti-calendar" style={{ fontSize: "14px" }}></i>
          {fmtDateStr(t.dueDate)}
        </span>
        <div style={{ display: "flex", gap: "6px" }}>
          <button onClick={() => toggleTask(t.id)} className="action-btn" title={t.completed ? "Desmarcar" : "Completar"}>
            <i className={t.completed ? "ti ti-arrow-back-up" : "ti ti-check"} style={{ fontSize: "15px" }}></i>
          </button>
          <button onClick={() => openEdit(t)} className="action-btn">
            <i className="ti ti-edit" style={{ fontSize: "15px" }}></i>
          </button>
          <button onClick={() => deleteTask(t.id)} className="action-btn del-btn">
            <i className="ti ti-trash" style={{ fontSize: "15px" }}></i>
          </button>
        </div>
      </div>
    </div>
  );
}