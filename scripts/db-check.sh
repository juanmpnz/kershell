#!/usr/bin/env bash
set -euo pipefail

compose_file="packages/db/compose.test.yml"
project_name="kershell_db_test"
test_database_url="postgres://kershell_test:kershell_test_only@127.0.0.1:55432/kershell_test"

cleanup() {
  docker compose --project-name "$project_name" --file "$compose_file" down --volumes --remove-orphans >/dev/null
}

trap cleanup EXIT

docker compose --project-name "$project_name" --file "$compose_file" up --detach --wait

DATABASE_URL="$test_database_url" pnpm --filter @kershell/db test:integration
DATABASE_URL="$test_database_url" pnpm --filter @kershell/db seed
DATABASE_URL="$test_database_url" pnpm --filter @kershell/admin test:integration
