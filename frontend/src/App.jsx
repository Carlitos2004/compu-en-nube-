// ─── App.jsx ──────────────────────────────────────────────────────────────────
// Raíz de la aplicación Planea.
// 1. Configura el React Router (Navegación por URL).
// 2. Inyecta AppProvider (Estado global) solo en las rutas que lo necesitan.
// 3. Renderiza Sidebar + TopBar + Vista activa + Modal en el Dashboard.

import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// ─── Contexto ───
import AppProvider, { useApp } from "./context/AppContext";

// ─── Componentes del Layout ───
import Sidebar from "./components/layout/Sidebar";
import TopBar from "./components/layout/TopBar";
import TaskModal from "./components/ui/TaskModal";

// ─── Vistas Internas ───
import DashboardView from "./pages/Dashboard/DashboardView";
import TasksView from "./pages/Tasks/TasksView";
import SettingsView from "./pages/Settings/SettingsView";

// ─── Estilos ───
import "./assets/styles/global.css";

// ─── Sub-enrutador Interno (Controlado por AppContext) ────────────────────────
function MainContent() {
  const { view } = useApp();
  
  if (view === "dashboard") return <DashboardView />;
  if (view === "ajustes")   return <SettingsView />;
  return <TasksView />;
}

// ─── Layout Principal del Dashboard ───────────────────────────────────────────
function DashboardLayout() {
  const { darkMode } = useApp();

  return (
    <div className={`planea-theme-wrapper ${darkMode ? "dark-theme" : "light-theme"}`}>
      <div className="app">
        <Sidebar />
        <main className="mn">
          <TopBar />
          <MainContent />
        </main>
      </div>
      <TaskModal />
    </div>
  );
}

// ─── Root con React Router ────────────────────────────────────────────────────
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Redirección automática de la raíz al dashboard */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        
        {/* Ruta principal del Dashboard envuelta en su Proveedor de Estado */}
        <Route 
          path="/dashboard" 
          element={
            <AppProvider>
              <DashboardLayout />
            </AppProvider>
          } 
        />

        {/* Cuando tengas la vista de Login lista, la agregas aquí afuera del AppProvider 
          para que tenga su propio diseño limpio sin el Sidebar:
          
          <Route path="/login" element={<Login />} /> 
        */}
      </Routes>
    </BrowserRouter>
  );
}