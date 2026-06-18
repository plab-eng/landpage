#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
P-LAB — Gerador de versões traduzidas (EN/ES) a partir do site em português.

O QUE FAZ
---------
- Lê cada .html da RAIZ (português = fonte da verdade).
- Extrai apenas o texto traduzível, preservando intactas as tags HTML,
  atributos, scripts e valores de href/class/id.
- Traduz com a DeepL API (endpoint api-free.deepl.com) para EN-US e ES.
- Escreve os arquivos traduzidos em /en/ e /es/, espelhando a estrutura.
- Reescreve os caminhos de assets para "../" (CSS/JS/imagens vivem na raiz).
- Ajusta <html lang>, canonical e og:url de cada versão (hreflang já vem pronto).

CACHE (economia de cota)
------------------------
- Cache persistente em scripts/.translation-cache.json (VERSIONADO no Git).
- Chave = md5(texto-fonte + idioma). Se o trecho já está no cache, NÃO chama o
  DeepL (zero consumo). Só textos novos/editados são enviados e salvos no cache.

USO
---
    python scripts/translate.py                 # traduz TODAS as páginas
    python scripts/translate.py viewer.html     # traduz só as páginas indicadas (incremental)
    python scripts/translate.py --force         # ignora o cache e re-traduz tudo
    python scripts/translate.py --mock          # NÃO chama o DeepL (teste local sem chave)

A chave da API é lida da variável de ambiente DEEPL_API_KEY (nunca no código).
Equivalentes por env: FORCE_TRANSLATE=1, MOCK_TRANSLATE=1.

>>> DOMÍNIO BASE — TROQUE AQUI SE O SITE MUDAR DE ENDEREÇO <<<
    Ex.: GitHub Pages -> "https://plab-eng.github.io/landpage"
         Hostinger    -> "https://www.seudominio.com.br"
