// ─── DashboardView.jsx ────────────────────────────────────────────────────────
// Vista del Dashboard. Contiene: StatCards, gráfico semanal, selector de fecha
// y la grilla de tareas.

import React, { useState, useEffect } from "react";
import { useApp } from "../../context/AppContext";
import { ALL_MONTHS } from "../../utils/mockData";
import { monthLabel } from "../../utils/dateHelpers";
import StatCard from "../../components/ui/StatCard";
import TaskCard from "../../components/ui/TaskCard";

export default function DashboardView() {
  const { total, doneN, pendN, dateFilter, setDF, showMonths, filtered, recentTasks } = useApp();
  
  // ── Estado para el Gráfico Semanal ──
  const [weeklyData, setWeeklyData] = useState([]);
  const [maxTasks, setMaxTasks] = useState(1);

  useEffect(() => {
    // Consultamos tu nueva ruta de analíticas reales
    fetch('/api/analytics/weekly')
      .then(res => res.json())
      .then(response => {
        if (response.status === 'success') {
          setWeeklyData(response.data);
          // Buscamos el día con más tareas para escalar las barras proporcionalmente
          const max = Math.max(...response.data.map(d => d.tasks));
          setMaxTasks(max > 0 ? max : 1); // Evitamos división por cero
        }
      })
      .catch(err => console.error("Error cargando gráfico:", err));
  }, []);

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
        <StatCard lbl="Total de tareas" num={total} sub="En tu lista"                               colVar="var(--color-text-primary)"  filterGo="todas"       />
        <StatCard lbl="Completadas"     num={doneN} sub={`${Math.round(total ? doneN / total * 100 : 0)}% del total`} colVar="var(--color-text-success)"  filterGo="completadas" />
        <StatCard lbl="Pendientes"      num={pendN} sub="Por completar"                               colVar="var(--color-text-info)"     filterGo="pendientes"  />
      </div>

      {/* ─ Gráfico de Productividad Semanal (Nuevo) ─ */}
      <div style={{ marginBottom: "32px", background: "var(--color-background-primary)", padding: "24px", borderRadius: "var(--border-radius-lg)", border: "1px solid var(--color-border-primary)" }}>
        <div style={{ fontSize: "11px", color: "var(--color-text-tertiary)", textTransform: "uppercase", letterSpacing: "1px", fontWeight: 700, marginBottom: "24px" }}>
          Productividad (Últimos 7 días)
        </div>
        
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", height: "140px", gap: "8px" }}>
          {weeklyData.length === 0 ? (
            <div style={{ width: "100%", textAlign: "center", color: "var(--color-text-tertiary)", alignSelf: "center" }}>Cargando analíticas...</div>
          ) : (
            weeklyData.map((dayData, index) => {
              // Calculamos la altura de la barra basada en el máximo de la semana
              const heightPercent = (dayData.tasks / maxTasks) * 100;
              return (
                <div key={index} style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1, gap: "8px" }}>
                  <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--color-text-primary)" }}>{dayData.tasks}</span>
                  <div style={{ 
                    width: "100%", 
                    maxWidth: "40px", 
                    height: `${heightPercent}%`, 
                    minHeight: "4px",
                    background: dayData.tasks > 0 ? "var(--color-text-info)" : "var(--color-background-secondary)", 
                    borderRadius: "4px 4px 0 0",
                    transition: "height 0.3s ease"
                  }}></div>
                  <span style={{ fontSize: "11px", color: "var(--color-text-secondary)", fontWeight: 600 }}>{dayData.day}</span>
                </div>
              );
            })
          )}
        </div>
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