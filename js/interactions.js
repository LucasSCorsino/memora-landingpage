/**
 * @file interactions.js
 * @description Controla todas as interações de UI da página:
 * 1. Simulador interativo de Flashcard FSRS no Hero (#FAFAF7)
 * 2. Dock interativo das Funcionalidades (Estilo Google Antigravity)
 * 3. Reações pré-definidas da Comunidade (👏 🔥 🧠 💡 ❤️ 😂)
 * 4. Accordion do FAQ
 * 5. Modal da Lista de Espera ([A DEFINIR]) & Menu Mobile
 */

export function initInteractions() {
  initMobileNav();
  initScrollSpyNav();
  initCardSpotlight();
  initFsrsHeroSimulator();
  initSuiteDock();
  initCommunityReactions();
  initFaqAccordion();
  initWaitlistModal();
}

/* 1A. ScrollSpy ativo para destacar o ícone da seção atual no cabeçalho */
function initScrollSpyNav() {
  const navLinks = document.querySelectorAll('.site-nav__link[href^="#"]');
  if (!navLinks.length || !('IntersectionObserver' in window)) return;

  const map = new Map();
  navLinks.forEach((link) => {
    const id = link.getAttribute('href');
    if (!id || id === '#') return;
    const sec = document.querySelector(id);
    if (sec) map.set(sec, link);
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          navLinks.forEach((l) => l.classList.remove('is-active'));
          const activeLink = map.get(entry.target);
          if (activeLink) activeLink.classList.add('is-active');
        }
      });
    },
    { rootMargin: '-35% 0px -55% 0px', threshold: 0 }
  );

  map.forEach((_, sec) => observer.observe(sec));
}

/* 1B. Spotlight dinâmico acompanhando o cursor nos cards */
function initCardSpotlight() {
  if (!window.matchMedia('(pointer: fine)').matches) return;

  const cards = document.querySelectorAll(
    '.problem-card, .step-card, .audience-card, .pricing-card, .trust-card, .b2b-banner'
  );

  cards.forEach((card) => {
    card.addEventListener(
      'mousemove',
      (e) => {
        const rect = card.getBoundingClientRect();
        card.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
        card.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
      },
      { passive: true }
    );
  });
}

/* 1. Menu Mobile */
function initMobileNav() {
  const menuBtn = document.getElementById('mobile-menu-btn');
  const nav = document.getElementById('site-nav');
  if (!menuBtn || !nav) return;

  menuBtn.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('is-open');
    menuBtn.setAttribute('aria-expanded', String(isOpen));
  });

  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      nav.classList.remove('is-open');
      menuBtn.setAttribute('aria-expanded', 'false');
    });
  });
}

/* 2. Simulador FSRS Interativo no Hero Mockup (#FAFAF7) */
function initFsrsHeroSimulator() {
  const revealBtn = document.getElementById('fsrs-reveal-btn');
  const answerBox = document.getElementById('fsrs-answer-box');
  const feedbackEl = document.getElementById('fsrs-schedule-feedback');
  const rateBtns = document.querySelectorAll('.fsrs-rate-btn');
  const oneTapBtn = document.getElementById('one-tap-session-btn');
  const neuronCounter = document.getElementById('hero-neuron-count');

  if (revealBtn && answerBox) {
    revealBtn.addEventListener('click', () => {
      const isVisible = answerBox.classList.toggle('is-revealed');
      revealBtn.textContent = isVisible ? 'Ocultar resposta' : 'Ver resposta do card';
    });
  }

  rateBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      rateBtns.forEach((b) => b.classList.remove('is-selected'));
      btn.classList.add('is-selected');
      if (answerBox) answerBox.classList.add('is-revealed');
      if (revealBtn) revealBtn.textContent = 'Ocultar resposta';

      const interval = btn.getAttribute('data-interval') || '4 dias';
      const label = btn.getAttribute('data-difficulty') || 'Bom';

      if (feedbackEl) {
        feedbackEl.innerHTML = `Agendador <strong>FSRS (90% retenção alvo)</strong>: classificado como <strong>${label}</strong> → próxima revisão agendada para <strong>${interval}</strong>.`;
      }
    });
  });

  if (oneTapBtn && neuronCounter) {
    let triggered = false;
    oneTapBtn.addEventListener('click', () => {
      if (!triggered) {
        triggered = true;
        neuronCounter.textContent = '145';
        oneTapBtn.innerHTML = '✓ Sessão iniciada • Meta diária em andamento (+5 Neurônios)';
      } else {
        triggered = false;
        neuronCounter.textContent = '140';
        oneTapBtn.innerHTML = '▶ Iniciar sessão do dia em 1 toque (12 cards hoje)';
      }
    });
  }
}

