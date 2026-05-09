/**
 * InputHandler.js
 * Handles mouse/touch interactions with the 3D board via raycasting.
 */

import * as THREE from 'three';

export class InputHandler {
  constructor(camera, renderer, board3D, onSquareClick) {
    this.camera      = camera;
    this.renderer    = renderer;
    this.board3D     = board3D;
    this.onSquareClick = onSquareClick;
    this.raycaster   = new THREE.Raycaster();
    this.mouse       = new THREE.Vector2();
    this._enabled    = true;

    renderer.domElement.addEventListener('click', this._onClick.bind(this));
    renderer.domElement.addEventListener('mousemove', this._onMove.bind(this));
  }

  _getCoords(e) {
    const rect = this.renderer.domElement.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width)  * 2 - 1,
      y: -((e.clientY - rect.top) / rect.height) * 2 + 1,
    };
  }

  _onClick(e) {
    if (!this._enabled) return;
    const { x, y } = this._getCoords(e);
    this.raycaster.setFromCamera({ x, y }, this.camera);
    const hits = this.raycaster.intersectObjects(this.board3D.getInteractiveMeshes());
    if (hits.length > 0) {
      const square = this.board3D.getSquareFromMesh(hits[0].object);
      if (square) this.onSquareClick(square);
    }
  }

  _onMove(e) {
    if (!this._enabled) return;
    const { x, y } = this._getCoords(e);
    this.raycaster.setFromCamera({ x, y }, this.camera);

    // If holding a piece, update its position to follow the mouse
    if (this.board3D.pickedSprite) {
      const plane = new THREE.Plane().setFromNormalAndCoplanarPoint(
        new THREE.Vector3(0, 1, 0),
        new THREE.Vector3(0, 1.0, 0) // slightly elevated while carried
      );
      const intersectPoint = new THREE.Vector3();
      this.raycaster.ray.intersectPlane(plane, intersectPoint);
      if (intersectPoint) {
        this.board3D.pickedSprite.position.x = intersectPoint.x;
        this.board3D.pickedSprite.position.z = intersectPoint.z;
        this.board3D.pickedSprite.position.y = 1.0;
      }
    }

    const hits = this.raycaster.intersectObjects(this.board3D.getInteractiveMeshes());
    if (hits.length > 0) {
      const square = this.board3D.getSquareFromMesh(hits[0].object);
      this.board3D.setHover(square);
    } else {
      this.board3D.setHover(null);
    }
  }

  enable()  { this._enabled = true;  }
  disable() { this._enabled = false; }
}
