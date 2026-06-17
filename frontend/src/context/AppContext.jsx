import React, { createContext, useContext, useEffect, useState } from "react";
import { INIT_TASKS } from "../utils/mockData";
import { addDays, getBucket, getMonthKey } from "../utils/dateHelpers";
import { tasksApi } from "../services/tasksApi";

const AppContext = createContext(null);
export const useApp = () => useContext(AppContext);

export default function AppProvider({ children }) {
  const [view, setView] = useState("dashboard");
  const [category, setCategory] = useState(null);
  const [dateFilter, setDateFilter] = useState("todas");
  const [showMonths, setShowMonths] = useState(false);

  const [darkMode, setDarkMode] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [search, setSearch] = useState("");
  const [collapsedOverrides, setCollapsedOverrides] = useState({});

  const [tasks, setTasks] = useState(INIT_TASKS);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState(null);

  const [showModal, setModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [fTitle, setFTitle] = useState("");
  const [fDate, setFDate] = useState("");
  const [fNotes, setFNotes] = useState("");
  const [fCat, setFCat] = useState("Personal");

  useEffect(() => {
    let isMounted = true;

    const loadTasks = async () => {
      try {
        setIsSyncing(true);
        const backendTasks = await tasksApi.list();
        if (isMounted) {
          setTasks(backendTasks);
          setSyncError(null);
        }
      } catch (error) {
        console.error("No se pudieron cargar las tareas desde el backend:", error);
        if (isMounted) setSyncError(error.message);
      } finally {
        if (isMounted) setIsSyncing(false);
      }
    };

    loadTasks();

    return () => {
      isMounted = false;
    };
  }, []);

  const total = tasks.length;
  const doneN = tasks.filter((t) => t.completed).length;
  const pendN = tasks.filter((t) => !t.completed).length;
  const overdueN = tasks.filter((t) => getBucket(t.dueDate) === "vencidas" && !t.completed).length;

  const catTasks = category ? tasks.filter((t) => t.category === category) : [];
  const catTotal = catTasks.length;
  const catDone = catTasks.filter((t) => t.completed).length;
  const catPend = catTasks.filter((t) => !t.completed).length;
  const catOver = catTasks.filter((t) => getBucket(t.dueDate) === "vencidas" && !t.completed).length;

  let filtered = [...tasks];
  if (search.trim()) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (t) => t.title.toLowerCase().includes(q) || String(t.notes || "").toLowerCase().includes(q)
    );
  }
  if (category) filtered = filtered.filter((t) => t.category === category);
  if (view === "pendientes") filtered = filtered.filter((t) => !t.completed);
  if (view === "completadas") filtered = filtered.filter((t) => t.completed);
  if (view === "vencidas") filtered = filtered.filter((t) => getBucket(t.dueDate) === "vencidas" && !t.completed);
  if (view === "dashboard" && dateFilter !== "todas" && dateFilter !== "meses") {
    if (dateFilter.length > 6) {
      filtered = filtered.filter((t) => getMonthKey(t.dueDate) === dateFilter);
    } else {
      filtered = filtered.filter((t) => getBucket(t.dueDate) === dateFilter);
    }
  }

  const groupedTasks = {};
  filtered.forEach((t) => {
    const mk = getMonthKey(t.dueDate);
    if (!groupedTasks[mk]) groupedTasks[mk] = [];
    groupedTasks[mk].push(t);
  });

  const todayDate = new Date();
  const currentMonthKey = `${todayDate.getFullYear()}-${String(todayDate.getMonth() + 1).padStart(2, "0")}`;

  const sortedMonthKeys = Object.keys(groupedTasks).sort((a, b) => {
    if (a === "0000-00") return 1;
    if (b === "0000-00") return -1;
    const isAPast = a < currentMonthKey;
    const isBPast = b < currentMonthKey;
    if (isAPast && !isBPast) return 1;
    if (!isAPast && isBPast) return -1;
    if (isAPast && isBPast) return b.localeCompare(a);
    return a.localeCompare(b);
  });

  const recentTasks = [...tasks].filter((t) => !t.completed).slice(0, 3);

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

  const go = (v) => {
    setView(v);
    setCategory(null);
    setDateFilter("todas");
  };

  const goCat = (c) => {
    setCategory(c);
    setView("todas");
    setDateFilter("todas");
  };

  const setDF = (f) => {
    if (f === "meses") {
      setShowMonths(!showMonths);
      return;
    }
    setDateFilter(f);
  };

  const toggleTask = async (id) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;

    const previousTasks = tasks;
    const completed = !task.completed;
    setTasks(tasks.map((t) => t.id === id ? { ...t, completed } : t));

    try {
      const updatedTask = await tasksApi.updateStatus(id, completed);
      setTasks((current) => current.map((t) => t.id === id ? updatedTask : t));
      setSyncError(null);
    } catch (error) {
      console.error("No se pudo actualizar la tarea:", error);
      setTasks(previousTasks);
      setSyncError(error.message);
      alert("No se pudo actualizar la tarea en el backend.");
    }
  };

  const deleteTask = async (id) => {
    const previousTasks = tasks;
    setTasks(tasks.filter((t) => t.id !== id));

    try {
      await tasksApi.remove(id);
      setSyncError(null);
    } catch (error) {
      console.error("No se pudo eliminar la tarea:", error);
      setTasks(previousTasks);
      setSyncError(error.message);
      alert("No se pudo eliminar la tarea en el backend.");
    }
  };

  const openAdd = () => {
    setEditId(null);
    setFTitle("");
    setFDate(addDays(0));
    setFNotes("");
    setFCat("Personal");
    setModal(true);
  };

  const openEdit = (t) => {
    setEditId(t.id);
    setFTitle(t.title);
    setFDate(t.dueDate || addDays(0));
    setFNotes(t.notes || "");
    setFCat(t.category || "Personal");
    setModal(true);
  };

  const saveTask = async () => {
    if (!fTitle.trim()) return;

    const payload = {
      title: fTitle,
      dueDate: fDate,
      notes: fNotes,
      category: fCat
    };

    try {
      if (editId !== null) {
        const updatedTask = await tasksApi.update(editId, payload);
        setTasks(tasks.map((t) => t.id === editId ? updatedTask : t));
      } else {
        const createdTask = await tasksApi.create({ ...payload, completed: false });
        setTasks([createdTask, ...tasks]);
      }
      setSyncError(null);
      setModal(false);
    } catch (error) {
      console.error("No se pudo guardar la tarea:", error);
      setSyncError(error.message);
      alert("No se pudo guardar la tarea en el backend.");
    }
  };

  const dayLabel = new Date().toLocaleDateString("es-CL", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  });
  const handleLogout = () => alert("Cerrando sesion de usuario...");
  const showSearch = view !== "ajustes" && view !== "dashboard";

  const value = {
    view,
    setView,
    category,
    dateFilter,
    showMonths,
    darkMode,
    setDarkMode,
    isSidebarCollapsed,
    setIsSidebarCollapsed,
    search,
    setSearch,
    showModal,
    setModal,
    editId,
    fTitle,
    setFTitle,
    fDate,
    setFDate,
    fNotes,
    setFNotes,
    fCat,
    setFCat,
    total,
    doneN,
    pendN,
    overdueN,
    isSyncing,
    syncError,
    catTotal,
    catDone,
    catPend,
    catOver,
    filtered,
    groupedTasks,
    sortedMonthKeys,
    recentTasks,
    currentMonthKey,
    isMonthCollapsed,
    toggleMonth,
    go,
    goCat,
    setDF,
    toggleTask,
    deleteTask,
    openAdd,
    openEdit,
    saveTask,
    handleLogout,
    dayLabel,
    showSearch,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
