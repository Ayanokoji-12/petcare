PETCARE+ - INTEGRACION INICIAL CON REACT
========================================

IMPORTANTE: ESTA ES LA PRIMERA ETAPA DE MIGRACION.
El sitio original se conserva INTACTO en public/legacy y se muestra dentro de React.
Esto preserva la apariencia y scripts originales; NO significa que el HTML y JS original
se hayan convertido a componentes React todavia.

PASOS EN WINDOWS (PowerShell):
1. No borres tu carpeta Frontend original.
2. Renombra tu carpeta actual Frontend-React a Frontend-React-Respaldo
   (hazlo con el servidor Vite detenido).
3. Descomprime este ZIP en C:\laragon\www\petcare\
4. Renombra la carpeta PETCARE-React-Inicio a Frontend-React
5. Abre una terminal en C:\laragon\www\petcare\Frontend-React
6. Ejecuta: npm install
7. Ejecuta: npm run dev
8. Abre la URL que Vite muestre, normalmente http://localhost:5173

RUTAS:
/           -> portada original PETCARE+
/login      -> login original PETCARE+
/panel      -> panel administrativo original PETCARE+
/react      -> demostracion de componentes React, aun sin API real
/react/mascotas, /react/especies, /react/pagos -> prototipos React

El sitio original redirige internamente a /legacy/login.html y /legacy/admin.html.
Eso es normal en esta etapa. El token de sessionStorage comparte el mismo origen
si Vite y el sitio original se abren en el mismo host/puerto.

BACKEND:
Para login y operaciones reales, el backend Express debe estar iniciado en
http://localhost:3000, como espera el JavaScript original. La conexion API y CORS
requieren verificacion en el entorno local; no estan validadas en este ZIP.

PROXIMAS ETAPAS:
- Convertir portada, login y panel a JSX real
- Convertir cada modulo a componentes React, con hooks y React Router
- Conectar la API, autenticacion y permisos con pruebas funcionales
- Eliminar la capa legacy solo cuando todo este migrado y probado

No se modifica la carpeta Backend ni la base de datos.
