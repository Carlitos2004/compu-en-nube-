// ─── AppContext.jsx ───────────────────────────────────────────────────────────
// Estado global de Planea: navegación, tareas, filtros, modal y UI.
// Expone todo vía useApp() — ningún componente maneja estado local relevante.
import React, { createContext, useContext, useState, useEffect } from "react";
// Se mantiene la importación de helpers
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

  // ── Tareas (Estado Global) ──────────────────────────────────────────────────
  const [tasks, setTasks] = useState([]);

  // ── Modal ───────────────────────────────────────────────────────────────────
  const [showModal, setModal] = useState(false);
  const [editId, setEditId]   = useState(null);
  const [fTitle, setFTitle]   = useState("");
  const [fDate, setFDate]     = useState("");
  const [fNotes, setFNotes]   = useState("");
  const [fCat, setFCat]       = useState("Personal");

  // ── Carga inicial desde PostgreSQL (Centralizada) ───────────────────────────
  const [apiStats, setApiStats] = useState(null);

  useEffect(() => {
    // Cargar Estadísticas
    fetch('/api/dashboard/stats')
      .then(res => res.json())
      .then(data => setApiStats(data))
      .catch(err => console.error("Error API Stats:", err));

    // Cargar Tareas Reales
    fetch('/api/tasks')
      .then(res => res.json())
      .then(response => {
        if (response.status === 'success') {
          setTasks(response.data);
        }
      })
      .catch(err => console.error("Error API Tasks:", err));
  }, []);

  const total    = apiStats ? apiStats.total : tasks.length;
  const doneN    = apiStats ? apiStats.completed : tasks.filter((t) => t.completed).length;
  const pendN    = apiStats ? apiStats.pending : tasks.filter((t) => !t.completed).length;
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
      (t) => t.title.toLowerCase().includes(q) || (t.notes && t.notes.toLowerCase().includes(q))
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
    return mk !== currentMonthKey;
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

  // ── CRUD de tareas (Conectado a la BD) ──────────────────────────────────────
  const toggleTask = async (id) => {
    // 1. Encontramos la tarea actual para invertir su estado
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    // 2. Actualizamos la interfaz instantáneamente (Optimistic UI)
    setTasks(tasks.map((t) => t.id === id ? { ...t, completed: !t.completed } : t));

    // 3. Le avisamos a PostgreSQL en segundo plano
    try {
      await fetch(`/api/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...task, completed: !task.completed })
      });
    } catch (error) {
      console.error("Error al completar tarea:", error);
    }
  };
  
  const deleteTask = async (id) => {
    // 1. Borramos de la interfaz instantáneamente
    setTasks(tasks.filter((t) => t.id !== id));

    // 2. Le pedimos a PostgreSQL que la destruya
    try {
      await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
    } catch (error) {
      console.error("Error al eliminar tarea:", error);
    }
  };
  
  const openAdd  = () => { setEditId(null); setFTitle(""); setFDate(addDays(0)); setFNotes(""); setFCat("Personal"); setModal(true); };
  const openEdit = (t) => { setEditId(t.id); setFTitle(t.title); setFDate(t.dueDate || addDays(0)); setFNotes(t.notes || ""); setFCat(t.category); setModal(true); };
  
  const saveTask = async () => {
    if (!fTitle.trim()) return;

    const taskData = { title: fTitle, category: fCat, dueDate: fDate, notes: fNotes };

    if (editId !== null) {
      // MODO EDICIÓN (PUT a PostgreSQL)
      taskData.completed = tasks.find(t => t.id === editId)?.completed || false;
      
      setTasks(tasks.map((t) => t.id === editId ? { ...t, ...taskData } : t));
      setModal(false);

      try {
        await fetch(`/api/tasks/${editId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(taskData)
        });
      } catch (error) {
        console.error("Error al editar tarea:", error);
      }
    } else {
      // MODO CREACIÓN (POST a PostgreSQL)
      try {
        const response = await fetch('/api/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(taskData)
        });
        const result = await response.json();
        if (result.status === 'success') {
          setTasks([result.data, ...tasks]);
          setModal(false);
        }
      } catch (error) {
        console.error("Error al crear tarea:", error);
      }
    }
  };

  // ── Misc ────────────────────────────────────────────────────────────────────
  const dayLabel   = new Date().toLocaleDateString("es-CL", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  const handleLogout = () => alert("Cerrando sesión de usuario...");
  const showSearch   = view !== "ajustes" && view !== "dashboard";

  // ── Valor del contexto ──────────────────────────────────────────────────────
  const value = {
    view, setView, category, dateFilter, showMonths,
    darkMode, setDarkMode, isSidebarCollapsed, setIsSidebarCollapsed,
    search, setSearch,
    showModal, setModal, editId,
    fTitle, setFTitle, fDate, setFDate, fNotes, setFNotes, fCat, setFCat,
    total, doneN, pendN, overdueN,
    catTotal, catDone, catPend, catOver,
    filtered, groupedTasks, sortedMonthKeys, recentTasks, currentMonthKey,
    isMonthCollapsed, toggleMonth,
    go, goCat, setDF, toggleTask, deleteTask, openAdd, openEdit, saveTask,
    handleLogout, dayLabel, showSearch,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
// ── Registrar dispositivo para notificaciones ──────────────────────────────
  const registerDevice = async () => {
    // Simulamos un token (en un entorno real usarías Firebase o Web Push)
    // Usaremos un identificador único basado en el tiempo si es la primera vez
    const token = localStorage.getItem("device_token") || `browser_${Date.now()}`;
    localStorage.setItem("device_token", token);

    try {
      await fetch('/api/devices/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, type: 'browser' })
      });
      console.log("Dispositivo registrado exitosamente");
    } catch (error) {
      console.error("Error registrando dispositivo:", error);
    }
  };

  // Ejecutamos el registro al iniciar la app
  useEffect(() => {
    registerDevice();
  }, []);