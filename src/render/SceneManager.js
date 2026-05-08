/**
 * SceneManager.js
 * Manages the Three.js scene, camera, renderer, and lighting.
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export class SceneManager {
  constructor(canvas) {
    this.canvas = canvas;
    this.width  = canvas.parentElement.offsetWidth;
    this.height = canvas.parentElement.offsetHeight;

    this._initRenderer();
    this._initScene();
    this._initCamera();
    this._initLights();
    this._initControls();
    this._initResize();
    this._startLoop();
  }

  _initRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: false,
    });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;
  }

  _initScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0d0d1a);
    this.scene.fog = new THREE.Fog(0x0d0d1a, 20, 60);
  }

  _initCamera() {
    this.camera = new THREE.PerspectiveCamera(45, this.width / this.height, 0.1, 100);
    this.camera.position.set(0, 14, 12);
    this.camera.lookAt(0, 0, 0);
  }

  _initLights() {
    // Ambient light
    const ambient = new THREE.AmbientLight(0x8888ff, 0.5);
    this.scene.add(ambient);

    // Main directional light (sun-like)
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
    dirLight.position.set(8, 16, 8);
    dirLight.castShadow = true;
    dirLight.shadow.camera.near    = 0.1;
    dirLight.shadow.camera.far     = 50;
    dirLight.shadow.camera.left    = -12;
    dirLight.shadow.camera.right   = 12;
    dirLight.shadow.camera.top     = 12;
    dirLight.shadow.camera.bottom  = -12;
    dirLight.shadow.mapSize.width  = 2048;
    dirLight.shadow.mapSize.height = 2048;
    this.scene.add(dirLight);

    // Fill light (colored accent)
    const fillLight = new THREE.PointLight(0x7b5ef8, 1.5, 30);
    fillLight.position.set(-6, 6, -6);
    this.scene.add(fillLight);

    // Rim light (warm)
    const rimLight = new THREE.PointLight(0xf5a623, 0.8, 20);
    rimLight.position.set(6, 4, -8);
    this.scene.add(rimLight);
  }

  _initControls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.06;
    this.controls.minDistance   = 8;
    this.controls.maxDistance   = 25;
    this.controls.maxPolarAngle = Math.PI / 2.2;
    this.controls.target.set(0, 0, 0);
  }

  _initResize() {
    window.addEventListener('resize', () => {
      this.width  = this.canvas.parentElement.offsetWidth;
      this.height = this.canvas.parentElement.offsetHeight;
      this.camera.aspect = this.width / this.height;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(this.width, this.height);
    });
  }

  _startLoop() {
    const animate = () => {
      requestAnimationFrame(animate);
      this.controls.update();
      if (this.onFrameCallback) this.onFrameCallback();
      this.renderer.render(this.scene, this.camera);
    };
    animate();
  }

  /** Register a per-frame update callback */
  onFrame(fn) { this.onFrameCallback = fn; }

  /** Flip the board view to the other side */
  flipCamera() {
    const pos = this.camera.position;
    const target = this.controls.target;
    this.camera.position.set(-pos.x, pos.y, -pos.z);
    this.camera.lookAt(target);
    this.controls.update();
  }
}
