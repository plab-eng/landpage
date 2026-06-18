/* =========================================================
   P-LAB — comportamento do site
   i18n: PT é a fonte da verdade. EN/ES traduzem o essencial
   (menu, hero, cards de consultoria, plugins). Conteúdo novo
   das páginas de produto fica em PT por enquanto (fallback).
   Observação: updateLang usa innerText — por isso só cadastramos
   chaves de TEXTO PURO. CTAs com ícone e textos com <a>/<strong>
   internos não recebem chave (mantêm o PT do HTML, sem quebrar).
   ========================================================= */
const translations = {
    'pt': {
        // Navegação
        'nav-home': 'Início',
        'nav-plugins': 'Plugins',
        'nav-viewer': 'P-LAB Viewer',
        'nav-hub': 'P-LAB Hub',
        'nav-consultoria': 'Consultoria',
        'nav-contact': 'Contato',

        // Home — hero e eixos
        'hero-eyebrow': 'PLUGINS · PLATAFORMAS · GESTÃO',
        'hero-title': 'Software e automação para engenharia',
        'hero-desc': 'Da automação no Revit à revisão BIM no navegador e à gestão do escritório: três produtos da P-LAB para eliminar o trabalho manual e devolver tempo à engenharia.',
        'hero-btn': 'Conheça as soluções',
        'axes-title': 'Três frentes, um objetivo: eliminar trabalho manual',
        'axis1-t': 'Plugins Revit & Navisworks',
        'axis1-d': 'Automações em Python e C# que eliminam tarefas repetitivas. Export Schedules e Export Sheets já disponíveis — gratuitos.',
        'axis2-t': 'P-LAB Viewer',
        'axis2-d': 'Plataforma web para visualizar, comparar e revisar projetos BIM (IFC, PDF, DXF) no navegador. Escritórios de projetos já utilizam.',
        'axis3-t': 'P-LAB Hub',
        'axis3-d': 'O sistema operacional do escritório de projetos: qualidade, custos, comercial e indicadores no lugar de planilhas soltas.',
        'custom-eyebrow': 'DESENVOLVIMENTO SOB MEDIDA',
        'custom-title': 'O seu fluxo, virando software',
        'custom-desc': 'A P-LAB também desenvolve sob demanda: plugins customizados para Revit e Navisworks, sistemas de gestão e ferramentas de análise adaptadas ao processo de cada escritório. Export Schedules, Export Sheets, o Hub e o Viewer nasceram exatamente assim — de necessidades reais de quem projeta.',
        'custom-btn': 'Descreva seu fluxo',
        'cons-band-eyebrow': 'CONSULTORIA BIM',
        'cons-band-title': 'Antes do software, o método',
        'cons-band-desc': 'A P-LAB também atua em consultoria BIM: gestão e cultura, coordenação multidisciplinar e auditoria de qualidade para estruturar o BIM do seu escritório.',

        // Consultoria — cards
        'title-gestao': 'Gestão e Cultura BIM',
        'g-card1-t': 'Implementação e Diretrizes',
        'g-card1-d': 'Criação de documentação estratégica (PEB/BEP e BIM Mandate) e desenvolvimento de Templates BIM no Revit.',
        'g-card2-t': 'Cultura e Capacitação',
        'g-card2-d': 'Garantia da cultura BIM na companhia através de suporte técnico contínuo e treinamento em fluxos Revit e AutoCAD.',
        'g-card3-t': 'Gestão de Stakeholders',
        'g-card3-d': 'Rotinas periódicas de alinhamento e relatórios de progresso para stakeholders.',
        'title-coord': 'Coordenação e Engenharia Digital',
        'c-card1-t': 'Coordenação Multidisciplinar',
        'c-card1-d': 'Integração de modelos multidisciplinares em ambiente federado usando Navisworks.',
        'c-card2-t': 'Gerenciamento de CDE',
        'c-card2-d': 'Gestão do ambiente comum de dados (Autodesk Construction Cloud), controlando acessos e fluxos.',
        'c-card3-t': 'Planejamento e Custos (4D/5D)',
        'c-card3-d': 'Integração do modelo com cronogramas e orçamentos para análise de construtividade.',
        'title-inov': 'Inovação e Auditoria de Qualidade',
        'i-card1-t': 'Auditoria e Clash Detection',
        'i-card1-d': 'Processos rigorosos de compatibilização no Navisworks para garantir modelos limpos.',
        'i-card2-t': 'Integração de Sistemas',
        'i-card2-d': 'Conexão entre o modelo digital e sistemas corporativos (ERP/EPPM) para automação de processos.',
        'i-card3-t': 'Dashboards e BI',
        'i-card3-d': 'Visualização de indicadores de performance através de Dashboards no Power BI integrados aos dados do modelo.',

        // Plugins (solucoes.html)
        'sol-title': 'Plugins Gratuitos para Revit',
        'py-title': 'A Plataforma pyRevit',
        'py-desc': 'Nossas soluções utilizam o pyRevit, uma plataforma leve que funciona como uma engine para rodar scripts de forma eficiente dentro do Revit.',
        'p1-title': 'Export Schedules',
        'p1-desc-long': 'Automatize a extração de dados do seu modelo Revit. Este plugin exporta tabelas Revit diretamente para Excel (.xlsx) via COM, sem a necessidade de abrir o modelo manualmente, economizando tempo precioso na elaboração de orçamentos e listas de materiais.',
        'p2-title': 'Export Sheets',
        'p2-desc-long': 'Gestão eficiente de entregas. Exportação profissional de pranchas para PDF, DWG e DWF em massa. Inclui organização automática em subpastas e vinculação de imagens em DWG, garantindo um As-Built limpo e focado em operação.',
        'btn-download': 'Download Instalador',
        'btn-manual': 'Download Manual',

        // Contato e rodapé
        'contact-title': 'Fale com a P-LAB',
        'contact-btn': 'Solicitar Orçamento',
        'footer-tagline': 'Software e automação para engenharia.',
        'footer-products': 'Produtos',
        'footer-social': 'Siga-nos',
        'footer-contact': 'Contato',
        'lang-suggested': 'LOCALIZAÇÃO SUGERIDA',
        'lang-available': 'SÍTIOS DISPONÍVEIS',
        'label': 'PT'
    },
    'en': {
        // TODO: traduzir o conteúdo novo das páginas de produto (Viewer/Hub) e dos eixos.
        // O que não estiver aqui cai no fallback em português (texto do HTML).
        'nav-home': 'Home',
        'nav-plugins': 'Plugins',
        'nav-viewer': 'P-LAB Viewer',
        'nav-hub': 'P-LAB Hub',
        'nav-consultoria': 'Consulting',
        'nav-contact': 'Contact',
        'hero-eyebrow': 'PLUGINS · PLATFORMS · MANAGEMENT',
        'hero-title': 'Software and automation for engineering',
        'hero-desc': 'From Revit automation to BIM review in the browser and office management: three P-LAB products to eliminate manual work and give time back to engineering.',
        'hero-btn': 'Explore the solutions',
        'title-gestao': 'BIM Management & Culture',
        'g-card1-t': 'Implementation & Guidelines',
        'g-card1-d': 'Strategic documentation (BEP/BIM Mandate) and professional Revit Template development.',
        'g-card2-t': 'Culture & Training',
        'g-card2-d': 'Ensuring BIM culture through technical support and Revit/AutoCAD workflow training.',
        'g-card3-t': 'Stakeholder Management',
        'g-card3-d': 'Periodic alignment routines and progress reports for stakeholders.',
        'title-coord': 'Coordination & Digital Engineering',
        'c-card1-t': 'Multidisciplinary Coordination',
        'c-card1-d': 'Integration of multidisciplinary models in a federated environment using Navisworks.',
        'c-card2-t': 'CDE Management',
        'c-card2-d': 'Common Data Environment management (Autodesk Construction Cloud), controlling access and workflows.',
        'c-card3-t': 'Planning & Costs (4D/5D)',
        'c-card3-d': 'Model integration with schedules and budgets for constructability analysis.',
        'title-inov': 'Innovation & Quality Audit',
        'i-card1-t': 'Audit & Clash Detection',
        'i-card1-d': 'Rigorous coordination processes in Navisworks to ensure clean models.',
        'i-card2-t': 'Systems Integration',
        'i-card2-d': 'Connecting the digital model with corporate systems (ERP/EPPM) for process automation.',
        'i-card3-t': 'Dashboards & BI',
        'i-card3-d': 'Performance indicators visualization through Power BI Dashboards integrated with model data.',
        'sol-title': 'Free Plugins for Revit',
        'py-title': 'The pyRevit Platform',
        'py-desc': 'Our solutions use pyRevit, a lightweight platform that acts as an engine to run scripts efficiently within Revit.',
        'p1-title': 'Export Schedules',
        'p1-desc-long': 'Automate data extraction from your Revit model. This plugin exports Revit schedules directly to Excel (.xlsx) via COM without manual model opening.',
        'p2-title': 'Export Sheets',
        'p2-desc-long': 'Efficient delivery management. Professional bulk sheet export (PDF, DWG, DWF). Includes automatic subfolders and DWG image binding.',
        'btn-download': 'Download Installer',
        'btn-manual': 'Download Manual',
        'contact-title': 'Contact P-LAB',
        'contact-btn': 'Request a Quote',
        'footer-tagline': 'Software and automation for engineering.',
        'footer-products': 'Products',
        'footer-social': 'Follow us',
        'footer-contact': 'Contact',
        'lang-suggested': 'SUGGESTED LOCATION',
        'lang-available': 'AVAILABLE SITES',
        'label': 'EN'
    },
    'es': {
        // TODO: traducir el contenido nuevo de las páginas de producto (Viewer/Hub) y de los ejes.
        // Lo que no esté aquí usa el respaldo en portugués (texto del HTML).
        'nav-home': 'Inicio',
        'nav-plugins': 'Plugins',
        'nav-viewer': 'P-LAB Viewer',
        'nav-hub': 'P-LAB Hub',
        'nav-consultoria': 'Consultoría',
        'nav-contact': 'Contacto',
        'hero-eyebrow': 'PLUGINS · PLATAFORMAS · GESTIÓN',
        'hero-title': 'Software y automatización para ingeniería',
        'hero-desc': 'De la automatización en Revit a la revisión BIM en el navegador y la gestión de la oficina: tres productos de P-LAB para eliminar el trabajo manual y devolver tiempo a la ingeniería.',
        'hero-btn': 'Conozca las soluciones',
        'title-gestao': 'Gestión y Cultura BIM',
        'g-card1-t': 'Implementación y Directrices',
        'g-card1-d': 'Creación de documentación estratégica (BEP/BIM Mandate) y plantillas Revit profesionales.',
        'g-card2-t': 'Cultura y Capacitación',
        'g-card2-d': 'Garantizar la cultura BIM mediante soporte técnico y capacitación en Revit y AutoCAD.',
        'g-card3-t': 'Gestión de Stakeholders',
        'g-card3-d': 'Rutinas periódicas de alineación e informes de progreso para interesados.',
        'title-coord': 'Coordinación e Ingeniería Digital',
        'c-card1-t': 'Coordinación Multidisciplinaria',
        'c-card1-d': 'Integración de modelos en un entorno federado utilizando Navisworks.',
        'c-card2-t': 'Gestión de CDE',
        'c-card2-d': 'Gestión del entorno común de datos (Autodesk Construction Cloud), controlando accesos.',
        'c-card3-t': 'Planificación y Costos (4D/5D)',
        'c-card3-d': 'Integración del modelo con cronogramas y presupuestos para análisis de constructibilidad.',
        'title-inov': 'Innovación y Auditoría de Calidad',
        'i-card1-t': 'Auditoría y Clash Detection',
        'i-card1-d': 'Procesos de coordinación en Navisworks para garantizar modelos limpios.',
        'i-card2-t': 'Integración de Sistemas',
        'i-card2-d': 'Conexión del modelo digital con sistemas corporativos (ERP/EPPM) para automatización.',
        'i-card3-t': 'Dashboards y BI',
        'i-card3-d': 'Visualización de indicadores de desempeño a través de Dashboards en Power BI.',
        'sol-title': 'Plugins Gratuitos para Revit',
        'py-title': 'La Plataforma pyRevit',
        'py-desc': 'Nuestras soluciones utilizan pyRevit, una plataforma ligera que funciona como un motor para ejecutar scripts en Revit.',
        'p1-title': 'Export Schedules',
        'p1-desc-long': 'Automatice la extracción de datos de su modelo Revit. Exporta tablas de Revit a Excel (.xlsx) mediante COM sin apertura manual.',
        'p2-title': 'Export Sheets',
        'p2-desc-long': 'Gestión eficiente de entregas. Exportación profesional de planos (PDF, DWG, DWF). Incluye organización de carpetas.',
        'btn-download': 'Descargar Instalador',
        'btn-manual': 'Descargar Manual',
        'contact-title': 'Hable con P-LAB',
        'contact-btn': 'Solicitar Presupuesto',
        'footer-tagline': 'Software y automatización para ingeniería.',
        'footer-products': 'Productos',
        'footer-social': 'Síguenos',
        'footer-contact': 'Contacto',
        'lang-suggested': 'UBICACIÓN SUGERIDA',
        'lang-available': 'SITIOS DISPONIBLES',
        'label': 'ES'
    }
};

function updateLang(lang) {
    if (!translations[lang]) lang = 'pt';
    const label = document.getElementById('current-lang-label');
    if (label) label.innerText = translations[lang].label;

    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        // Só substitui se houver tradução cadastrada; senão mantém o texto do HTML (fallback PT).
        if (translations[lang][key]) {
            el.innerText = translations[lang][key];
        }
    });
    localStorage.setItem('p-lab-lang-pref', lang);
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
    const saved = localStorage.getItem('p-lab-lang-pref') || 'pt';
    updateLang(saved);
    if (hasConsent()) loadGA();   // visitante que já aceitou em visita anterior
    buildCookieBanner();
    initTracking();
    initContactForm();
    initThemeToggle();
    initMobileMenu();
});
