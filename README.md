# Memora — Landing Page de Apresentação

Landing page institucional do **Memora**, construída com foco em **Clean Architecture**, modularidade de pastas (`html`, `css`, `js`, `imgs`), motion design (GSAP + ScrollTrigger + Lenis) e inspiração estética no **Google Antigravity**, mantendo fidelidade absoluta à identidade visual e às regras de negócio do Memora.

---

## 1. Arquitetura de Pastas e Arquivos

```text
memora-landing/
├── index.html                  # Documento principal semântico, SEO, Open Graph e 14 seções
├── css/
│   ├── variables.css           # Design tokens: #00A1E0, #FAFAF7, neutros Dark/Light, tipografia
│   ├── base.css                # Reset moderno, Lenis styles, utilitários e badges [A DEFINIR]
│   ├── components.css          # Header glassmorphism, botões pill, mockups #FAFAF7, dock e modal
│   ├── sections.css            # Layout das seções 5.1 a 5.14 e rodapé monumental
│   └── responsive.css          # Media queries e refinamentos mobile-first
├── js/
│   ├── main.js                 # Ponto de entrada ES6 que inicializa todos os módulos
│   ├── theme.js                # Toggle Dark/Light mode na landing (mantendo mockups em #FAFAF7)
│   ├── smooth-scroll.js        # Configuração do Lenis sincronizado ao GSAP ScrollTrigger
│   ├── canvas-particles.js     # Vórtice/constelação sináptica interativa no Hero (#00A1E0)
│   ├── animations.js           # Coreografias de entrada, scroll reveal e botões magnéticos
│   └── interactions.js         # Simulador FSRS, Dock interativo, reações da comunidade, FAQ e Modal
└── imgs/
    ├── logo-memora-placeholder.svg
    ├── noa-avatar-placeholder.svg
    ├── neuronio-coin.svg
    └── og-preview-placeholder.svg
```

---

## 2. Como Executar Localmente

Por utilizar **ES Modules (`type="module"`)** para manter o JavaScript desacoplado em múltiplos arquivos, abra o projeto através de um servidor HTTP local (ex.: extensão *Live Server* no VS Code / Antigravity IDE, `npx serve .` ou `python -m http.server 8080`).

---

## 3. Mapa de Placeholders `[A DEFINIR]` (Checklist da Seção 8)

Todos os itens ainda não decididos foram sinalizados visualmente com `.tbd-badge` / `.tbd-box`, sem inventar dados:

- **CTA principal e destino**: Configurado como modal interativo de Lista de Espera (`#waitlist-modal` em `index.html` e `js/interactions.js`).
- **Preços, nomes e limites dos planos**: Sinalizados na seção `#planos` (`index.html`).
- **Dados reais da pesquisa (73 respostas) e dados de mercado**: Estruturados na seção `#dados` (`index.html`).
- **Logotipo, fontes e paleta completa**: Variáveis centralizadas em `css/variables.css` e `imgs/logo-memora-placeholder.svg`.
- **Mockups e imagens do app**: Construídos como componentes interativos em tema claro `#FAFAF7` (`css/components.css` e `index.html`).
- **Parceiros de cupons**: Slots sinalizados na seção `#parceiros` (`index.html`).
- **Textos legais (Privacidade e Termos)**: Sinalizados no rodapé (`index.html`).
