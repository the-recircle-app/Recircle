# Step-by-Step Solo Node Setup

## Step 1: Install Docker (5 minutes)
1. Go to https://www.docker.com/products/docker-desktop/
2. Download for your operating system
3. Install and start Docker Desktop
4. Open terminal/command prompt and run: `docker --version`

## Step 2: Start VeChain Solo Node (2 commands)
Copy and paste these exact commands:

```bash
# Pull the VeChain node image
docker pull vechain/thor:latest

# Start the solo node (this creates a real blockchain)
docker run -d --name vechain-solo -p 8669:8669 -v solo-data:/root/.thor vechain/thor:latest --network solo --api-addr 0.0.0.0:8669 --api-cors "*" --verbosity 3
```

Check if it's running:
```bash
docker ps
```

You should see "vechain-solo" in the list.

## Step 3: Find Your Local IP Address
**Windows:**
```cmd
ipconfig | findstr "IPv4"
```

**Mac/Linux:**  
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

Tell me this IP address - it will look like `192.168.1.XXX`

## Step 4: Configure VeWorld (I'll help with this)
Once your solo node is running, I'll give you the exact VeWorld settings.

## Step 5: I Take Over
Once your solo node is running:
- I'll deploy B3TR contracts to it
- I'll connect Replit to your solo node  
- I'll test the complete flow
- We'll verify B3TR tokens appear in VeWorld

## If Something Goes Wrong
Just tell me:
- Any error messages
- What step failed
- Screenshot if helpful

I'll help troubleshoot and get it working.

Ready to start with Step 1?