/**
 * @file canvas-particles.js
 * @description Campo de Gravidade Zero & Partículas Flutuantes (Inspiração Natural Google Antigravity).
 * - Movimento orgânico, calmo e contínuo (deriva antigravitacional com física de mola amortecida)
 * - Sem linhas "sci-fi" artificiais, sem choques bruscos: apenas micropartículas luminosas com profundidade (DOF)
 * - Interação natural de repulsão/fluxo suave ao redor do cursor e leve parallax 3D
 * - Pausa automática fora da tela (IntersectionObserver) e suporte a prefers-reduced-motion
 */

export function initSynapseCanvas() {
  const canvas = document.getElementById('synapse-canvas');
  if (!canvas) return;

  const heroSection = canvas.parentElement || document.getElementById('hero');
  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  let prefersReducedMotion = motionQuery.matches;

  if (typeof window.THREE !== 'undefined') {
    try {
      return initAntigravityField3D(canvas, heroSection, () => prefersReducedMotion, motionQuery);
    } catch (err) {
      console.warn('Fallback para Canvas 2D Antigravity:', err);
    }
  }

  return initAntigravityField2D(canvas, heroSection, () => prefersReducedMotion, motionQuery);
}

/* ==========================================================================
   MOTOR PRINCIPAL: THREE.JS — ANTIGRAVITY ORGANIC FLOATING FIELD
   ========================================================================== */
