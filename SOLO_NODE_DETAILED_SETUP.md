# Detailed Solo Node Setup Instructions

## Step 1: Install Docker Desktop (10 minutes)

### For Windows:
1. Open your web browser
2. Go to: https://www.docker.com/products/docker-desktop/
3. Click "Download for Windows"
4. Once downloaded, double-click the installer file
5. Follow the installation wizard (accept all defaults)
6. Restart your computer when prompted
7. Open "Docker Desktop" from Start menu
8. Wait for Docker to start (you'll see a whale icon in system tray)

### For Mac:
1. Go to: https://www.docker.com/products/docker-desktop/
2. Click "Download for Mac" (choose Intel or Apple Silicon based on your Mac)
3. Open the downloaded .dmg file
4. Drag Docker to Applications folder
5. Open Docker from Applications
6. Grant permissions when prompted
7. Wait for Docker to start

### Verify Installation:
1. Open Terminal (Mac) or Command Prompt (Windows)
   - **Windows**: Press Windows key + R, type "cmd", press Enter
   - **Mac**: Press Cmd + Space, type "Terminal", press Enter
2. Type exactly: `docker --version`
3. Press Enter
4. You should see something like: "Docker version 24.0.7, build afdd53b"

**STOP HERE** - Tell me if you see the Docker version or any error messages.

---

## Step 2: Download VeChain Solo Node (2 minutes)

In the same Terminal/Command Prompt window, type exactly:

```bash
docker pull vechain/thor:latest
```

Press Enter and wait. You'll see download progress like:
```
latest: Pulling from vechain/thor
a2abf6c4d29d: Pull complete
...
Status: Downloaded newer image for vechain/thor:latest
```

**STOP HERE** - Tell me when you see "Status: Downloaded" or any error.

---

## Step 3: Start Your Solo Blockchain (30 seconds)

Type exactly (copy the entire command):

```bash
docker run -d --name vechain-solo -p 8669:8669 -v solo-data:/root/.thor vechain/thor:latest --network solo --api-addr 0.0.0.0:8669 --api-cors "*" --verbosity 3
```

Press Enter. You should see a long string like:
```
7a8b9c2d3e4f5g6h7i8j9k0l1m2n3o4p5q6r7s8t9u0v1w2x3y4z5a6b7c8d9e0f
```

Now check if it's running:
```bash
docker ps
```

You should see something like:
```
CONTAINER ID   IMAGE               COMMAND              STATUS        PORTS
7a8b9c2d3e4f   vechain/thor:latest "/usr/bin/thor..."   Up 5 seconds  0.0.0.0:8669->8669/tcp
```

**STOP HERE** - Tell me if you see the container running or any errors.

---

## Step 4: Find Your Computer's IP Address

### Windows:
```cmd
ipconfig
```
Look for "IPv4 Address" under your main network adapter. It will look like:
```
IPv4 Address. . . . . . . . . . . : 192.168.1.155
```

### Mac/Linux:
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```
You'll see something like:
```
inet 192.168.1.155 netmask 0xffffff00 broadcast 192.168.1.255
```

**The IP address is the number that starts with 192.168 or 10.0**

**STOP HERE** - Tell me your IP address (like 192.168.1.155).

---

## Step 5: Test Solo Node Connection

Type exactly (replace YOUR_IP with the IP from Step 4):

```bash
curl http://YOUR_IP:8669/blocks/best
```

Example:
```bash
curl http://192.168.1.155:8669/blocks/best
```

You should see JSON data starting with:
```json
{"number":"0x1","id":"0x00000001...","size":236...}
```

**STOP HERE** - Tell me if you see JSON data or any error.

---

## What Happens Next (I Handle This):

Once your solo node is running and responding:

1. **I'll deploy B3TR contracts** to your solo node
2. **I'll configure Replit** to connect to your solo node
3. **I'll create wallet funding** for testing
4. **We'll configure VeWorld** to connect to your solo node
5. **We'll test complete flow** from receipt upload to B3TR in wallet

## Troubleshooting Common Issues:

### "Docker not found"
- Docker Desktop isn't running - start it from your applications

### "Port 8669 already in use"
- Stop existing container: `docker stop vechain-solo && docker rm vechain-solo`
- Then retry Step 3

### "Permission denied"
- On Mac: Add `sudo` before docker commands
- On Windows: Run Command Prompt as Administrator

Ready to start with Step 1? Just follow each step exactly and tell me the results after each STOP HERE point.