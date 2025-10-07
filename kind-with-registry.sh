#!/usr/bin/env bash
set -euo pipefail

kind_registry="kind-registry"
kind_registry_port="5000"

if [[ "$(docker inspect -f '{{.State.Running}}' "${kind_registry}")" != "true" ]]; then
  docker run -d --restart=always -p "127.0.0.1:${kind_registry_port}:5000" --network bridge --name "${kind_registry}" registry:2
fi

