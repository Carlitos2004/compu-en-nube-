// ─── TopBar.jsx ───────────────────────────────────────────────────────────────
// Encabezado de la vista activa: título dinámico, fecha, búsqueda y botón "Nueva tarea".
// El buscador solo aparece en vistas de listado (no dashboard ni ajustes).

import React from "react";
import { useApp } from "../../context/AppContext";
import { VT } from "../../utils/mockData";

export default function TopBar() {
  const { view, category, search, setSearch, openAdd, dayLabel, showSearch } = useApp();

  const title = category ? `Categoría: ${category}` : VT[view] || "Dashboard";

  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "32px" }}>
      <div>
        <div style={{ fontSize: "26px", fontWeight: 700, color: "var(--color-text-primary)", marginBottom: "6px", letterSpacing: "-0.5px" }}>
          {title}
        </div>
        <div style={{ fontSize: "13px", color: "var(--color-text-tertiary)", fontWeight: 500 }}>
          {dayLabel}
        </div>
      </div>

      <div style={{ display: "flex", gap: "14px", alignItems: "center" }}>
        {showSearch && (
          <div style={{ position: "relative" }}>
            <i className="ti ti-search" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", fontSize: "16px", color: "var(--color-text-tertiary)" }}></i>
            <input className="search-input" placeholder="Buscar tareas..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        )}
        <button className="btn-primary" onClick={openAdd}>
          <i className="ti ti-plus" style={{ fontSize: "16px" }}></i>
          Nueva tarea
        </button>
      </div>
    </div>
  );
}