/* 3. Dock Interativo de Funcionalidades (Inspiração Antigravity Suite Dock) */
function initSuiteDock() {
  const dockButtons = document.querySelectorAll('[data-suite-target]');
  const panels = document.querySelectorAll('[data-suite-panel]');

  if (!dockButtons.length || !panels.length) return;

  dockButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-suite-target');

      dockButtons.forEach((b) => {
        const active = b === btn;
        b.classList.toggle('is-active', active);
        b.setAttribute('aria-selected', String(active));
      });

      panels.forEach((panel) => {
        const isMatch = panel.getAttribute('data-suite-panel') === target;
        panel.classList.toggle('is-active', isMatch);
      });
    });
  });
}

/* 4. Reações Pré-definidas da Comunidade (👏 🔥 🧠 💡 ❤️ 😂) */
function initCommunityReactions() {
  const reactionBtns = document.querySelectorAll('.reaction-pill');
  reactionBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const countSpan = btn.querySelector('.reaction-count');
      if (!countSpan) return;

      const isReacted = btn.classList.toggle('is-reacted');
      const current = parseInt(countSpan.textContent || '0', 10);
      countSpan.textContent = String(isReacted ? current + 1 : Math.max(0, current - 1));
    });
  });
}

/* 5. FAQ Accordion */
function initFaqAccordion() {
  const items = document.querySelectorAll('.faq-item');

  function syncOpenHeights() {
    items.forEach((item) => {
      const content = item.querySelector('.faq-content');
      if (!content) return;
      if (item.classList.contains('is-open')) {
        content.style.maxHeight = `${content.scrollHeight}px`;
      } else {
        content.style.maxHeight = '0px';
      }
    });
  }

  items.forEach((item) => {
    const trigger = item.querySelector('.faq-trigger');
    const content = item.querySelector('.faq-content');
    if (!trigger || !content) return;

    trigger.addEventListener('click', () => {
      const isOpen = item.classList.contains('is-open');

      // Fecha outros itens abertos
      items.forEach((other) => {
        other.classList.remove('is-open');
        const otherBtn = other.querySelector('.faq-trigger');
        const otherContent = other.querySelector('.faq-content');
        if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
        if (otherContent) otherContent.style.maxHeight = '0px';
      });

      if (!isOpen) {
        item.classList.add('is-open');
        trigger.setAttribute('aria-expanded', 'true');
        content.style.maxHeight = `${content.scrollHeight}px`;
      }
    });
  });

  syncOpenHeights();
  window.addEventListener('resize', syncOpenHeights);
}

/* 6. Modal da Lista de Espera ([A DEFINIR: CTA Principal]) */
function initWaitlistModal() {
  const modal = document.getElementById('waitlist-modal');
  const openBtns = document.querySelectorAll('[data-open-waitlist]');
  const closeBtn = document.getElementById('close-waitlist-modal');
  const form = document.getElementById('waitlist-form');
  const feedback = document.getElementById('waitlist-feedback');

  if (!modal) return;

  let lastFocusedEl = null;

  function openModal() {
    lastFocusedEl = document.activeElement;
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    const firstInput = modal.querySelector('input, select, button:not(#close-waitlist-modal)');
    if (firstInput) setTimeout(() => firstInput.focus(), 60);
  }

  function closeModal() {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    if (lastFocusedEl && typeof lastFocusedEl.focus === 'function') {
      lastFocusedEl.focus();
    }
  }

  openBtns.forEach((btn) => btn.addEventListener('click', openModal));
  if (closeBtn) closeBtn.addEventListener('click', closeModal);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('is-open')) {
      closeModal();
    }
  });

  if (form && feedback) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      feedback.style.display = 'block';
      form.reset();
    });
  }
}
