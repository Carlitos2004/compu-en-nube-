// ─── mockData.js ──────────────────────────────────────────────────────────────
// Constantes de configuración y datos de muestra.
// Cuando se conecte el backend real, INIT_TASKS se reemplaza por llamadas HTTP.

import { addDays } from "./dateHelpers";

// ─ Paleta de colores por categoría ───────────────────────────────────────────
export const CAT_COLOR = {
  Personal: "#7C3AED",
  Trabajo:  "#0EA5E9",
  Compras:  "#F59E0B",
  Salud:    "#10B981",
  Familia:  "#EC4899",
};

// ─ Íconos Tabler por categoría ───────────────────────────────────────────────
export const CAT_ICON = {
  Personal: "ti-user",
  Trabajo:  "ti-briefcase",
  Compras:  "ti-shopping-bag",
  Salud:    "ti-heart",
  Familia:  "ti-users",
};

// ─ Etiquetas de vistas (para el TopBar) ──────────────────────────────────────
export const VT = {
  dashboard:   "Dashboard",
  todas:       "Todas las tareas",
  pendientes:  "Pendientes",
  completadas: "Completadas",
  vencidas:    "Vencidas",
  ajustes:     "Ajustes",
};

// ─ 12 meses del año 2026 para el navegador de fechas ─────────────────────────
export const ALL_MONTHS = Array.from(
  { length: 12 },
  (_, i) => `2026-${String(i + 1).padStart(2, "0")}`
);

// ─ Tareas de ejemplo (reemplazar por fetch al backend en producción) ──────────
export const INIT_TASKS = [
  { id: 101, title: "Configurar Keycloak y Docker",   notes: "Entorno de desarrollo local levantado",    category: "Trabajo",  dueDate: "2026-03-15",  completed: true  },
  { id: 102, title: "Torneo Tenis de Mesa",            notes: "Fase de grupos",                           category: "Salud",    dueDate: "2026-04-10",  completed: true  },
  { id: 103, title: "Hito 0 - Planificación",          notes: "Entrega de Excel y roles definidos",       category: "Trabajo",  dueDate: "2026-04-05",  completed: true  },
  { id: 104, title: "Reunión Grupo 3",                 notes: "Coordinar maquetación y UI/UX del panel",  category: "Trabajo",  dueDate: "2026-05-15",  completed: false },
  { id: 105, title: "Migrar base de datos a Neon",     notes: "Revisar modelos SQLAlchemy",               category: "Trabajo",  dueDate: addDays(0),    completed: false },
  { id: 106, title: "Pagar mensualidad",               notes: "Transferencia portal alumno",              category: "Personal", dueDate: addDays(1),    completed: false },
  { id: 107, title: "Comprar zapatillas deportivas",   notes: "Para los entrenamientos de la semana",     category: "Compras",  dueDate: "2026-05-28",  completed: false },
  { id: 108, title: "Corte de pelo (Taper fade)",      notes: "Pedir hora con el barbero",                category: "Personal", dueDate: "2026-06-05",  completed: false },
  { id: 109, title: "Hito 6 - Defensa Final",          notes: "Presentación del proyecto",                category: "Trabajo",  dueDate: "2026-07-08",  completed: false },
  { id: 110, title: "Reunión con cliente WellQ",       notes: "Validar dashboard administrativo",         category: "Trabajo",  dueDate: "2026-06-15",  completed: false },
  { id: 111, title: "Prueba recuperativa",             notes: "Repasar estructuras de datos",             category: "Trabajo",  dueDate: "2026-06-25",  completed: false },
  { id: 112, title: "Renovar suscripción servidores",  notes: "Hosting y dominios",                       category: "Compras",  dueDate: "2026-08-10",  completed: false },
];