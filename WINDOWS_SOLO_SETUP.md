# Windows VeChain Solo Node Setup

## PowerShell Commands (For Windows)

**Step 1: Pull the Docker Image**
```powershell
docker pull vechain/thor:latest
```

**Step 2: Start Solo Node (Single Line)**
```powershell
docker run -d --name vechain-solo -p 8669:8669 vechain/thor:latest --network solo --api-addr 0.0.0.0:8669 --api-cors "*"
```

**Step 3: Check if Running**
```powershell
docker ps
```

**Step 4: Test Connection**
```powershell
# Test the solo node is responding
curl http://localhost:8669/blocks/best
```

## VeWorld Configuration
Once the solo node is running:

```
Network Name: Solo Node
RPC URL: http://localhost:8669
Chain ID: 39
Symbol: VET
```

## Troubleshooting
If Docker isn't installed:
1. Download Docker Desktop from https://www.docker.com/products/docker-desktop/
2. Install and restart your computer
3. Start Docker Desktop
4. Try the commands above

## Alternative: Thor Solo Binary
If Docker doesn't work, download the binary:
1. Go to https://github.com/vechain/thor/releases
2. Download `thor-solo-windows.exe`
3. Run: `.\thor-solo-windows.exe --network solo --api-addr 0.0.0.0:8669`

Once running, you'll have a real VeChain Solo node that VeWorld can connect to!