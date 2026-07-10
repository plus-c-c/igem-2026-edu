#!/bin/sh
export API_URL="http://localhost:${PORT:-3000}"
node backend/dist/index.js &
node backend/dist/seed.js 2>&1 || true
wait
