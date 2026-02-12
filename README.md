# 🔐 CipherCircuit - IEEE Cryptographic Challenge 2026

**A Professional Two-Round Team-Based Cryptographic Competition Platform**

*Featuring Cassette Futurism Aesthetic • Real-Time Synchronization • XOR-Based Encryption*

---

## 🎯 Overview

**CipherCircuit** is an immersive digital environment for IEEE-sponsored cryptographic competitions combining:

- **Hardware Logic Simulation** (Round 1) - 4-bit key generation via XOR gates
- **Software Encryption/Decryption** (Round 2) - Real-time XOR cryptographic operations  
- **Cassette Futurism Aesthetic** - 1980s CRT terminal interface with phosphor glows
- **Real-Time Team Synchronization** - WebSocket-based dual-user state management

---

## ✨ Key Features

### Visual Design
- **CRT Monitor Effects** - Scanline overlays, vignette, phosphor text glow
- **Three.js Particle Anomaly** - Interactive 3D background
- **Cassette Futurism Palette** - True Charcoal (#0B0D10), Electric Cyan (#40E0FF), Neon Lime (#B6FF3B)
- **GSAP Animations** - Smooth state transitions
- **Responsive Bento-Box Layout** - Adaptive grid design

### Technical Features
- **Real-Time WebSocket** - Sub-100ms team synchronization
- **Role-Based Access** - Separate encryption/decryption interfaces
- **XOR Validation Engine** - Automated circuit verification
- **Virtual LED Indicators** - Visual binary state representation
- **Progress Persistence** - LocalStorage + WebSocket sync

---

## 🛠 Technology Stack

**Frontend:** Next.js 14+ • TypeScript • Tailwind CSS • Three.js • GSAP • Framer Motion  
**Backend:** Node.js • Express.js • Socket.io • In-Memory State Management

---

## 📦 Installation

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
cd ..
```

---

## 🚀 Running the Application

### Start Backend (Terminal 1)
```bash
cd server
npm run dev
```
Backend runs on `http://localhost:3001`

### Start Frontend (Terminal 2)  
```bash
npm run dev
```
Frontend runs on `http://localhost:3000`

---

## 🎮 Competition Flow

### 1. Authentication
- Enter **Team ID** and **Team Name**
- Access team dashboard

### 2. Round 1 - Key Generation
- Build XOR circuit in CircuitVerse using equations:
  ```
  Key₀ = S₀ ⊕ S₁
  Key₁ = S₁ ⊕ S₂
  Key₂ = S₂ ⊕ S₃
  Key₃ = S₃ ⊕ S₀
  ```
- Both teammates submit matching 4-bit key
- System auto-expands to 8-bit: `[4-bit] + 1000`

### 3. Round 2 - Encryption/Decryption

**Teammate A (Encrypt):**
1. Input decimal (0-255)
2. System converts to binary
3. XOR with 8-bit key
4. Submit ciphertext

**Teammate B (Decrypt):**
1. Receive ciphertext
2. XOR with 8-bit key  
3. Convert binary to decimal
4. Submit answer

**Winner:** Fastest time with fewest resubmissions

---

## 📁 Project Structure

```
cipher-circuit/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Landing page
│   │   ├── dashboard/page.tsx    # Team dashboard
│   │   ├── round1/page.tsx       # Key generation
│   │   └── round2/
│   │       ├── encrypt/page.tsx  # Teammate A
│   │       └── decrypt/page.tsx  # Teammate B
│   ├── components/
│   │   └── ParticleAnomaly.tsx   # Three.js background
│   └── hooks/
│       └── useSocket.ts          # WebSocket client
├── server/
│   └── index.js                  # Backend server
└── README.md
```

---

## 🔌 WebSocket Events

### Client → Server
- `join_team` - Join competition room
- `submit_round1_key` - Submit 4-bit key
- `submit_encryption` - Send ciphertext
- `submit_decryption` - Submit decrypted value

### Server → Client
- `team_state` - Current team progress
- `round1_result` - Key validation result
- `ciphertext_received` - Encrypted data
- `competition_complete` - Final results

---

## 🎨 Design Philosophy

**Cassette Futurism** - 1970s-80s vision of computing featuring:
- CRT screen effects with scanlines
- Phosphor glow text (amber/cyan)
- Terminal-style typography
- Retro-futuristic color palette

---

## 📝 License

MIT License

---

## 🙏 Acknowledgments

- **IEEE** - Competition sponsorship
- **CircuitVerse** - Logic simulation platform
- **Cassette Futurism Movement** - Design inspiration

---

<div align="center">

**Built with ⚡ for IEEE CipherCircuit 2026**

*Where Hardware Logic Meets Software Encryption*

</div>
