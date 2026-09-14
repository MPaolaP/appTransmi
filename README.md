# 🚍 AppTransmi

Aplicación web para consultar y gestionar información del sistema **TransMilenio de Bogotá**. El proyecto utiliza **React + Vite** en el frontend, **Node.js + Express** en el backend y **MySQL** como base de datos.

## 📌 ¿Qué hace?

AppTransmi integra una interfaz web con una API REST conectada a MySQL para ofrecer funcionalidades relacionadas con usuarios, rutas y tarjetas:

- 🔐 Inicio de sesión mediante cédula y contraseña.
- 🏠 Página principal del usuario.
- 🚌 Consulta de rutas.
- 🚉 Consulta de estaciones.
- 🕐 Consulta de horarios.
- 🔎 Búsqueda de rutas por nombre o estación.
- 💳 Consulta de saldo de tarjeta.
- 📋 Consulta del historial de recargas.
- 💰 Registro de recargas en línea.
- 👤 Consulta del tipo de usuario y tarifa asociada.

La aplicación principal se encuentra en `src/` y consume el backend que se ejecuta en `http://localhost:5000`.

## 🏗️ Arquitectura

```text
┌─────────────────────────┐
│      React + Vite       │
│        Frontend         │
│                         │
│ Login · Home · Rutas    │
│ Balance · Historial     │
│ Recarga                 │
└────────────┬────────────┘
             │ HTTP / JSON
             ▼
┌─────────────────────────┐
│    Node.js + Express    │
│        Backend          │
│                         │
│ Auth · Rutas · Tarjetas │
│ Recargas · Tarifas      │
└────────────┬────────────┘
             │ mysql2
             ▼
┌─────────────────────────┐
│          MySQL          │
│       transmilenio      │
│                         │
│ Persona · Usuario       │
│ Tarjeta · Recarga       │
│ Ruta · Estacion         │
│ Parada · Tipo_pasaje    │
└─────────────────────────┘
```

## 🛠️ Tecnologías

**Frontend**
- React 19
- Vite 6
- React Router 7
- JavaScript / JSX
- CSS

**Backend**
- Node.js
- Express 4
- MySQL
- mysql2
- CORS
- bcrypt
- dotenv

## 📂 Estructura

```text
appTransmi/
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── Balance.jsx
│   │   ├── Historial.jsx
│   │   ├── Home.jsx
│   │   ├── Login.jsx
│   │   ├── Recarga.jsx
│   │   └── Rutas.jsx
│   ├── App.jsx
│   └── main.jsx
│
├── backend/
│   ├── server.js
│   ├── setup-credenciales.js
│   ├── package.json
│   └── package-lock.json
│
├── public/
├── package.json
├── vite.config.js
├── eslint.config.js
└── README.md
```

> El directorio `Transmi/` contiene una implementación React/TSX anterior o paralela. La aplicación principal ejecutada desde la raíz utiliza `src/` y `src/App.jsx`.

## ⚙️ Requisitos

- Node.js 18 o superior.
- npm.
- MySQL Server.
- Una base de datos `transmilenio` con las tablas requeridas por el backend.

## 🚀 Instalación

### 1. Clonar

```bash
git clone https://github.com/MPaolaP/appTransmi.git
cd appTransmi
```

### 2. Instalar frontend

```bash
npm install
```

### 3. Instalar backend

```bash
cd backend
npm install
cd ..
```

### 4. Configurar MySQL

Crea `backend/.env` con tus credenciales locales:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_contraseña
DB_NAME=transmilenio
DB_CONNECTION_LIMIT=10
DB_QUEUE_LIMIT=0
```

No publiques `.env` ni credenciales reales en GitHub.

### 5. Preparar la base de datos

La base de datos debe contener, como mínimo, las entidades utilizadas por el backend para personas, usuarios, credenciales, tarjetas, recargas, proveedores, rutas, estaciones, paradas y tipos de pasaje.

## ▶️ Ejecución

Ejecuta el frontend y el backend en terminales separadas.

**Terminal 1 — Backend**

```bash
cd backend
npm start
```

Servidor: `http://localhost:5000`

**Terminal 2 — Frontend**

Desde la raíz del proyecto:

```bash
npm run dev
```