"""

import os
import re
import sys
import json
import html
import hashlib
import urllib.request
import urllib.parse

# ============================ CONFIGURAÇÃO ============================

BASE_URL = "https://plab-eng.github.io/landpage"   # <<< TROQUE AQUI o domínio base

DEEPL_ENDPOINT = "https://api-free.deepl.com/v2/translate"

# Páginas-fonte (na raiz). A home usa caminho '' nas URLs absolutas.
PAGES = {
    "index.html": "",
    "solucoes.html": "solucoes.html",
    "viewer.html": "viewer.html",
    "hub.html": "hub.html",
    "consultoria.html": "consultoria.html",
    "obrigado.html": "obrigado.html",
}

# Idiomas-alvo: pasta de saída -> código DeepL
TARGETS = {"en": "EN-US", "es": "ES"}

# Termos que NÃO devem ser traduzidos. Mantenha curto: SÓ nomes de produto que
# o DeepL traduziria por engano (ex.: "Viewer" -> "Visor"). Siglas e marcas
# (BIM, IFC, PDF, Revit, Navisworks, AutoCAD, Power BI...) o DeepL já preserva
# sozinho — protegê-las só atrapalha (gera artefatos como "cBIM" e ordem errada).
PROTECTED_TERMS = [
    "P-LAB Viewer", "P-LAB Hub", "P-LAB",
    "Export Schedules", "Export Sheets",
    "pyRevit", "Runrun.it", "ClickUp",
]
PROTECTED_SORTED = sorted(PROTECTED_TERMS, key=len, reverse=True)

# Tags cujo texto nunca é traduzido. (NÃO incluir "head" nem "[document]": o
# <title> mora no head e a raiz do parser é ancestral de TODO nó de texto.)
SKIP_PARENTS = {"script", "style", "code"}

CACHE_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".translation-cache.json")
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# ============================ DEPENDÊNCIAS ============================
try:
    from bs4 import BeautifulSoup, Comment, NavigableString
except ImportError:
    sys.exit("Falta a dependência: pip install beautifulsoup4")

# ============================ CACHE ============================

def cache_key(text, lang):
    return hashlib.md5((text + "::" + lang).encode("utf-8")).hexdigest()

def load_cache():
    if os.path.exists(CACHE_PATH):
        try:
            with open(CACHE_PATH, encoding="utf-8") as f:
                return json.load(f)
        except (json.JSONDecodeError, OSError):
            return {}
    return {}

def save_cache(cache):
    with open(CACHE_PATH, "w", encoding="utf-8", newline="\n") as f:
        json.dump(cache, f, ensure_ascii=False, indent=0, sort_keys=True)

# ============================ PROTEÇÃO DE TERMOS ============================

def protect(text):
    """Escapa XML e envolve termos protegidos em <x>...</x> (DeepL ignora <x>)."""
    esc = html.escape(text, quote=False)
    placeholders = {}
    for i, term in enumerate(PROTECTED_SORTED):
        pat = r'(?<![\w])' + re.escape(term) + r'(?![\w])'
        def repl(m, i=i, term=term):
            ph = "%d" % i
            placeholders[ph] = term
            return ph
        esc = re.sub(pat, repl, esc)
    for ph, term in placeholders.items():
        esc = esc.replace(ph, "<x>%s</x>" % html.escape(term, quote=False))
    return esc

def unprotect(text):
    """Remove as tags <x> e desfaz o escape XML.
    Reinsere o espaço quando o DeepL cola a tag protegida numa palavra vizinha
    (ex.: 'P-LABalso' / 'P-LABtambién') — efeito colateral do ignore_tags."""
    text = re.sub(r"(?<=\w)(<x>)", r" \1", text)    # palavra+<x>  -> palavra <x>
    text = re.sub(r"(</x>)(?=\w)", r"\1 ", text)     # </x>+palavra -> </x> palavra
    text = re.sub(r"<x>(.*?)</x>", r"\1", text, flags=re.S)
    return html.unescape(text)

# ============================ DEEPL ============================

def deepl_translate(texts, deepl_lang, api_key):
    """Traduz uma lista de textos (já protegidos) numa única requisição."""
    fields = [("text", t) for t in texts]
    fields += [
        ("source_lang", "PT"),
        ("target_lang", deepl_lang),
        ("tag_handling", "xml"),
        ("ignore_tags", "x"),
    ]
    data = urllib.parse.urlencode(fields).encode("utf-8")
    req = urllib.request.Request(
        DEEPL_ENDPOINT, data=data,
        headers={"Authorization": "DeepL-Auth-Key " + api_key,
                 "Content-Type": "application/x-www-form-urlencoded"},
    )
    with urllib.request.urlopen(req, timeout=60) as resp:
        payload = json.loads(resp.read().decode("utf-8"))
    return [t["text"] for t in payload["translations"]]

# ============================ EXTRAÇÃO ============================

def is_translatable_text(node):
    # Apenas texto comum: exclui Comment, Doctype, CData, Declaration, etc.
    # (todos são subclasses de NavigableString).
    if type(node) is not NavigableString:
        return False
    parent = node.parent
    while parent is not None:
        name = getattr(parent, "name", None)
        if name in SKIP_PARENTS:
            return False
        cls = parent.get("class") if hasattr(parent, "get") else None
        if cls and "tech-badge" in cls:
            return False
        if hasattr(parent, "has_attr") and parent.has_attr("data-no-translate"):
            return False
        parent = parent.parent
    text = str(node)
    if not text.strip():
        return False
    if not re.search(r"[A-Za-zÀ-ÿ]", text):   # sem letras (símbolos, números) -> ignora
        return False
    if text.strip() in PROTECTED_TERMS:        # só um nome de produto -> mantém
        return False
    return True

def collect_units(soup):
    """Retorna lista de (setter_callable, texto_fonte) para tudo que deve ser traduzido."""
    units = []

    # 1) Nós de texto visível
    for node in soup.find_all(string=True):
        if is_translatable_text(node):
            units.append(("text", node, str(node)))

    # 2) Atributos de meta (apenas description / og:title / og:description)
    for meta in soup.find_all("meta"):
        n = (meta.get("name") or "").lower()
        p = (meta.get("property") or "").lower()
        if n == "description" or p in ("og:title", "og:description"):
            val = meta.get("content", "")
            if val.strip():
                units.append(("attr", (meta, "content"), val))

    # 3) Outros atributos visíveis ao usuário
    for el in soup.find_all(True):
        if el.has_attr("data-no-translate"):
            continue
        for attr in ("alt", "placeholder", "aria-label", "title"):
            if el.has_attr(attr):
                val = el.get(attr, "")
                if val.strip() and re.search(r"[A-Za-zÀ-ÿ]", val):
                    units.append(("attr", (el, attr), val))
    return units

# ============================ PATHS / SEO ============================

def fix_path(val):
    """Assets compartilhados na raiz passam a ser referenciados via ../ a partir de /en|/es."""
    if val.startswith(("http://", "https://", "#", "mailto:", "tel:", "javascript:", "data:")):
        return val
    if val in ("style.css", "script.js"):
        return "../" + val
    if val.startswith(("images/", "videos/", "downloads/")):
        return "../" + val
    return val  # links internos .html / âncoras: resolvem dentro da própria pasta de idioma

def rewrite_paths(soup):
    for tag, attr in (("link", "href"), ("script", "src"), ("img", "src"),
                      ("source", "src"), ("video", "poster"), ("a", "href")):
        for el in soup.find_all(tag):
            if el.has_attr(attr):
                el[attr] = fix_path(el[attr])

def rewrite_seo(soup, lang_dir, rel):
    soup.html["lang"] = lang_dir
    lang_url = "%s/%s/%s" % (BASE_URL, lang_dir, rel)
    can = soup.find("link", rel="canonical")
    if can:
        can["href"] = lang_url
    ogu = soup.find("meta", property="og:url")
    if ogu:
        ogu["content"] = lang_url

# ============================ TRADUÇÃO DE UMA PÁGINA ============================

def translate_page(fname, rel, lang_dir, deepl_lang, cache, api_key, mock, force, stats):
    src_path = os.path.join(ROOT, fname)
    with open(src_path, encoding="utf-8") as f:
        soup = BeautifulSoup(f.read(), "html.parser")

    units = collect_units(soup)

    # Resolve cada texto único (cache -> DeepL).
    pending = {}   # texto_fonte -> None (a traduzir)
    resolved = {}  # texto_fonte -> tradução
    for _, _, src in units:
        if src in resolved or src in pending:
            continue
        k = cache_key(src, lang_dir)
        if not force and k in cache:
            resolved[src] = cache[k]
            stats["cached"] += 1
        else:
            pending[src] = None

    pend_list = list(pending.keys())
    if pend_list:
        # Protege termos e traduz em lotes de até 40 textos.
        for i in range(0, len(pend_list), 40):
            chunk = pend_list[i:i + 40]
            protected = [protect(t) for t in chunk]
            if mock:
                out = ["[%s] %s" % (lang_dir.upper(), p) for p in protected]
            else:
                out = deepl_translate(protected, deepl_lang, api_key)
            for src, tr in zip(chunk, out):
                final = unprotect(tr)
                resolved[src] = final
                cache[cache_key(src, lang_dir)] = final
                stats["new"] += 1
                stats["chars"] += len(src)

    # Aplica as traduções no DOM.
    for kind, ref, src in units:
        tr = resolved.get(src, src)
        if kind == "text":
            ref.replace_with(NavigableString(tr))
        else:
            el, attr = ref
            el[attr] = tr

    rewrite_paths(soup)
    rewrite_seo(soup, lang_dir, rel)

    out_dir = os.path.join(ROOT, lang_dir)
    os.makedirs(out_dir, exist_ok=True)
    with open(os.path.join(out_dir, fname), "w", encoding="utf-8", newline="\n") as f:
        f.write(str(soup))

# ============================ MAIN ============================

def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    flags = {a for a in sys.argv[1:] if a.startswith("--")}
    force = "--force" in flags or os.environ.get("FORCE_TRANSLATE") == "1"
    mock = "--mock" in flags or os.environ.get("MOCK_TRANSLATE") == "1"

    api_key = os.environ.get("DEEPL_API_KEY", "")
    if not mock and not api_key:
        sys.exit("ERRO: defina a variável de ambiente DEEPL_API_KEY "
                 "(ou rode com --mock para testar sem chave).")

    # Páginas a processar: as passadas por argumento (incremental) ou todas.
    selected = [a for a in args if a in PAGES] or list(PAGES.keys())

    cache = load_cache()
    stats = {"cached": 0, "new": 0, "chars": 0}

    for fname in selected:
        rel = PAGES[fname]
        for lang_dir, deepl_lang in TARGETS.items():
            translate_page(fname, rel, lang_dir, deepl_lang, cache, api_key, mock, force, stats)

    save_cache(cache)

    print("\n== Relatório de tradução ==")
    print("Modo:                         %s" % ("MOCK (sem DeepL)" if mock else "DeepL"))
    print("Páginas processadas:          %d (x %d idiomas)" % (len(selected), len(TARGETS)))
    print("Trechos vindos do CACHE:      %d" % stats["cached"])
    print("Trechos traduzidos (novos):   %d" % stats["new"])
    print("Caracteres enviados ao DeepL: %d" % stats["chars"])
    print("Cache: %s (%d entradas)" % (os.path.relpath(CACHE_PATH, ROOT), len(cache)))


if __name__ == "__main__":
    main()
