// ─── Sidebar.jsx ──────────────────────────────────────────────────────────────
// Sidebar colapsable. Contiene: logo, nav principal, categorías, ajustes y cuenta.
// Se colapsa a 100px mostrando solo íconos.

import React from "react";
import { useApp } from "../../context/AppContext";
import { CAT_COLOR, CAT_ICON } from "../../utils/mockData";

export default function Sidebar() {
  const {
    view, category,
    isSidebarCollapsed, setIsSidebarCollapsed,
    total, doneN, pendN, overdueN,
    go, goCat,
  } = useApp();

  return (
    <aside className={`sb ${isSidebarCollapsed ? "collapsed" : ""}`}>

      {/* ─ Logo + botón colapsar ─ */}
      <div style={{ display: "flex", flexDirection: isSidebarCollapsed ? "column" : "row", alignItems: "center", justifyContent: isSidebarCollapsed ? "center" : "space-between", marginBottom: "32px", padding: "4px 8px", width: "100%", gap: isSidebarCollapsed ? "16px" : "0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ width: "38px", height: "38px", background: "var(--color-background-info)", borderRadius: "var(--border-radius-sm)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <i className="ti ti-check-square" style={{ fontSize: "22px", color: "var(--color-text-info)" }}></i>
          </div>
          <div className="logo-text">
            <div style={{ fontSize: "18px", fontWeight: 700, color: "var(--color-text-primary)", letterSpacing: "-0.5px" }}>Planea</div>
          </div>
        </div>
        <button onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} style={{ background: "transparent", border: "none", color: "var(--color-text-tertiary)", cursor: "pointer", display: "flex", padding: "4px" }}>
          <i className={`ti ${isSidebarCollapsed ? "ti-layout-sidebar-right-expand" : "ti-layout-sidebar-left-collapse"}`} style={{ fontSize: "22px" }}></i>
        </button>
      </div>

      {/* ─ Dashboard ─ */}
      <button className={`ni ${view === "dashboard" ? "act" : ""}`} onClick={() => go("dashboard")} title="Dashboard">
        <i className="ti ti-layout-dashboard" style={{ fontSize: "18px" }}></i>
        <span>Dashboard</span>
      </button>

      {/* ─ Mis Tareas ─ */}
      <div className="slbl">Mis tareas</div>
      <button className={`ni ${view === "todas" && !category ? "act" : ""}`} onClick={() => go("todas")} title="Todas">
        <i className="ti ti-list" style={{ fontSize: "18px" }}></i>
        <span>Todas</span>
        <span className="bx">{total}</span>
      </button>
      <button className={`ni ${view === "pendientes" && !category ? "act" : ""}`} onClick={() => go("pendientes")} title="Pendientes">
        <i className="ti ti-circle-dashed" style={{ fontSize: "18px" }}></i>
        <span>Pendientes</span>
        <span className="bx">{pendN}</span>
      </button>
      <button className={`ni ${view === "completadas" && !category ? "act" : ""}`} onClick={() => go("completadas")} title="Completadas">
        <i className="ti ti-circle-check" style={{ fontSize: "18px" }}></i>
        <span>Completadas</span>
        <span className="bx">{doneN}</span>
      </button>
      <button
        className={`ni ${view === "vencidas" && !category ? "act dng" : ""} ${view !== "vencidas" && overdueN > 0 && !category ? "dng" : ""}`}
        onClick={() => go("vencidas")} title="Vencidas"
      >
        <i className="ti ti-alert-triangle" style={{ fontSize: "18px" }}></i>
        <span>Vencidas</span>
        <span className={`bx ${overdueN > 0 ? "d" : ""}`}>{overdueN}</span>
      </button>

      {/* ─ Mis Categorías ─ */}
      <div className="slbl">Mis categorías</div>
      {Object.entries(CAT_COLOR).map(([name, color]) => (
        <button key={name} className={`ni ${category === name ? "act" : ""}`} onClick={() => goCat(name)} title={name}>
          <i className={`ti ${CAT_ICON[name]}`} style={{ fontSize: "18px", color }} />
          <span>{name}</span>
        </button>
      ))}

      {/* ─ Footer: Ajustes + Cuenta ─ */}
      <div style={{ marginTop: "auto", borderTop: "1px solid var(--color-border-tertiary)", paddingTop: "16px", width: "100%" }}>
        <button className={`ni ${view === "ajustes" ? "act" : ""}`} onClick={() => go("ajustes")} title="Ajustes">
          <i className="ti ti-settings" style={{ fontSize: "18px" }}></i>
          <span>Ajustes</span>
        </button>
        <button className="ni" onClick={() => go("ajustes")}
          style={{ background: "var(--color-background-secondary)", border: "1px solid var(--color-border-tertiary)", borderRadius: "var(--border-radius-sm)", marginTop: "10px", gap: "12px", padding: "12px" }}
          title="Mi cuenta"
        >
          <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "var(--color-background-info)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: 700, color: "var(--color-text-info)", flexShrink: 0 }}>MC</div>
          <div className="mc-text" style={{ flex: 1, textAlign: "left" }}>
            <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--color-text-primary)" }}>Mi cuenta</div>
            <div style={{ fontSize: "11px", color: "var(--color-text-secondary)" }}>Personal</div>
          </div>
          <i className="ti ti-chevron-right mc-text" style={{ fontSize: "16px", color: "var(--color-text-tertiary)" }}></i>
        </button>
      </div>
    </aside>
  );
}