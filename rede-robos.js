/* Rede de robôs no fundo do topo da página inicial (29/10/2026).
   Robozinhos e engrenagens no lugar das bolinhas, ligados por linhas como uma
   rede de automação; pacotes de dados correm pelas ligações e o robô que recebe
   pisca os olhos. Canvas puro, sem biblioteca. Com "reduzir movimento" no
   sistema, desenha um quadro parado. Para quando a aba fica oculta ou o topo
   sai da tela. */
(function () {
  var hero = document.querySelector('.hero-section');
  if (!hero) return;
  var cv = document.createElement('canvas');
  cv.className = 'rede-robos';
  cv.setAttribute('aria-hidden', 'true');
  hero.insertBefore(cv, hero.firstChild);
  var ctx = cv.getContext('2d');
  var parado = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var W = 0, H = 0, dpr = 1, nos = [], pacotes = [], mouse = null, visivel = true, cor = '#0E7A45', fundo = '#fff';
  var DIST = 150;

  function lerCores() {
    var cs = getComputedStyle(document.documentElement);
    cor = (cs.getPropertyValue('--accent') || '#0E7A45').trim();
    fundo = (cs.getPropertyValue('--bg') || '#fff').trim();
  }

  function rgba(hex, a) {
    var h = hex.replace('#', '');
    if (h.length === 3) h = h.split('').map(function (c) { return c + c; }).join('');
    var n = parseInt(h, 16);
    return 'rgba(' + (n >> 16 & 255) + ',' + (n >> 8 & 255) + ',' + (n & 255) + ',' + a + ')';
  }

  var bloqueio = null;
  function medirBloqueio(r) {
    var t = hero.querySelector('.hero-text');
    if (!t) { bloqueio = null; return; }
    var b = t.getBoundingClientRect();
    bloqueio = { x0: b.left - r.left - 18, y0: b.top - r.top - 18, x1: b.right - r.left + 18, y1: b.bottom - r.top + 18 };
  }
  function dentro(x, y) {
    return bloqueio && x > bloqueio.x0 && x < bloqueio.x1 && y > bloqueio.y0 && y < bloqueio.y1;
  }
  function criar() {
    var r = hero.getBoundingClientRect();
    medirBloqueio(r);
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = r.width; H = r.height;
    cv.width = W * dpr; cv.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    DIST = W < 700 ? 110 : 150;
    var qtd = Math.max(14, Math.min(64, Math.round(W * H / 17000)));
    nos = [];
    for (var i = 0; i < qtd; i++) {
      var x0, y0, tent = 0;
      do { x0 = Math.random() * W; y0 = Math.random() * H; } while (dentro(x0, y0) && ++tent < 40);
      nos.push({
        x: x0, y: y0,
        vx: (Math.random() - .5) * .35, vy: (Math.random() - .5) * .35,
        tipo: Math.random() < .28 ? 'engrenagem' : 'robo',
        giro: Math.random() * 6.28, vg: (Math.random() < .5 ? -1 : 1) * (.006 + Math.random() * .01),
        pisca: Math.random() * 400, brilho: 0, escala: .85 + Math.random() * .4
      });
    }
    pacotes = [];
  }

  function ligacoes() {
    var l = [];
    for (var i = 0; i < nos.length; i++) for (var j = i + 1; j < nos.length; j++) {
      var dx = nos[i].x - nos[j].x, dy = nos[i].y - nos[j].y, d = Math.sqrt(dx * dx + dy * dy);
      if (d < DIST && !dentro((nos[i].x + nos[j].x) / 2, (nos[i].y + nos[j].y) / 2)) l.push([i, j, d]);
    }
    return l;
  }

  function robo(n) {
    var s = n.escala;
    ctx.save();
    ctx.translate(n.x, n.y);
    ctx.scale(s, s);
    ctx.lineWidth = 1.4;
    ctx.strokeStyle = rgba(cor, .85);
    ctx.fillStyle = fundo;
    // antena
    ctx.beginPath(); ctx.moveTo(0, -6); ctx.lineTo(0, -10); ctx.stroke();
    ctx.beginPath(); ctx.arc(0, -11.5, 1.8, 0, 6.283);
    ctx.fillStyle = n.brilho > 0 ? cor : rgba(cor, .85); ctx.fill();
    // cabeça
    ctx.fillStyle = fundo;
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(-8, -6, 16, 12, 3.5); else ctx.rect(-8, -6, 16, 12);
    ctx.fill(); ctx.stroke();
    // orelhas
    ctx.beginPath(); ctx.moveTo(-8, -1.5); ctx.lineTo(-10, -1.5); ctx.moveTo(8, -1.5); ctx.lineTo(10, -1.5); ctx.stroke();
    // olhos: piscam de vez em quando; acendem quando chega um pacote
    var fechado = n.pisca < 8;
    ctx.fillStyle = cor;
    if (fechado) {
      ctx.beginPath(); ctx.moveTo(-5, 0); ctx.lineTo(-2, 0); ctx.moveTo(2, 0); ctx.lineTo(5, 0); ctx.stroke();
    } else {
      var r = n.brilho > 0 ? 2.3 : 1.5;
      ctx.beginPath(); ctx.arc(-3.5, -.5, r, 0, 6.283); ctx.arc(3.5, -.5, r, 0, 6.283); ctx.fill();
    }
    if (n.brilho > 0) {
      ctx.strokeStyle = rgba(cor, n.brilho * .5);
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(0, 0, 14 + (1 - n.brilho) * 8, 0, 6.283); ctx.stroke();
    }
    ctx.restore();
  }

  function engrenagem(n) {
    var s = n.escala * 1.05, dentes = 8, r1 = 7, r2 = 9.5;
    ctx.save();
    ctx.translate(n.x, n.y);
    ctx.rotate(n.giro);
    ctx.scale(s, s);
    ctx.beginPath();
    for (var i = 0; i < dentes * 2; i++) {
      var a = i / (dentes * 2) * 6.283, r = i % 2 ? r1 : r2;
      var a2 = (i + 1) / (dentes * 2) * 6.283;
      ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
      ctx.lineTo(Math.cos(a2) * r, Math.sin(a2) * r);
    }
    ctx.closePath();
    ctx.fillStyle = fundo; ctx.fill();
    ctx.lineWidth = 1.3; ctx.strokeStyle = rgba(cor, .7); ctx.stroke();
    ctx.beginPath(); ctx.arc(0, 0, 2.6, 0, 6.283); ctx.stroke();
    ctx.restore();
  }

  var quadro = 0, liga = [];
  function passo() {
    quadro++;
    for (var i = 0; i < nos.length; i++) {
      var n = nos[i];
      var nx = n.x + n.vx, ny = n.y + n.vy;
      if (dentro(nx, ny) && !dentro(n.x, n.y)) {
        if (dentro(n.x, ny)) n.vy *= -1; else n.vx *= -1;
        nx = n.x + n.vx; ny = n.y + n.vy;
      }
      n.x = nx; n.y = ny;
      if (n.x < 10 || n.x > W - 10) n.vx *= -1;
      if (n.y < 14 || n.y > H - 10) n.vy *= -1;
      n.giro += n.vg;
      n.pisca = (n.pisca + 1) % 420;
      if (n.brilho > 0) n.brilho = Math.max(0, n.brilho - .025);
    }
    liga = ligacoes();
    // um pacote novo a cada ~0,5 s
    if (quadro % 30 === 0 && liga.length) {
      var l = liga[Math.floor(Math.random() * liga.length)];
      var ida = Math.random() < .5;
      pacotes.push({ de: ida ? l[0] : l[1], para: ida ? l[1] : l[0], t: 0 });
    }
    for (var k = pacotes.length - 1; k >= 0; k--) {
      var p = pacotes[k];
      p.t += .018;
      if (p.t >= 1) { nos[p.para].brilho = 1; pacotes.splice(k, 1); }
    }
  }

  function desenhar() {
    ctx.clearRect(0, 0, W, H);
    // ligações
    ctx.lineWidth = 1;
    for (var i = 0; i < liga.length; i++) {
      var a = nos[liga[i][0]], b = nos[liga[i][1]], al = (1 - liga[i][2] / DIST) * .35;
      ctx.strokeStyle = rgba(cor, al);
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
    }
    // o mouse vira mais um nó da rede
    if (mouse) {
      for (var m = 0; m < nos.length; m++) {
        var dx = nos[m].x - mouse.x, dy = nos[m].y - mouse.y, d = Math.sqrt(dx * dx + dy * dy);
        if (d < DIST * 1.2) {
          ctx.strokeStyle = rgba(cor, (1 - d / (DIST * 1.2)) * .55);
          ctx.beginPath(); ctx.moveTo(mouse.x, mouse.y); ctx.lineTo(nos[m].x, nos[m].y); ctx.stroke();
        }
      }
    }
    // pacotes de dados
    for (var k = 0; k < pacotes.length; k++) {
      var p = pacotes[k], de = nos[p.de], pa = nos[p.para];
      var x = de.x + (pa.x - de.x) * p.t, y = de.y + (pa.y - de.y) * p.t;
      ctx.fillStyle = rgba(cor, .25);
      ctx.beginPath(); ctx.arc(x, y, 5, 0, 6.283); ctx.fill();
      ctx.fillStyle = cor;
      ctx.beginPath(); ctx.arc(x, y, 2.2, 0, 6.283); ctx.fill();
    }
    for (var j = 0; j < nos.length; j++) (nos[j].tipo === 'robo' ? robo : engrenagem)(nos[j]);
  }

  function laco() {
    if (visivel && !document.hidden) { passo(); desenhar(); }
    requestAnimationFrame(laco);
  }

  hero.addEventListener('pointermove', function (e) {
    var r = hero.getBoundingClientRect();
    mouse = { x: e.clientX - r.left, y: e.clientY - r.top };
  });
  hero.addEventListener('pointerleave', function () { mouse = null; });

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (en) { visivel = en[0].isIntersecting; }).observe(hero);
  }
  new MutationObserver(lerCores).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  if (window.matchMedia) window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', lerCores);

  var espera;
  window.addEventListener('resize', function () {
    clearTimeout(espera);
    espera = setTimeout(function () { criar(); if (parado) { passo(); desenhar(); } }, 200);
  });

  lerCores();
  criar();
  if (parado) { passo(); desenhar(); } else { laco(); }
})();
