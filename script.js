/* =========================================================
   P-LAB — comportamento do site
   i18n: o conteúdo é escrito em PORTUGUÊS (raiz). As versões
   /en/ e /es/ são HTML real, gerado por scripts/translate.py.
   Aqui o seletor de idioma apenas NAVEGA entre as versões,
   detectando o idioma atual pelo caminho (path) da URL.
   ========================================================= */

/* ===== Seletor de idioma (navega entre /, /en/ e /es/) ===== */
// Idioma atual a partir do caminho (.../en/..., .../es/..., senão pt).
function plabCurrentLang() {
    var p = location.pathname;
    if (p.indexOf('/en/') !== -1) return 'en';
    if (p.indexOf('/es/') !== -1) return 'es';
    return 'pt';
}

// Vai para a MESMA página no idioma escolhido, preservando o arquivo atual.
// Funciona tanto em subpasta (GitHub Pages /landpage/) quanto na raiz (Hostinger).
function plabSwitchLang(lang) {
    var path = location.pathname;
    var slash = path.lastIndexOf('/');
    var file = path.substring(slash + 1) || 'index.html';
    var dir = path.substring(0, slash + 1);
    // remove um eventual segmento /en ou /es do fim do diretório -> volta à raiz do site
    var root = dir.replace(/(?:\/(?:en|es))?\/$/, '/');
    location.href = root + (lang === 'pt' ? '' : lang + '/') + file;
}

// Atualiza o rótulo PT/EN/ES e marca o idioma ativo no seletor.
function setLangLabel() {
    var lang = plabCurrentLang();
    var label = document.getElementById('current-lang-label');
    if (label) label.innerText = lang.toUpperCase();
    document.querySelectorAll('.lang-dropdown a[data-lang]').forEach(function (a) {
        a.classList.toggle('active', a.getAttribute('data-lang') === lang);
    });
}

/* ===== LGPD: Consentimento de cookies + Google Analytics 4 ===== */
const GA_ID = 'G-M9WEG41PNK';
const CONSENT_KEY = 'p-lab-cookie-consent';

// Carrega o GA4 dinamicamente — chamado SOMENTE após o aceite do usuário
function loadGA() {
    if (window.__gaLoaded) return;
    window.__gaLoaded = true;
    const s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { dataLayer.push(arguments); };
    gtag('js', new Date());
    gtag('config', GA_ID);
}

function hasConsent() {
    return localStorage.getItem(CONSENT_KEY) === 'accepted';
}

// Dispara evento no GA4 apenas se houver consentimento
function trackEvent(name, params) {
    if (hasConsent() && typeof window.gtag === 'function') {
        gtag('event', name, params || {});
    }
}

// Cria o banner de cookies (somente se o usuário ainda não decidiu)
function buildCookieBanner() {
    if (localStorage.getItem(CONSENT_KEY)) return;
    const banner = document.createElement('div');
    banner.className = 'cookie-banner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-label', 'Aviso de cookies');
    banner.innerHTML =
        '<p class="cookie-text">Usamos cookies para análise de tráfego e para melhorar sua experiência. Você decide se aceita.</p>' +
        '<div class="cookie-actions">' +
        '<button type="button" class="cookie-btn cookie-reject" id="cookie-reject">Recusar</button>' +
        '<button type="button" class="cookie-btn cookie-accept" id="cookie-accept">Aceitar</button>' +
        '</div>';
    document.body.appendChild(banner);
    document.getElementById('cookie-accept').addEventListener('click', () => {
        localStorage.setItem(CONSENT_KEY, 'accepted');
        loadGA();
        banner.remove();
    });
    document.getElementById('cookie-reject').addEventListener('click', () => {
        localStorage.setItem(CONSENT_KEY, 'rejected');
        banner.remove();
    });
}

/* ===== Rastreamento de eventos (só dispara se consentido) ===== */
function initTracking() {
    document.querySelectorAll('a[href*="wa.me"]').forEach(a => {
        a.addEventListener('click', () => trackEvent('whatsapp_click', { local: a.className || 'link' }));
    });
    document.querySelectorAll('a[href^="downloads/"]').forEach(a => {
        a.addEventListener('click', () => {
            const arquivo = a.getAttribute('href').split('/').pop();
            trackEvent('download', { plugin: arquivo });
        });
    });
}

