import { siteConfig } from "./site-config.js";
import * as THREE from "three";

export class Starfield {
  constructor(scene, numStars = 15000) {
    this.scene = scene;
    this.numStars = numStars;
    this.init();
  }

  init() {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(this.numStars * 3);
    const colors = new Float32Array(this.numStars * 3);

    const colorPalette = [
      new THREE.Color(0xffffff),
      new THREE.Color(0xaaccff),
      new THREE.Color(0xffccaa),
      new THREE.Color(0xddddff),
    ];

    for (let i = 0; i < this.numStars; i++) {
      const radius = 200 + Math.random() * 800;
      const theta = 2 * Math.PI * Math.random();
      const phi = Math.acos(2 * Math.random() - 1);

      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = radius * Math.cos(phi);

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
      const color =
        colorPalette[Math.floor(Math.random() * colorPalette.length)];
      const brightness = 0.5 + Math.random() * 0.5;

      colors[i * 3] = color.r * brightness;
      colors[i * 3 + 1] = color.g * brightness;
      colors[i * 3 + 2] = color.b * brightness;
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    geometry.attributes.position.setUsage(THREE.DynamicDrawUsage);
    geometry.attributes.color.setUsage(THREE.DynamicDrawUsage);
    this.originalPositions = new Float32Array(positions);
    this.targetPositions = new Float32Array(positions);
    this.isFormingConstellation = false;
    this.constellationProgress = 0;
    this.lastUpdateTime = 0;
    const canvas = document.createElement("canvas");
    canvas.width = 16;
    canvas.height = 16;
    const context = canvas.getContext("2d");
    const gradient = context.createRadialGradient(8, 8, 0, 8, 8, 8);
    gradient.addColorStop(0, "rgba(255,255,255,1)");
    gradient.addColorStop(0.2, "rgba(255,255,255,0.8)");
    gradient.addColorStop(1, "rgba(255,255,255,0)");
    context.fillStyle = gradient;
    context.fillRect(0, 0, 16, 16);
    const texture = new THREE.CanvasTexture(canvas);

    const material = new THREE.PointsMaterial({
      size: 2.0,
      vertexColors: true,
      map: texture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    this.points = new THREE.Points(geometry, material);
    this.scene.add(this.points);
  }

  formConstellation() {
    if (this.isFormingConstellation) return;
    this.isFormingConstellation = true;
    this.constellationProgress = 0;
    const canvas = document.createElement("canvas");
    const cw = 1200;
    const ch = 400;
    canvas.width = cw;
    canvas.height = ch;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = 'bold 80px "Times New Roman", Arial, sans-serif';
    ctx.fillText(siteConfig.constellation.line1, cw / 2, ch / 2 - 40);
    ctx.font = 'italic 70px "Times New Roman", Arial, sans-serif';
    ctx.fillText(siteConfig.constellation.line2, cw / 2, ch / 2 + 50);
    const imgData = ctx.getImageData(0, 0, cw, ch).data;
    const points = [];
    for (let y = 0; y < ch; y += 3) {
      for (let x = 0; x < cw; x += 3) {
        const alpha = imgData[(y * cw + x) * 4 + 3];
        if (alpha > 128) {
          points.push({ x: x, y: y });
        }
      }
    }

    const colors = this.points.geometry.attributes.color.array;
    let starIndex = 0;
    const scale = 0.16;
    for (let i = 0; i < points.length; i++) {
      if (starIndex >= Math.floor(this.numStars * 0.5)) break;

      const pt = points[i];
      const nx = (pt.x - cw / 2) * scale + (Math.random() - 0.5) * 0.5;
      const ny = -(pt.y - ch / 2) * scale + (Math.random() - 0.5) * 0.5;
      const nz = -100 + (Math.random() - 0.5);

      this.targetPositions[starIndex * 3] = nx;
      this.targetPositions[starIndex * 3 + 1] = ny;
      this.targetPositions[starIndex * 3 + 2] = nz;
      colors[starIndex * 3] = 1.0;
      colors[starIndex * 3 + 1] = 0.55;
      colors[starIndex * 3 + 2] = 0.1;

      starIndex++;
    }
    this.points.geometry.attributes.color.needsUpdate = true;
  }

  update(time) {
    this.points.rotation.y = time * 0.02;
    this.points.rotation.x = time * 0.005;
    if (this.isFormingConstellation && this.constellationProgress < 1.0) {
      const delta =
        this.lastUpdateTime > 0
          ? Math.max(0, time - this.lastUpdateTime)
          : 1 / 60;
      this.constellationProgress += delta * 0.24;
      if (this.constellationProgress > 1.0) this.constellationProgress = 1.0;

      const positions = this.points.geometry.attributes.position.array;
      const t = 1.0 - Math.pow(1.0 - this.constellationProgress, 3);
      for (let i = 0; i < this.numStars * 3; i++) {
        positions[i] =
          this.originalPositions[i] +
          (this.targetPositions[i] - this.originalPositions[i]) * t;
      }
      this.points.geometry.attributes.position.needsUpdate = true;
    }

    this.lastUpdateTime = time;
  }
}
