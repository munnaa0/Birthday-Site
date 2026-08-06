import { siteConfig } from "./site-config.js";
import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";

import { Starfield } from "./Starfield.js";
import { Planet } from "./Planet.js";
import { CometSystem } from "./CometSystem.js";
import { MouseTrail } from "./MouseTrail.js";
import { Nebula } from "./Nebula.js";

class CosmosApp {
  constructor() {
    this.container = document.getElementById("webgl-canvas");
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.quality = this.createQualityProfile();
    this.targetFrameInterval = 1 / this.quality.targetFps;
    this.lastFrameTime = 0;
    this.smoothedFps = this.quality.targetFps;
    this.lastQualityCheckTime = 0;
    this.dynamicPixelRatio = this.quality.initialPixelRatio;

    this.initScene();
    this.initPostProcessing();
    this.initObjects();
    this.addEventListeners();

    this.clock = new THREE.Clock();
    this.isCosmicMotionStarted = false;
    this.motionStartTime = 0;
    this.animate();
  }

  createQualityProfile() {
    const isMobile =
      window.matchMedia("(max-width: 900px)").matches ||
      "ontouchstart" in window;
    const cores = navigator.hardwareConcurrency || 4;
    const memory = navigator.deviceMemory || 4;

    const lowEnd = isMobile || cores <= 4 || memory <= 4;

    return {
      targetFps: 60,
      initialPixelRatio: Math.min(
        window.devicePixelRatio || 1,
        lowEnd ? 1.25 : 1.75,
      ),
      minPixelRatio: lowEnd ? 0.9 : 1.0,
      maxPixelRatio: Math.min(window.devicePixelRatio || 1, lowEnd ? 1.35 : 2),
      lowFpsThreshold: lowEnd ? 26 : 42,
      highFpsThreshold: lowEnd ? 40 : 57,
      qualityCheckInterval: 2.0,
    };
  }

  initScene() {
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x030308, 0.0005);

    this.camera = new THREE.PerspectiveCamera(
      60,
      this.width / this.height,
      0.1,
      2000,
    );
    this.camera.position.set(0, 0, 100);

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.container,
      antialias: true,
      powerPreference: "high-performance",
    });

    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(this.dynamicPixelRatio);
    this.renderer.toneMapping = THREE.ReinhardToneMapping;
    this.renderer.toneMappingExposure = 1.2;
  }

  initPostProcessing() {
    this.composer = new EffectComposer(this.renderer);

    const renderPass = new RenderPass(this.scene, this.camera);
    this.composer.addPass(renderPass);
    const resolution = new THREE.Vector2(this.width, this.height);
    const bloomPass = new UnrealBloomPass(resolution, 1.5, 0.4, 0.85);

    bloomPass.threshold = 0.6;
    bloomPass.strength = 1.0;
    bloomPass.radius = 0.6;

    this.composer.addPass(bloomPass);
  }

  initObjects() {
    this.nebula = new Nebula(this.scene);
    this.starfield = new Starfield(this.scene, 15000);
    this.planet = new Planet(this.scene, 40, new THREE.Vector3(80, 10, -120));
    this.comets = new CometSystem(this.scene);
    this.mouseTrail = new MouseTrail(this.scene, this.camera);
  }

  addEventListeners() {
    window.addEventListener("resize", this.onWindowResize.bind(this));
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) {
        this.lastFrameTime = this.clock.getElapsedTime();
      }
    });
  }

  onWindowResize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(this.width, this.height);
    this.composer.setSize(this.width, this.height);
    this.applyPixelRatio(this.dynamicPixelRatio);
  }

  applyPixelRatio(nextRatio) {
    const clamped = Math.min(
      this.quality.maxPixelRatio,
      Math.max(this.quality.minPixelRatio, nextRatio),
    );

    if (Math.abs(clamped - this.dynamicPixelRatio) < 0.05) return;

    this.dynamicPixelRatio = clamped;
    this.renderer.setPixelRatio(this.dynamicPixelRatio);
    this.renderer.setSize(this.width, this.height, false);
    this.composer.setPixelRatio(this.dynamicPixelRatio);
    this.composer.setSize(this.width, this.height);
  }

  updateAdaptiveQuality(delta, elapsedTime) {
    if (!Number.isFinite(delta) || delta <= 0) return;

    const instantFps = 1 / delta;
    this.smoothedFps = THREE.MathUtils.lerp(this.smoothedFps, instantFps, 0.08);

    if (
      elapsedTime - this.lastQualityCheckTime <
      this.quality.qualityCheckInterval
    ) {
      return;
    }

    this.lastQualityCheckTime = elapsedTime;

    if (this.smoothedFps < this.quality.lowFpsThreshold) {
      this.applyPixelRatio(this.dynamicPixelRatio - 0.1);
    } else if (this.smoothedFps > this.quality.highFpsThreshold) {
      this.applyPixelRatio(this.dynamicPixelRatio + 0.05);
    }
  }

  startCosmicMotion() {
    if (this.isCosmicMotionStarted) return;
    this.motionStartTime = this.clock.getElapsedTime();
    this.isCosmicMotionStarted = true;
  }

  animate() {
    requestAnimationFrame(this.animate.bind(this));

    if (document.hidden) return;

    const now = this.clock.getElapsedTime();

    if (this.lastFrameTime === 0) {
      this.lastFrameTime = now;
      return;
    }

    const elapsed = now - this.lastFrameTime;
    if (elapsed < this.targetFrameInterval) return;

    this.lastFrameTime = now;

    this.updateAdaptiveQuality(elapsed, now);

    const rawTime = now;
    const motionTime = this.isCosmicMotionStarted
      ? rawTime - this.motionStartTime
      : 0;
    if (this.nebula) this.nebula.update(motionTime);
    if (this.starfield) this.starfield.update(motionTime);
    if (this.planet) this.planet.update(motionTime);
    if (this.comets) this.comets.update(motionTime);
    if (this.mouseTrail) this.mouseTrail.update();
    this.composer.render();
  }
}
function getConfigValue(path) {
  const parts = path.split(".");
  let val = siteConfig;
  for (const p of parts) {
    if (val == null) return "";
    val = val[p];
  }
  return val ?? "";
}

