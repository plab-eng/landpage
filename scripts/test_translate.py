"""Testes do translate.py (caminhos e nomes protegidos).
Precisa do beautifulsoup4: python -m unittest scripts/test_translate.py"""
import os
import sys
import unittest

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import translate as tr  # noqa: E402
from bs4 import BeautifulSoup  # noqa: E402


class CaminhosDosArquivos(unittest.TestCase):
    """As páginas de /en/ e /es/ buscam CSS, JS, imagens e vídeos na raiz."""

    def test_css_e_js_da_raiz_ganham_o_prefixo(self):
        # 29/10/2026: plab-tokens.css ficava sem ../ e /en/ e /es/ perdiam o tema.
        for nome in ("style.css", "plab-tokens.css", "script.js", "rede-robos.js"):
            self.assertEqual(tr.fix_path(nome), "../" + nome)

    def test_pastas_de_midia_ganham_o_prefixo(self):
        self.assertEqual(tr.fix_path("images/a.webp"), "../images/a.webp")
        self.assertEqual(tr.fix_path("videos/a.mp4"), "../videos/a.mp4")

    def test_paginas_e_enderecos_externos_ficam_iguais(self):
        for val in ("solucoes.html", "solucoes.html#viewer", "#assistant",
                    "https://plabdev.com.br/x.css", "mailto:a@b.c", "data:image/png;base64,AA"):
            self.assertEqual(tr.fix_path(val), val)

    def test_video_do_popup_ganha_o_prefixo(self):
        sopa = BeautifulSoup('<button data-video="videos/a.mp4">x</button>', "html.parser")
        tr.rewrite_paths(sopa)
        self.assertEqual(sopa.button["data-video"], "../videos/a.mp4")


class NomesProtegidos(unittest.TestCase):
    """Nome de produto não se traduz (o DeepL fazia "Nube de puntos P-LAB")."""

    def test_produtos_estao_na_lista(self):
        for nome in ("P-LAB PointCloud", "PointCloud", "P-LAB Dimensions", "Viewer Pro"):
            self.assertIn(nome, tr.PROTECTED_TERMS)

    def test_frase_com_o_produto_esconde_o_nome_do_deepl(self):
        self.assertIn("<x>P-LAB PointCloud</x>", tr.protect("Baixe o P-LAB PointCloud grátis"))


if __name__ == "__main__":
    unittest.main()
