#!/bin/bash

echo "🚀 Starting VeChain Solo Node with Docker..."

# Check if Docker is available
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is required but not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is available
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is required but not installed. Please install Docker Compose first."
    exit 1
fi

# Start the solo node
echo "📦 Starting VeChain Solo Node container..."
docker-compose up -d vechain-solo

# Wait for the node to be ready
echo "⏳ Waiting for solo node to start..."
timeout=60
counter=0

while [ $counter -lt $timeout ]; do
    if curl -s http://localhost:8669/blocks/best > /dev/null 2>&1; then
        echo "✅ VeChain Solo Node is ready!"
        break
    fi
    echo "   Waiting... ($counter/$timeout)"
    sleep 2
    counter=$((counter + 2))
done

if [ $counter -ge $timeout ]; then
    echo "❌ Solo node failed to start within $timeout seconds"
    echo "📋 Check logs with: docker-compose logs vechain-solo"
    exit 1
fi

echo ""
echo "🎉 VeChain Solo Node Successfully Started!"
echo "📡 RPC Endpoint: http://localhost:8669"
echo "🔗 Network: Solo (isolated testing network)"
echo ""
echo "📊 Node Status:"
curl -s http://localhost:8669/blocks/best | jq '.number, .id' 2>/dev/null || echo "Node running (jq not available for formatted output)"
echo ""
echo "💰 Pre-funded Solo Node Accounts:"
echo "Account 1: 0x7567d83b7b8d80addcb281a71d54fc7b3364ffed"
echo "Account 2: 0xd3ae78222beadb038203be21ed5ce7c9b1bff602"
echo "Account 3: 0x733b7269443c70de16bbf9b0615307884bcc5636"
echo ""
echo "🔧 Update your .env file:"
echo "VECHAIN_NETWORK=solo"
echo "VECHAIN_RPC_URL=http://localhost:8669"
echo ""
echo "🛑 To stop the node: docker-compose down"
echo "📋 To view logs: docker-compose logs vechain-solo"