# STEP-BY-STEP: Download and Run ReCircle Locally

## STEP 1: Download ReCircle from Replit

### Method 1: Using Replit's Download Feature
1. **In your Replit workspace:**
   - Look for the file manager on the left side of the screen
   - Click the three dots (⋯) next to "Files" at the top
   - Select "Download as zip" from the dropdown menu
   - Save the zip file to your Downloads folder

### Method 2: Using Git Clone (Alternative)
1. **Open Command Prompt on your computer:**
   - Press `Windows Key + R`
   - Type `cmd` and press Enter
   
2. **Navigate to where you want the project:**
   ```cmd
   cd C:\
   mkdir ReCircle
   cd ReCircle
   ```

3. **Clone the repository:**
   ```cmd
   git clone https://github.com/your-username/your-repo-name.git .
   ```

### Method 3: Manual File Download (Most Reliable)
1. **In Replit, download these key files individually:**
   - Right-click on each file → "Download"
   - Download these essential files:
     - `package.json`
     - `.env.local`
     - All files in the `server/` folder
     - All files in the `client/` folder
     - All files in the `scripts/` folder
     - All files in the `shared/` folder

## STEP 2: Extract and Organize Files

1. **Create project folder:**
   ```cmd
   mkdir C:\ReCircle
   ```

2. **Extract the zip file:**
   - Right-click the downloaded zip file
   - Select "Extract All..."
   - Choose `C:\ReCircle` as the destination
   - Click "Extract"

3. **Verify the folder structure:**
   Open `C:\ReCircle` and you should see:
   ```
   C:\ReCircle\
   ├── package.json
   ├── .env.local
   ├── server/
   ├── client/
   ├── scripts/
   ├── shared/
   └── (other files)
   ```

## STEP 3: Install Node.js (If Not Already Installed)

1. **Check if Node.js is installed:**
   ```cmd
   node --version
   npm --version
   ```
   
2. **If not installed, download Node.js:**
   - Go to https://nodejs.org
   - Download the LTS version
   - Run the installer
   - Follow the installation wizard

## STEP 4: Install Project Dependencies

1. **Open Command Prompt in the project folder:**
   ```cmd
   cd C:\ReCircle
   ```

2. **Install all dependencies:**
   ```cmd
   npm install
   ```
   
   This will take 2-3 minutes and install all required packages.

## STEP 5: Configure Environment for Local Use

1. **Copy the local environment file:**
   ```cmd
   copy .env.local .env
   ```

2. **Edit the .env file:**
   - Open `C:\ReCircle\.env` in Notepad
   - Make sure these lines are set correctly:
   ```
   VITE_SOLO_MODE_ENABLED=true
   SOLO_MODE_ENABLED=true
   VITE_CHAIN_ID=39
   VITE_RPC_URL=http://localhost:8669
   VITE_SOLO_NETWORK_URL=http://localhost:8669
   DATABASE_URL=sqlite:./local-recircle.db
   NODE_ENV=development
   PORT=3000
   ```

## STEP 6: Deploy B3TR Tokens to Your Solo Node

1. **Make sure your Solo node is still running:**
   ```cmd
   docker ps
   ```
   You should see the vechain-solo container running.

2. **Run the deployment script:**
   ```cmd
   cd C:\ReCircle
   node scripts/deploy-solo-contracts.cjs
   ```

3. **Expected output:**
   ```
   🚀 Connecting to VeChain Solo Node...
   ✅ Solo node connected. Best block: 25
   👤 Deployer address: 0x7567d83b7b8d80addcb281a71d54fc7b3364ffed
   💰 Deployer balance: 1000000 VET
   🏗️  Deploying B3TR Token contract...
   ✅ B3TR Token deployed successfully!
      Contract Address: 0x[new-address]
   ```

4. **Update .env with the new contract address:**
   - Open `C:\ReCircle\.env` in Notepad
   - Find the line `SOLO_B3TR_CONTRACT_ADDRESS=`
   - Replace it with the new contract address from the deployment

## STEP 7: Start ReCircle Locally

1. **Start the development server:**
   ```cmd
   cd C:\ReCircle
   npm run dev
   ```

2. **Expected output:**
   ```
   > rest-express@1.0.0 dev
   > NODE_ENV=development tsx server/index.ts
   
   ReCircle server running on port 3000
   ```

3. **Open your browser:**
   - Go to `http://localhost:3000`
   - You should see the ReCircle application

## STEP 8: Configure VeWorld for Local Testing

1. **Open VeWorld Chrome extension**
2. **Add Solo Network:**
   - Click "Networks" or "Settings"
   - Click "Add Network"
   - Enter these details:
     ```
     Network Name: Solo Node
     RPC URL: http://localhost:8669
     Chain ID: 39
     Symbol: VET
     ```

3. **Import a test account:**
   - Click "Import Account"
   - Use this mnemonic: `denial kitchen pet squirrel other broom bar gas better priority spoil cross`
   - This will give you a funded account with VET and VTHO

## STEP 9: Test the Complete Flow

1. **Connect VeWorld to ReCircle:**
   - Go to `http://localhost:3000`
   - Click "Connect Wallet"
   - Select VeWorld
   - Make sure you're on the Solo Network

2. **Submit a test receipt:**
   - Upload a transportation receipt (Uber, Lyft, etc.)
   - Wait for processing
   - Check if B3TR tokens appear in your VeWorld wallet

## Troubleshooting

**If npm install fails:**
```cmd
npm cache clean --force
npm install
```

**If port 3000 is busy:**
- Edit `.env` and change `PORT=3000` to `PORT=3001`
- Access the app at `http://localhost:3001`

**If Solo node connection fails:**
- Check if Docker container is running: `docker ps`
- Restart Solo node: `docker restart vechain-solo`

## Success Indicators

✅ ReCircle loads at http://localhost:3000
✅ VeWorld connects to Solo Network
✅ Receipt submission processes successfully
✅ B3TR tokens appear in VeWorld wallet
✅ Real blockchain transactions with transaction hashes

This setup gives you a complete local blockchain environment with real B3TR distribution!