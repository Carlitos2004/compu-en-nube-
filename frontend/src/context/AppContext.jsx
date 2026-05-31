// ─── AppContext.jsx ───────────────────────────────────────────────────────────
// Estado global de Planea: navegación, tareas, filtros, modal y UI.
// Expone todo vía useApp() — ningún componente maneja estado local relevante.

import React, { createContext, useContext, useState } from "react";
import { INIT_TASKS } from "../utils/mockData";
import { addDays, getBucket, getMonthKey } from "../utils/dateHelpers";

const AppContext = createContext(null);
export const useApp = () => useContext(AppContext);

export default function AppProvider({ children }) {
  // ── Navegación ──────────────────────────────────────────────────────────────
  const [view, setView]             = useState("dashboard");
  const [category, setCategory]     = useState(null);
  const [dateFilter, setDateFilter] = useState("todas");
  const [showMonths, setShowMonths] = useState(false);

  // ── UI ──────────────────────────────────────────────────────────────────────
  const [darkMode, setDarkMode]                     = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [search, setSearch]                         = useState("");
  const [collapsedOverrides, setCollapsedOverrides] = useState({});

  // ── Tareas ──────────────────────────────────────────────────────────────────
  const [tasks, setTasks] = useState(INIT_TASKS);

  // ── Modal ───────────────────────────────────────────────────────────────────
  const [showModal, setModal] = useState(false);
  const [editId, setEditId]   = useState(null);
  const [fTitle, setFTitle]   = useState("");
  const [fDate, setFDate]     = useState("");
  const [fNotes, setFNotes]   = useState("");
  const [fCat, setFCat]       = useState("Personal");

  // ── Stats globales ──────────────────────────────────────────────────────────
  const total    = tasks.length;
  const doneN    = tasks.filter((t) => t.completed).length;
  const pendN    = tasks.filter((t) => !t.completed).length;
  const overdueN = tasks.filter((t) => getBucket(t.dueDate) === "vencidas" && !t.completed).length;

  // ── Stats por categoría ─────────────────────────────────────────────────────
  const catTasks = category ? tasks.filter((t) => t.category === category) : [];
  const catTotal = catTasks.length;
  const catDone  = catTasks.filter((t) => t.completed).length;
  const catPend  = catTasks.filter((t) => !t.completed).length;
  const catOver  = catTasks.filter((t) => getBucket(t.dueDate) === "vencidas" && !t.completed).length;

  // ── Filtrado ────────────────────────────────────────────────────────────────
  let filtered = [...tasks];
  if (search.trim()) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (t) => t.title.toLowerCase().includes(q) || t.notes.toLowerCase().includes(q)
    );
  }
  if (category)             filtered = filtered.filter((t) => t.category === category);
  if (view === "pendientes") filtered = filtered.filter((t) => !t.completed);
  if (view === "completadas") filtered = filtered.filter((t) => t.completed);
  if (view === "vencidas")   filtered = filtered.filter((t) => getBucket(t.dueDate) === "vencidas" && !t.completed);
  if (view === "dashboard" && dateFilter !== "todas" && dateFilter !== "meses") {
    if (dateFilter.length > 6) {
      filtered = filtered.filter((t) => getMonthKey(t.dueDate) === dateFilter);
    } else {
      filtered = filtered.filter((t) => getBucket(t.dueDate) === dateFilter);
    }
  }

  // ── Agrupado por mes ────────────────────────────────────────────────────────
  const groupedTasks = {};
  filtered.forEach((t) => {
    const mk = getMonthKey(t.dueDate);
    if (!groupedTasks[mk]) groupedTasks[mk] = [];
    groupedTasks[mk].push(t);
  });

  const todayDate       = new Date();
  const currentMonthKey = `${todayDate.getFullYear()}-${String(todayDate.getMonth() + 1).padStart(2, "0")}`;

  const sortedMonthKeys = Object.keys(groupedTasks).sort((a, b) => {
    if (a === "0000-00") return 1;
    if (b === "0000-00") return -1;
    const isAPast = a < currentMonthKey;
    const isBPast = b < currentMonthKey;
    if (isAPast && !isBPast) return 1;
    if (!isAPast && isBPast) return -1;
    if (isAPast && isBPast)  return b.localeCompare(a);
    return a.localeCompare(b);
  });

  const recentTasks = [...tasks].filter((t) => !t.completed).slice(0, 3);

  // ── Acordeón inteligente ────────────────────────────────────────────────────
  const isMonthCollapsed = (mk) => {
    if (collapsedOverrides[mk] !== undefined) return collapsedOverrides[mk];
    return mk !== currentMonthKey; // Por defecto: solo el mes actual está abierto
  };
  const toggleMonth = (mk) => {
    setCollapsedOverrides((prev) => ({
      ...prev,
      [mk]: prev[mk] !== undefined ? !prev[mk] : mk === currentMonthKey ? true : false,
    }));
  };

  // ── Acciones de navegación ──────────────────────────────────────────────────
  const go    = (v) => { setView(v); setCategory(null); setDateFilter("todas"); };
  const goCat = (c) => { setCategory(c); setView("todas"); setDateFilter("todas"); };
  const setDF = (f) => {
    if (f === "meses") { setShowMonths(!showMonths); return; }
    setDateFilter(f);
  };

  // ── CRUD de tareas ──────────────────────────────────────────────────────────
  const toggleTask = (id) => setTasks(tasks.map((t) => t.id === id ? { ...t, completed: !t.completed } : t));
  const deleteTask = (id) => setTasks(tasks.filter((t) => t.id !== id));
  const openAdd    = () => { setEditId(null); setFTitle(""); setFDate(addDays(0)); setFNotes(""); setFCat("Personal"); setModal(true); };
  const openEdit   = (t) => { setEditId(t.id); setFTitle(t.title); setFDate(t.dueDate || addDays(0)); setFNotes(t.notes); setFCat(t.category); setModal(true); };
  const saveTask   = () => {
    if (!fTitle.trim()) return;
    if (editId !== null) {
      setTasks(tasks.map((t) => t.id === editId ? { ...t, title: fTitle, dueDate: fDate, notes: fNotes, category: fCat } : t));
    } else {
      setTasks([{ id: Date.now(), title: fTitle, dueDate: fDate, notes: fNotes, category: fCat, completed: false }, ...tasks]);
    }
    setModal(false);
  };

  // ── Misc ────────────────────────────────────────────────────────────────────
  const dayLabel   = new Date().toLocaleDateString("es-CL", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  const handleLogout = () => alert("Cerrando sesión de usuario...");
  const showSearch   = view !== "ajustes" && view !== "dashboard";

  // ── Valor del contexto ──────────────────────────────────────────────────────
  const value = {
    // Estado de navegación
    view, setView, category, dateFilter, showMonths,
    // Estado de UI
    darkMode, setDarkMode, isSidebarCollapsed, setIsSidebarCollapsed,
    search, setSearch,
    // Estado del modal
    showModal, setModal, editId,
    fTitle, setFTitle, fDate, setFDate, fNotes, setFNotes, fCat, setFCat,
    // Stats
    total, doneN, pendN, overdueN,
    catTotal, catDone, catPend, catOver,
    // Datos derivados
    filtered, groupedTasks, sortedMonthKeys, recentTasks, currentMonthKey,
    // Funciones de acordeón
    isMonthCollapsed, toggleMonth,
    // Acciones
    go, goCat, setDF, toggleTask, deleteTask, openAdd, openEdit, saveTask,
    handleLogout, dayLabel, showSearch,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}