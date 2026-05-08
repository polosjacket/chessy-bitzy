# 🎓 Chessy Bitzy — How-To Guide

> **Learn how to play, run, and extend the Nintendo-Inspired 3D Chess Game.**

This guide is split into two parts:
- **Part A** — For Players (how to play the game)
- **Part B** — For Developers (how to set up, extend, and learn from the code)

---

## Part A: Playing the Game

### 🚀 A1. Starting the Game

1. Open your browser and navigate to **`http://localhost:5173`**
2. The **Main Menu** will load with a floating chess piece and two glowing buttons.

---

### 🎮 A2. Choosing a Game Mode

| Button | What it does |
|--------|-------------|
| 🎮 **1 Player** | You play against the computer AI. Great for solo practice! |
| 👥 **2 Players** | Two people take turns on the same screen. |

> 💡 **Tip:** Hover over any button to see a tooltip explaining what it does!

---

### 🍄 A3. Choosing Your Faction

You can pick between two factions. Each has a unique set of Nintendo-inspired characters:

#### Team Mario (White Pieces)
| Chess Piece | Character | Role |
|------------|-----------|------|
| King | 👨‍🔧 Mario | Your most important piece. Protect him! |
| Queen | 👸 Peach | The most powerful piece — moves in any direction. |
| Rook | 🦍 Donkey Kong | Moves in straight lines. Great for controlling files. |
| Bishop | 🧤 Luigi | Moves diagonally. Controls color squares. |
| Knight | 🦖 Yoshi | Moves in an L-shape. Can jump over pieces! |
| Pawn | 🍄 Toad | Marches forward; captures diagonally. |

#### Team Kirby (Black Pieces)
| Chess Piece | Character | Role |
|------------|-----------|------|
| King | 🐧 King Dedede | Your king. Don't let him get checkmated! |
| Queen | 👁️ Dark Matter | The black queen. Unpredictable and powerful. |
| Rook | 🐢 Bowser | The Koopa King defends the flanks. |
| Bishop | 🧙 Magolor | Casts diagonal spells across the board. |
| Knight | ⚔️ Meta Knight | Swift L-shaped jumper. Hard to predict! |
| Pawn | ⭐️ Waddle Dee | Loyal foot soldiers advancing the front line. |

> 💡 **Tip:** Hover over each faction card to see all characters. A unique **musical jingle** plays for each faction!

---

### A4. Understanding the Board

- **Orange square** = The piece you've selected
- **Purple squares** = Valid moves for your selected piece
- **Cyan squares** = The last move made (by you or the AI)

**Camera controls:**
| Action | How |
|--------|-----|
| Rotate board | Click + Drag |
| Zoom in/out | Scroll wheel |
| Pan | Right-click + Drag |
| Flip board | Click the **🔄** button in the HUD |

---

### A5. Making a Move

1. **Click any piece** of your color to select it. Its valid moves will light up in **purple**.
2. **Click a highlighted square** to move there.
3. Click the same piece again to **deselect**.
4. Click a different friendly piece to **switch selection**.

> Each time you select a piece, you'll hear that character's **signature 8-bit sound**!

---

### A6. Special Chess Rules

| Rule | How it appears |
|------|---------------|
| **Check** | HUD shows ⚠️ Check! and a 3-note alarm plays. |
| **Checkmate** | HUD announces the winner with a full fanfare. |
| **Pawn Promotion** | Automatically promotes to a Queen (most powerful). |
| **Castling** | Click your King and then click 2 squares left/right. |
| **En Passant** | Highlighted as a valid move naturally by the engine. |

---

### A7. HUD Controls

| Button | Action | Tooltip |
|--------|--------|---------|
| 🔄 | Flip camera 180° | "Rotate the camera to view from the other side" |
| ↩ | Undo last move | "In 1P mode, also undoes the AI's response" |
| 🏠 | Return to main menu | "Current game progress will be lost" |

---

### A8. Audio Controls

- **Background music** plays automatically on the menu and in-game.
- **Press `M`** on your keyboard to **toggle mute** at any time.
- Faction hover → musical preview
- Piece selection → character signature jingle
- Move → short tick
- Capture → dramatic 4-note burst
- Check → alert chord
- Checkmate → full victory/defeat fanfare

---

## Part B: Developer Guide

### 🛠 B1. Prerequisites

Make sure you have these installed:

| Tool | Version | Download |
|------|---------|----------|
| Node.js | 18+ | https://nodejs.org |
| npm | 9+ | Included with Node.js |
| A modern browser | Chrome / Firefox / Safari | — |

---

### B2. Installation

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/chessy-bitzy.git
cd chessy-bitzy

# 2. Install all dependencies
npm install

# 3. Start the development environment
npm run dev
```

After running `npm run dev`, two servers start:
- **Frontend (Vite):** `http://localhost:5173`
- **Backend (Node.js/Socket.io):** `http://localhost:3000`

Open your browser at `http://localhost:5173` to play.

---

### B3. Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start both Vite frontend + Node.js server concurrently |
| `npm run server` | Start only the Node.js/Socket.io server |
| `npm run build` | Build a production-ready bundle to `dist/` |
| `npm run preview` | Preview the production build locally |

---

### B4. Project Architecture — The Learning Path

If you want to understand how the game works, read the files in this order:

#### Step 1: Understand the Data Layer
**`src/config/characters.js`**  
This is the simplest file — just a JavaScript object that maps chess piece codes to character names and emojis. No frameworks, no complex logic. Start here.

```js
// What you'll learn: How to use nested objects as a data configuration store
export const FACTIONS = {
  mario: {
    pieces: {
      K: { name: 'Mario', emoji: '👨‍🔧' },
      // ...
    }
  }
};
```

