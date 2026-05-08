# 📖 Chessy Bitzy — Source Code Documentation

> A Nintendo-Inspired 3D Chess Game built with Node.js, Vite, Three.js, chess.js, and Socket.io.

---

## Table of Contents
1. [Project Overview](#1-project-overview)
2. [Directory Structure](#2-directory-structure)
3. [Entry Points](#3-entry-points)
4. [Module Reference](#4-module-reference)
   - [config/characters.js](#41-configcharactersjs)
   - [logic/GameEngine.js](#42-logicgameenginejs)
   - [render/SceneManager.js](#43-renderscenemanagerjs)
   - [render/Board3D.js](#44-renderboard3djs)
   - [render/InputHandler.js](#45-renderinputhandlerjs)
   - [audio/AudioManager.js](#46-audioadiomanagerjs)
   - [ui/HUD.js](#47-uihudjs)
   - [main.js](#48-mainjs)
5. [Server Architecture](#5-server-architecture)
6. [Data Flow Diagram](#6-data-flow-diagram)
7. [Key Algorithms](#7-key-algorithms)
8. [Styling System](#8-styling-system)

---

## 1. Project Overview

Chessy Bitzy is a browser-based 3D chess game. The **frontend** is a Vite-bundled Vanilla JavaScript application. The **backend** is an Express + Socket.io server for optional online 2-player sessions. All 3D rendering is done via Three.js, chess logic via chess.js, and audio via the Web Audio API (no external audio files).

```
Browser (Vite frontend)
     │
     ├── Three.js 3D Scene
     ├── chess.js game engine  
     ├── Web Audio API (8-bit chiptune)
     └── Socket.io-client (2P online)
          │
          └── Node.js Express server (port 3000)
                    └── Socket.io rooms
```

---

## 2. Directory Structure

```
chessy-bitzy/
├── index.html              ← Single-page HTML shell
├── vite.config.js          ← Vite bundler configuration
├── package.json            ← Dependencies & npm scripts
├── .gitignore              ← Git exclusion rules
│
├── server/
│   └── index.js            ← Express + Socket.io backend
│
└── src/
    ├── main.js             ← App bootstrap & event wiring
    ├── style.css           ← Global design system
    │
    ├── config/
    │   └── characters.js   ← Piece → character data mapping
    │
    ├── logic/
    │   └── GameEngine.js   ← chess.js wrapper + AI
    │
    ├── render/
    │   ├── SceneManager.js ← Three.js scene/camera/lights
    │   ├── Board3D.js      ← 3D board & piece sprites
    │   └── InputHandler.js ← Raycasting mouse → square
    │
    ├── audio/
    │   └── AudioManager.js ← Web Audio API chiptune engine
    │
    └── ui/
        └── HUD.js          ← DOM HUD controller
```

---

## 3. Entry Points

### `index.html`
The single HTML file. Contains two `<div class="screen">` elements:
- **`#screen-menu`** — Main menu with mode selection, faction picker, start button.
- **`#screen-game`** — HUD toolbar, canvas, move history sidebar.

Only the `.active` screen is displayed (via CSS `display: flex` vs `display: none`). Scripts load via `<script type="module" src="/src/main.js">` which triggers Vite's module bundling.

### `vite.config.js`
```js
server.proxy['/socket.io'] → 'http://localhost:3000'
```
Vite dev server proxies all `/socket.io` WebSocket traffic to the Node.js backend on port 3000, so both can run on different ports during development without CORS issues.

---

## 4. Module Reference

### 4.1 `config/characters.js`

**Purpose:** Central data store mapping chess piece codes to Nintendo characters.

**Exports:**
| Export | Type | Description |
|--------|------|-------------|
| `FACTIONS` | `Object` | Keyed by `'mario'` and `'kirby'`. Each contains `name`, `color`, `emoji`, `theme`, and `pieces`. |
| `getCharacter(pieceCode)` | `Function` | Lookup character data by FEN code (e.g. `'K'`, `'q'`). |

**Piece code conventions:**
- **Uppercase** (`K`, `Q`, `R`, `B`, `N`, `P`) = White (Team Mario)
- **Lowercase** (`k`, `q`, `r`, `b`, `n`, `p`) = Black (Team Kirby)

**Example:**
```js
import { FACTIONS } from './config/characters.js';
const mario = FACTIONS.mario;
console.log(mario.pieces.K.name); // "Mario"
console.log(mario.pieces.P.emoji); // "🍄"
```

---

### 4.2 `logic/GameEngine.js`

**Purpose:** Thin wrapper around `chess.js`. Provides event-driven state updates, move validation, undo, and a random-move AI.

**Class: `GameEngine`**

| Method | Parameters | Returns | Description |
|--------|-----------|---------|-------------|
| `start(mode, faction)` | `mode: '1p'\|'2p'`, `faction: string` | `void` | Resets game, emits `gameStart` and `boardUpdate`. |
| `getState()` | — | `GameState` | Snapshot of current board, turn, FEN, history, flags. |
| `getValidMoves(square)` | `square: string` e.g. `'e4'` | `Move[]` | All legal moves from that square (verbose). |
| `makeMove(from, to, promotion)` | `string, string, string` | `Move\|null` | Attempts a move. Returns move object or `null` if illegal. Auto-triggers AI in 1P mode. |
| `undoMove()` | — | `void` | Pops last move (2 pops in 1P to also undo AI). |
| `on(event, callback)` | `event: string`, `cb: Function` | `this` | Registers event listener. Chainable. |

**Events emitted:**

| Event | Payload | When |
|-------|---------|------|
| `gameStart` | `{ mode, playerFaction }` | `start()` called |
| `boardUpdate` | `GameState` | After any board change |
| `moveMade` | `Move` (chess.js verbose move) | After a successful move |
| `gameOver` | `GameState` | When `chess.isGameOver()` is true |

**`GameState` object shape:**
```js
{
  board: Square[][]    // chess.js board array (8x8)
  turn: 'w' | 'b'
  fen: string
  pgn: string
  history: Move[]
  isCheck: boolean
  isCheckmate: boolean
  isStalemate: boolean
  isDraw: boolean
  isGameOver: boolean
}
```

**AI (`_makeAIMove`):**  
Currently picks a uniformly random legal move. Triggered 500ms after any move when `gameMode === '1p'` and it is Black's turn.

---

### 4.3 `render/SceneManager.js`

**Purpose:** Bootstrap and manage the Three.js rendering environment.

**Class: `SceneManager`**

**Constructor:** `new SceneManager(canvas: HTMLCanvasElement)`

Sets up:
1. `WebGLRenderer` — antialias, shadow maps (PCFSoft), ACES filmic tone mapping.
2. `Scene` — dark background `#0d0d1a`, fog from 20–60 units.
3. `PerspectiveCamera` — 45° FOV, starts at `(0, 14, 12)` looking at origin.
4. **Three lights:**
   - `AmbientLight` (blue-tinted, 0.5 intensity) — fills shadows softly.
   - `DirectionalLight` (white, 1.5) at `(8,16,8)` — casts PCFSoft shadows.
   - `PointLight` (purple accent, 1.5) at `(-6,6,-6)` — rim/fill from left.
   - `PointLight` (warm orange, 0.8) at `(6,4,-8)` — warm rim from right.
5. `OrbitControls` — damping `0.06`, polar angle capped at 82°, distance 8–25.
6. **Render loop** — `requestAnimationFrame` running `controls.update()` + custom `onFrame` callback.
7. **Resize handler** — updates renderer size and camera aspect on window resize.

| Method | Description |
|--------|-------------|
| `onFrame(fn)` | Register a callback called every animation frame |
| `flipCamera()` | Mirrors the camera position around the Y-axis (180° board flip) |

---

### 4.4 `render/Board3D.js`

**Purpose:** Builds and manages the visual 3D chessboard and piece emoji sprites.

**Class: `Board3D`**

**Constructor:** `new Board3D(scene: THREE.Scene)`

**Board construction (`_buildBoard`):**
- Base slab: `BoxGeometry(9, 0.3, 9)` in `COLOR_BOARD_BORDER`.
- 64 squares: `BoxGeometry(1, 0.15, 1)`. Positioned so `a1` = bottom-left at `(-3.5, 0, -3.5)`.
- Square `userData.square` stores the algebraic notation (e.g. `'e4'`).
- `userData.baseColor` stores the original color for resetting highlights.

**Piece sprites (`_createPieceSprite`):**
- Draws an emoji onto an offscreen `<canvas>` (256×256).
- Adds a radial gradient glow (orange for white, purple for black).
- Wraps canvas as `THREE.CanvasTexture` → `SpriteMaterial` → `THREE.Sprite`.
- Sprites render without depth-testing (`depthTest: false`) so they always appear above the board.

**Key Methods:**

| Method | Parameters | Description |
|--------|-----------|-------------|
| `updatePieces(board, playerFaction)` | `board: Square[][]`, `faction: string` | Removes all old sprites, creates new ones from current board state. |
| `highlightSquares(squares, type)` | `squares: string[]`, `type: 'selected'\|'valid'\|'lastmove'\|'check'` | Tints square meshes with a highlight color. |
| `clearHighlights()` | — | Restores all highlighted squares to their base color. |
| `getSquareMeshes()` | — | Returns array of all 64 square `THREE.Mesh` objects (used for raycasting). |
| `getSquareFromMesh(mesh)` | `mesh: THREE.Mesh` | Extracts the algebraic square name from mesh userData. |

**Highlight colors:**
| Type | Color |
|------|-------|
| `selected` | `#f5a623` (orange) |
| `valid` | `#7b5ef8` (purple) |
| `lastmove` | `#38d9f5` (cyan) |
| `check` | `#e8445a` (red) |

---

### 4.5 `render/InputHandler.js`

**Purpose:** Maps mouse clicks on the canvas to chessboard square names via raycasting.

**Class: `InputHandler`**

**Constructor:** `new InputHandler(camera, renderer, board3D, onSquareClick)`

- Attaches `click` listener to `renderer.domElement`.
- On click: normalizes mouse coordinates to NDC (`[-1,1]`), fires a `THREE.Raycaster` against all 64 square meshes.
- If a hit is found, calls `onSquareClick(squareName)`.

| Method | Description |
|--------|-------------|
| `enable()` | Allow click events (default) |
| `disable()` | Block click events (e.g. during AI animation) |

**Coordinate normalization formula:**
```
x = ((clientX - rect.left) / rect.width)  * 2 - 1
y = -((clientY - rect.top)  / rect.height) * 2 + 1
```

---

### 4.6 `audio/AudioManager.js`

**Purpose:** All audio synthesized procedurally via the Web Audio API — no files needed.

**Class: `AudioManager`**  
**Singleton export:** `export const audio = new AudioManager()`

**AudioContext initialization:**  
Lazy-initialized on first user click/keypress (required by browser autoplay policy).

**Signal chain:**
```
OscillatorNode → GainNode (per-note ADSR) → masterGain → AudioContext.destination
```

**`_playNote(freq, startTime, duration, type, gain, slide)`**  
Core note synthesizer. Creates an oscillator + gain envelope (ADSR-lite: 10ms attack, 70% sustain, linear decay to 0).

**Background music (`_THEMES`):**  
Two themes: `menu` (140 BPM) and `game` (120 BPM). Each has a 32-note `melody` and `bass` array of MIDI note numbers. An arpeggio layer is derived from the melody.

| Layer | Waveform | Gain |
|-------|----------|------|
| Melody | `square` | 0.12 |
| Bass | `triangle` | 0.10 |
| Arpeggio | `square` | 0.04 |

**Character sounds (`_CHARACTER_SOUNDS`):**  
Each of 12 piece types has a unique 4-note MIDI sequence and waveform. Played on piece selection and hover.

**Key Methods:**

| Method | Parameters | Description |
|--------|-----------|-------------|
| `playBackground(theme)` | `'menu'\|'game'` | Starts looping background music. |
| `stopBackground()` | — | Stops the background loop. |
| `playCharacterSound(pieceCode)` | e.g. `'K'`, `'p'` | Plays 4-note jingle for that character. |
| `playFactionSelect(faction)` | `'mario'\|'kirby'` | Ascending (major) or descending (minor) arpeggio. |
| `playMove()` | — | Short 2-note "tick". |
| `playCapture()` | — | 4-note descending sawtooth burst. |
| `playCheck()` | — | 3-note alert. |
| `playGameOver(winner)` | `'white'\|'black'` | 7-note ascending or descending fanfare. |
| `toggleMute()` | — | Mutes/unmutes master gain. Returns new mute state. |
| `setVolume(vol)` | `0–1` | Sets master volume. |

**Keyboard shortcut:** Press `M` to toggle mute.

---

### 4.7 `ui/HUD.js`

**Purpose:** Controls all DOM elements in the in-game HUD panel.

**Class: `HUD`**

| Method | Parameters | Description |
|--------|-----------|-------------|
| `setTurn(turn)` | `'w'\|'b'` | Updates turn indicator text and `.active-turn` class on player panels. |
| `setStatus(message, type)` | `string`, `'info'\|'warn'\|'danger'` | Shows colored status text (check, checkmate, draw). |
| `addMove(move)` | `Move` (verbose) | Appends a move row to the history panel and auto-scrolls. |
| `reset()` | — | Clears move history, status, and resets turn indicator. |
| `setFactions(white, black)` | `Faction, Faction` | Updates player name and emoji in both HUD panels. |

---

### 4.8 `main.js`

**Purpose:** Application bootstrap. Wires all modules together and handles the menu UI.

**Initialization sequence:**
1. `initTooltips()` — injects the `#global-tooltip` div, attaches `mouseover`/`mousemove`/`mouseout` delegators.
2. `audio.playBackground('menu')` — starts menu music.
3. Attaches `data-tooltip` attributes to all interactive menu elements.
4. Attaches faction card `mouseenter` handlers for hover sounds.

**`startGame()` flow:**
```
showScreen('screen-game')
→ new GameEngine()
→ new SceneManager(canvas)  [lazy, only first time]
→ new Board3D(scene)         [lazy]
→ new InputHandler(...)      [lazy]
→ new HUD()
→ engine.on('boardUpdate')   [→ board3D.updatePieces + hud.setTurn]
→ engine.on('moveMade')      [→ hud.addMove + audio SFX]
→ engine.start(mode, faction)
```

**`onSquareClick(square)` flow:**
```
if no selectedSquare:
  → validate piece ownership
  → audio.playCharacterSound(pieceCode)
  → highlight valid moves (purple)
else:
  → engine.makeMove(from, to)
  → if moved: clear highlights, audio SFX
  → if not moved: try re-selecting another friendly piece
```

---

## 5. Server Architecture

**File:** `server/index.js`

Express HTTP server + Socket.io on **port 3000**.

### Room lifecycle:
```
client emits 'joinRoom' { roomId }
→ server creates room if absent
→ assigns color ('w' first, 'b' second)
→ emits 'assignColor' { color } to client
→ emits 'playerCount' { count } to room

client emits 'move' { from, to, promotion, fen }
→ server relays to opponent: 'opponentMove' { from, to, promotion, fen }

client disconnects
→ server removes from room
→ if room empty, deletes room
```

### Socket Events Reference:

| Direction | Event | Payload | Description |
|-----------|-------|---------|-------------|
| Client → Server | `joinRoom` | `{ roomId }` | Join or create a room |
| Server → Client | `assignColor` | `{ color }` | `'w'` or `'b'` |
| Server → Client | `roomFull` | — | Room already has 2 players |
| Server → Room | `playerCount` | `{ count }` | Current number of players |
| Client → Server | `move` | `{ from, to, promotion, fen }` | Relay a move |
| Server → Opponent | `opponentMove` | same | Forwarded move |

---

## 6. Data Flow Diagram

```
User Click
    │
    ▼
InputHandler (raycasting)
    │ square name (e.g. 'e4')
    ▼
main.js → onSquareClick()
    │
    ├── audio.playCharacterSound()
    │
    ▼
GameEngine.makeMove(from, to)
    │
    ├── chess.js validates & applies move
    │
    ▼
GameEngine emits 'moveMade', 'boardUpdate'
    │               │
    │               ▼
    │           HUD.setTurn()
    │           HUD.addMove()
    │           HUD.setStatus()
    │               │
    ▼               ▼
Board3D.updatePieces()    audio.playMove() / playCapture()
Board3D.highlightSquares()
```

---

## 7. Key Algorithms

### Raycasting (click → square)
Three.js `Raycaster.setFromCamera()` shoots a ray from the camera through the mouse's NDC coordinates. It intersects against the 64 BoxGeometry meshes. The first hit's `userData.square` gives the algebraic notation.

### 8-bit Chiptune Synthesis
The `AudioManager` schedules notes ahead of time using `AudioContext.currentTime`. Each note creates a temporary `OscillatorNode` (square/sawtooth/triangle/sine wave) connected through a `GainNode` with a short attack/decay envelope. A `setInterval` reschedules the next bar just before the current one ends to create a seamless loop without `AudioBufferSourceNode` (which would require pre-recorded audio).

### Piece Sprite Generation
A 256×256 `<canvas>` is drawn off-screen per piece: a radial gradient glow + the emoji at 55% font size. This is uploaded to the GPU as a `THREE.CanvasTexture`. The sprite uses `depthTest: false` so it always renders in front of the board squares regardless of camera angle.

---

## 8. Styling System

All styles live in `src/style.css`. Design tokens are defined as CSS custom properties on `:root`.

**Color palette:**
| Token | Value | Use |
|-------|-------|-----|
| `--color-bg` | `#0d0d1a` | Page background |
| `--color-surface` | `#13132a` | Cards, panels |
| `--color-surface-2` | `#1e1e3f` | Borders, dividers |
| `--color-primary` | `#e8445a` | Red accent, danger |
| `--color-secondary` | `#f5a623` | Gold/orange, highlights |
| `--color-accent` | `#7b5ef8` | Purple, valid moves |
| `--color-accent-2` | `#38d9f5` | Cyan, last move |
| `--color-muted` | `#8888aa` | Labels, secondary text |

**Fonts:**
- `Sniglet` — Display/logo text (playful, Nintendo-like)
- `Outfit` — Body text, UI labels (modern, clean)

**Key animation keyframes:**
- `float` — Logo chess piece bob (0 → -12px → 0, 3s infinite)
- `twinkle` — Star field opacity + scale pulse (4s infinite alternate)

**Tooltip component (`.global-tooltip`):**  
Absolutely positioned via JS `mousemove`. Glassmorphic: dark semi-transparent background, purple border, backdrop blur. Fades + slides in via `opacity` + `translateY` transition.
