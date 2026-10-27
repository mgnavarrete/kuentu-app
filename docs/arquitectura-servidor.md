# Versión web con usuarios: arquitectura

> **Estado:** fases 2 a 4 implementadas en `server/` y `src/lib/account.ts`, `src/lib/sync.ts`. Ver «Servidor y cuentas» en el README.

Objetivo: publicar la app en un servidor propio (Nginx + dominio), con cuentas que crea el administrador,
un tablero por usuario guardado en una base de datos y acceso desde varios dispositivos,
**sin rehacer lo que ya existe**.

## Idea central: la app sigue funcionando sola, el servidor solo sincroniza

Hoy toda la información del usuario (tableros, ajustes, palabras aprendidas, recientes) ya vive en **un solo
objeto `AppData`** que se guarda en IndexedDB (`src/lib/store.ts`). Eso facilita mucho el trabajo:

- La app sigue guardando primero en el dispositivo, así **funciona sin internet** (clave para un comunicador:
  no puede dejar de hablar porque se cayó el wifi).
- Si hay sesión iniciada, cada cambio se envía además al servidor unos segundos después (guardado automático).
- Al iniciar sesión en otro dispositivo, se descarga el `AppData` del servidor.
- Sin sesión (o en el APK / Windows sin cuenta) se comporta exactamente como ahora.

```
 Navegador / APK / Windows                     Servidor (tu VPS)
┌──────────────────────────┐   HTTPS   ┌────────────────────────────────────┐
│ React (igual que hoy)    │ ────────▶ │ Nginx                              │
│ IndexedDB = copia local  │           │  ├─ /       → archivos de dist/    │
│ sync.ts: subir / bajar   │ ◀──────── │  └─ /api/*  → Node (puerto 3000)   │
└──────────────────────────┘           │        └─ base de datos            │
                                       └────────────────────────────────────┘
```

## Piezas

| Pieza | Propuesta | Por qué |
|---|---|---|
| Backend | Node + **Fastify** en TypeScript, carpeta `server/` del mismo repositorio | Mismo lenguaje que la app; puede reutilizar `src/lib/types.ts` |
| Base de datos | **PostgreSQL** (ya instalado en el servidor) | Columna `jsonb` para guardar el tablero completo y consultarlo; respaldos con `pg_dump` |
| Acceso a datos | **pg** (node-postgres) con SQL directo (`server/sql/`) | Son pocas consultas; menos dependencias que un ORM |
| Sesiones | Cookie `httpOnly` + `Secure` + `SameSite=Lax` con id de sesión guardado en la base | Más simple y seguro que JWT para una app web propia; cerrar sesión borra la fila |
| Contraseñas | **scrypt** (incluido en Node) | Seguro y sin dependencias nativas que compilar en el servidor |
| Servidor web | Nginx sirve `dist/` y redirige `/api/` al Node; HTTPS con **Let's Encrypt (certbot)** | |
| Proceso | **systemd** (o pm2) para mantener el Node encendido | |

## Base de datos (mínima)

```
users      id, username, password_hash, display_name, role ('admin' | 'user'), created_at, disabled
sessions   id (aleatorio), user_id, expires_at, user_agent
boards     user_id (PK), data (jsonb con el AppData), version (entero), updated_at
```

Guardar el `AppData` completo como un documento JSON por usuario es lo que permite avanzar sin rehacer nada:
el formato es el mismo que ya usa el respaldo (`exportData` / `importData`).
Si más adelante se necesita (por ejemplo, para compartir carpetas entre usuarios), se puede separar en tablas.

## API

```
POST   /api/login            { username, password }  → cookie de sesión
POST   /api/logout
GET    /api/me               → { username, displayName, role }
GET    /api/data             → { data: AppData, version }
PUT    /api/data             { data, baseVersion }  → { version }   (409 si otro dispositivo guardó antes)

# solo admin
GET    /api/admin/users
POST   /api/admin/users      { username, password, displayName }
PATCH  /api/admin/users/:id  { password?, disabled?, displayName? }
DELETE /api/admin/users/:id
```

**Varios dispositivos:** cada guardado manda la `version` que tenía. Si en el servidor hay una más nueva
(se editó desde otro dispositivo), responde 409; la app descarga la versión nueva y avisa
«Se actualizó desde otro dispositivo». Para un tablero de CAA, donde casi siempre edita una sola persona
(terapeuta o familia), esto basta; no hace falta edición simultánea en tiempo real.

**Recientes y palabras aprendidas** cambian con cada frase; se pueden subir agrupados cada 30 s
para no saturar el servidor.

## Cambios en la app

- `src/lib/sync.ts` nuevo: `login`, `logout`, `pull`, `push` con espera de 2 s después de cada cambio.
- `App.tsx`: después de `saveData(data)`, llamar a `push`. Al abrir con sesión, `pull`.
- Pantalla de inicio de sesión (solo en la versión web, o como opción en Ajustes → «Cuenta»).
- Panel de administración simple (`/admin`) para crear, desactivar y cambiar contraseña de usuarios.
- Indicador discreto en la barra superior: guardado ✓ / sin conexión / guardando…

## Fases (cada una sirve por sí sola)

1. **GitHub + publicación estática.** Subir el repositorio (sin `android/keystore.properties` ni `*.jks`,
   ya están en `.gitignore`), configurar Nginx + dominio + HTTPS sirviendo `dist/`. La app ya funciona en
   la web, cada dispositivo con sus datos locales.
2. **Backend con cuentas.** `server/` con login, sesiones y `GET/PUT /api/data`. Usuarios creados por
   consola (`npm run user:create`). El tablero queda guardado en el servidor.
3. **Panel de administración** en la web.
4. **Sincronización multi-dispositivo** con control de versiones (409) y aviso en pantalla.
5. **APK y Windows con cuenta opcional**, apuntando al mismo servidor.
6. Más adelante: un terapeuta que administra varios usuarios, plantillas para crear tableros nuevos,
   historial de versiones del tablero (deshacer cambios), respaldo automático diario de la base.

## Despliegue (resumen)

```nginx
server {
    server_name tudominio.cl;
    root /var/www/kuentu/dist;

    location /api/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    location / {
        try_files $uri $uri/ /index.html;
    }
    location ~* \.(png|js|css|svg)$ {
        expires 30d;
    }
}
```

Luego `sudo certbot --nginx -d tudominio.cl` para HTTPS (obligatorio: sin HTTPS no funcionan ni la
instalación como app ni las cookies seguras).

## Notas

- **Licencia de pictogramas:** publicarla en la web está permitido mientras sea **gratuita** y se mantenga la
  atribución a ARASAAC. Cobrar por las cuentas convertiría el uso en comercial.
- **Datos personales:** los tableros pueden incluir fotos y nombres de niños. Usar HTTPS siempre, respaldar
  la base cifrada y no registrar el contenido de los mensajes en los logs del servidor.
