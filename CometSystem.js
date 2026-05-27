import * as THREE from "three";

export class CometSystem {
  constructor(scene) {
    this.scene = scene;
    this.comets = [];
    this.maxComets = 3;
    this.maxTailPoints = 30;
    const canvas = document.createElement("canvas");
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext("2d");
    const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    gradient.addColorStop(0, "rgba(255, 255, 255, 1)");
    gradient.addColorStop(0.2, "rgba(150, 200, 255, 0.8)");
    gradient.addColorStop(1, "rgba(0, 50, 255, 0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 32, 32);
    this.cometTexture = new THREE.CanvasTexture(canvas);

    this.material = new THREE.SpriteMaterial({
      map: this.cometTexture,
      color: 0xffffff,
      blending: THREE.AdditiveBlending,
      transparent: true,
      depthWrite: false,
    });
  }

  spawnComet() {
    if (this.comets.length >= this.maxComets) return;
    const startX = (Math.random() - 0.5) * 800;
    const startY = 200 + Math.random() * 200;
    const startZ = -300 - Math.random() * 200;
    const velX = (Math.random() - 0.5) * 4.0;
    const velY = -2.0 - Math.random() * 3.0;
    const velZ = Math.random() * 2.0;

    return this.createCometInstance(
      startX,
      startY,
      startZ,
      velX,
      velY,
      velZ,
      1.0,
      0x88ccff,
      10,
    );
  }

  spawnWishComet() {
    const startX = -400;
    const startY = -300;
    const startZ = -100;
    const velX = 2.5;
    const velY = 1.5;
    const velZ = -0.5;
    const comet = this.createCometInstance(
      startX,
      startY,
      startZ,
      velX,
      velY,
      velZ,
      5.0,
      0xff88cc,
      25,
    );
    this.wishCometActive = true;
    return comet;
  }

  createCometInstance(
    startX,
    startY,
    startZ,
    velX,
    velY,
    velZ,
    initialLife,
    tailColor,
    headSize,
  ) {
    const comet = {
      head: new THREE.Sprite(this.material),
      velocity: new THREE.Vector3(velX, velY, velZ),
      life: initialLife,
      tailIndex: 0,
      tailCount: 0,
      tailHistory: new Float32Array(this.maxTailPoints * 3),
      tailRenderBuffer: new Float32Array(this.maxTailPoints * 3),
      tailGeometry: new THREE.BufferGeometry(),
      tailMaterial: new THREE.LineBasicMaterial({
        color: tailColor,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending,
        linewidth: 2,
      }),
      tailLine: null,
      isWishComet: initialLife > 1.0,
    };

    comet.head.position.set(startX, startY, startZ);
    comet.head.scale.set(headSize, headSize, 1);
    if (comet.isWishComet) {
      comet.head.material = comet.head.material.clone();
      comet.head.material.color.setHex(0xffaadd);
    }

    comet.tailGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(comet.tailRenderBuffer, 3),
    );
    comet.tailGeometry.attributes.position.setUsage(THREE.DynamicDrawUsage);
    comet.tailGeometry.setDrawRange(0, 0);
    comet.tailLine = new THREE.Line(comet.tailGeometry, comet.tailMaterial);

    this.scene.add(comet.head);
    this.scene.add(comet.tailLine);
    this.comets.push(comet);
    return comet;
  }

  update(time) {
    if (Math.random() < 0.005) {
      this.spawnComet();
    }
    if (this.wishCometActive && Math.random() < 0.002) {
      let hasWish = this.comets.some((c) => c.isWishComet);
      if (!hasWish) this.spawnWishComet();
    }

    for (let i = this.comets.length - 1; i >= 0; i--) {
      const comet = this.comets[i];
      comet.head.position.add(comet.velocity);
      const writeIndex = comet.tailIndex * 3;
      comet.tailHistory[writeIndex] = comet.head.position.x;
      comet.tailHistory[writeIndex + 1] = comet.head.position.y;
      comet.tailHistory[writeIndex + 2] = comet.head.position.z;
      comet.tailIndex = (comet.tailIndex + 1) % this.maxTailPoints;
      comet.tailCount = Math.min(comet.tailCount + 1, this.maxTailPoints);

      if (comet.tailCount > 1) {
        const tailAttr = comet.tailGeometry.attributes.position;
        for (let j = 0; j < comet.tailCount; j++) {
          const src =
            ((comet.tailIndex - comet.tailCount + j + this.maxTailPoints) %
              this.maxTailPoints) *
            3;
          const dst = j * 3;
          tailAttr.array[dst] = comet.tailHistory[src];
          tailAttr.array[dst + 1] = comet.tailHistory[src + 1];
          tailAttr.array[dst + 2] = comet.tailHistory[src + 2];
        }
        comet.tailGeometry.setDrawRange(0, comet.tailCount);
        tailAttr.needsUpdate = true;
      }
      if (!comet.isWishComet) {
        comet.life -= 0.002;
      } else {
        comet.life -= 0.001;
      }
      comet.head.material.opacity = Math.min(1.0, comet.life);
      comet.tailMaterial.opacity = Math.min(1.0, comet.life * 0.8);
      const outOfBounds = comet.isWishComet
        ? comet.head.position.y > 600 || comet.head.position.x > 800
        : comet.head.position.y < -400;

      if (comet.life <= 0 || outOfBounds) {
        this.scene.remove(comet.head);
        this.scene.remove(comet.tailLine);
        comet.tailGeometry.dispose();
        comet.tailMaterial.dispose();
        this.comets.splice(i, 1);
      }
    }
  }
}
