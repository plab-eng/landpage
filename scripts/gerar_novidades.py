#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
P-LAB - Gera o conteudo da pagina novidades.html a partir das notas de release.

USO (na raiz do landpage, no momento do release):
    python scripts/gerar_novidades.py CAMINHO/notas-release-2.0.x.md
    python scripts/gerar_novidades.py CAMINHO/notas.md --saida novidades.html

O argumento com o arquivo de notas e OBRIGATORIO (nao ha caminho padrao: o
arquivo mora no repo do add-in, docs/notas-release-2.0.x.md).

FORMATO DAS NOTAS
-----------------
    ## 2.0.2 (06/10)      <- uma secao por versao, a mais nova primeiro
    - item da lista       <- um item por linha; `codigo` vira <code>

Secoes cujo titulo traz "(em desenvolvimento)" ou "(em teste)" NAO entram na
pagina: so aparece o que ja foi liberado.

O HTML e escrito entre os marcadores
    <!-- novidades:inicio -->  ...  <!-- novidades:fim -->
de novidades.html; o resto da pagina nao e tocado. Apenas biblioteca padrao.
"""

import argparse
import html
import os
import re
import sys

MARCA_INICIO = "<!-- novidades:inicio -->"
MARCA_FIM = "<!-- novidades:fim -->"
OCULTAR = ("(em desenvolvimento)", "(em teste)")

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def inline(texto):
    """Escapa o HTML e converte `codigo` em <code>."""
    saida = html.escape(texto.strip(), quote=False)
    return re.sub(r"`([^`]+)`", r"<code>\1</code>", saida)


def ler_secoes(caminho):
    """Devolve [(titulo, [itens])] na ordem do arquivo."""
    with open(caminho, encoding="utf-8") as f:
        linhas = f.read().splitlines()
    secoes = []
    for linha in linhas:
        if linha.startswith("## "):
            secoes.append((linha[3:].strip(), []))
        elif linha.startswith("- ") and secoes:
            secoes[-1][1].append(linha[2:])
        elif linha.startswith(("  ", "\t")) and secoes and secoes[-1][1] and linha.strip():
            secoes[-1][1][-1] += " " + linha.strip()  # continuacao de item
    return secoes


def separar_titulo(titulo):
    """'2.0.2 (06/10)' -> ('2.0.2', '06/10'); sem parenteses, data vazia."""
    m = re.match(r"^(.*?)\s*\((.*)\)\s*$", titulo)
    return (m.group(1), m.group(2)) if m else (titulo, "")


def montar_html(secoes):
    blocos = []
    for titulo, itens in secoes:
        if any(marca in titulo.lower() for marca in OCULTAR) or not itens:
            continue
        versao, data = separar_titulo(titulo)
        lis = "\n".join("                        <li>%s</li>" % inline(i) for i in itens)
        data_html = ' <span class="release-data">%s</span>' % html.escape(data) if data else ""
        blocos.append(
            '                <article class="release" id="v%s">\n'
            '                    <h2>Versão %s%s</h2>\n'
            '                    <ul>\n%s\n                    </ul>\n'
            '                </article>'
            % (re.sub(r"[^0-9A-Za-z]+", "-", versao), html.escape(versao), data_html, lis)
        )
    if not blocos:
        sys.exit("Nenhuma versao liberada nas notas: nada a escrever.")
    return "\n".join(blocos)


def main():
    ap = argparse.ArgumentParser(description="Gera novidades.html a partir das notas de release.")
    ap.add_argument("notas", help="arquivo markdown de notas (ex.: notas-release-2.0.x.md)")
    ap.add_argument("--saida", default=os.path.join(RAIZ, "novidades.html"),
                    help="pagina a atualizar (padrao: novidades.html na raiz do site)")
    args = ap.parse_args()

    if not os.path.isfile(args.notas):
        sys.exit("Arquivo de notas nao encontrado: %s" % args.notas)
    with open(args.saida, encoding="utf-8") as f:
        pagina = f.read()
    i, j = pagina.find(MARCA_INICIO), pagina.find(MARCA_FIM)
    if i < 0 or j < i:
        sys.exit("Marcadores %s / %s nao encontrados em %s" % (MARCA_INICIO, MARCA_FIM, args.saida))

    miolo = montar_html(ler_secoes(args.notas))
    novo = pagina[: i + len(MARCA_INICIO)] + "\n" + miolo + "\n                " + pagina[j:]
    with open(args.saida, "w", encoding="utf-8", newline="\n") as f:
        f.write(novo)
    print("Escrito %s (%d versoes)" % (args.saida, miolo.count('<article')))


if __name__ == "__main__":
    main()
