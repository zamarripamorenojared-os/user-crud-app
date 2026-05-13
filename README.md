# ⬡ UserVault — Gestión de Usuarios (CRUD)

Aplicación web **SPA (Single Page Application)** para gestión completa de usuarios con operaciones CRUD. Funciona sin backend ni base de datos externa; usa `localStorage` como capa de persistencia.

## ✨ Funcionalidades

| Operación | Descripción |
|-----------|-------------|
| **Registrar** | Alta de usuario con nombre(s), apellido(s), correo y contraseña |
| **Consultar** | Visualización en tarjetas con búsqueda en tiempo real |
| **Modificar** | Edición de todos los campos del usuario |
| **Eliminar** | Borrado con confirmación |

### Extras
- Indicador de fortaleza de contraseña
- Validación de formulario con mensajes de error inline
- Búsqueda en vivo por nombre o correo
- Modal de detalle al hacer clic en una tarjeta
- Avatares con iniciales y color único por usuario
- Diseño responsive (mobile-first)
- Sin dependencias externas de JavaScript

## 🗂️ Estructura del proyecto

```
user-crud-app/
├── index.html   ← Estructura HTML + referencias
├── style.css    ← Estilos (variables CSS, dark theme, animaciones)
├── app.js       ← Lógica CRUD + localStorage + validaciones
└── README.md
```

## 🚀 Cómo ejecutar

### Opción 1 — Directamente en el navegador
1. Clona o descarga el repositorio
2. Abre `index.html` en cualquier navegador moderno
3. ¡Listo! No requiere servidor ni instalación

```bash
git clone https://github.com/TU_USUARIO/user-crud-app.git
cd user-crud-app
# Abre index.html en tu navegador
```

### Opción 2 — Con servidor local (recomendado)
```bash
# Python 3
python -m http.server 3000

# Node.js (npx)
npx serve .

# VS Code → extensión "Live Server" → clic en "Go Live"
```
Luego visita: `http://localhost:3000`

### Opción 3 — GitHub Pages (publicar en línea)
1. Sube el repositorio a GitHub
2. Ve a **Settings → Pages**
3. En *Source*, selecciona `main` / `root`
4. Tu app estará en: `https://TU_USUARIO.github.io/user-crud-app/`

## 💾 Persistencia de datos

Los usuarios se almacenan en `localStorage` bajo la clave `uv_users`. Los datos persisten aunque se cierre el navegador. Para limpiar los registros:

```javascript
// Pega esto en la consola del navegador (F12)
localStorage.removeItem('uv_users');
location.reload();
```

> **Nota de seguridad:** Las contraseñas se almacenan en Base64 solo como demostración. En un entorno de producción real, **siempre** usa hashing seguro (bcrypt/argon2) en el lado del servidor.

## 🛠️ Tecnologías

- **HTML5** semántico
- **CSS3** — Custom Properties, Grid, Flexbox, animaciones
- **JavaScript ES2020** — vanilla, sin frameworks
- **localStorage** — persistencia client-side
- **Google Fonts** — Syne + DM Sans

## 📱 Capturas

> La interfaz cuenta con tema oscuro, tarjetas con avatares de iniciales, buscador en tiempo real y formulario de registro con validaciones.

## 📄 Licencia

MIT — libre para uso personal y comercial.
