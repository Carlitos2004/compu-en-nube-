// ─── dateHelpers.js ───────────────────────────────────────────────────────────
// Funciones utilitarias de fecha para calcular buckets, etiquetas y formato.
// Sin dependencias externas — se puede testear de forma aislada.

export const today0 = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

export const addDays = (n) => {
  const d = today0();
  d.setDate(d.getDate() + n);
  return d.toISOString().split("T")[0];
};

export const getBucket = (dueDate) => {
  if (!dueDate) return "sin-fecha";
  const now = today0();
  const due = new Date(dueDate + "T00:00:00");
  due.setHours(0, 0, 0, 0);
  const diff = Math.round((due - now) / 86400000);
  if (diff < 0)   return "vencidas";
  if (diff === 0) return "hoy";
  if (diff === 1) return "manana";
  return `${due.getFullYear()}-${String(due.getMonth() + 1).padStart(2, "0")}`;
};

export const getMonthKey = (dueDate) => {
  if (!dueDate) return "0000-00";
  const due = new Date(dueDate + "T00:00:00");
  return `${due.getFullYear()}-${String(due.getMonth() + 1).padStart(2, "0")}`;
};

export const monthLabel = (id) => {
  if (id === "0000-00") return "Sin fecha definida";
  const [y, m] = id.split("-");
  const s = new Date(+y, +m - 1, 1).toLocaleDateString("es-CL", {
    month: "long",
    year: "numeric",
  });
  return s.charAt(0).toUpperCase() + s.slice(1);
};

export const fmtDateStr = (dueDate) => {
  const b = getBucket(dueDate);
  if (b === "hoy")    return "Hoy";
  if (b === "manana") return "Mañana";
  return new Date(dueDate + "T00:00:00").toLocaleDateString("es-CL", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};