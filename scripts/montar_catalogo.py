"""
Monta as listas dos cartões de módulo de planos.html a partir do catalogo.json
do último release do add-in (docs/superpowers/plans/2026-09-14-catalogo-automatico.md).

Roda no workflow ANTES do translate.py: o que é gerado aqui é o que o DeepL
traduz para /en e /es. Nunca derruba o deploy — sem catálogo utilizável,
planos.html fica exatamente como está.

Uso local:  CATALOGO_URL=file:///C:/caminho/catalogo.json PLANOS_HTML=copia.html python scripts/montar_catalogo.py
"""
import html
import json
import os
import re
import sys
import unicodedata
import urllib.request

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
URL_PADRAO = "https://github.com/plab-eng/P-LAB-releases/releases/latest/download/catalogo.json"
FLAGS_VALIDAS = {"free", "tools", "mep", "documentacao", "export", "assistant", "livre"}

MARCADOR = re.compile(
    r"(?P<abre>(?P<recuo>[ \t]*)<!-- catalogo:(?P<cartao>[a-z]+) -->(?P<nl>\r?\n))"
    r"(?P<miolo>.*?)"
    r"(?P<fecha>[ \t]*<!-- /catalogo:(?P=cartao) -->)",
    re.S,
)


def normalizar(texto):
    """Compara textos de botão sem se importar com acento, caixa, quebra e espaço."""
    t = unicodedata.normalize("NFKD", texto or "")
    t = "".join(c for c in t if not unicodedata.combining(c))
    return re.sub(r"\s+", " ", t).strip().lower()


def validar_catalogo(dados):
    if not isinstance(dados, dict) or not isinstance(dados.get("botoes"), list) or not dados["botoes"]:
        raise ValueError("catálogo sem botões")
    for b in dados["botoes"]:
        for campo in ("id", "rotulo", "flag"):
            if not isinstance(b.get(campo), str) or not b[campo].strip():
                raise ValueError("botão sem %s: %r" % (campo, b))
        if b["flag"] not in FLAGS_VALIDAS:
            raise ValueError("flag inválida %r em %s" % (b["flag"], b["id"]))
    return dados


def baixar_catalogo(url, timeout=20):
    try:
        with urllib.request.urlopen(url, timeout=timeout) as resposta:
            return validar_catalogo(json.loads(resposta.read().decode("utf-8")))
    except Exception as erro:  # rede, 404 sem anexo, JSON ruim: tudo vira "não mexe"
        print("catalogo: sem catálogo utilizável (%s) — planos.html fica como está" % erro)
        return None


def itens_do_cartao(catalogo, config, cartao):
    """[(texto, em_breve)] na ordem da ribbon, e depois os Em breve que ainda não saíram."""
    flags = set(config["cartoes"][cartao]["flags"])
    renomear = config.get("renomear", {})
    ocultar = set(config.get("ocultar", []))

    visiveis = [b for b in catalogo["botoes"] if b["id"] not in ocultar]
    lancados = set()
    for b in visiveis:
        lancados.add(normalizar(b["rotulo"]))
        lancados.add(normalizar(renomear.get(b["id"], b["rotulo"])))

    itens, vistos = [], set()
    for b in visiveis:
        if b["flag"] not in flags:
            continue
        texto = renomear.get(b["id"], b["rotulo"])
        chave = normalizar(texto)
        if chave in vistos:
            continue
        vistos.add(chave)
        itens.append((texto, False))

    for texto in config.get("em_breve", {}).get(cartao, []):
        chave = normalizar(texto)
        if chave in lancados or chave in vistos:
            continue
        vistos.add(chave)
        itens.append((texto, True))
    return itens


def render_lista(itens, recuo, nl):
    linhas = []
    for texto, em_breve in itens:
        t = html.escape(texto, quote=False)
        if em_breve:
            linhas.append('%s<li><span>%s</span> <span class="plano-tag" data-i18n="em-breve">Em breve</span></li>' % (recuo, t))
        else:
            linhas.append("%s<li>%s</li>" % (recuo, t))
    return "".join(linha + nl for linha in linhas)


def aplicar(html_texto, catalogo, config):
    encontrados = set()

    def trocar(m):
        cartao = m.group("cartao")
        if cartao not in config["cartoes"]:
            raise ValueError("marcador de cartão desconhecido: %s" % cartao)
        encontrados.add(cartao)
        lista = render_lista(itens_do_cartao(catalogo, config, cartao), m.group("recuo"), m.group("nl"))
        return m.group("abre") + lista + m.group("fecha")

    novo = MARCADOR.sub(trocar, html_texto)
    faltando = set(config["cartoes"]) - encontrados
    if faltando:
        raise ValueError("planos.html sem marcador para: %s" % ", ".join(sorted(faltando)))
    return novo


def main():
    url = os.environ.get("CATALOGO_URL", URL_PADRAO)
    caminho_html = os.environ.get("PLANOS_HTML", os.path.join(RAIZ, "planos.html"))
    with open(os.path.join(RAIZ, "scripts", "catalogo_site.json"), encoding="utf-8") as f:
        config = json.load(f)

    catalogo = baixar_catalogo(url)
    if catalogo is None:
        return 0

    with open(caminho_html, encoding="utf-8", newline="") as f:
        atual = f.read()
    try:
        novo = aplicar(atual, catalogo, config)
    except ValueError as erro:
        print("catalogo: não aplicado (%s) — planos.html fica como está" % erro)
        return 0

    if novo == atual:
        print("catalogo: nada mudou (versão %s)" % catalogo.get("versao"))
    else:
        with open(caminho_html, "w", encoding="utf-8", newline="") as f:
            f.write(novo)
        print("catalogo: planos.html atualizado com a versão %s" % catalogo.get("versao"))
    return 0


if __name__ == "__main__":
    sys.exit(main())
