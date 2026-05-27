import * as THREE from "three";

export class MouseTrail {
  constructor(scene, camera, maxParticles = 1000) {
    this.scene = scene;
    this.camera = camera;
    this.maxParticles = maxParticles;
    this.particles = [];
    this.particleIndex = 0;
    this.lastEmitTime = 0;
    this.geometry = new THREE.BufferGeometry();
    this.positions = new Float32Array(this.maxParticles * 3);
    this.colors = new Float32Array(this.maxParticles * 3);
    this.sizes = new Float32Array(this.maxParticles);

    for (let i = 0; i < this.maxParticles; i++) {
      this.positions[i * 3] = 0;
      this.positions[i * 3 + 1] = 0;
      this.positions[i * 3 + 2] = 0;
      this.colors[i * 3] = 0;
      this.colors[i * 3 + 1] = 0;
      this.colors[i * 3 + 2] = 0;
      this.sizes[i] = 0;
      this.particles.push({
        life: 0,
        x: 0,
        y: 0,
        z: 0,
        vx: 0,
        vy: 0,
        vz: 0,
        r: 0,
        g: 0,
        b: 0,
      });
    }

    this.geometry.setAttribute(
      "position",
      new THREE.BufferAttribute(this.positions, 3),
    );
    this.geometry.setAttribute(
      "color",
      new THREE.BufferAttribute(this.colors, 3),
    );
    this.geometry.setAttribute(
      "size",
      new THREE.BufferAttribute(this.sizes, 1),
    );
    this.geometry.attributes.position.setUsage(THREE.DynamicDrawUsage);
    this.geometry.attributes.color.setUsage(THREE.DynamicDrawUsage);
    this.geometry.attributes.size.setUsage(THREE.DynamicDrawUsage);
    const canvas = document.createElement("canvas");
    canvas.width = 16;
    canvas.height = 16;
    const ctx = canvas.getContext("2d");
    const gradient = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
    gradient.addColorStop(0, "rgba(255, 255, 255, 1)");
    gradient.addColorStop(0.3, "rgba(100, 200, 255, 0.8)");
    gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 16, 16);
    const texture = new THREE.CanvasTexture(canvas);
    this.material = new THREE.ShaderMaterial({
      uniforms: {
        pointTexture: { value: texture },
      },
      vertexShader: `
                attribute float size;
                attribute vec3 color;
                varying vec3 vColor;
                void main() {
                    vColor = color;
                    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                    gl_PointSize = size * (300.0 / -mvPosition.z);
                    gl_Position = projectionMatrix * mvPosition;
                }
            `,
      fragmentShader: `
                uniform sampler2D pointTexture;
                varying vec3 vColor;
                void main() {
                    gl_FragColor = vec4(vColor, 1.0) * texture2D(pointTexture, gl_PointCoord);
                    if (gl_FragColor.a < 0.05) discard;
                }
            `,
      blending: THREE.AdditiveBlending,
      depthTest: true,
      depthWrite: false,
      transparent: true,
    });

    this.particleSystem = new THREE.Points(this.geometry, this.material);
    this.scene.add(this.particleSystem);
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.intersectPoint = new THREE.Vector3();
    this.plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 50);

    window.addEventListener("mousemove", this.onMouseMove.bind(this), {
      passive: true,
    });
  }

  onMouseMove(event) {
    const now = performance.now();
    if (now - this.lastEmitTime < 16) return;
    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersectPoint = this.intersectPoint;
    this.raycaster.ray.intersectPlane(this.plane, intersectPoint);

    if (intersectPoint) {
      this.emitParticles(intersectPoint, 3);
      this.lastEmitTime = now;
    }
  }

  emitParticles(origin, count) {
    for (let i = 0; i < count; i++) {
      const p = this.particles[this.particleIndex];

      p.life = 1.0;
      p.x = origin.x + (Math.random() - 0.5) * 2;
      p.y = origin.y + (Math.random() - 0.5) * 2;
      p.z = origin.z + (Math.random() - 0.5) * 2;
      p.vx = (Math.random() - 0.5) * 0.5;
      p.vy = (Math.random() - 0.5) * 0.5;
      p.vz = (Math.random() - 0.5) * 0.5;
      const colorRgb = [
        [0.2, 0.8, 1.0],
        [0.8, 0.2, 1.0],
        [1.0, 1.0, 1.0],
      ][Math.floor(Math.random() * 3)];

      p.r = colorRgb[0];
      p.g = colorRgb[1];
      p.b = colorRgb[2];

      this.particleIndex = (this.particleIndex + 1) % this.maxParticles;
    }
  }

  update() {
    const positionAttr = this.geometry.attributes.position;
    const colorAttr = this.geometry.attributes.color;
    const sizeAttr = this.geometry.attributes.size;
    let changed = false;

    for (let i = 0; i < this.maxParticles; i++) {
      const p = this.particles[i];

      if (p.life > 0) {
        changed = true;
        p.life -= 0.015;
        if (p.life < 0) p.life = 0;
        p.x += p.vx;
        p.y += p.vy;
        p.z += p.vz;
        p.vx *= 0.98;
        p.vy -= 0.005;
        p.vz *= 0.98;
        positionAttr.array[i * 3] = p.x;
        positionAttr.array[i * 3 + 1] = p.y;
        positionAttr.array[i * 3 + 2] = p.z;
        colorAttr.array[i * 3] = p.r * p.life;
        colorAttr.array[i * 3 + 1] = p.g * p.life;
        colorAttr.array[i * 3 + 2] = p.b * p.life;
        sizeAttr.array[i] = 15.0 * p.life;
      } else {
        if (sizeAttr.array[i] !== 0) {
          sizeAttr.array[i] = 0;
          changed = true;
        }
      }
    }
    if (!changed) return;
    positionAttr.needsUpdate = true;
    colorAttr.needsUpdate = true;
    sizeAttr.needsUpdate = true;
  }
}