#### Step 2: Understand the Chess Logic
**`src/logic/GameEngine.js`**  
Learn how to wrap a third-party library (chess.js) and build an event-driven API around it. Uses a simple pub/sub (publish/subscribe) pattern.

```js
// What you'll learn: The Observer/Event Emitter pattern in JavaScript
engine.on('moveMade', (move) => {
  console.log('A move was made:', move.san);
});
```

**Key concept:** The engine doesn't know anything about the UI. It just emits events. This separation of concerns makes the code easy to test and change.

#### Step 3: Understand 3D Rendering
**`src/render/SceneManager.js`** → then **`src/render/Board3D.js`**

```js
// What you'll learn: Three.js fundamentals
// Scene = the 3D world
// Camera = your viewpoint
// Renderer = draws the world into the <canvas>
// Mesh = a 3D object (geometry + material)
// Sprite = a 2D image that always faces the camera
```

The board is made of 64 `BoxGeometry` meshes. Pieces are `THREE.Sprite` objects with an emoji drawn onto a canvas texture.

#### Step 4: Understand User Input in 3D
**`src/render/InputHandler.js`**

```js
// What you'll learn: Raycasting — the technique for clicking on 3D objects
// A ray is shot from the camera through the mouse position
// Any 3D object the ray hits can be detected and interacted with
this.raycaster.setFromCamera(mouseNDC, camera);
const hits = this.raycaster.intersectObjects(squareMeshes);
```

#### Step 5: Understand Procedural Audio
**`src/audio/AudioManager.js`**

```js
// What you'll learn: The Web Audio API
// AudioContext = the audio environment
// OscillatorNode = generates a sound wave (square, sine, etc.)
// GainNode = controls volume
// MIDI notes converted to frequencies: freq = 440 * 2^((midi-69)/12)
```

#### Step 6: See it All Come Together
**`src/main.js`**

This is where all modules connect. Notice how it:
- Creates instances of each module
- Subscribes to engine events
- Updates the 3D board + HUD + audio in response

---

### B5. Adding a New Character

1. Open `src/config/characters.js`
2. Add your character to the appropriate faction's `pieces` object:
   ```js
   N: { name: 'Yoshi', emoji: '🦖', description: 'Swift and nimble rider' },
   ```
3. Open `src/audio/AudioManager.js`
4. Add/modify the character's entry in `_CHARACTER_SOUNDS`:
   ```js
   N: { notes: [62, 65, 69, 65], type: 'square', label: 'Yoshi' },
   ```
   The `notes` array is MIDI note numbers. Middle C = 60.

---

### B6. Adding a New Theme / Arena

1. In `src/render/Board3D.js`, change the `COLOR_LIGHT_SQUARE` and `COLOR_DARK_SQUARE` constants.
2. In `src/render/SceneManager.js`, change `this.scene.background` and fog color.
3. In `src/audio/AudioManager.js`, add a new key to `_THEMES` and call `playBackground('yourTheme')`.

---

### B7. Improving the AI

The current AI in `src/logic/GameEngine.js → _makeAIMove()` picks a random move. To improve it:

1. Replace the random pick with a **Minimax** algorithm:
   ```js
   _makeAIMove() {
     const bestMove = this._minimax(this.chess, 3, -Infinity, Infinity, false);
     this.makeMove(bestMove.from, bestMove.to);
   }

   _minimax(board, depth, alpha, beta, isMaximizing) {
     if (depth === 0 || board.isGameOver()) {
       return this._evaluateBoard(board);
     }
     // ... standard minimax with alpha-beta pruning
   }
   ```
2. Implement `_evaluateBoard()` using material scores:
   ```js
   const PIECE_VALUES = { p: 1, n: 3, b: 3.25, r: 5, q: 9, k: 1000 };
   ```

---

### B8. Adding Online Multiplayer

The Socket.io server is already built! To enable it in the frontend:

1. Install the client: `npm install socket.io-client`
2. In `src/main.js`, after a `2P` game starts in online mode:
   ```js
   import { io } from 'socket.io-client';
   const socket = io();
   socket.emit('joinRoom', { roomId: 'my-room-123' });
   socket.on('assignColor', ({ color }) => { /* set player color */ });
   socket.on('opponentMove', ({ from, to }) => {
     engine.makeMove(from, to);
   });
   // After making a move, emit it:
   socket.emit('move', { from, to, fen: engine.getState().fen });
   ```

---

### B9. File Size & Performance Tips

| Optimization | How |
|-------------|-----|
| Reduce sprite resolution | Change `256` to `128` in `Board3D._createPieceSprite` |
| Cache textures | Store created `CanvasTexture` in a Map by emoji key |
| Upgrade AI | Use Minimax depth ≤ 4 for playable speed |
| 3D Models | Replace sprites with GLTF models via `GLTFLoader` |
| LOD | Use `THREE.LOD` for lower-poly models at distance |

---

### B10. Keyboard Shortcuts Reference

| Key | Action |
|-----|--------|
| `M` | Toggle audio mute |
| `Esc` | (Planned) Deselect current piece |
| Mouse Scroll | Zoom camera in/out |
| Click + Drag | Rotate camera |

---

## 📚 Recommended Learning Resources

| Topic | Resource |
|-------|---------|
| Three.js | https://threejs.org/docs |
| chess.js API | https://github.com/jhlywa/chess.js |
| Web Audio API | https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API |
| Socket.io | https://socket.io/docs |
| Vite | https://vitejs.dev/guide |
| Minimax Algorithm | https://en.wikipedia.org/wiki/Minimax |
| MIDI note numbers | https://www.inspiredacoustics.com/en/MIDI_note_numbers_and_center_frequencies |
