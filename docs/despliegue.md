# Instalar Kuentu en un servidor propio

Pensado para un servidor Linux (Ubuntu/Debian) que **ya tiene otras cosas corriendo** con Nginx y PostgreSQL.
Kuentu no toca lo existente: usa su propia carpeta (`/opt/kuentu`), su propio usuario de sistema,
su propia base de datos, un puerto interno libre (3100) y un sitio de Nginx aparte.

Los comandos con `TU-DOMINIO` hay que cambiarlos por el dominio real (p. ej. `kuentu.cl` o `app.kuentu.cl`).

## 0. Requisitos

```bash
node -v      # debe ser 22.18 o más nuevo
psql --version
nginx -v
sudo ss -ltnp | grep 3100   # no debe mostrar nada (puerto libre). Si está ocupado, elige otro.
```

Si Node es más antiguo, instalar Node 22 (NodeSource):

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs
```

El dominio debe apuntar a la IP del servidor (registro **A** en el DNS) antes del paso de HTTPS.

## 1. Usuario de sistema y código

```bash
sudo useradd --system --create-home --home-dir /opt/kuentu --shell /usr/sbin/nologin kuentu
sudo -u kuentu git clone https://github.com/mgnavarrete/kuentu-app.git /opt/kuentu
```

Si el repositorio es privado, usa una *deploy key* de solo lectura (GitHub → Settings → Deploy keys) y clona con
`git@github.com:mgnavarrete/kuentu-app.git`.

## 2. Base de datos

```bash
sudo -u postgres psql <<'SQL'
CREATE ROLE kuentu LOGIN PASSWORD 'CAMBIA-ESTA-CLAVE';
CREATE DATABASE kuentu OWNER kuentu;
SQL
```

Las tablas se crean solas la primera vez que arranca el servidor.

## 3. Configuración

```bash
sudo -u kuentu cp /opt/kuentu/server/.env.example /opt/kuentu/server/.env
sudo -u kuentu nano /opt/kuentu/server/.env
```

```ini
DATABASE_URL=postgres://kuentu:CAMBIA-ESTA-CLAVE@localhost:5432/kuentu
PORT=3100
HOST=127.0.0.1
COOKIE_SECURE=true
```

```bash
sudo chmod 600 /opt/kuentu/server/.env
```

## 4. Compilar

```bash
cd /opt/kuentu
sudo -u kuentu env ELECTRON_SKIP_BINARY_DOWNLOAD=1 npm ci --no-audit --no-fund
sudo -u kuentu npm run build
sudo -u kuentu npm --prefix server ci --omit=dev --no-audit --no-fund
```

## 5. Servicio (que el servidor de Kuentu arranque solo)

```bash
which node                       # si no es /usr/bin/node, corregir ExecStart en el archivo
sudo cp /opt/kuentu/deploy/kuentu-api.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now kuentu-api
sudo systemctl status kuentu-api  # debe decir "active (running)"
curl http://127.0.0.1:3100/api/health   # → {"ok":true}
```

Ver registros: `journalctl -u kuentu-api -f`.

## 6. Primer administrador

```bash
cd /opt/kuentu/server
sudo -u kuentu node --env-file=.env src/cli.ts create admin --admin --name "Administrador"
```

Pide la contraseña sin mostrarla. Los demás usuarios se crean desde la app (Ajustes → Cuenta → Administrar usuarios).

## 7. Nginx + HTTPS

```bash
sudo cp /opt/kuentu/deploy/nginx-kuentu.conf /etc/nginx/sites-available/kuentu
sudo sed -i 's/TU-DOMINIO/kuentu.cl/' /etc/nginx/sites-available/kuentu   # tu dominio real
sudo ln -s /etc/nginx/sites-available/kuentu /etc/nginx/sites-enabled/kuentu
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d kuentu.cl     # agrega HTTPS y la redirección desde http
```

`nginx -t` revisa la configuración **antes** de recargar, así un error no bota los otros sitios.
Nginx necesita poder leer `/opt/kuentu/dist`: si da error 403, `sudo chmod 755 /opt/kuentu`.

## 8. Actualizar a una versión nueva

Después de subir cambios a GitHub:

```bash
cd /opt/kuentu && sudo -u kuentu git pull --ff-only
sudo -u kuentu bash -c 'ELECTRON_SKIP_BINARY_DOWNLOAD=1 npm ci --no-audit --no-fund && npm run build && npm --prefix server ci --omit=dev --no-audit --no-fund'
sudo systemctl restart kuentu-api
```

(`deploy/actualizar.sh` hace lo mismo si se ejecuta con un usuario con permisos sobre `/opt/kuentu` y `sudo`.)

## 9. Respaldos

```bash
# Respaldo diario a las 3:00 (crontab -e del usuario postgres o root), guardando 14 días:
0 3 * * * pg_dump -U postgres -Fc kuentu > /var/backups/kuentu-$(date +\%F).dump && find /var/backups -name 'kuentu-*.dump' -mtime +14 -delete
```

Restaurar: `pg_restore -U postgres -d kuentu --clean /var/backups/kuentu-AAAA-MM-DD.dump`.
