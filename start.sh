#!/bin/sh
node backend/dist/seed.js 2>&1
exec node backend/dist/index.js