/* ===== Validação do formulário de contato ===== */
function initContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;
    const errorBox = document.getElementById('form-error');
    form.addEventListener('submit', (e) => {
        const nome = form.Nome.value.trim();
        const email = form.Email.value.trim();
        const msg = form.Mensagem.value.trim();
        const honey = form._honey ? form._honey.value : '';
        const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (honey) { e.preventDefault(); return; } // provável bot
        let erro = '';
        if (!nome) erro = 'Por favor, informe seu nome.';
        else if (!emailRe.test(email)) erro = 'Informe um e-mail válido.';
        else if (msg.length < 10) erro = 'Escreva uma mensagem com pelo menos 10 caracteres.';
        if (erro) {
            e.preventDefault();
            if (errorBox) { errorBox.textContent = erro; errorBox.hidden = false; }
            return;
        }
        if (errorBox) errorBox.hidden = true;
        trackEvent('form_submit', { form: 'contato' });
    });
}

/* ===== Toggle de tema claro/escuro ===== */
const THEME_KEY = 'p-lab-theme';
function initThemeToggle() {
    const btn = document.getElementById('theme-toggle');
    if (!btn) return;
    btn.addEventListener('click', () => {
        const atual = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
        const proximo = atual === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', proximo);
        localStorage.setItem(THEME_KEY, proximo);
    });
}

/* ===== Menu mobile (hambúrguer) ===== */
function initMobileMenu() {
    const toggle = document.getElementById('nav-toggle');
    const nav = document.getElementById('primary-nav');
    if (!toggle || !nav) return;

    const closeMenu = () => {
        nav.classList.remove('open');
        toggle.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-label', 'Abrir menu');
    };
    const openMenu = () => {
        nav.classList.add('open');
        toggle.classList.add('open');
        toggle.setAttribute('aria-expanded', 'true');
        toggle.setAttribute('aria-label', 'Fechar menu');
    };

    toggle.addEventListener('click', () => {
        if (nav.classList.contains('open')) closeMenu(); else openMenu();
    });
    // Fecha ao clicar num link de navegação
    nav.querySelectorAll('.nav-links a').forEach(a => a.addEventListener('click', closeMenu));
    // Fecha ao clicar fora do header
    document.addEventListener('click', (e) => {
        if (nav.classList.contains('open') && !e.target.closest('.main-header')) closeMenu();
    });
    // Fecha com a tecla Esc
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(); });
}

/* ===== Carrossel de mídia do P-LAB Viewer =====
   Regras:
   - Navegação MANUAL (setas, teclado ← →, swipe). NUNCA troca de slide sozinho,
     para não interromper a narração dos vídeos.
   - Só o slide ATIVO carrega/toca vídeo: os <video> usam preload="none" e o play()
     só é chamado quando o slide entra em foco (resolve o peso de ter vários vídeos).
   - Ao tornar-se ativo: autoplay MUDO em loop (playsinline). Ao sair: pausa e volta a mudo.
   - Respeita prefers-reduced-motion: não dá autoplay; mostra o poster com botão de play. */
