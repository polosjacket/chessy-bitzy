/**
 * Board3D.js
 * Constructs and manages the 3D chessboard and piece sprites.
 * Uses Three.js geometry + emoji sprites for pieces.
 */

import * as THREE from 'three';
import { FACTIONS } from '../config/characters.js';

const FILE_LETTERS = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

// Colors
const COLOR_LIGHT_SQUARE  = 0xe8d5b7;
const COLOR_DARK_SQUARE   = 0x8b4513;
const COLOR_BOARD_BORDER  = 0x4a2800;
const COLOR_HIGHLIGHT     = 0xf5a623;
const COLOR_VALID_MOVE    = 0x7b5ef8;
const COLOR_LAST_MOVE     = 0x38d9f5;
const COLOR_CHECK         = 0xe8445a;

export class Board3D {
  constructor(scene) {
    this.scene = scene;
    this.squareMeshes = {};  // key: 'a1', value: THREE.Mesh
    this.pieceMeshes  = {};  // key: 'a1', value: THREE.Sprite
    this.highlightedSquares = [];
    this.lastMoveSquares    = [];
    this._group = new THREE.Group();
    scene.add(this._group);
    this._buildBoard();
  }

  /** Build the 8x8 board grid */
  _buildBoard() {
    // Board base/border
    const baseGeo  = new THREE.BoxGeometry(9, 0.3, 9);
    const baseMat  = new THREE.MeshStandardMaterial({ color: COLOR_BOARD_BORDER, roughness: 0.8 });
    const baseMesh = new THREE.Mesh(baseGeo, baseMat);
    baseMesh.position.y = -0.2;
    baseMesh.receiveShadow = true;
    this._group.add(baseMesh);

    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const isLight = (row + col) % 2 === 0;
        const geo  = new THREE.BoxGeometry(1, 0.15, 1);
        const mat  = new THREE.MeshStandardMaterial({
          color: isLight ? COLOR_LIGHT_SQUARE : COLOR_DARK_SQUARE,
          roughness: 0.6,
          metalness: 0.1,
        });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.receiveShadow = true;

        // Position: center at (0,0), a1 = bottom-left
        mesh.position.set(col - 3.5, 0, row - 3.5);
        mesh.userData.square = `${FILE_LETTERS[col]}${row + 1}`;
        mesh.userData.baseColor = isLight ? COLOR_LIGHT_SQUARE : COLOR_DARK_SQUARE;

        this.squareMeshes[mesh.userData.square] = mesh;
        this._group.add(mesh);
      }
    }
  }

  /** Create an emoji sprite for a piece */
  _createPieceSprite(emoji, isWhite) {
    const size  = 256;
    const canvas = document.createElement('canvas');
    canvas.width  = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    // Glow background
    const gradient = ctx.createRadialGradient(size/2, size/2, 10, size/2, size/2, size/2);
    gradient.addColorStop(0, isWhite ? 'rgba(245,166,35,0.35)' : 'rgba(123,94,248,0.35)');
    gradient.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);

    // Emoji
    ctx.font = `${size * 0.55}px serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(emoji, size / 2, size / 2 + 4);

    const texture = new THREE.CanvasTexture(canvas);
    const mat     = new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false });
    const sprite  = new THREE.Sprite(mat);
    sprite.scale.set(0.85, 0.85, 0.85);
    return sprite;
  }

  /** Place or update all pieces based on chess.js board state */
  updatePieces(board, playerFaction = 'mario') {
    // Remove existing piece sprites
    Object.values(this.pieceMeshes).forEach(s => this._group.remove(s));
    this.pieceMeshes = {};

    const whiteFaction = FACTIONS[playerFaction];
    const blackFaction = Object.values(FACTIONS).find(f => f !== whiteFaction);

    board.forEach((rowData, rankIdx) => {
      rowData.forEach((piece, fileIdx) => {
        if (!piece) return;
        const square = `${FILE_LETTERS[fileIdx]}${rankIdx + 1}`;
        const isWhite = piece.color === 'w';
        const faction = isWhite ? whiteFaction : blackFaction;
        const pieceKey = isWhite ? piece.type.toUpperCase() : piece.type;
        const charData = faction?.pieces?.[pieceKey];
        const emoji = charData?.emoji || '♟';

        const sprite = this._createPieceSprite(emoji, isWhite);
        sprite.position.set(fileIdx - 3.5, 0.7, rankIdx - 3.5);
        this.pieceMeshes[square] = sprite;
        this._group.add(sprite);
      });
    });
  }

  /** Highlight a set of squares (valid move targets) */
  highlightSquares(squares, type = 'valid') {
    this.clearHighlights();
    squares.forEach(sq => {
      const mesh = this.squareMeshes[sq];
      if (!mesh) return;
      const color = type === 'selected' ? COLOR_HIGHLIGHT
                  : type === 'valid'    ? COLOR_VALID_MOVE
                  : type === 'lastmove' ? COLOR_LAST_MOVE
                  : COLOR_CHECK;
      mesh.material.color.setHex(color);
      this.highlightedSquares.push(sq);
    });
  }

  /** Clear all highlights and restore base colors */
  clearHighlights() {
    this.highlightedSquares.forEach(sq => {
      const mesh = this.squareMeshes[sq];
      if (mesh) mesh.material.color.setHex(mesh.userData.baseColor);
    });
    this.highlightedSquares = [];
  }

  /** Get the square name from an intersected mesh */
  getSquareFromMesh(mesh) {
    return mesh?.userData?.square || null;
  }

  /** Get all square meshes for raycasting */
  getSquareMeshes() {
    return Object.values(this.squareMeshes);
  }
}