function initAntigravityField3D(canvas, container, getReducedMotion, motionQuery) {
  const THREE = window.THREE;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    powerPreference: 'high-performance',
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 1, 1000);
  camera.position.z = 340;

  const fieldGroup = new THREE.Group();
  scene.add(fieldGroup);

  let width = 1;
  let height = 1;
  let isVisible = true;
  let animationFrameId = null;

  // Textura circular ultra-suave (bokeh / poeira estelar natural)
  function createSoftDotTexture() {
    const c = document.createElement('canvas');
    c.width = 64;
    c.height = 64;
    const ctx = c.getContext('2d');
    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    grad.addColorStop(0.28, 'rgba(255, 255, 255, 0.82)');
    grad.addColorStop(0.65, 'rgba(255, 255, 255, 0.18)');
    grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(c);
  }

  const dotTexture = createSoftDotTexture();
  const isMobile = window.innerWidth < 768;

  // Duas camadas de profundidade para sensação real de foco (Foreground + Background)
  const COUNT_NEAR = isMobile ? 42 : 85;
  const COUNT_FAR = isMobile ? 65 : 130;

  const pointer = {
    nx: 0,
    ny: 0,
    targetNx: 0,
    targetNy: 0,
    worldX: 9999,
    worldY: 9999,
    active: false,
  };

  function getPalette() {
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    return {
      isLight,
      brand: new THREE.Color(0x00a1e0),
      softBlue: new THREE.Color(isLight ? 0x0284c7 : 0x7dd3fc),
      neutral: new THREE.Color(isLight ? 0x475569 : 0xcbd5e1),
      muted: new THREE.Color(isLight ? 0x94a3b8 : 0x64748b),
    };
  }

  let palette = getPalette();

  function createLayer(count, size, zRange, opacity) {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const items = [];

    const spreadX = Math.max(width * 0.48, 320);
    const spreadY = Math.max(height * 0.42, 220);

    for (let i = 0; i < count; i++) {
      const homeX = (Math.random() - 0.5) * spreadX * 2;
      const homeY = (Math.random() - 0.5) * spreadY * 2;
      const homeZ = (Math.random() - 0.5) * zRange;

      const roll = Math.random();
      const tone = roll < 0.28 ? 'brand' : roll < 0.52 ? 'softBlue' : roll < 0.8 ? 'neutral' : 'muted';

      items.push({
        x: homeX,
        y: homeY,
        z: homeZ,
        homeX,
        homeY,
        homeZ,
        vx: 0,
        vy: 0,
        freqX: 0.18 + Math.random() * 0.25,
        freqY: 0.15 + Math.random() * 0.22,
        ampX: 8 + Math.random() * 16,
        ampY: 10 + Math.random() * 18,
        phaseX: Math.random() * Math.PI * 2,
        phaseY: Math.random() * Math.PI * 2,
        driftSpeed: 0.06 + Math.random() * 0.14,
        tone,
      });

      const col = palette[tone];
      colors[i * 3] = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const mat = new THREE.PointsMaterial({
      size,
      map: dotTexture,
      vertexColors: true,
      transparent: true,
      opacity,
      depthWrite: false,
      blending: palette.isLight ? THREE.NormalBlending : THREE.AdditiveBlending,
    });

    const mesh = new THREE.Points(geo, mat);
    fieldGroup.add(mesh);

    return { count, items, positions, colors, geo, mat };
  }

  let nearLayer = null;
  let farLayer = null;

  function initLayers() {
    if (nearLayer) fieldGroup.remove(nearLayer.mesh);
    if (farLayer) fieldGroup.remove(farLayer.mesh);
    nearLayer = createLayer(COUNT_NEAR, isMobile ? 5.2 : 6.2, 140, palette.isLight ? 0.55 : 0.78);
    farLayer = createLayer(COUNT_FAR, isMobile ? 3.0 : 3.6, 240, palette.isLight ? 0.32 : 0.42);
  }

  function refreshColors() {
    palette = getPalette();
    [nearLayer, farLayer].forEach((layer, idx) => {
      if (!layer) return;
      layer.mat.blending = palette.isLight ? THREE.NormalBlending : THREE.AdditiveBlending;
      layer.mat.opacity = idx === 0 ? (palette.isLight ? 0.55 : 0.78) : palette.isLight ? 0.32 : 0.42;
      for (let i = 0; i < layer.count; i++) {
        const col = palette[layer.items[i].tone];
        layer.colors[i * 3] = col.r;
        layer.colors[i * 3 + 1] = col.g;
        layer.colors[i * 3 + 2] = col.b;
      }
      layer.geo.attributes.color.needsUpdate = true;
    });
  }

  let time = 0;

  function updateLayer(layer, reduced, influenceScale) {
    if (!layer) return;
    const spreadY = Math.max(height * 0.44, 230);

    for (let i = 0; i < layer.count; i++) {
      const p = layer.items[i];

      if (!reduced) {
        // Levitação antigravitacional lenta e contínua para cima
        p.homeY += p.driftSpeed;
        if (p.homeY > spreadY) {
          p.homeY = -spreadY;
          p.y = p.homeY;
        }

        // Oscilação harmônica orgânica (como partículas suspensas no ar)
        const targetX = p.homeX + Math.sin(time * p.freqX + p.phaseX) * p.ampX;
        const targetY = p.homeY + Math.cos(time * p.freqY + p.phaseY) * p.ampY;

        // Força de mola suave em direção à órbita natural
        p.vx += (targetX - p.x) * 0.022;
        p.vy += (targetY - p.y) * 0.022;

        // Deslocamento fluido e natural ao passar o cursor (efeito campo antigravitacional)
        if (pointer.active) {
          const dx = p.x - pointer.worldX;
          const dy = p.y - pointer.worldY;
          const dist = Math.hypot(dx, dy);
          const radius = 135 * influenceScale;

          if (dist < radius && dist > 0.1) {
            const easeForce = Math.pow(1 - dist / radius, 2);
            p.vx += (dx / dist) * easeForce * 0.65 * influenceScale;
            p.vy += (dy / dist) * easeForce * 0.65 * influenceScale;
          }
        }

        // Amortecimento viscoso para zero trepidação
        p.vx *= 0.88;
        p.vy *= 0.88;

        p.x += p.vx;
        p.y += p.vy;
      }

      layer.positions[i * 3] = p.x;
      layer.positions[i * 3 + 1] = p.y;
      layer.positions[i * 3 + 2] = p.z;
    }

    layer.geo.attributes.position.needsUpdate = true;
  }

  function renderFrame(dt = 0.016) {
    time += dt;
    const reduced = getReducedMotion();

    if (!reduced) {
      // Parallax de câmera extremamente sutil e natural
      pointer.nx += (pointer.targetNx - pointer.nx) * 0.035;
      pointer.ny += (pointer.targetNy - pointer.ny) * 0.035;

      fieldGroup.rotation.y = pointer.nx * 0.09;
      fieldGroup.rotation.x = -pointer.ny * 0.07;
    }

    updateLayer(nearLayer, reduced, 1.0);
    updateLayer(farLayer, reduced, 0.55);

    renderer.render(scene, camera);
  }

  function resize() {
    const rect = container.getBoundingClientRect();
    width = Math.max(rect.width, 1);
    height = Math.max(rect.height, 1);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    if (!nearLayer) {
      initLayers();
    }
    renderFrame(0);
  }

  function animate() {
    if (!isVisible || getReducedMotion()) {
      animationFrameId = null;
      return;
    }
    renderFrame(0.016);
    animationFrameId = requestAnimationFrame(animate);
  }

  function startLoop() {
    if (!animationFrameId && isVisible && !getReducedMotion()) {
      animationFrameId = requestAnimationFrame(animate);
    }
  }

  function onPointerMove(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    if (clientY < rect.top - 60 || clientY > rect.bottom + 60) {
      pointer.active = false;
      pointer.targetNx = 0;
      pointer.targetNy = 0;
      return;
    }
    const nx = ((clientX - rect.left) / Math.max(rect.width, 1)) * 2 - 1;
    const ny = ((clientY - rect.top) / Math.max(rect.height, 1)) * 2 - 1;
    pointer.targetNx = Math.max(-1, Math.min(1, nx));
    pointer.targetNy = Math.max(-1, Math.min(1, ny));

    const fovRad = (camera.fov * Math.PI) / 180;
    const viewH = 2 * Math.tan(fovRad / 2) * camera.position.z;
    const viewW = viewH * camera.aspect;

    pointer.worldX = pointer.targetNx * (viewW * 0.5);
    pointer.worldY = -pointer.targetNy * (viewH * 0.5);
    pointer.active = true;
  }

  window.addEventListener('mousemove', (e) => onPointerMove(e.clientX, e.clientY), { passive: true });
  window.addEventListener('mouseleave', () => {
    pointer.active = false;
    pointer.targetNx = 0;
    pointer.targetNy = 0;
  });

  window.addEventListener('resize', resize);
  window.addEventListener('memora:themechange', () => {
    refreshColors();
    renderFrame(0);
  });

  motionQuery.addEventListener?.('change', (e) => {
    if (e.matches) {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
      renderFrame(0);
    } else {
      startLoop();
    }
  });

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      (entries) => {
        isVisible = entries[0]?.isIntersecting ?? true;
        if (isVisible) startLoop();
      },
      { threshold: 0.02 }
    );
    io.observe(container);
  }

  document.addEventListener('visibilitychange', () => {
    isVisible = !document.hidden;
    if (isVisible) startLoop();
  });

  resize();
  startLoop();

  return () => {
    if (animationFrameId) cancelAnimationFrame(animationFrameId);
    renderer.dispose();
  };
}

