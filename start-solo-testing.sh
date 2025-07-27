#!/bin/bash

echo "🚀 Starting VeChain Solo Node for Testing..."

# Start the solo node in background
echo "📡 Starting solo node server..."
node scripts/simple-solo-node.js &
SOLO_PID=$!

# Wait for solo node to start
echo "⏳ Waiting for solo node to start..."
sleep 3

# Test if solo node is running
if curl -s http://localhost:8669/blocks/best > /dev/null; then
    echo "✅ Solo node is running!"
    
    # Update environment for solo testing
    echo "🔧 Setting up solo testing environment..."
    
    export VECHAIN_NETWORK=solo
    export VECHAIN_RPC_URL=http://localhost:8669
    export ADMIN_PRIVATE_KEY=0x99f0500549792796c14fed62011a51081dc5b5e68fe8bd8a13b86be829c4fd36
    export DISTRIBUTOR_PRIVATE_KEY=0x7f9290af603f8ce9c391b88222e6eff75db6c60ff07e1f0b2d34d1c6b85c936e
    export APP_ID=0x90178ff5f95f31644b5e21b11ba6e173ea0d9b9595e675cb84593c0d2df730c1
    
    echo "✅ Solo testing environment ready!"
    echo ""
    echo "🧪 You can now test VeBetterDAO transactions with:"
    echo "- Unlimited fake VET/VTHO"
    echo "- Real blockchain-like responses" 
    echo "- Safe isolated environment"
    echo ""
    echo "🛑 To stop solo node: kill $SOLO_PID"
    
    # Keep running
    wait $SOLO_PID
else
    echo "❌ Failed to start solo node"
    kill $SOLO_PID 2>/dev/null
    exit 1
fi