// ─── MonthAccordion.jsx ───────────────────────────────────────────────────────
// Grupo colapsable de tareas por mes. El mes actual viene abierto por defecto.
// Props: mk (string "YYYY-MM"), tasks (array de tareas del mes)

import React from "react";
import { useApp } from "../../context/AppContext";
import { monthLabel } from "../../utils/dateHelpers";
import TaskCard from "./TaskCard";

export default function MonthAccordion({ mk, tasks }) {
  const { isMonthCollapsed, toggleMonth } = useApp();
  const collapsed = isMonthCollapsed(mk);

  return (
    <div>
      <div className="month-header" onClick={() => toggleMonth(mk)}>
        <h3>
          <i className="ti ti-calendar-event" style={{ fontSize: "18px", color: "var(--color-text-info)" }}></i>
          {monthLabel(mk)}
        </h3>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontSize: "11px", color: "var(--color-text-secondary)", fontWeight: 600 }}>
            {tasks.length} tareas
          </span>
          <i className={`ti ti-chevron-${collapsed ? "down" : "up"}`} style={{ color: "var(--color-text-tertiary)" }}></i>
        </div>
      </div>

      {!collapsed && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "20px" }}>
          {tasks.map((t) => <TaskCard key={t.id} t={t} />)}
        </div>
      )}
    </div>
  );
}