function initViewerCarousel() {
    const carousel = document.getElementById('viewer-carousel');
    if (!carousel) return;

    const slides = Array.from(carousel.querySelectorAll('.carousel-slide'));
    const captions = Array.from(carousel.querySelectorAll('.carousel-caption'));
    const prevBtn = carousel.querySelector('.carousel-prev');
    const nextBtn = carousel.querySelector('.carousel-next');
    const curEl = carousel.querySelector('.cc-current');
    const totalEl = carousel.querySelector('.cc-total');
    const live = carousel.querySelector('#carousel-live');
    // O total de slides é derivado automaticamente do nº de <li class="carousel-slide">.
    // AO ATIVAR VÍDEO 4 e/ou 5 (descomentando os <li> no HTML): NÃO é preciso mexer aqui —
    // 'total' passa de 3 para 4/5 sozinho e o indicador "X / N" se ajusta. No HTML, atualize
    // apenas o "/ 3" estático do contador e os aria-label "Slide X de N" dos slides existentes.
    const total = slides.length;
    if (!total) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let current = 0;
    if (totalEl) totalEl.textContent = total;

    // <video> de um slide (null se for slide de imagem)
    const videoOf = (slide) => slide.querySelector('video');
    const tryPlay = (v) => { const p = v.play(); if (p && p.catch) p.catch(() => { /* autoplay bloqueado */ }); };

    // Sincroniza ícones/estado dos botões com o estado real do vídeo
    function syncControls(slide) {
        const v = videoOf(slide);
        if (!v) return;
        slide.classList.toggle('is-paused', v.paused);
        slide.classList.toggle('is-unmuted', !v.muted);
        const playBtn = slide.querySelector('.cv-play');
        const soundBtn = slide.querySelector('.cv-sound');
        if (playBtn) {
            playBtn.setAttribute('aria-pressed', String(!v.paused));
            playBtn.setAttribute('aria-label', v.paused ? 'Reproduzir vídeo' : 'Pausar vídeo');
        }
        if (soundBtn) {
            soundBtn.setAttribute('aria-pressed', String(!v.muted));
            soundBtn.setAttribute('aria-label', v.muted ? 'Ativar som' : 'Silenciar vídeo');
        }
    }

    // Ativa um slide: se for vídeo, autoplay mudo (salvo reduced-motion -> só poster)
    function activate(slide) {
        const v = videoOf(slide);
        if (!v) return;
        v.muted = true;                       // todo vídeo começa mudo
        if (!reduceMotion) tryPlay(v);        // preload="none": só aqui o vídeo é buscado
        syncControls(slide);
    }

    // Sai de um slide de vídeo: pausa e volta a mudo (nada toca em 2º plano)
    function deactivate(slide) {
        const v = videoOf(slide);
        if (!v) return;
        v.pause();
        v.muted = true;
        syncControls(slide);
    }

    function go(index) {
        const next = (index + total) % total;
        if (next === current) return;
        slides[current].classList.remove('is-active');
        if (captions[current]) captions[current].classList.remove('is-active');
        deactivate(slides[current]);

        slides[next].classList.add('is-active');
        if (captions[next]) captions[next].classList.add('is-active');
        current = next;
        if (curEl) curEl.textContent = next + 1;
        if (live) live.textContent = 'Slide ' + (next + 1) + ' de ' + total;
        activate(slides[next]);
    }

    if (prevBtn) prevBtn.addEventListener('click', () => go(current - 1));
    if (nextBtn) nextBtn.addEventListener('click', () => go(current + 1));

    // Teclado ← → quando o carrossel está focado
    carousel.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') { e.preventDefault(); go(current - 1); }
        else if (e.key === 'ArrowRight') { e.preventDefault(); go(current + 1); }
    });

    // Controles próprios do vídeo (delegação) — som só toca após clique no botão
    carousel.addEventListener('click', (e) => {
        const slide = e.target.closest('.carousel-slide');
        if (!slide) return;
        const v = videoOf(slide);
        if (!v) return;
        if (e.target.closest('.cv-play, .carousel-bigplay')) {
            if (v.paused) tryPlay(v); else v.pause();
            syncControls(slide);
        } else if (e.target.closest('.cv-sound')) {
            v.muted = !v.muted;
            if (!v.muted && v.paused) tryPlay(v);
            syncControls(slide);
        }
    });

    // Mantém os ícones em sincronia se o estado do vídeo mudar por conta própria
    slides.forEach((slide) => {
        const v = videoOf(slide);
        if (!v) return;
        ['play', 'pause', 'volumechange'].forEach((ev) => v.addEventListener(ev, () => syncControls(slide)));
    });

    // Swipe por toque (opcional, mobile)
    const stage = carousel.querySelector('.carousel-stage');
    let touchX = null;
    if (stage) {
        stage.addEventListener('touchstart', (e) => { touchX = e.touches[0].clientX; }, { passive: true });
        stage.addEventListener('touchend', (e) => {
            if (touchX === null) return;
            const dx = e.changedTouches[0].clientX - touchX;
            if (Math.abs(dx) > 40) go(dx < 0 ? current + 1 : current - 1);
            touchX = null;
        }, { passive: true });
    }

    // Estado inicial: ativa o primeiro slide
    activate(slides[0]);
}

document.addEventListener('DOMContentLoaded', () => {
    setLangLabel();               // mostra PT/EN/ES conforme o caminho atual
    if (hasConsent()) loadGA();   // visitante que já aceitou em visita anterior
    buildCookieBanner();
    initTracking();
    initContactForm();
    initThemeToggle();
    initMobileMenu();
    initViewerCarousel();
});
