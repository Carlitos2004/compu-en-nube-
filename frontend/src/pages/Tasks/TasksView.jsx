// ─── TasksView.jsx ────────────────────────────────────────────────────────────
// Vista de listados agrupados por mes. Se usa para todas las vistas de tareas
// excepto Dashboard y Ajustes. Incluye sub-tabs cuando hay categoría activa.

import React from "react";
import { useApp } from "../../context/AppContext";
import { VT } from "../../utils/mockData";
import MonthAccordion from "../../components/ui/MonthAccordion";

export default function TasksView() {
  const {
    view, setView, category,
    filtered, groupedTasks, sortedMonthKeys,
    catTotal, catDone, catPend, catOver,
    search,
  } = useApp();

  return (
    <>
      {/* ─ Sub-tabs de categoría ─ */}
      {category && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", marginBottom: "28px", borderBottom: "1px solid var(--color-border-tertiary)", paddingBottom: "20px" }}>
          <button className={`sub-tab ${view === "todas" ? "act" : ""}`}       onClick={() => setView("todas")}>Todas ({catTotal})</button>
          <button className={`sub-tab ${view === "pendientes" ? "act" : ""}`}  onClick={() => setView("pendientes")}>Pendientes ({catPend})</button>
          <button className={`sub-tab ${view === "completadas" ? "act" : ""}`} onClick={() => setView("completadas")}>Completadas ({catDone})</button>
          <button className={`sub-tab ${view === "vencidas" ? "act" : ""}`}    onClick={() => setView("vencidas")}>Vencidas ({catOver})</button>
        </div>
      )}

      {/* ─ Contador de resultados ─ */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
        <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--color-text-secondary)", textTransform: "uppercase", letterSpacing: "1px" }}>
          {category ? `Mostrando: ${VT[view] || "Listado"}` : "Listado"}
        </span>
        <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--color-text-info)", background: "var(--color-background-info)", padding: "4px 12px", borderRadius: "999px" }}>
          {filtered.length} elementos
        </span>
      </div>

      {/* ─ Estado vacío ─ */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px 20px" }}>
          <i className="ti ti-clipboard-list" style={{ fontSize: "54px", color: "var(--color-text-tertiary)", display: "block", marginBottom: "18px" }}></i>
          <div style={{ fontSize: "18px", fontWeight: 700, color: "var(--color-text-secondary)", marginBottom: "8px" }}>Sin tareas aquí</div>
          <div style={{ fontSize: "14px", color: "var(--color-text-tertiary)" }}>
            {search ? "No hay resultados para tu búsqueda" : "Crea una nueva tarea para comenzar"}
          </div>
        </div>
      ) : (
        /* ─ Acordeones por mes ─ */
        <div>
          {sortedMonthKeys.map((mk) => (
            <MonthAccordion key={mk} mk={mk} tasks={groupedTasks[mk]} />
          ))}
        </div>
      )}
    </>
  );
}