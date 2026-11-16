#!/bin/sh
# Execute na raiz do projeto na VPS. Faça também uma cópia externa dos backups.
set -eu
backup_dir="backups/$(date -u +%Y%m%dT%H%M%SZ)"
mkdir -p "$backup_dir"
chmod 700 "$backup_dir"
umask 077
# Suspende web e worker para copiar banco, WAL e anexos no mesmo ponto.
docker compose stop app
trap 'docker compose start app' EXIT INT TERM
docker compose run --rm --no-deps -T --entrypoint tar app -czf - -C /app/data . > "$backup_dir/daytrade.tar.gz"
printf 'Backup concluído: %s\n' "$backup_dir"
