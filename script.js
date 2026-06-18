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

document.addEventListener('DOMContentLoaded', () => {
    setLangLabel();               // mostra PT/EN/ES conforme o caminho atual
    if (hasConsent()) loadGA();   // visitante que já aceitou em visita anterior
    buildCookieBanner();
    initTracking();
    initContactForm();
    initThemeToggle();
    initMobileMenu();
});
