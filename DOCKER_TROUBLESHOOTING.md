# Docker Solo Node Troubleshooting

## Issue: Container Started but Stopped
Your Docker container started but immediately stopped. Let's fix this.

## Commands to Run in PowerShell:

**1. Check what happened:**
```powershell
docker logs vechain-solo
```

**2. Remove the stopped container:**
```powershell
docker rm vechain-solo
```

**3. Try the corrected command:**
```powershell
docker run -d --name vechain-solo -p 8669:8669 vechain/thor:latest --network solo --api-addr 0.0.0.0:8669 --api-cors "*" --verbosity 3
```

**4. Check if it's running:**
```powershell
docker ps
```

**5. If still not working, try with different flags:**
```powershell
docker run -d --name vechain-solo -p 8669:8669 vechain/thor:latest --network solo --api-addr 0.0.0.0:8669 --api-cors "*" --skip-logs
```

**6. Test the connection:**
```powershell
curl http://localhost:8669/blocks/best
```

## Alternative Simple Command:
If the above doesn't work, try the most basic version:
```powershell
docker run -d --name vechain-solo -p 8669:8669 vechain/thor:latest --network solo
```

Once it's running, you'll see output from `docker ps` and can connect VeWorld to `http://localhost:8669`.