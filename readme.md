CloudTask – Gestión de Tareas en la Nube

Aplicación web para la gestión de tareas desarrollada con una arquitectura Frontend + Backend + Base de Datos en la nube, desplegada sobre AWS EC2.

Integrantes
Nicolás Exequiel Dreller
Carlos (Agregar apellido)
(Agregar resto del equipo)
Tecnologías utilizadas
Frontend
React
Vite
React Router
Backend
Node.js 20
Express.js
Base de datos
Neon PostgreSQL (Cloud)
Infraestructura
AWS EC2 (Amazon Linux 2023)
PM2
GitHub Actions
Docker
Arquitectura
Usuario
    │
    ▼
Frontend (React + Vite)
Puerto 3000
    │
    ▼
Backend (Node + Express)
Puerto 5000
    │
    ▼
Neon PostgreSQL
(Base de datos Cloud)
Requisitos
Node.js 20
npm
Git
Cuenta de AWS
Base de datos Neon
Instalación
1. Clonar repositorio
git clone https://github.com/Carlitos2004/compu-en-nube-.git

cd compu-en-nube-
2. Backend

Entrar al backend

cd backend

Instalar dependencias

npm install

Crear el archivo .env

Ejemplo:

PORT=5000

DATABASE_URL=...

FEATURE_AUTH_ENABLED=false

Ejecutar

npm run dev

o en producción

npm start
3. Frontend

Entrar al frontend

cd frontend

Instalar dependencias

npm install

Ejecutar

npm run dev

Compilar

npm run build

Vista previa

npm run preview
Despliegue en AWS EC2
Actualizar sistema
sudo dnf update -y
Instalar Git
sudo dnf install git -y
Instalar Node.js 20
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -

sudo dnf install nodejs -y

Verificar

node -v

npm -v
Clonar el proyecto
git clone https://github.com/Carlitos2004/compu-en-nube-.git

cd compu-en-nube-
Levantar Backend
cd backend

npm install

pm2 start src/index.js --name backend
Levantar Frontend
cd ../frontend

npm install

pm2 start "npm run preview -- --host 0.0.0.0 --port 3000" --name frontend

Guardar procesos

pm2 save

Verificar

pm2 list

Salida esperada

backend   online

frontend  online
Health Checks

Liveness

GET /api/health/liveness

Readiness

GET /api/health/readiness

Metrics

GET /api/health/metrics

Ejemplo

curl http://localhost:5000/api/health/liveness
CI/CD

El proyecto utiliza GitHub Actions.

En cada push a la rama main se ejecuta automáticamente:

Instalación de dependencias
Ejecución de pruebas con Jest
Construcción de la imagen Docker

Archivo:

.github/workflows/ci.yml
Docker

Construir imagen

cd backend

docker build -t todoapp-backend .
Acceso a la aplicación

Frontend

http://IP_PUBLICA_EC2:3000

Backend

http://IP_PUBLICA_EC2:5000

Health Check

http://IP_PUBLICA_EC2:5000/api/health/liveness
Estructura del proyecto
compu-en-nube-

├── backend
│   ├── controllers
│   ├── middlewares
│   ├── models
│   ├── routes
│   ├── src
│   ├── tests
│   ├── Dockerfile
│   └── package.json
│
├── frontend
│   ├── src
│   ├── public
│   ├── package.json
│   └── vite.config.js
│
├── infra
│
└── .github
    └── workflows
        └── ci.yml
Mejoras implementadas respecto a la Evaluación 1
Despliegue completo en AWS EC2.
Integración con base de datos Neon PostgreSQL.
Ejecución del backend y frontend mediante PM2.
Health Checks (Liveness, Readiness y Metrics).
Pipeline CI con GitHub Actions.
Dockerfile para el backend.
Uso de variables de entorno para la configuración.