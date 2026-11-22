# Pappuk — Frontend

Cliente web de **Pappuk** (`client-gastos-rahemza`): plataforma de gestión financiera multiempresa. Es una SPA hecha con React 18, Vite 8 y React Router 7.

Este proyecto se ejecuta con **[Bun](https://bun.sh)** como gestor de paquetes y runner de scripts (hay un `bun.lock` en la raíz).

## Requisitos

- [Bun](https://bun.sh) instalado (`bun --version` para verificar).
- Node.js >= 22.12 (requerido por Vite 8; `engines` en `package.json`). Bun ejecuta los scripts, pero Vite corre sobre Node.

Para instalar Bun:

```bash
# macOS / Linux
curl -fsSL https://bun.sh/install | bash

# Windows (PowerShell)
powershell -c "irm bun.sh/install.ps1 | iex"
```

## Configuración

Crea un archivo `.env` en la raíz con:

```env
# URL del backend (por defecto: http://localhost:4000)
VITE_BACKEND_URL_GASTOS=http://localhost:4000

# URL del frontend, usada para el callbackURL de Google OAuth (por defecto: http://localhost:5173)
VITE_FRONTEND_URL=http://localhost:5173
```

En producción, cambia ambas por las URLs reales.

## Comandos

| Comando | Descripción |
|---|---|
| `bun install` | Instala las dependencias (usa `bun.lock`). |
| `bun run dev` | Inicia el servidor de desarrollo de Vite con HMR. |
| `bun run build` | Genera el bundle de producción en `dist/`. |
| `bun run preview` | Sirve el build de producción para revisarlo. |
| `bun run lint` | Corre ESLint sobre el proyecto. |

Para agregar o quitar dependencias, usa Bun para que `bun.lock` se mantenga actualizado:

```bash
bun add <paquete>
bun add -d <paquete>   # dependencia de desarrollo
bun remove <paquete>
```

> No uses `npm install` ni `yarn` en este proyecto: generarían otro lockfile (`package-lock.json` / `yarn.lock`) y desincronizarían las dependencias.

## Inicio rápido

```bash
bun install
bun run dev
```

La app queda disponible en `http://localhost:5173`.

## Despliegue

El proyecto incluye `vercel.json` con un rewrite de todas las rutas a `index.html` para que funcione React Router (SPA). Vercel detecta `bun.lock` y usa Bun para instalar. El comando de build es `bun run build` y el directorio de salida es `dist/`.
