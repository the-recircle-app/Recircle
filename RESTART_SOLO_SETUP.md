# Solo Node Setup - Fresh Start

## Step 1: Verify Docker is Running
1. Open Command Prompt (Windows key + R, type "cmd", press Enter)
2. Type: `docker --version`
3. You should see: "Docker version 28.3.2" or similar

## Step 2: Download VeChain Blockchain
```bash
docker pull vechain/thor:latest
```
Wait for download to complete (shows "Status: Downloaded newer image")

## Step 3: Start Your Blockchain
```bash
docker run -d --name vechain-solo -p 8669:8669 vechain/thor:latest --network solo --api-addr 0.0.0.0:8669 --api-cors "*"
```
You'll see a long container ID string

## Step 4: Verify It's Running
```bash
docker ps
```
Should show "vechain-solo" container running

## Step 5: Get Your IP Address
```bash
ipconfig
```
Find the line: `IPv4 Address. . . . . . . . . . . : 192.168.X.XXX`

## Step 6: Test Connection
```bash
curl http://192.168.X.XXX:8669/blocks/best
```
(Replace X.XXX with your actual IP numbers)

Once you complete these steps and give me your IP address, I'll deploy real B3TR contracts to your blockchain and connect Replit.