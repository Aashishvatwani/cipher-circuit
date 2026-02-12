# 🚀 Quick Start Guide - CipherCircuit

## Prerequisites
- Node.js 18+ installed
- Two terminal windows

## 5-Minute Setup

### 1. Install Dependencies (First Time Only)
```bash
# Frontend dependencies
npm install

# Backend dependencies
cd server
npm install
cd ..
```

### 2. Start Both Servers

**Terminal 1 - Backend Server:**
```bash
cd server
npm run dev
```
✅ Backend running on `http://localhost:3001`

**Terminal 2 - Frontend:**
```bash
npm run dev
```
✅ Frontend running on `http://localhost:3000`

### 3. Access the Application
Open your browser and go to: **http://localhost:3000**

---

## 🎮 Test the Competition

### Login Credentials
Use any Team ID and Team Name (no validation in dev mode):
- **Team ID:** `TEAM001`
- **Team Name:** `Test Team`

### Round 1 - Key Generation
1. Go to **Dashboard** → **Start Round 1**
2. Default switch values: `S0=1, S1=0, S2=1, S3=0`
3. Calculate XOR keys:
   - Key₀ = 1 ⊕ 0 = **1**
   - Key₁ = 0 ⊕ 1 = **1**
   - Key₂ = 1 ⊕ 0 = **1**
   - Key₃ = 0 ⊕ 1 = **1**
4. Enter: **1111**
5. System expands to 8-bit: **11111000**

### Round 2 - Encryption & Decryption

**Teammate A (Encrypt):**
1. Dashboard → **Encrypt (A)**
2. Enter decimal: `77`
3. Binary: `01001101`
4. XOR with key `11111000`: Result shown
5. Click **Encrypt & Submit**

**Teammate B (Decrypt):**
1. Dashboard → **Decrypt (B)**
2. Wait for ciphertext (transmitted automatically)
3. View decrypted binary
4. Convert to decimal
5. Submit answer

---

## 🎨 Features to Explore

✨ **Three.js Particle Animation** - Move your mouse on landing page  
🖥️ **CRT Effects** - Notice scanlines and phosphor glow  
⚡ **Real-Time Sync** - Open two browser windows for same team  
🎯 **Virtual LEDs** - Watch bits light up in Round 1  
🔐 **XOR Visualization** - See encryption step-by-step

---

## 🛑 Troubleshooting

### "Cannot connect to WebSocket server"
- Ensure backend is running on port 3001
- Check terminal for errors

### "Page not found"
- Clear browser cache
- Restart dev server: `Ctrl+C` then `npm run dev`

### Build errors
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
npm run build
```

---

## 📝 Development Commands

```bash
# Frontend
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server

# Backend (in server/ folder)
npm run dev          # Start with nodemon (auto-reload)
npm start            # Start production server
```

---

## 🎯 Next Steps

1. **Customize Team Data** - Edit `server/index.js` to add team validation
2. **Add Sound Effects** - Import audio files for button clicks
3. **Deploy** - Use Vercel (frontend) + Railway (backend)
4. **Add Leaderboard** - View `/api/leaderboard` endpoint

---

**Ready to compete! 🔐⚡**
