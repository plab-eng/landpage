"""Testes do montar_catalogo.py — só stdlib: python -m unittest scripts/test_montar_catalogo.py"""
import json
import os
import sys
import tempfile
import unittest

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import montar_catalogo as mc  # noqa: E402

CONFIG = {
    "cartoes": {
        "free": {"flags": ["free", "livre"]},
        "tools": {"flags": ["tools", "export"]},
        "mep": {"flags": ["mep", "export"]},
        "documentacao": {"flags": ["documentacao", "export"]},
    },
    "renomear": {"PLAB_Mep_QuedaTensao": "Calcular Queda de Tensão"},
    "ocultar": ["PLAB_Tools_Escondido"],
    "em_breve": {
        "free": ["Numerar Detalhes"],
        "tools": ["Visibilidade Links", "Exportar Worksets"],
        "mep": ["Conectar Tubos"],
        "documentacao": [],
    },
}


def botao(id_, rotulo, flag):
    return {"id": id_, "rotulo": rotulo, "painel": "X", "flag": flag, "flag_painel": flag, "comando": "C"}


CATALOGO = {
    "versao": "1.0.8",
    "gerado_em": "2026-09-14T12:00:00Z",
    "botoes": [
        botao("PLAB_Tools_TransferirEstado", "Transferir Estado", "free"),
        botao("PLAB_Reportar_Problema", "Reportar Problema", "livre"),
        botao("PLAB_Tools_ClashWorks", "Clash Works", "tools"),
        botao("PLAB_Tools_VisibilidadeLinks", "Visibilidade Links", "tools"),
        botao("PLAB_Tools_Escondido", "Escondido", "tools"),
        botao("PLAB_Mep_QuedaTensao", "Calcular Queda Tensão", "mep"),
        botao("PLAB_Tools_GerarVistas", "Gerar Vistas", "documentacao"),
        botao("PLAB_Tools_ExportSchedules", "Export Schedules", "export"),
        botao("PLAB_Assistant_Toggle", "Assistant (API)", "assistant"),
    ],
}

HTML = """<ul class="plano-lista">
                            <!-- catalogo:free -->
                            <li>velho</li>
                            <!-- /catalogo:free -->
</ul>
<ul class="plano-lista">
                            <!-- catalogo:tools -->
                            <!-- /catalogo:tools -->
</ul>
<ul class="plano-lista">
                            <!-- catalogo:mep -->
                            <!-- /catalogo:mep -->
</ul>
<ul class="plano-lista">
                            <!-- catalogo:documentacao -->
                            <!-- /catalogo:documentacao -->
</ul>"""


class Normalizar(unittest.TestCase):
    def test_ignora_acento_caixa_quebra_e_espaco(self):
        self.assertEqual(mc.normalizar("Cota\nAutomática  "), "cota automatica")


class Itens(unittest.TestCase):
    def test_free_junta_free_e_livre_na_ordem_do_release(self):
        itens = mc.itens_do_cartao(CATALOGO, CONFIG, "free")
        self.assertEqual(itens, [("Transferir Estado", False), ("Reportar Problema", False), ("Numerar Detalhes", True)])

    def test_export_aparece_nos_tres_cartoes_pagos(self):
        for cartao in ("tools", "mep", "documentacao"):
            self.assertIn(("Export Schedules", False), mc.itens_do_cartao(CATALOGO, CONFIG, cartao))
        self.assertNotIn(("Export Schedules", False), mc.itens_do_cartao(CATALOGO, CONFIG, "free"))

    def test_em_breve_some_quando_o_botao_sai_no_release(self):
        itens = mc.itens_do_cartao(CATALOGO, CONFIG, "tools")
        self.assertIn(("Visibilidade Links", False), itens)
        self.assertNotIn(("Visibilidade Links", True), itens)
        self.assertIn(("Exportar Worksets", True), itens)

    def test_renomear_e_ocultar(self):
        self.assertIn(("Calcular Queda de Tensão", False), mc.itens_do_cartao(CATALOGO, CONFIG, "mep"))
        self.assertNotIn("Escondido", [t for t, _ in mc.itens_do_cartao(CATALOGO, CONFIG, "tools")])

    def test_assistant_nao_entra_em_cartao_nenhum(self):
        for cartao in CONFIG["cartoes"]:
            self.assertNotIn("Assistant (API)", [t for t, _ in mc.itens_do_cartao(CATALOGO, CONFIG, cartao)])


class Aplicar(unittest.TestCase):
    def test_troca_o_miolo_dos_marcadores_e_mantem_o_recuo(self):
        novo = mc.aplicar(HTML, CATALOGO, CONFIG)
        self.assertNotIn("<li>velho</li>", novo)
        self.assertIn("                            <li>Transferir Estado</li>", novo)
        self.assertIn('<li><span>Numerar Detalhes</span> <span class="plano-tag" data-i18n="em-breve">Em breve</span></li>', novo)
        self.assertIn("<!-- /catalogo:free -->", novo)

    def test_idempotente(self):
        uma = mc.aplicar(HTML, CATALOGO, CONFIG)
        self.assertEqual(mc.aplicar(uma, CATALOGO, CONFIG), uma)

    def test_escapa_html(self):
        cat = dict(CATALOGO, botoes=[botao("A", "Tags <b> & cotas", "free")])
        self.assertIn("<li>Tags &lt;b&gt; &amp; cotas</li>", mc.aplicar(HTML, cat, CONFIG))

    def test_crlf_funciona(self):
        self.assertIn("<li>Transferir Estado</li>\r\n", mc.aplicar(HTML.replace("\n", "\r\n"), CATALOGO, CONFIG))

    def test_marcador_faltando_recusa(self):
        with self.assertRaises(ValueError):
            mc.aplicar(HTML.replace("catalogo:mep", "outra-coisa"), CATALOGO, CONFIG)


class Validar(unittest.TestCase):
    def test_recusa_vazio_flag_invalida_e_campo_faltando(self):
        for ruim in ({}, {"botoes": []}, {"botoes": [botao("A", "B", "vega")]}, {"botoes": [{"id": "A", "flag": "free"}]}):
            with self.assertRaises(ValueError):
                mc.validar_catalogo(ruim)


class Baixar(unittest.TestCase):
    def test_le_de_arquivo_e_falha_em_silencio(self):
        with tempfile.TemporaryDirectory() as pasta:
            caminho = os.path.join(pasta, "catalogo.json")
            with open(caminho, "w", encoding="utf-8") as f:
                json.dump(CATALOGO, f)
            url = "file:///" + caminho.replace("\\", "/").lstrip("/")
            self.assertEqual(mc.baixar_catalogo(url)["versao"], "1.0.8")
            self.assertIsNone(mc.baixar_catalogo(url + ".nao-existe"))


if __name__ == "__main__":
    unittest.main()
