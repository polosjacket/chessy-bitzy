# 🍄 Chessy Bitzy: A Nintendo-Inspired 3D Chess Adventure

## 🌟 Concept Overview
**Chessy Bitzy** is a vibrant, 3D chess game built on Node.js that transforms the classic game of strategy into a battle between iconic characters inspired by the Nintendo universe. Imagine a battlefield where Mario leads an army of Toads against King Dedede and his Waddle Dees.

The game features immersive 3D graphics, dynamic animations, and a polished user interface that captures the whimsical spirit of Nintendo's most beloved franchises.

---

## 🎭 Character-to-Piece Mapping
Each team features a unique set of characters. Players can choose their "Faction" (e.g., Team Mario vs. Team Kirby).

| Chess Piece | Team Mario (White) | Team Kirby (Black) |
| :--- | :--- | :--- |
| **King** | 👑 Mario | 🐧 King Dedede |
| **Queen** | 👸 Peach | 👸 Rosalina (or Dark Matter) |
| **Bishop** | 🧤 Luigi | 🧙‍♂️ Magolor |
| **Knight** | 🦖 Yoshi | ⚔️ Meta Knight |
| **Rook** | 🦍 Donkey Kong | 🐢 Bowser |
| **Pawn** | 🍄 Toads | ⭐️ Waddle Dees |

---

## 🎮 Game Features
### 1. Game Modes
*   **1 Player (VS Computer):** Challenge a smart AI opponent with adjustable difficulty levels.
*   **2 Players (Local/Online):** Battle a friend on the same machine or via a Node.js-powered lobby system.

### 2. 3D Experience
*   **Dynamic Camera:** Rotate, zoom, and tilt the board to get the best view of the action.
*   **Action Animations:** Pieces don't just move; they walk, fly, or smash into their new positions. Capturing a piece triggers a unique "KO" animation.
*   **Vibrant Arenas:** Choose between different themed boards like "Mushroom Kingdom," "Dream Land," or "Bowser's Castle."

### 3. Aesthetics & UI
*   **Premium Design:** Sleek, glassmorphic UI overlays.
*   **Vibrant Palettes:** High-saturation colors, smooth gradients, and playful typography (e.g., *Outfit* or *Sniglet*).
*   **Contextual Tooltips:** Hovering over any menu button, HUD icon, or character card reveals a rich tooltip explaining the item, its chess role, strategy tips, and unique character description.
*   **Character-Specific Sounds:** Each of the 12 Nintendo-inspired chess characters has a unique 4-note 8-bit signature jingle that plays when the piece is selected or hovered.

### 4. Audio System
*   **Procedural 8-bit Chiptune:** All music and SFX are synthesized via the Web Audio API (no external files). Square and sawtooth wave oscillators create authentic chiptune aesthetics.
*   **Dual Themes:** A fast (140 BPM) menu theme and a moderate (120 BPM) in-game theme loop seamlessly.
*   **Faction Select:** Hovering/clicking a faction plays a distinct ascending (Mario/major) or descending (Kirby/minor) musical arpeggio.
*   **Game SFX:** Unique sounds for moves, captures, check alerts, and victory/defeat fanfares.

---

## 🛠 Technical Stack
*   **Backend:** Node.js (Express.js) for server-side logic and session management.
*   **Frontend Logic:** Vanilla Javascript (ES6+).
*   **3D Rendering:** Three.js for the 3D board, models, and lighting.
*   **Chess Engine:** chess.js for move validation, check/checkmate detection, and game state.
*   **Audio:** Web Audio API (procedural chiptune — no external files).
*   **Real-time Interaction:** Socket.io for seamless 2-player multiplayer.
*   **Bundler:** Vite for fast HMR dev server and optimized production builds.
*   **Animations:** GSAP (GreenSock) for smooth UI and piece transitions.

## 📚 Documentation
*   **`docs/SOURCE_CODE.md`** — Full technical documentation of every module, method, algorithm, and data flow.
*   **`docs/HOWTO.md`** — Step-by-step guide for players and developers, including setup, gameplay rules, and how to extend the codebase.

## 📈 Project Tracking
*   **Changelog:** A `changelog.md` file is always updated with every command and change made.
*   **`.gitignore`** — Comprehensive exclusion rules for Node.js, Vite, OS files, and secrets.

---

## 🗺 Roadmap
1.  **Phase 1:** ✅ Project setup, Vite, Node.js server, and core chess engine.
2.  **Phase 2:** ✅ 3D board rendering with Three.js, lighting, and camera.
3.  **Phase 3:** ✅ Emoji piece sprites, character mapping, and move highlighting.
4.  **Phase 4:** ✅ Procedural 8-bit audio, character sounds, faction jingles, and game SFX.
5.  **Phase 5:** ✅ Tooltip system (UI and 3D Pieces).
6.  **Phase 6:** ✅ Documentation (SOURCE_CODE.md, HOWTO.md) and .gitignore.
7.  **Phase 7:** ✅ Pick & Place mechanics (Drag-and-drop gameplay).
8.  **Phase 8:** 🔲 Minimax AI upgrade for a smarter computer opponent.
9.  **Phase 9:** 🔲 Full online multiplayer with Socket.io rooms.
10. **Phase 10:** 🔲 3D GLTF character models replacing emoji sprites.
11. **Phase 11:** 🔲 Themed arenas (Mushroom Kingdom, Dream Land, Bowser's Castle).

---
*Created with ❤️ by Antigravity*
