#!/usr/bin/env bash
set -euo pipefail

# After docker compose up -d, run this script to install models into LibreTranslate
# The container has no internet access, so we pre-download models and inject them.

MODELS_DIR="$(cd "$(dirname "$0")/.." && pwd)/argos-models"
CONTAINER="education-libretranslate-1"

if ! docker ps --format '{{.Names}}' | grep -q "^${CONTAINER}$"; then
  echo "Error: container ${CONTAINER} is not running" >&2
  echo "Run 'docker compose up -d' first" >&2
  exit 1
fi

echo "Installing argos-translate packages..."
docker cp "$MODELS_DIR/translate-zh_en-1_9" "${CONTAINER}:/home/libretranslate/.local/share/argos-translate/packages/"
docker cp "$MODELS_DIR/translate-en_zh-1_9" "${CONTAINER}:/home/libretranslate/.local/share/argos-translate/packages/"

echo "Installing minisbd sentence-boundary models..."
docker exec "${CONTAINER}" mkdir -p /home/libretranslate/.local/share/argos-translate/minisbd
docker cp "$MODELS_DIR/en.onnx" "${CONTAINER}:/home/libretranslate/.local/share/argos-translate/minisbd/"
docker cp "$MODELS_DIR/zh-hans.onnx" "${CONTAINER}:/home/libretranslate/.local/share/argos-translate/minisbd/"

echo "Restarting LibreTranslate..."
docker compose restart libretranslate

echo "Done."
