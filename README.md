# Chessy Bitzy

A Nintendo-inspired 3D chess game built with Node.js, Three.js, and Socket.io.

This repository contains the client and server for a small multiplayer 3D chess experience — rendering and animation handled with Three.js and GSAP, chess rules enforced with chess.js, and real-time multiplayer powered by Socket.io.

---

## Table of contents

- [Demo / Preview](#demo--preview)
- [Features](#features)
- [Tech stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Quick start (development)](#quick-start-development)
- [Build & preview (production)](#build--preview-production)
- [Server-only](#server-only)
- [Project structure](#project-structure)
- [How it works (high level)](#how-it-works-high-level)
- [Contributing](#contributing)
- [License](#license)
- [Links](#links)

---

## Demo / Preview

- The repo includes a simple client (`index.html` / `src/`) and a Node.js server (`server/`).
- For local development run the full dev workflow below. The Vite dev server serves the client; the Node server runs the real-time game server.


## Features

- 3D-rendered chessboard and pieces using Three.js
- Chess rules and move validation using chess.js
- Real-time multiplayer using Socket.io (server + client)
- Smooth piece animations using GSAP
- Lightweight Node/Express server for multiplayer signalling


## Tech stack

- Node.js (ES modules)
- Three.js — 3D rendering
- chess.js — chess rules and validation
- Socket.io & socket.io-client — real-time multiplayer
- Vite — development server and build tooling
- GSAP — animations
- Express — server framework


## Prerequisites

- Node.js 16+ (Node 18+ recommended)
- npm


## Quick start (development)

1. Clone the repository:

   git clone https://github.com/polosjacket/chessy-bitzy.git
   cd chessy-bitzy

2. Install dependencies:

   npm install

3. Start the development environment (client + server):

   npm run dev

This runs the Node server (`server/index.js`) and Vite simultaneously (the `dev` script uses `concurrently`).

Open the Vite client in your browser (Vite will print the local address, typically http://localhost:5173). Connect multiple browser windows to test multiplayer behavior.


## Build & preview (production)

1. Build the client bundle:

   npm run build

2. Preview the production build using Vite:

   npm run preview

(If you want to serve the built files from the Node server instead of the Vite preview, you can adapt `server/index.js` to serve the `dist/` folder produced by the build.)


## Server-only

To start only the server (no Vite client):

npm run server

By default the server entry point is `server/index.js`. The server is responsible for Socket.io connections and multiplayer signalling.


## Project structure

- index.html — client entry (static)
- src/ — client-side source (Three.js scene, UI, socket client, etc.)
- server/ — Node/Express + Socket.io server
- docs/ — project documentation
- changelog.md — changes & release notes
- idea.md, plan.md — notes and planning
- package.json — npm scripts & dependencies
- vite.config.js — Vite configuration


## How it works (high level)

- The client renders a 3D chessboard and pieces with Three.js. Piece movement animations are handled by GSAP.
- Game logic (legal moves, check/checkmate, move generation) is enforced with `chess.js` on the client and/or server as needed.
- Players connect to a common room using Socket.io. The server relays move events and simple game state so connected clients stay in sync.


## Contributing

Contributions, issues and feature requests are welcome.

- Open an issue to discuss changes before implementing larger features.
- Fork the repository and submit a pull request with a clear description of the changes.


## License

This project is licensed under the terms found in the `LICENSE` file in this repository.


## Links

- Changelog: `changelog.md`
- Docs: `docs/` directory
- Idea / Plan: `idea.md`, `plan.md`

---

Maintainer: @polosjacket

Enjoy playing and building with Chessy Bitzy! If you want improvements to the README (screenshots, badges, demo link), tell me what to include and I'll update it.
