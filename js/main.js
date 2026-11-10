/**
 * @file main.js
 * @description Ponto de entrada principal da Landing Page do Memora.
 * Arquitetura modular ES6 limpa e desacoplada.
 */

import { initThemeToggle } from './theme.js';
import { initSmoothScroll } from './smooth-scroll.js';
import { initSynapseCanvas } from './canvas-particles.js';
import { initAnimations } from './animations.js';
import { initInteractions } from './interactions.js';

document.addEventListener('DOMContentLoaded', () => {
  initThemeToggle();
  initSmoothScroll();
  initSynapseCanvas();
  initInteractions();
  initAnimations();
});
