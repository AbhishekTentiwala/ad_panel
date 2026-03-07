#!/bin/bash
# Run this on your machine to fetch OpenAPI schemas from your server.
# Usage: ./scripts/fetch-openapi.sh

BASE="http://10.99.69.2:8080"
SCHEMAS=("auth" "college" "community" "posts" "comments" "attachments" "admin")
DIR="$(cd "$(dirname "$0")/.." && pwd)/openapi"

mkdir -p "$DIR"
for name in "${SCHEMAS[@]}"; do
  echo "Fetching $name..."
  curl -s "${BASE}/api/${name}/openapi.json" -o "${DIR}/${name}.json" && echo "  -> ${DIR}/${name}.json" || echo "  FAILED"
done
echo "Done. Check the openapi/ folder."
