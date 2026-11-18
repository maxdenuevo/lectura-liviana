#!/bin/sh
# Deja lectura-liviana corriendo permanente en localhost:3000 vía launchd
# (build de producción + LaunchAgent con KeepAlive). Idempotente: la primera
# vez instala y arranca; las siguientes reconstruyen y reinician.
#
#   npm run deploy            build + (re)inicio
#   npm run deploy -- --stop  detener y desinstalar el agente
#
# Log del servidor: /tmp/lectura-liviana.log
set -eu

LABEL="me.max.lectura-liviana"
REPO="$(cd "$(dirname "$0")/.." && pwd)"
PLIST_SRC="$REPO/scripts/launchd/$LABEL.plist"
PLIST_DST="$HOME/Library/LaunchAgents/$LABEL.plist"
DOMAIN="gui/$(id -u)"

if [ "${1:-}" = "--stop" ]; then
  launchctl bootout "$DOMAIN/$LABEL" 2>/dev/null || true
  rm -f "$PLIST_DST"
  echo "detenido y desinstalado ($LABEL)"
  exit 0
fi

cd "$REPO"
echo "→ next build"
npm run build --silent

mkdir -p "$HOME/Library/LaunchAgents"
cp "$PLIST_SRC" "$PLIST_DST"

if launchctl print "$DOMAIN/$LABEL" >/dev/null 2>&1; then
  echo "→ reinicio ($LABEL)"
  launchctl kickstart -k "$DOMAIN/$LABEL"
else
  echo "→ instalación ($LABEL)"
  launchctl bootstrap "$DOMAIN" "$PLIST_DST"
fi

# esperar a que responda (hasta ~60 s: next start con serwist tarda ~20 s la primera vez)
i=0
until curl -sf -o /dev/null http://localhost:3000/; do
  i=$((i + 1))
  if [ "$i" -ge 120 ]; then
    echo "no responde en localhost:3000 — mira /tmp/lectura-liviana.log" >&2
    exit 1
  fi
  sleep 0.5
done
echo "✓ lectura-liviana arriba en http://localhost:3000 (log: /tmp/lectura-liviana.log)"
