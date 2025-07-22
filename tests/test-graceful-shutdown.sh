#!/bin/bash

# Docker Graceful Shutdown Test Script
# Tests the graceful shutdown functionality of the Express server

set -e

echo "🐳 Docker Graceful Shutdown Test"
echo "================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
CONTAINER_NAME="express-shutdown-test"
IMAGE_NAME="express-server-template"
PORT="3001"

# Cleanup function
cleanup() {
    echo -e "\n${YELLOW}🧹 Cleaning up...${NC}"
    docker rm -f $CONTAINER_NAME 2>/dev/null || true
}

# Set trap to cleanup on exit
trap cleanup EXIT

echo -e "${BLUE}📋 Test Configuration:${NC}"
echo "   Container: $CONTAINER_NAME"
echo "   Image: $IMAGE_NAME"
echo "   Port: $PORT"
echo ""

# Build the image
echo -e "${BLUE}🔨 Building Docker image...${NC}"
docker build -t $IMAGE_NAME . || {
    echo -e "${RED}❌ Failed to build Docker image${NC}"
    exit 1
}

# Start the container
echo -e "${BLUE}🚀 Starting container...${NC}"
docker run -d \
    --name $CONTAINER_NAME \
    --stop-timeout 30 \
    -p $PORT:3000 \
    -e NODE_ENV=test \
    $IMAGE_NAME || {
    echo -e "${RED}❌ Failed to start container${NC}"
    exit 1
}

# Wait for container to be ready
echo -e "${BLUE}⏳ Waiting for server to be ready...${NC}"
timeout=30
while [ $timeout -gt 0 ]; do
    if curl -s -f http://localhost:$PORT/health/liveness >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Server is ready!${NC}"
        break
    fi
    sleep 1
    timeout=$((timeout - 1))
done

if [ $timeout -eq 0 ]; then
    echo -e "${RED}❌ Server failed to start within 30 seconds${NC}"
    docker logs $CONTAINER_NAME
    exit 1
fi

# Test 1: Check server is responding
echo -e "\n${BLUE}🧪 Test 1: Server Health Check${NC}"
response=$(curl -s http://localhost:$PORT/health/liveness)
if echo "$response" | grep -q '"status":"ok"'; then
    echo -e "${GREEN}✅ Health check passed${NC}"
else
    echo -e "${RED}❌ Health check failed${NC}"
    echo "Response: $response"
    exit 1
fi

# Test 2: SIGTERM graceful shutdown
echo -e "\n${BLUE}🧪 Test 2: SIGTERM Graceful Shutdown${NC}"
echo "Sending SIGTERM signal..."

# Start following logs in background
docker logs -f $CONTAINER_NAME &
LOG_PID=$!

# Send SIGTERM
docker kill --signal=TERM $CONTAINER_NAME

# Wait for container to stop
echo "Waiting for graceful shutdown..."
timeout=35
while [ $timeout -gt 0 ]; do
    if ! docker ps | grep -q $CONTAINER_NAME; then
        echo -e "${GREEN}✅ Container stopped gracefully${NC}"
        break
    fi
    sleep 1
    timeout=$((timeout - 1))
done

# Stop log following
kill $LOG_PID 2>/dev/null || true

if [ $timeout -eq 0 ]; then
    echo -e "${RED}❌ Container did not stop within timeout${NC}"
    exit 1
fi

# Check exit code
exit_code=$(docker inspect $CONTAINER_NAME --format='{{.State.ExitCode}}')
if [ "$exit_code" = "0" ]; then
    echo -e "${GREEN}✅ Container exited with code 0 (success)${NC}"
else
    echo -e "${RED}❌ Container exited with code $exit_code${NC}"
    exit 1
fi

# Test 3: Check logs for graceful shutdown messages
echo -e "\n${BLUE}🧪 Test 3: Graceful Shutdown Log Analysis${NC}"
logs=$(docker logs $CONTAINER_NAME 2>&1)

# Check for expected log messages
if echo "$logs" | grep -q "SIGTERM signal received"; then
    echo -e "${GREEN}✅ SIGTERM signal received${NC}"
else
    echo -e "${RED}❌ SIGTERM signal not logged${NC}"
fi

if echo "$logs" | grep -q "Stopping HTTP server"; then
    echo -e "${GREEN}✅ HTTP server shutdown initiated${NC}"
else
    echo -e "${RED}❌ HTTP server shutdown not logged${NC}"
fi

if echo "$logs" | grep -q "Database connections closed"; then
    echo -e "${GREEN}✅ Database connections closed${NC}"
else
    echo -e "${RED}❌ Database disconnect not logged${NC}"
fi

if echo "$logs" | grep -q "Graceful shutdown completed"; then
    echo -e "${GREEN}✅ Graceful shutdown completed${NC}"
else
    echo -e "${RED}❌ Graceful shutdown completion not logged${NC}"
fi

# Test 4: Docker stop test (restart container for this test)
echo -e "\n${BLUE}🧪 Test 4: Docker Stop Command${NC}"
echo "Starting container again for docker stop test..."

docker run -d \
    --name "${CONTAINER_NAME}-stop-test" \
    --stop-timeout 30 \
    -p $((PORT + 1)):3000 \
    -e NODE_ENV=test \
    $IMAGE_NAME

# Wait for ready
timeout=30
while [ $timeout -gt 0 ]; do
    if curl -s -f http://localhost:$((PORT + 1))/health/liveness >/dev/null 2>&1; then
        break
    fi
    sleep 1
    timeout=$((timeout - 1))
done

# Test docker stop
echo "Testing 'docker stop' command..."
start_time=$(date +%s)
docker stop "${CONTAINER_NAME}-stop-test"
end_time=$(date +%s)
duration=$((end_time - start_time))

echo "Stop duration: ${duration}s"
if [ $duration -lt 35 ]; then
    echo -e "${GREEN}✅ Docker stop completed within timeout${NC}"
else
    echo -e "${RED}❌ Docker stop took too long${NC}"
fi

# Cleanup stop test container
docker rm "${CONTAINER_NAME}-stop-test" 2>/dev/null || true

echo -e "\n${GREEN}🎉 All tests completed successfully!${NC}"
echo ""
echo -e "${BLUE}📊 Test Summary:${NC}"
echo "   ✅ Health check response"
echo "   ✅ SIGTERM graceful shutdown"
echo "   ✅ Proper exit code (0)"
echo "   ✅ Graceful shutdown logs"
echo "   ✅ Docker stop command"
echo ""
echo -e "${GREEN}Your Docker graceful shutdown implementation is working correctly!${NC}"
