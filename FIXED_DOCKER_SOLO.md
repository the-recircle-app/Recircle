# Fixed VeChain Solo Node Setup

## The Problem
The VeChain Thor Docker image needs a proper genesis configuration. The current commands are failing because of missing genesis files.

## PowerShell vs CMD
**Use PowerShell** - it's what you're already using and it works fine for Docker commands.

## Working Commands for PowerShell:

**1. Check the second container logs:**
```powershell
docker logs vechain-solo
docker rm vechain-solo
```

**2. Try with proper genesis configuration:**
```powershell
docker run -d --name vechain-solo -p 8669:8669 -e NETWORK=solo vechain/thor:latest --network solo --api-addr 0.0.0.0:8669 --api-cors "*" --genesis /app/genesis/solo.json
```

**3. If that fails, try the official solo mode:**
```powershell
docker run -d --name vechain-solo -p 8669:8669 vechain/thor:latest solo --api-addr 0.0.0.0:8669 --api-cors "*"
```

**4. Alternative: Use thor-solo specifically:**
```powershell
docker pull vechain/thor:solo
docker run -d --name vechain-solo -p 8669:8669 vechain/thor:solo --api-addr 0.0.0.0:8669 --api-cors "*"
```

**5. Test if working:**
```powershell
docker ps
curl http://localhost:8669/blocks/best
```

## If Docker keeps failing:
Download the binary directly:
1. Go to https://github.com/vechain/thor/releases  
2. Download `thor-solo-windows.exe`
3. Run: `.\thor-solo-windows.exe --api-addr 0.0.0.0:8669`

The binary approach is often more reliable than Docker for solo nodes.