function escAttr(s) {
  if (typeof s !== "string") return "";
  return s.replace(/&/g, "\x26amp;").replace(/"/g, "\x26quot;").replace(/</g, "\x26lt;").replace(/>/g, "\x26gt;");
}

function buildGlitchSpan(item) {
  if (!item.glitchText) return "";
  return '<span class="story-cb-msg-glitch" data-glitch="' +
    escAttr(item.glitchText) +
    '">' +
    (item.backGlitchVisibleText || "") +
    "</span>";
}

function buildStoryItem(item, idx) {
  const isRight = item.side === "right";
  const glitchSpan = buildGlitchSpan(item);
  const backMsgText = item.backMessage || "";
  const backMsgContent = glitchSpan
    ? backMsgText + " " + glitchSpan
    : backMsgText;

  const nodeBlock =
    '<div class="story-node" aria-hidden="true">' +
    '<div class="story-node-ring"></div>' +
    '<div class="story-node-pulse"></div>' +
    '<div class="story-node-core">' + (item.nodeEmoji || "") + "</div>" +
    "</div>";

  const spacerBlock = '<div class="story-spacer"></div>';

  const cardBlock =
    '<div class="story-card-wrap">' +
    '<div class="story-orb-ring" aria-hidden="true">' +
    '<span class="story-orb story-orb-a"></span>' +
    '<span class="story-orb story-orb-b"></span>' +
    "</div>" +
    '<div class="story-card" tabindex="0" role="button" aria-label="Flip card">' +
    '<div class="story-card-inner">' +
    '<div class="story-card-front">' +
    '<figure class="story-card-photo">' +
    '<img src="' + (item.imageSrc || "") + '" alt="Story photo" class="story-card-img" />' +
    "</figure>" +
    '<div class="story-date-wrap">' +
    '<span class="story-date-icon">' + (item.dateIcon || "") + "</span>" +
    '<time class="story-date" data-tw="' + escAttr(item.date || "") + '"></time>' +
    "</div>" +
    '<h3 class="story-event-title">' + (item.title || "") + "</h3>" +
    '<p class="story-desc">' + (item.description || "") + "</p>" +
    '<span class="story-flip-hint" aria-hidden="true">hover to flip ✨</span>' +
    "</div>" +
    '<div class="story-card-back" aria-hidden="true">' +
    '<figure class="story-cb-gif-wrap">' +
    '<img src="' + (item.backGifSrc || "") + '" alt="memory gif" class="story-cb-gif" />' +
    "</figure>" +
    '<p class="story-cb-msg">' + backMsgContent + "</p>" +
    "</div>" +
    "</div>" +
    "</div>" +
    '<div class="story-item-ptcl" aria-hidden="true"></div>' +
    "</div>";

  if (isRight) {
    return '<div class="story-item story-item--right" data-story-idx="' + idx + '">' +
      spacerBlock + nodeBlock + cardBlock +
      "</div>";
  }
  return '<div class="story-item story-item--left" data-story-idx="' + idx + '">' +
    cardBlock + nodeBlock + spacerBlock +
    "</div>";
}

function generateStoryItems(items) {
  if (!items || !items.length) return "";
  return items.map((item, idx) => buildStoryItem(item, idx)).join("");
}

function applyConfig() {
  // Meta
  document.title = siteConfig.meta.title || "";
  const faviconLink = document.getElementById("favicon-link");
  if (faviconLink && siteConfig.meta.favicon) {
    faviconLink.href = siteConfig.meta.favicon;
  }

  // data-config text elements
  document.querySelectorAll("[data-config]").forEach((el) => {
    const path = el.getAttribute("data-config");
    if (!path) return;
    const value = getConfigValue(path);
    if (value != null) {
      el.textContent = String(value);
    }
  });

  // data-config-src elements
  document.querySelectorAll("[data-config-src]").forEach((el) => {
    const path = el.getAttribute("data-config-src");
    if (!path) return;
    const value = getConfigValue(path);
    if (value) {
      el.src = value;
    }
  });

  // data-config-placeholder elements
  document.querySelectorAll("[data-config-placeholder]").forEach((el) => {
    const path = el.getAttribute("data-config-placeholder");
    if (!path) return;
    const value = getConfigValue(path);
    if (value) {
      el.placeholder = value;
    }
  });

  // Letter paragraphs
  const letterWrapper = document.getElementById("letter-content-wrapper");
  if (letterWrapper && siteConfig.letter.paragraphs) {
    const greeting = siteConfig.letter.greeting || "";
    const signoff = siteConfig.letter.signoff || "";
    const signoffName = siteConfig.letter.signoffName || "";
    const paras = siteConfig.letter.paragraphs
      .map((p) => '<p class="letter-para">' + p + "</p>")
      .join("");
    letterWrapper.innerHTML =
      '<p class="letter-greeting">' +
      greeting +
      "</p>" +
      paras +
      '<div class="letter-signoff-block">' +
      '<p class="letter-signoff">' +
      signoff +
      "</p>" +
      '<p class="letter-signoff letter-name">' +
      signoffName +
      "</p>" +
      "</div>";
  }

  // Story timeline
  const storyTimeline = document.getElementById("story-timeline");
  if (storyTimeline && siteConfig.story.items) {
    const tlLine = storyTimeline.querySelector(".story-tl-line");
    const existingItems = storyTimeline.querySelectorAll(".story-item");
    existingItems.forEach((el) => el.remove());
    const generated = generateStoryItems(siteConfig.story.items);
    if (tlLine) {
      tlLine.insertAdjacentHTML("afterend", generated);
    } else {
      storyTimeline.insertAdjacentHTML("afterbegin", generated);
    }
  }
}

window.onload = () => {
  applyConfig();

  const fallbackImageSrc = siteConfig.fallbacks.image || "images/pic1.jpg";
  document.addEventListener(
    "error",
    (event) => {
      const target = event.target;
      if (!target || target.tagName !== "IMG") return;
      if (target.dataset.fallbackApplied === "1") return;
      if (target.src && target.src.includes(fallbackImageSrc)) return;

      target.dataset.fallbackApplied = "1";
      target.src = fallbackImageSrc;
    },
    true,
  );

  const app = new CosmosApp();
  let startIntroCountdown = () => {};
  const overlay = document.getElementById("intro-overlay");
  const instruction = document.getElementById("intro-instruction");
  const countdownEl = document.getElementById("countdown");
  const candleWrapper = document.getElementById("candle-wrapper");
  const candlePrompt = document.getElementById("candle-prompt");
  const birthdayText = document.getElementById("happy-birthday-text");
  const blowBtn = document.getElementById("blow-candle-btn");
  const bgm = document.getElementById("bgm");
  const originalBirthdayText = birthdayText
    ? birthdayText.textContent.trim()
    : "";
  let introCountdownStarted = false;
  const BGM_BASE_VOLUME = siteConfig.audio.bgmVolume ?? 0.5;
  const BGM_PLAY_TIMEOUT_MS = 2500;
  let bgmVolumeTweenFrame = 0;
  let bgmRetryArmed = false;
  let bgmShouldPlay = false;
  let bgmPlayPromise = null;
  let bgmDelayedRetryId = 0;

  if (bgm) {
    bgm.preload = "auto";
    bgm.loop = true;
    bgm.muted = false;
    bgm.volume = BGM_BASE_VOLUME;
  }

  function smoothBgmVolume(targetVolume, durationMs = 320) {
    if (!bgm) return;

    const clampedTarget = Math.max(0, Math.min(1, targetVolume));

    if (bgmVolumeTweenFrame) {
      cancelAnimationFrame(bgmVolumeTweenFrame);
      bgmVolumeTweenFrame = 0;
    }

    if (!Number.isFinite(durationMs) || durationMs <= 0) {
      bgm.volume = clampedTarget;
      return;
    }

    const startVolume = Number.isFinite(bgm.volume)
      ? bgm.volume
      : clampedTarget;
    const delta = clampedTarget - startVolume;

    if (Math.abs(delta) < 0.005) {
      bgm.volume = clampedTarget;
      return;
    }

    const startTime = performance.now();
    const step = (now) => {
      const progress = Math.min(1, (now - startTime) / durationMs);
      const eased = 1 - Math.pow(1 - progress, 3);
      bgm.volume = startVolume + delta * eased;

      if (progress < 1) {
        bgmVolumeTweenFrame = requestAnimationFrame(step);
      } else {
        bgm.volume = clampedTarget;
        bgmVolumeTweenFrame = 0;
      }
    };

    bgmVolumeTweenFrame = requestAnimationFrame(step);
  }

  function armBgmRetryOnNextInteraction() {
    if (!bgm || bgmRetryArmed) return;
    bgmRetryArmed = true;

    const retry = () => {
      document.removeEventListener("pointerdown", retry);
      document.removeEventListener("keydown", retry);
      document.removeEventListener("click", retry);
      document.removeEventListener("touchend", retry);
      bgmRetryArmed = false;
      void startBgmPlayback();
    };

    document.addEventListener("pointerdown", retry, { once: true });
    document.addEventListener("keydown", retry, { once: true });
    document.addEventListener("click", retry, { once: true });
    document.addEventListener("touchend", retry, { once: true, passive: true });
  }

  function scheduleBgmRetry(delayMs) {
    if (!bgm || bgmDelayedRetryId) return;
    bgmDelayedRetryId = setTimeout(() => {
      bgmDelayedRetryId = 0;
      if (bgmShouldPlay && bgm.paused && !bgm.ended && !document.hidden) {
        void startBgmPlayback();
      }
    }, delayMs);
  }

  function startBgmPlayback() {
    if (!bgm) return Promise.resolve(false);

    bgmShouldPlay = true;
    bgm.loop = true;
    bgm.muted = false;

    if (!bgm.paused && !bgm.ended) {
      smoothBgmVolume(BGM_BASE_VOLUME, 300);
      return Promise.resolve(true);
    }

    if (bgmPlayPromise) return bgmPlayPromise;

    if (bgm.ended) bgm.currentTime = 0;
    bgm.volume = BGM_BASE_VOLUME;

    let attempt;
    try {
      attempt = bgm.play();
    } catch (err) {
      attempt = Promise.reject(err);
    }

    if (!attempt || typeof attempt.then !== "function") {
      return Promise.resolve(true);
    }

    const timeoutId = setTimeout(() => {
      if (bgmShouldPlay && bgm.paused && !bgm.ended && bgmPlayPromise) {
        bgmPlayPromise = null;
        bgm.load();
        scheduleBgmRetry(300);
      }
    }, BGM_PLAY_TIMEOUT_MS);

    const settle = () => {
      clearTimeout(timeoutId);
      bgmPlayPromise = null;
    };

    bgmPlayPromise = attempt
      .then(() => {
        settle();
        return true;
      })
      .catch((err) => {
        settle();
        if (err && err.name === "AbortError") {
          // Superseded by a newer request or an internal interrupt — retry
          // shortly instead of waiting for another user interaction.
          scheduleBgmRetry(500);
          return false;
        }
        armBgmRetryOnNextInteraction();
        console.log("Audio playback blocked:", err);
        return false;
      });

    return bgmPlayPromise;
  }

  function setupBgmRecovery() {
    if (!bgm) return;

    const resumeIfNeeded = () => {
      if (!bgmShouldPlay || document.hidden) return;
      if (bgm.paused && !bgm.ended) {
        if (bgm.error || bgm.readyState >= 2) {
          void startBgmPlayback();
        } else {
          scheduleBgmRetry(600);
        }
      }
    };

    bgm.addEventListener("pause", () => {
      if (bgmShouldPlay && !bgm.ended) setTimeout(resumeIfNeeded, 80);
    });

    bgm.addEventListener("ended", () => {
      if (bgmShouldPlay) {
        bgm.currentTime = 0;
        void startBgmPlayback();
      }
    });

    bgm.addEventListener("stalled", () => setTimeout(resumeIfNeeded, 300));
    bgm.addEventListener("waiting", () => setTimeout(resumeIfNeeded, 400));
    bgm.addEventListener("error", () => scheduleBgmRetry(600));

    document.addEventListener("visibilitychange", () => {
      if (!document.hidden && bgmShouldPlay && bgm.paused && !bgm.ended) {
        void startBgmPlayback();
      }
    });

    setInterval(resumeIfNeeded, 3000);
  }

  setupBgmRecovery();

  startIntroCountdown = () => {
    if (introCountdownStarted) return;
    introCountdownStarted = true;

    let count = 3;
    countdownEl.textContent = count;

    const interval = setInterval(() => {
      count--;
      if (count > 0) {
        countdownEl.textContent = count;
      } else {
        clearInterval(interval);
        instruction.style.opacity = "0";
        instruction.style.maxHeight = "0";
        instruction.style.marginBottom = "0";
        countdownEl.style.opacity = "0";
        countdownEl.style.maxHeight = "0";
        countdownEl.style.marginBottom = "0";
        candlePrompt.classList.add("visible");
        blowBtn.classList.add("visible");
      }
    }, 1000);
  };
  startIntroCountdown();

  const mobileBirthdayMedia = window.matchMedia("(max-width: 430px)");

  function formatBirthdayTextForViewport() {
    if (!birthdayText || !originalBirthdayText) return;

    if (mobileBirthdayMedia.matches) {
      if (birthdayText.dataset.mobileFormatted === "1") return;

      const match = originalBirthdayText.match(/^(Happy\s+Birthday)\s+(.+)$/i);
      if (match) {
        birthdayText.innerHTML =
          '<span class="hb-mobile-line">' +
          match[1] +
          "</span><br>" +
          '<span class="hb-mobile-line">' +
          match[2] +
          "</span>";
        birthdayText.dataset.mobileFormatted = "1";
      }
    } else if (birthdayText.dataset.mobileFormatted === "1") {
      birthdayText.textContent = originalBirthdayText;
      delete birthdayText.dataset.mobileFormatted;
    }
  }

  formatBirthdayTextForViewport();
  if (typeof mobileBirthdayMedia.addEventListener === "function") {
    mobileBirthdayMedia.addEventListener(
      "change",
      formatBirthdayTextForViewport,
    );
  } else if (typeof mobileBirthdayMedia.addListener === "function") {
    mobileBirthdayMedia.addListener(formatBirthdayTextForViewport);
  }
  function triggerBlowSequence() {
    // Keep this as the first action to preserve user-activation context.
    void startBgmPlayback();

    app.startCosmicMotion();

    blowBtn.style.display = "none";
    candlePrompt.style.transition = "opacity 0.4s";
    candlePrompt.style.opacity = "0";
    candleWrapper.classList.add("hidden");
    overlay.classList.add("fade-bg");
    overlay.style.backgroundColor = "transparent";
    birthdayText.classList.add("show");
    setTimeout(() => {
      if (app.starfield) {
        app.starfield.formConstellation();
      }
    }, 1500);
    setTimeout(() => {
      overlay.classList.add("fade-out");
      setTimeout(() => {
        const scrollWrapper = document.getElementById("scroll-wrapper");
        if (scrollWrapper) scrollWrapper.classList.add("visible");
        revealLetterSection();
      }, 1600);
    }, 4000);
  }

  if (blowBtn) {
    blowBtn.addEventListener("click", triggerBlowSequence);
  }
  const letterSection = document.getElementById("section-letter");
  const letterCard = document.getElementById("letter-card");
  const letterContentWrapper = document.getElementById(
    "letter-content-wrapper",
  );
  const waxSealBtn = document.getElementById("wax-seal-btn");
  const letterTiltContainer = document.getElementById("letter-tilt-container");
  const scrollWrapper = document.getElementById("scroll-wrapper");
  let letterAnimated = false;
  function wrapLetterWords() {
    if (!letterCard) return;
    const els = letterCard.querySelectorAll(
      ".letter-greeting, .letter-para, .letter-signoff",
    );
    els.forEach((el) => {
      const words = el.textContent.split(/\s+/).filter((w) => w.length > 0);
      el.innerHTML = words
        .map((w) => '<span class="letter-word">' + w + "</span>")
        .join("");
    });
  }
  function animateLetterText() {
    if (!letterCard) return Promise.resolve();
    const words = letterCard.querySelectorAll(".letter-word");
    const revealDelay = 110;
    let index = 0;

    const lineHeightRaw = letterContentWrapper
      ? parseFloat(window.getComputedStyle(letterContentWrapper).lineHeight)
      : NaN;
    const bottomBufferPx = Number.isFinite(lineHeightRaw)
      ? Math.max(16, Math.round(lineHeightRaw))
      : 24;

    function advanceForWord(wordEl) {
      if (!letterContentWrapper) return;
      if (!letterContentWrapper.classList.contains("long-letter-auto")) return;

      const wordBottom = wordEl.offsetTop + wordEl.offsetHeight;
      const viewportBottom =
        letterContentWrapper.scrollTop + letterContentWrapper.clientHeight;
      const triggerBottom = viewportBottom - bottomBufferPx;
      if (wordBottom > triggerBottom) {
        const nextScrollTop =
          wordBottom - (letterContentWrapper.clientHeight - bottomBufferPx);
        letterContentWrapper.scrollTop = Math.max(
          letterContentWrapper.scrollTop,
          nextScrollTop,
        );
      }
    }

    return new Promise((resolve) => {
      const revealNext = () => {
        if (index >= words.length) {
          resolve();
          return;
        }

        const word = words[index];
        word.classList.add("revealed");
        advanceForWord(word);
        index += 1;
        setTimeout(revealNext, revealDelay);
      };

      revealNext();
    });
  }

  function setMainScrollLock(locked) {
    if (!scrollWrapper) return;

    if (locked) {
      if (scrollWrapper.dataset.prevOverflowY === undefined) {
        scrollWrapper.dataset.prevOverflowY =
          scrollWrapper.style.overflowY || "";
      }
      scrollWrapper.style.overflowY = "hidden";
      return;
    }

    const previousOverflow = scrollWrapper.dataset.prevOverflowY;
    if (previousOverflow !== undefined) {
      scrollWrapper.style.overflowY = previousOverflow;
      delete scrollWrapper.dataset.prevOverflowY;
    } else {
      scrollWrapper.style.overflowY = "";
    }
  }

  function prepareLongLetterFlow() {
    if (!letterContentWrapper) return false;

    letterContentWrapper.scrollTop = 0;
    letterContentWrapper.classList.remove(
      "long-letter-auto",
      "manual-scroll-enabled",
    );

    const overflowDistance =
      letterContentWrapper.scrollHeight - letterContentWrapper.clientHeight;

    if (overflowDistance < 2) {
      return false;
    }

    letterContentWrapper.classList.add("long-letter-auto");
    setMainScrollLock(true);
    return true;
  }

  function finishLongLetterAutoScroll() {
    if (!letterContentWrapper) return Promise.resolve();
    if (!letterContentWrapper.classList.contains("long-letter-auto")) {
      return Promise.resolve();
    }

    const totalOverflow = Math.max(
      0,
      letterContentWrapper.scrollHeight - letterContentWrapper.clientHeight,
    );
    const remainingDistance = Math.max(
      0,
      totalOverflow - letterContentWrapper.scrollTop,
    );

    if (remainingDistance < 2) {
      letterContentWrapper.classList.remove("long-letter-auto");
      letterContentWrapper.classList.add("manual-scroll-enabled");
      setMainScrollLock(false);
      return Promise.resolve();
    }

    const pxPerSecond = 52;
    const durationMs = Math.max(
      900,
      Math.min(6000, (remainingDistance / pxPerSecond) * 1000),
    );
    const startTop = letterContentWrapper.scrollTop;

    return new Promise((resolve) => {
      const startTime = performance.now();

      const tick = (now) => {
        const progress = Math.min(1, (now - startTime) / durationMs);
        const eased = 1 - Math.pow(1 - progress, 2);
        letterContentWrapper.scrollTop = startTop + remainingDistance * eased;

        if (progress < 1) {
          requestAnimationFrame(tick);
          return;
        }

        letterContentWrapper.classList.remove("long-letter-auto");
        letterContentWrapper.classList.add("manual-scroll-enabled");
        setMainScrollLock(false);
        resolve();
      };

      requestAnimationFrame(tick);
    });
  }

  function revealPostLetterSections() {
    setTimeout(() => {
      const storySection = document.getElementById("section-story");
      if (storySection) {
        storySection.classList.add("revealed");
        initStory();
      }
    }, 700);
    setTimeout(() => {
      const wishSection = document.getElementById("section-wish");
      if (wishSection) {
        wishSection.classList.add("revealed");
      }
    }, 2100);
  }

  function applyLetterViewportLock() {
    if (!letterCard || !letterContentWrapper) return;

    const viewportCap = Math.min(window.innerHeight * 0.72, 520);
    const computed = window.getComputedStyle(letterCard);
    const padTop = parseFloat(computed.paddingTop) || 0;
    const padBottom = parseFloat(computed.paddingBottom) || 0;
    const contentHeight = Math.max(
      220,
      Math.floor(viewportCap - padTop - padBottom),
    );

    letterCard.style.maxHeight = Math.floor(viewportCap) + "px";
    letterContentWrapper.style.maxHeight = contentHeight + "px";
  }
  wrapLetterWords();
  function handleWaxSealClick() {
    if (letterAnimated) return;
    letterAnimated = true;
    waxSealBtn.classList.add("broken");
    setTimeout(() => {
      letterCard.classList.remove("locked");
      applyLetterViewportLock();
      prepareLongLetterFlow();

      animateLetterText().then(() => {
        finishLongLetterAutoScroll().then(() => {
          revealPostLetterSections();
        });
      });
    }, 600);
  }

  if (waxSealBtn) {
    waxSealBtn.addEventListener("click", handleWaxSealClick);
  }
  if (letterTiltContainer && letterCard) {
    letterTiltContainer.addEventListener("mousemove", (e) => {
      const rect = letterTiltContainer.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -4;
      const rotateY = ((x - centerX) / centerX) * 4;

      letterCard.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    });

    letterTiltContainer.addEventListener("mouseleave", () => {
      letterCard.style.transform = `perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)`;
    });
  }
  function revealLetterSection() {
    if (!letterSection) return;
    letterSection.classList.add("revealed");
    const scrollHint = document.getElementById("letter-scroll-hint");
    if (scrollHint) scrollHint.classList.add("visible");
  }
  let lastSparkle = 0;
  if (letterCard) {
    letterCard.addEventListener("mousemove", (e) => {
      const now = Date.now();
      if (now - lastSparkle < 50) return;
      lastSparkle = now;
      const rect = letterCard.getBoundingClientRect();
      const sparkle = document.createElement("div");
      sparkle.className = "sparkle";
      sparkle.style.left = e.clientX - rect.left + "px";
      sparkle.style.top = e.clientY - rect.top + "px";
      letterCard.appendChild(sparkle);
      setTimeout(() => sparkle.remove(), 800);
    });
  }
  function initStory() {
    const scrollWrapper = document.getElementById("scroll-wrapper");
    const storyItems = document.querySelectorAll(".story-item");
    const storyCards = document.querySelectorAll(".story-card");

    function runTypewriter(dateEl) {
      if (!dateEl || dateEl.dataset.twDone) return;
      dateEl.dataset.twDone = "1";
      const text = dateEl.dataset.tw || "";
      dateEl.textContent = "";
      dateEl.classList.add("typing");
      let i = 0;
      const speed = 55;
      const tick = setInterval(() => {
        dateEl.textContent += text[i];
        i++;
        if (i >= text.length) {
          clearInterval(tick);
          dateEl.classList.remove("typing");
        }
      }, speed);
    }
    const entranceObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const item = entry.target;
            item.classList.add("animate-in");
            const dateEl = item.querySelector(".story-date[data-tw]");
            const delay = 420;
            setTimeout(() => runTypewriter(dateEl), delay);
            entranceObserver.unobserve(item);
          }
        });
      },
      { root: scrollWrapper, threshold: 0.25 },
    );

    storyItems.forEach((item) => entranceObserver.observe(item));
    let lastStorySparkle = 0;
    storyCards.forEach((card) => {
      const inner = card.querySelector(".story-card-inner");
      if (!inner) return;

      card.addEventListener("mousemove", (e) => {
        const now = Date.now();
        if (now - lastStorySparkle < 45) return;
        lastStorySparkle = now;
        const rect = inner.getBoundingClientRect();
        const sp = document.createElement("div");
        sp.className = "story-sparkle";
        const dx = (Math.random() - 0.5) * 20;
        const dy = -(8 + Math.random() * 16);
        sp.style.setProperty("--sx", dx + "px");
        sp.style.setProperty("--sy", dy + "px");
        sp.style.left = e.clientX - rect.left + "px";
        sp.style.top = e.clientY - rect.top + "px";
        inner.appendChild(sp);
        setTimeout(() => sp.remove(), 800);
      });
      card.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          card.classList.toggle("flipped");
        }
      });
      card.addEventListener("click", () => {
        if (window.matchMedia("(hover: none)").matches) {
          card.classList.toggle("flipped");
        }
      });
    });
    const ptclColors = ["#d4af37", "#fff2cc", "#b76e79", "#ffd1dc", "#c8a0e0"];

    function emitCardParticles(ptclContainer) {
      if (!ptclContainer) return;
      const rect = ptclContainer.getBoundingClientRect();
      if (rect.width === 0) return;
      for (let i = 0; i < 3; i++) {
        const dot = document.createElement("div");
        dot.className = "story-ptcl-dot";
        const startX = 10 + Math.random() * (rect.width - 20);
        const startY = 10 + Math.random() * (rect.height - 20);
        const dx = (Math.random() - 0.5) * 60;
        const dy = -(20 + Math.random() * 50);
        dot.style.left = startX + "px";
        dot.style.top = startY + "px";
        dot.style.setProperty("--ptcl-dx", dx + "px");
        dot.style.setProperty("--ptcl-dy", dy + "px");
        dot.style.background =
          ptclColors[Math.floor(Math.random() * ptclColors.length)];
        dot.style.boxShadow = "0 0 4px " + dot.style.background;
        ptclContainer.appendChild(dot);
        setTimeout(() => dot.remove(), 2900);
      }
    }
    const cardParticleIntervals = new WeakMap();
    const storyParticleCards = document.querySelectorAll(".story-item-ptcl");

    if (storyParticleCards.length > 0 && "IntersectionObserver" in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          const ptcl = entry.target;
          const idx = Array.prototype.indexOf.call(storyParticleCards, ptcl);
          if (idx === -1) {
            return;
          }
          const baseInterval = 2200 + idx * 300;

          if (entry.isIntersecting) {
            if (cardParticleIntervals.has(ptcl)) {
              return;
            }
            const startDelay = 600 + idx * 200;
            const startTimeout = setTimeout(() => {
              emitCardParticles(ptcl);
              const intervalId = setInterval(
                () => emitCardParticles(ptcl),
                baseInterval,
              );
              cardParticleIntervals.set(ptcl, { intervalId });
            }, startDelay);
            cardParticleIntervals.set(ptcl, { timeoutId: startTimeout });
          } else {
            const handles = cardParticleIntervals.get(ptcl);
            if (handles) {
              if (handles.timeoutId) {
                clearTimeout(handles.timeoutId);
              }
              if (handles.intervalId) {
                clearInterval(handles.intervalId);
              }
              cardParticleIntervals.delete(ptcl);
            }
          }
        });
      });

      storyParticleCards.forEach((ptcl) => observer.observe(ptcl));
    } else {
      storyParticleCards.forEach((ptcl, idx) => {
        const baseInterval = 2200 + idx * 300;
        setTimeout(
          () => {
            emitCardParticles(ptcl);
            const intervalId = setInterval(
              () => emitCardParticles(ptcl),
              baseInterval,
            );
            cardParticleIntervals.set(ptcl, { intervalId });
          },
          600 + idx * 200,
        );
      });
    }
    const timeline = document.getElementById("story-timeline");
    const lineFill = document.getElementById("story-line-fill");

    if (timeline && lineFill && scrollWrapper) {
      const updateLine = () => {
        const tlRect = timeline.getBoundingClientRect();
        const wrapRect = scrollWrapper.getBoundingClientRect();
        const vpCentre = wrapRect.top + wrapRect.height / 2;
        const passed = vpCentre - tlRect.top;
        const pct = Math.max(0, Math.min(100, (passed / tlRect.height) * 100));
        if (!lineFill.dataset.cssAnimDone) {
          setTimeout(() => {
            lineFill.dataset.cssAnimDone = "1";
          }, 5400);
        } else {
          lineFill.style.animation = "none";
          lineFill.style.height = pct + "%";
        }
      };
      scrollWrapper.addEventListener("scroll", updateLine, { passive: true });
      updateLine();
    }
  }
  const wishBtn = document.getElementById("wish-btn");
  const wishInputContainer = document.querySelector(".wish-container");
  const wishInput = document.getElementById("wish-input");
  const finaleSection = document.getElementById("section-finale");

  const GOOGLE_FORM_ACTION_URL = siteConfig.wish.googleFormUrl || "";
  const GOOGLE_FORM_WISH_FIELD = siteConfig.wish.googleFormField || "";

  function submitWishToGoogleForm(message) {
    const formData = new URLSearchParams();
    formData.append(GOOGLE_FORM_WISH_FIELD, message);
    formData.append("fvv", "1");
    formData.append("pageHistory", "0");

    return fetch(GOOGLE_FORM_ACTION_URL, {
      method: "POST",
      mode: "no-cors",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
      },
      body: formData,
    }).catch(() => null);
  }

  const isMobileWishDevice = window.matchMedia(
    "(max-width: 768px), (pointer: coarse)",
  ).matches;

  const burstProfile = isMobileWishDevice
    ? {
        totalStars: 140,
        starsPerFrame: 28,
        minDuration: 1.8,
        maxDuration: 3.2,
        maxDelay: 2.8,
        minScale: 0.5,
        maxScale: 1.3,
        tx: "130vw",
        ty: "-130vh",
      }
    : {
        totalStars: 200,
        starsPerFrame: 40,
        minDuration: 2.0,
        maxDuration: 4.0,
        maxDelay: 3.5,
        minScale: 0.5,
        maxScale: 2.0,
        tx: "150vw",
        ty: "-150vh",
      };

  const burstStarPool = [];
  const burstColors = [
    "#ffffff",
    "#ffd700",
    "#ff69b4",
    "#00ffff",
    "#9370db",
    "#ff4500",
  ];

  function primeBurstPool() {
    while (burstStarPool.length < burstProfile.totalStars) {
      const star = document.createElement("div");
      star.className = "burst-star";
      burstStarPool.push(star);
    }
  }

  function hydrateBurstStar(star) {
    const startX = Math.random() * 120 - 20;
    const startY = Math.random() * 100 + 50;
    const duration =
      burstProfile.minDuration +
      Math.random() * (burstProfile.maxDuration - burstProfile.minDuration);
    const delay = Math.random() * burstProfile.maxDelay;
    const scale =
      burstProfile.minScale +
      Math.random() * (burstProfile.maxScale - burstProfile.minScale);

    star.classList.remove("active");
    star.style.setProperty("--sx", `${startX}vw`);
    star.style.setProperty("--sy", `${startY}vh`);
    star.style.setProperty("--tx", burstProfile.tx);
    star.style.setProperty("--ty", burstProfile.ty);
    star.style.setProperty("--s", `${scale}`);
    star.style.setProperty("--dur", `${duration}s`);
    star.style.setProperty("--delay", `${delay}s`);
    star.style.setProperty(
      "--c",
      burstColors[Math.floor(Math.random() * burstColors.length)],
    );
  }

  function createBurstFrameMonitor(sampleWindowMs = 1000) {
    let lastTs = 0;
    let startTs = 0;
    let rafId = 0;
    let samples = 0;
    let longFrames = 0;
    let reducedSuggested = false;
    let running = false;

    const onFrame = (ts) => {
      if (!running) return;

      if (!startTs) {
        startTs = ts;
        lastTs = ts;
      }

      const delta = ts - lastTs;
      lastTs = ts;
      if (samples > 0 && delta > 22) {
        longFrames += 1;
      }
      samples += 1;

      if (ts - startTs < sampleWindowMs) {
        rafId = requestAnimationFrame(onFrame);
      } else {
        const longFrameRatio = longFrames / Math.max(samples - 1, 1);
        reducedSuggested = longFrameRatio >= 0.3;
        running = false;
      }
    };

    return {
      start() {
        if (running) return;
        running = true;
        rafId = requestAnimationFrame(onFrame);
      },
      stop() {
        if (!running) return;
        running = false;
        if (rafId) cancelAnimationFrame(rafId);
      },
      shouldReduce() {
        return reducedSuggested;
      },
    };
  }

  function launchWishBurst(burstContainer) {
    burstContainer.innerHTML = "";

    let runtimeTotalStars = burstProfile.totalStars;
    let runtimeStarsPerFrame = burstProfile.starsPerFrame;
    let reducedApplied = false;
    const frameMonitor = createBurstFrameMonitor(1000);
    frameMonitor.start();

    const appendBatch = (startIndex) => {
      if (!reducedApplied && frameMonitor.shouldReduce()) {
        runtimeTotalStars = Math.max(
          Math.floor(burstProfile.totalStars * 0.72),
          80,
        );
        runtimeStarsPerFrame = Math.max(
          Math.floor(burstProfile.starsPerFrame * 0.6),
          12,
        );
        reducedApplied = true;
      }

      const fragment = document.createDocumentFragment();
      const activatedStars = [];
      const endIndex = Math.min(
        startIndex + runtimeStarsPerFrame,
        runtimeTotalStars,
      );

      for (let i = startIndex; i < endIndex; i++) {
        const star = burstStarPool[i];
        hydrateBurstStar(star);
        fragment.appendChild(star);
        activatedStars.push(star);
      }

      burstContainer.appendChild(fragment);

      requestAnimationFrame(() => {
        activatedStars.forEach((star) => star.classList.add("active"));
      });

      if (endIndex < runtimeTotalStars) {
        requestAnimationFrame(() => appendBatch(endIndex));
      } else {
        frameMonitor.stop();
      }
    };

    appendBatch(0);
  }

  if (typeof window.requestIdleCallback === "function") {
    window.requestIdleCallback(() => primeBurstPool(), { timeout: 300 });
  } else {
    setTimeout(() => primeBurstPool(), 0);
  }

  if (wishBtn && wishInputContainer) {
    let wishSent = false;

    wishBtn.addEventListener("click", () => {
      const wishMessage = wishInput.value.trim();
      if (wishMessage === "") {
        wishInput.focus();
        return;
      }

      if (wishSent) return;
      wishSent = true;

      void submitWishToGoogleForm(wishMessage);

      wishInputContainer.classList.add("sent");
      const wishHeader = document.querySelector(".wish-header");
      const wishCosmicBg = document.querySelector(".wish-cosmic-bg");
      if (wishHeader) wishHeader.classList.add("sent");
      if (wishCosmicBg) wishCosmicBg.classList.add("sent");

      const inputWrapper = document.getElementById("wish-input-wrapper");
      if (inputWrapper) inputWrapper.classList.add("sent");
      const burstContainer = document.getElementById("wish-star-burst");
      if (burstContainer) {
        launchWishBurst(burstContainer);
      }
      if (app.comets && typeof app.comets.spawnWishComet === "function") {
        app.comets.spawnWishComet();
      } else {
        console.log("Wish sent to the stars!");
      }
      if (finaleSection) {
        setTimeout(() => {
          finaleSection.style.display = "flex";
          setTimeout(() => {
            finaleSection.classList.add("active");
            const footer = finaleSection.querySelector(".story-footer");
            if (footer) footer.setAttribute("aria-hidden", "false");
          }, 50);
        }, 1200);
      }
    });
  }
};
