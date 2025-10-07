#!/bin/bash

# Configuration
REGISTRY="localhost:5000"
VERSION="1.0.0"

# Array of services and their corresponding dockerfile paths
declare -A SERVICES=(
    ["librechat"]="docker/librechat/Dockerfile"
    ["mongodb"]="docker/mongodb/Dockerfile"
    ["meilisearch"]="docker/meilisearch/Dockerfile"
    ["pgvectordb"]="docker/pgvectordb/Dockerfile"
    ["rag"]="docker/rag/Dockerfile"
    ["ollama"]="docker/ollama/Dockerfile"
    ["redis"]="docker/redis/Dockerfile"
)

# Function to build and push an image
build_and_push() {
    local service=$1
    local dockerfile=$2
    local tag="${REGISTRY}/${service}:${VERSION}"
    
    echo "Building ${service}..."
    docker build -t ${tag} -f ${dockerfile} .
    
    if [ $? -eq 0 ]; then
        echo "Pushing ${tag}..."
        docker push ${tag}
        if [ $? -eq 0 ]; then
            echo "✅ Successfully built and pushed ${tag}"
        else
            echo "❌ Failed to push ${tag}"
            return 1
        fi
    else
        echo "❌ Failed to build ${tag}"
        return 1
    fi
}

# Ensure local registry is running
echo "Ensuring local registry is running..."
if ! docker ps | grep -q "registry:2"; then
    echo "Starting local registry..."
    docker run -d -p 5000:5000 --name registry registry:2
fi

# Build and push all images
for service in "${!SERVICES[@]}"; do
    build_and_push "$service" "${SERVICES[$service]}"
done

echo "All operations completed!"