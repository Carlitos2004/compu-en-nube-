// ─── DashboardView.jsx ────────────────────────────────────────────────────────
// Vista del Dashboard. Contiene: StatCards, selector de fecha (Hoy/Mañana/Meses)
// y la grilla de tareas recientes o filtradas por fecha.

import React from "react";
import { useApp } from "../../context/AppContext";
import { ALL_MONTHS } from "../../utils/mockData";
import { monthLabel } from "../../utils/dateHelpers";
import StatCard from "../../components/ui/StatCard";
import TaskCard from "../../components/ui/TaskCard";

export default function DashboardView() {
  const { total, doneN, pendN, dateFilter, setDF, showMonths, filtered, recentTasks } = useApp();

  const sectionLabel = () => {
    if (dateFilter === "todas" || dateFilter === "meses") return "Tareas Recientes y Pendientes";
    if (dateFilter === "hoy")    return "Tareas de Hoy";
    if (dateFilter === "manana") return "Tareas de Mañana";
    return `Tareas de ${monthLabel(dateFilter)}`;
  };

  const displayTasks = (dateFilter === "todas" || dateFilter === "meses") ? recentTasks : filtered;

  return (
    <>
      {/* ─ Stat Cards ─ */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "20px", marginBottom: "32px" }}>
        <StatCard lbl="Total de tareas" num={total} sub="En tu lista"                                               colVar="var(--color-text-primary)"  filterGo="todas"       />
        <StatCard lbl="Completadas"     num={doneN} sub={`${Math.round(total ? doneN / total * 100 : 0)}% del total`} colVar="var(--color-text-success)"  filterGo="completadas" />
        <StatCard lbl="Pendientes"      num={pendN} sub="Por completar"                                              colVar="var(--color-text-info)"     filterGo="pendientes"  />
      </div>

      {/* ─ Navegador de Fecha ─ */}
      <div style={{ marginBottom: "32px" }}>
        <div style={{ fontSize: "11px", color: "var(--color-text-tertiary)", textTransform: "uppercase", letterSpacing: "1px", fontWeight: 700, marginBottom: "16px" }}>
          Navegar por fecha
        </div>
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          {[{ id: "hoy", ic: "ti-sun", lb: "Hoy" }, { id: "manana", ic: "ti-sunset-2", lb: "Mañana" }].map((d) => (
            <button key={d.id} className={`db ${dateFilter === d.id && !showMonths ? "act" : ""}`} onClick={() => setDF(d.id)}>
              <i className={`ti ${d.ic}`} style={{ fontSize: "22px", color: dateFilter === d.id && !showMonths ? "var(--color-text-info)" : "var(--color-text-secondary)" }}></i>
              <span style={{ fontSize: "12px", fontWeight: 600, color: dateFilter === d.id && !showMonths ? "var(--color-text-info)" : "var(--color-text-secondary)", marginTop: "4px" }}>{d.lb}</span>
            </button>
          ))}
          <button className={`db ${showMonths ? "act" : ""}`} onClick={() => setDF("meses")}>
            <i className="ti ti-calendar-month" style={{ fontSize: "22px", color: showMonths ? "var(--color-text-info)" : "var(--color-text-secondary)" }}></i>
            <span style={{ fontSize: "12px", fontWeight: 600, color: showMonths ? "var(--color-text-info)" : "var(--color-text-secondary)", marginTop: "4px", display: "flex", alignItems: "center", gap: "4px" }}>
              Meses <i className={`ti ti-chevron-${showMonths ? "up" : "down"}`} style={{ fontSize: "12px" }}></i>
            </span>
          </button>
        </div>

        {/* Grid expandible de 12 meses */}
        <div style={{ display: showMonths ? "grid" : "none", gridTemplateColumns: "repeat(6, 1fr)", gap: "12px", marginTop: "16px", padding: "16px", background: "var(--color-background-primary)", borderRadius: "var(--border-radius-lg)", border: "1px solid var(--color-border-tertiary)" }}>
          {ALL_MONTHS.map((m) => (
            <button key={m} className={`db ${dateFilter === m ? "act" : ""}`} onClick={() => setDF(m)} style={{ minWidth: "0" }}>
              <i className="ti ti-calendar" style={{ fontSize: "18px", color: dateFilter === m ? "var(--color-text-info)" : "var(--color-text-secondary)" }}></i>
              <span style={{ fontSize: "11px", fontWeight: 600, color: dateFilter === m ? "var(--color-text-info)" : "var(--color-text-secondary)", marginTop: "4px" }}>
                {new Date(m + "-01T00:00:00").toLocaleDateString("es-CL", { month: "short" }).toUpperCase()}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ─ Tareas ─ */}
      <div>
        <div style={{ fontSize: "11px", color: "var(--color-text-tertiary)", textTransform: "uppercase", letterSpacing: "1px", fontWeight: 700, marginBottom: "16px" }}>
          {sectionLabel()}
        </div>
        {displayTasks.length === 0 ? (
          <div style={{ fontSize: "13px", color: "var(--color-text-tertiary)" }}>No hay tareas para esta selección.</div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "20px" }}>
            {displayTasks.map((t) => <TaskCard key={t.id} t={t} />)}
          </div>
        )}
      </div>
    </>
  );
}