Vite mostrará la URL local, normalmente `http://localhost:5173`.

## 🔌 API REST

| Método | Endpoint | Descripción |
|---|---|---|
| `POST` | `/login` | Autentica al usuario. |
| `GET` | `/rutas` | Obtiene todas las rutas. |
| `GET` | `/rutas/buscar?q=...` | Busca rutas por nombre o estación. |
| `GET` | `/estaciones` | Obtiene las estaciones. |
| `GET` | `/horarios` | Obtiene horarios de las rutas. |
| `GET` | `/api/user/:cedula` | Obtiene información básica del usuario. |
| `GET` | `/api/usuario/tipo/:cedula` | Consulta el tipo de usuario. |
| `GET` | `/api/tarjeta/:cedula` | Consulta la tarjeta asociada a una persona. |
| `GET` | `/api/tarjeta/id/:tarjetaId` | Consulta una tarjeta por ID. |
| `GET` | `/api/recargas/:tarjetaId` | Consulta las recargas de una tarjeta. |
| `GET` | `/api/tarifas/pasaje/:tipoUsuario` | Consulta la tarifa por tipo de usuario. |
| `POST` | `/api/online-recharge` | Registra una recarga y actualiza el saldo. |

## 💳 Flujo de recarga

La recarga en línea sigue este flujo:

```text
Usuario
  │
  │ correo + banco + monto + tarjeta
  ▼
POST /api/online-recharge
  │
  ├── INSERT Recarga
  ├── INSERT Online_recarga
  ├── INSERT Proveedor_recarga
  └── UPDATE Tarjeta.tar_saldo
          │
          ▼
      Recarga registrada
```

## 🔐 Autenticación

El endpoint `/login` recibe la cédula y contraseña, busca la credencial correspondiente en `credenciales`, compara la contraseña mediante **bcrypt** y después consulta los datos de la persona en `Persona`.

La aplicación es actualmente de carácter **académico/demostrativo**. Para producción sería necesario implementar sesiones seguras o JWT, autorización por roles y controles adicionales de seguridad.

## 🖥️ Vistas principales

### Login
Autenticación del usuario.

### Home
Página principal y navegación hacia las funcionalidades de la aplicación.

### Rutas
Consulta rutas, estaciones y horarios, además de búsqueda y filtros.

### Balance
Consulta información del saldo de la tarjeta.

### Historial
Muestra el historial de recargas asociado a una tarjeta.

### Recarga
Busca una tarjeta mediante la cédula y permite registrar una recarga en línea proporcionando correo, banco y monto.

## 📜 Scripts

**Frontend**

```bash
npm run dev       # Desarrollo
npm run build     # Build de producción
npm run preview   # Previsualización del build
npm run lint      # ESLint
```

**Backend**

```bash
npm start         # Inicia Express
```

## ⚠️ Mejoras pendientes

El proyecto funciona como demostración, pero antes de llevarlo a producción conviene:

- Centralizar la URL del backend mediante variables de entorno.
- Implementar autenticación persistente con JWT o cookies seguras.
- Implementar autorización por roles.
- Usar transacciones SQL para las recargas.
- Validar estrictamente monto, correo, tarjeta y banco.
- Evitar registrar información sensible en logs.
- Mover todas las credenciales a variables de entorno.
- Corregir/eliminar código legado.
- Añadir pruebas automatizadas.

## 🔒 Seguridad

El archivo `backend/setup-credenciales.js` contiene actualmente credenciales de conexión escritas directamente en el código. Esto debe corregirse antes de compartir o desplegar el proyecto. Si alguna contraseña real ya fue publicada en GitHub, debe cambiarse inmediatamente.

## 🎓 Objetivo académico

AppTransmi sirve como proyecto académico para demostrar la integración entre:

- Desarrollo frontend con React.
- APIs REST.
- Backend con Express.
- Persistencia con MySQL.
- Hashing de contraseñas con bcrypt.
- Consultas de transporte público.
- Gestión de tarjetas y recargas.

## 👩‍💻 Autora

**MPaolaP**

[Repositorio en GitHub](https://github.com/MPaolaP/appTransmi)

---

⭐ Si el proyecto te resulta útil, puedes darle una estrella al repositorio.