/* ==========================================================================
   FALLBACK 2D NATURAL (SEM LINHAS ARTIFICIAIS)
   ========================================================================== */
function initAntigravityField2D(canvas, container, getReducedMotion, motionQuery) {
  const ctx = canvas.getContext('2d');
  let width = 0;
  let height = 0;
  let particles = [];
  let animationFrameId = null;
  let time = 0;

  const pointer = { x: -9999, y: -9999, radius: 130 };

  function createParticles() {
    const count = width < 768 ? 48 : 95;
    particles = [];
    for (let i = 0; i < count; i++) {
      const isBrand = i % 3 === 0;
      const hx = Math.random() * width;
      const hy = Math.random() * height;
      particles.push({
        x: hx,
        y: hy,
        homeX: hx,
        homeY: hy,
        vx: 0,
        vy: 0,
        size: isBrand ? Math.random() * 2.0 + 1.2 : Math.random() * 1.5 + 0.7,
        isBrand,
        alpha: isBrand ? 0.55 : 0.25,
        phase: Math.random() * Math.PI * 2,
        drift: 0.12 + Math.random() * 0.2,
      });
    }
  }

  function draw() {
    time += 0.016;
    ctx.clearRect(0, 0, width, height);
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    const neutralRgb = isLight ? '15, 23, 42' : '203, 213, 225';
    const reduced = getReducedMotion();

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      if (!reduced) {
        p.homeY -= p.drift;
        if (p.homeY < -10) {
          p.homeY = height + 10;
          p.y = p.homeY;
        }
        const tx = p.homeX + Math.sin(time * 0.4 + p.phase) * 12;
        const ty = p.homeY + Math.cos(time * 0.35 + p.phase) * 10;

        p.vx += (tx - p.x) * 0.03;
        p.vy += (ty - p.y) * 0.03;

        const dx = p.x - pointer.x;
        const dy = p.y - pointer.y;
        const dist = Math.hypot(dx, dy);
        if (dist < pointer.radius && dist > 0.1) {
          const force = Math.pow(1 - dist / pointer.radius, 2);
          p.vx += (dx / dist) * force * 0.55;
          p.vy += (dy / dist) * force * 0.55;
        }

        p.vx *= 0.88;
        p.vy *= 0.88;
        p.x += p.vx;
        p.y += p.vy;
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = p.isBrand ? `rgba(0, 161, 224, ${p.alpha})` : `rgba(${neutralRgb}, ${p.alpha})`;
      ctx.fill();
    }

    if (!reduced) {
      animationFrameId = requestAnimationFrame(draw);
    }
  }

  function resize() {
    const rect = container.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = rect.width;
    height = rect.height;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    createParticles();
    if (getReducedMotion()) draw();
  }

  window.addEventListener('resize', resize);
  window.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    pointer.x = e.clientX - rect.left;
    pointer.y = e.clientY - rect.top;
  });
  window.addEventListener('mouseleave', () => {
    pointer.x = -9999;
    pointer.y = -9999;
  });
  window.addEventListener('memora:themechange', () => {
    if (getReducedMotion()) draw();
  });
  motionQuery.addEventListener?.('change', () => draw());

  resize();
  draw();

  return () => {
    if (animationFrameId) cancelAnimationFrame(animationFrameId);
  };
}
