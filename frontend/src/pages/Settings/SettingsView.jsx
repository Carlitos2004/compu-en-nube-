// ─── SettingsView.jsx ─────────────────────────────────────────────────────────
// Vista de Ajustes del Sistema.
// Secciones: Personalización Visual · Perfil y Cuenta · Zona de Peligro

import React from "react";
import { useApp } from "../../context/AppContext";

export default function SettingsView() {
  const { darkMode, setDarkMode, handleLogout } = useApp();

  return (
    <div style={{ maxWidth: "640px", margin: "0 auto", width: "100%", paddingTop: "10px" }}>
      <div style={{ marginBottom: "32px" }}>
        <h2 style={{ color: "var(--color-text-primary)", fontSize: "24px", marginBottom: "8px", fontWeight: 700 }}>
          Configuración del Sistema
        </h2>
        <p style={{ color: "var(--color-text-secondary)", fontSize: "14px" }}>
          Administra tus preferencias de la interfaz y tu cuenta personal.
        </p>
      </div>

      {/* ─ Personalización Visual ─ */}
      <div className="ajustes-section" style={{ marginBottom: "24px" }}>
        <div style={{ fontSize: "12px", color: "var(--color-text-info)", textTransform: "uppercase", letterSpacing: "1px", fontWeight: 700, borderBottom: "1px solid var(--color-border-tertiary)", paddingBottom: "12px" }}>
          Personalización Visual
        </div>
        <div className="setting-row">
          <div>
            <div style={{ fontSize: "15px", fontWeight: 600, color: "var(--color-text-primary)", marginBottom: "4px" }}>Modo de interfaz</div>
            <div style={{ fontSize: "13px", color: "var(--color-text-tertiary)" }}>Elige tu esquema de colores preferido.</div>
          </div>
          <div className="theme-switch">
            <button onClick={() => setDarkMode(false)} className={`theme-btn ${!darkMode ? "active" : ""}`}>
              <i className="ti ti-sun" style={{ fontSize: "18px" }}></i> Claro
            </button>
            <button onClick={() => setDarkMode(true)} className={`theme-btn ${darkMode ? "active" : ""}`}>
              <i className="ti ti-moon" style={{ fontSize: "18px" }}></i> Oscuro
            </button>
          </div>
        </div>
      </div>

      {/* ─ Perfil y Cuenta ─ */}
      <div className="ajustes-section" style={{ marginBottom: "24px" }}>
        <div style={{ fontSize: "12px", color: "var(--color-text-info)", textTransform: "uppercase", letterSpacing: "1px", fontWeight: 700, borderBottom: "1px solid var(--color-border-tertiary)", paddingBottom: "12px" }}>
          Perfil y Cuenta
        </div>
        <div className="setting-row">
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "var(--color-background-info)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", fontWeight: 700, color: "var(--color-text-info)" }}>MC</div>
            <div>
              <div style={{ fontSize: "16px", fontWeight: 700, color: "var(--color-text-primary)" }}>Mi cuenta</div>
              <div style={{ fontSize: "13px", color: "var(--color-text-secondary)", marginTop: "4px" }}>Planea · v1.0 Personal</div>
            </div>
          </div>
          <button style={{ background: "var(--color-background-secondary)", border: "1px solid var(--color-border-primary)", padding: "8px 16px", borderRadius: "var(--border-radius-sm)", cursor: "pointer", color: "var(--color-text-secondary)", fontWeight: 600, display: "flex", alignItems: "center", gap: "6px" }}>
            <i className="ti ti-pencil" style={{ fontSize: "16px" }}></i> Editar perfil
          </button>
        </div>
      </div>

      {/* ─ Zona de Peligro ─ */}
      <div className="ajustes-section" style={{ border: "1px solid var(--color-border-danger)" }}>
        <div style={{ fontSize: "12px", color: "var(--color-text-danger)", textTransform: "uppercase", letterSpacing: "1px", fontWeight: 700, borderBottom: "1px solid var(--color-border-danger)", paddingBottom: "12px" }}>
          Zona de peligro
        </div>
        <div className="setting-row">
          <div>
            <div style={{ fontSize: "15px", fontWeight: 600, color: "var(--color-text-primary)", marginBottom: "4px" }}>Cerrar sesión</div>
            <div style={{ fontSize: "13px", color: "var(--color-text-tertiary)" }}>Finalizar la sesión activa en este dispositivo.</div>
          </div>
          <button onClick={handleLogout} style={{ padding: "10px 20px", display: "flex", alignItems: "center", gap: "8px", borderRadius: "var(--border-radius-sm)", background: "var(--color-background-danger)", border: "1px solid var(--color-border-danger)", color: "var(--color-text-danger)", cursor: "pointer", fontSize: "14px", fontWeight: 700 }}>
            <i className="ti ti-logout" style={{ fontSize: "18px" }}></i> Salir
          </button>
        </div>
      </div>
    </div>
  );
}