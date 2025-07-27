# Register ReCircle dApp on VeBetterDAO Testnet via Remix

Use this guide to manually register your dApp and get a valid App ID.

### 1. Open Remix
Go to: [https://remix.ethereum.org](https://remix.ethereum.org)

### 2. Setup
- In the sidebar, go to **"Deploy & Run Transactions"**
- Set **Environment** to `Injected Web3`
- Connect your VeWorld or Sync2 wallet (on VeChain Testnet)

### 3. Load Contract
- In the same tab, paste the contract address:
0xB54f3b684135cC6b54B9C2591c6F33e12f1F0070

- Click **"At Address"**

### 4. Add ABI
- Create a new file in Remix
- Paste the contents of `register-app-remix.json`'s `abi` block into Remix

### 5. Call `registerApp`
- Function: `registerApp(string name, string description)`
- Use:
  - `name`: `"ReCircle"`
  - `description`: `"Sustainability rewards platform for validating thrift, EV, and rideshare receipts"`
- Click **"Transact"**
- Confirm in wallet

### 6. After Success
- View the transaction in [VeChain Testnet Explorer](https://explore-testnet.vechain.org/)
- Locate your newly assigned **App ID** in logs or from the VeBetterDAO dashboard
- Copy the App ID

### 7. Update .env File
Open your `.env` and update:

```env
APP_ID=0x<your-assigned-app-id>
```

Your dApp is now registered and ready for Creator NFT submission!