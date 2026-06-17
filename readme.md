## ☁️ CloudTask — To-Do App

Aplicación web de gestión de tareas personales, desarrollada como proyecto universitario.

---

## 🧰 Stack Tecnológico

| Capa | Tecnología |
|------|------------|
| Frontend | React + Vite |
| Backend | Node.js + Express.js |
| Base de datos | PostgreSQL (AWS RDS) |
| Caché | Redis (AWS ElastiCache) |
| Autenticación | Amazon Cognito |
| Hosting frontend | AWS S3 + CloudFront |
| Contenedores | Docker + AWS ECS Fargate |

---


## 📁 Estructura del Proyecto

```
todo-app-cloud-grupo4/
│
├── 📂 frontend/
│   ├── node_modules/                         # ✅ Dependencias instaladas (npm install)
│   ├── public/
│   │   └── favicon.ico                       # ⚠️ Falta por agregar
│   ├── src/
│   │   ├── assets/
│   │   │   └── styles/
│   │   │       └── global.css                # ✅ Variables CSS y clases base (separado del JSX)
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── Sidebar.jsx               # ✅ Sidebar colapsable con navegación
│   │   │   │   └── TopBar.jsx                # ✅ Barra superior con búsqueda y nueva tarea
│   │   │   └── ui/
│   │   │       ├── StatCard.jsx              # ✅ Tarjeta de estadística
│   │   │       ├── TaskCard.jsx              # ✅ Tarjeta de tarea individual
│   │   │       ├── TaskModal.jsx             # ✅ Modal crear/editar tarea
│   │   │       └── MonthAccordion.jsx        # ✅ Acordeón por mes
│   │   ├── context/
│   │   │   └── AppContext.jsx                # ✅ Estado global + lógica central
│   │   ├── pages/
│   │   │   ├── Dashboard/
│   │   │   │   └── DashboardView.jsx         # ✅ Vista principal del dashboard
│   │   │   ├── Tasks/
│   │   │   │   └── TasksView.jsx             # ✅ Vista de listados (Todas/Pendientes/etc.)
│   │   │   └── Settings/
│   │   │       └── SettingsView.jsx          # ✅ Vista de Ajustes del sistema
│   │   ├── services/                         # ⚠️ Falta por agregar — Llamadas HTTP al backend
│   │   ├── utils/
│   │   │   ├── dateHelpers.js                # ✅ Funciones puras de fecha
│   │   │   └── mockData.js                   # ✅ Datos de prueba + constantes
│   │   ├── App.jsx                           # ✅ Raíz: contexto + tema + rutas
│   │   └── main.jsx                          # ✅ Punto de entrada React (sin cambios)
│   ├── .env.example                          # ⚠️ Falta por agregar
│   ├── .gitignore
│   ├── index.html                            # ✅ Punto de entrada HTML (Vite)
│   ├── package.json
│   ├── package-lock.json
│   └── vite.config.js
│
├── 📂 backend/
│   ├── node_modules/                         # ✅ Dependencias instaladas (npm install)
│   ├── controllers/                          # ⚠️ Falta por agregar — Lógica CRUD de tareas
│   ├── middlewares/                          # ⚠️ Falta por agregar — Validación JWT (Cognito)
│   ├── models/                               # ⚠️ Falta por agregar — Estructura tablas PostgreSQL
│   ├── routes/                               # ⚠️ Falta por agregar — Endpoints REST
│   └── src/
│       ├── config/
│       │   ├── db.js                         # ⚠️ Falta por agregar — Conexión RDS PostgreSQL
│       │   ├── cache.js                      # ⚠️ Falta por agregar — Conexión ElastiCache Redis
│       │   └── aws.js                        # ⚠️ Falta por agregar — Secrets Manager
│       └── index.js                          # ⚠️ Falta por agregar — Servidor principal Express
│   ├── package.json                          # ✅ Generado con npm init
│   ├── package-lock.json                     # ✅ Generado automáticamente
│   ├── .env.example                          # ⚠️ Falta por agregar
│   └── Dockerfile                            # ⚠️ Falta por agregar
│
├── 📂 infra/
│   ├── buildspec.yml                         # ⚠️ Falta por agregar
│   └── task-definition.json                  # ⚠️ Falta por agregar
│
└── README.md
```


## 📁 instalacion frontend
    
cd frontend
npm install


## 📁 instalacion backend

cd backend

npm init -y
npm install express pg ioredis jsonwebtoken jwks-rsa dotenv cors helmet @aws-sdk/client-secrets-manager
npm install --save-dev nodemon


## Para git hub 

1. Preparar todos los cambios nuevos o modificados

git add .

2. Guardar el punto de control con un mensaje claro

git commit -m "cambios"

3. Subir los cambios a la nube (ya no necesitas el -u origin main)

git push