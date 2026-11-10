/**
 * @file theme.js
 * @description Gerencia o toggle Dark / Light Mode da landing page.
 * Nota de Arquitetura (Seção 3.2 e 3.3):
 * - A landing page tem Dark Mode como base padrão.
 * - Os mockups do aplicativo permanecem travados em #FAFAF7 (tema claro perolado)
 *   para preservar a fidelidade ao produto atual e o contraste intencional.
 */

export function initThemeToggle() {
  const root = document.documentElement;
  const toggleBtn = document.getElementById('theme-toggle-btn');

  // Recupera preferência salva ou mantém Dark Mode como padrão (Seção 3.2)
  const savedTheme = localStorage.getItem('memora_landing_theme');
  if (savedTheme === 'light') {
    root.setAttribute('data-theme', 'light');
  } else {
    root.setAttribute('data-theme', 'dark');
  }

  if (!toggleBtn) return;

  toggleBtn.addEventListener('click', () => {
    const currentTheme = root.getAttribute('data-theme') || 'dark';
    const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';

    root.setAttribute('data-theme', nextTheme);
    localStorage.setItem('memora_landing_theme', nextTheme);
    toggleBtn.setAttribute(
      'aria-label',
      nextTheme === 'dark' ? 'Alternar para tema claro na página' : 'Alternar para tema escuro na página'
    );

    window.dispatchEvent(new CustomEvent('memora:themechange', { detail: { theme: nextTheme } }));
  });
}
