// ─── StatCard.jsx ─────────────────────────────────────────────────────────────
// Tarjeta clickeable de estadística. Al hacer clic navega a la vista correspondiente.
// Props: lbl, num, sub, colVar (CSS var string), filterGo (view name)

import React from "react";
import { useApp } from "../../context/AppContext";

export default function StatCard({ lbl, num, sub, colVar, filterGo }) {
  const { go } = useApp();

  return (
    <div className="sc" onClick={() => go(filterGo)}>
      <div style={{ fontSize: "11px", color: "var(--color-text-secondary)", textTransform: "uppercase", letterSpacing: ".8px", fontWeight: 600, marginBottom: "8px" }}>
        {lbl}
      </div>
      <div style={{ fontSize: "36px", fontWeight: 600, color: colVar, lineHeight: 1, marginBottom: "5px" }}>
        {String(num).padStart(2, "0")}
      </div>
      <div style={{ fontSize: "12px", color: "var(--color-text-tertiary)", marginBottom: "12px" }}>
        {sub}
      </div>
      <div style={{ fontSize: "12px", color: "var(--color-text-info)", display: "flex", alignItems: "center", gap: "4px", fontWeight: 500 }}>
        <span>Ver tareas</span>
        <i className="ti ti-arrow-right" style={{ fontSize: "12px" }}></i>
      </div>
    </div>
  );
}