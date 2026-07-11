#!/bin/bash
# 快速恢复 Docker 镜像缓存
cd "$(dirname "$0")/.."
echo "Loading Docker images from cache..."
docker load -i .docker-cache/images.tar
echo "Done! Images restored."
docker images | grep -E 'igem|postgres|nginx'
