#!/usr/bin/env bash
# Actualiza Kuentu en el servidor con lo último de GitHub: bash deploy/actualizar.sh
set -euo pipefail
cd "$(dirname "$0")/.."

git pull --ff-only
# Electron no se necesita en el servidor.
ELECTRON_SKIP_BINARY_DOWNLOAD=1 npm ci --no-audit --no-fund
npm run build
npm --prefix server ci --omit=dev --no-audit --no-fund
sudo systemctl restart kuentu-api
echo "Kuentu actualizado."
