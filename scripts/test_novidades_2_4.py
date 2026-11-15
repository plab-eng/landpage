"""Novidades do add-in 2.4.0/2.4.1 em solucoes.html (14/11/2026).
Decisões do José: MCP grátis em qualquer plataforma; chat só no Júnior e no Pleno;
Fábrica de plugins a partir do Júnior; as 4 ferramentas de Navisworks/Civil 3D
seguem em desenvolvimento; "AutoCAD" sai do "Em breve" do Sênior.
Precisa do beautifulsoup4: python -m unittest scripts/test_novidades_2_4.py"""
import os
import unittest

from bs4 import BeautifulSoup

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def pagina():
    with open(os.path.join(RAIZ, "solucoes.html"), encoding="utf-8") as f:
        return BeautifulSoup(f.read(), "html.parser")


def texto(no):
    return " ".join(no.get_text(" ").split())


class AlemDoRevit(unittest.TestCase):
    def setUp(self):
        self.secao = pagina().find(id="outras-plataformas")
        self.cad = self.secao.find(id="plab-cad")

    def test_cad_disponivel_com_as_tres_plataformas(self):
        cartoes = {texto(c.h3): c for c in self.cad.select(".botao-card")}
        self.assertEqual(sorted(cartoes), ["AutoCAD", "Civil 3D", "Navisworks"])

    def test_mcp_gratis_e_chat_so_no_pago(self):
        for c in self.cad.select(".botao-card"):
            self.assertIn("MCP grátis", texto(c), texto(c.h3))
        for nome in ("AutoCAD", "Civil 3D"):
            c = next(x for x in self.cad.select(".botao-card") if texto(x.h3) == nome)
            self.assertIn("Chat: Júnior e Pleno", texto(c))

    def test_navisworks_sem_chat(self):
        # 15/11/2026: o José pediu texto simples e sem "só leitura" no Navisworks.
        c = next(x for x in self.cad.select(".botao-card") if texto(x.h3) == "Navisworks")
        self.assertNotIn("Chat", texto(c))

    def test_as_quatro_ferramentas_seguem_em_desenvolvimento(self):
        dev = self.secao.find(id="em-desenvolvimento-cad")
        nomes = [texto(c.h3) for c in dev.select(".botao-card")]
        self.assertEqual(nomes, ["Clash Works", "Quantificação para o P-LAB OS",
                                 "Verificador de traçado", "Distribuição de terraplenagem"])
        for c in dev.select(".botao-card"):
            self.assertIn("Em desenvolvimento", texto(c))


class Assistant(unittest.TestCase):
    def setUp(self):
        self.sopa = pagina()

    def test_fabrica_de_plugins_a_partir_do_junior(self):
        c = self.sopa.find(id="fabrica-plugins")
        self.assertIn("Júnior e Pleno", texto(c))

    def test_modelos_de_pedido(self):
        self.assertIn("Júnior e Pleno", texto(self.sopa.find(id="modelos-pedido")))

    def test_agente_externo_lista_os_programas_novos(self):
        c = texto(self.sopa.find(id="agente-externo"))
        for prog in ("Claude Code", "Claude Desktop", "Codex", "Cursor", "VS Code", "Antigravity", "Gemini CLI"):
            self.assertIn(prog, c)
        self.assertIn("AutoCAD", c)

    def test_senior_nao_promete_mais_autocad(self):
        senior = self.sopa.select_one("#assistant .plano-card--em-breve")
        self.assertNotIn("AutoCAD", texto(senior))
        for nome in ("Rhino", "Blender", "Archicad", "ZWCAD", "GstarCAD"):
            self.assertIn(nome, texto(senior))


if __name__ == "__main__":
    unittest.main()
