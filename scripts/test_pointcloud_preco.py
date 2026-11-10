"""Preço e venda do P-LAB PointCloud em solucoes.html (10/11/2026).
Precisa do beautifulsoup4: python -m unittest scripts/test_pointcloud_preco.py"""
import os
import unittest

from bs4 import BeautifulSoup

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LINK_INDIVIDUAL = "https://www.asaas.com/000/c/yjv3i52fd7ii29vt"
LINK_EMPRESA = "https://www.asaas.com/000/c/jsaui45e3bqekdlw"


def secao_pointcloud():
    with open(os.path.join(RAIZ, "solucoes.html"), encoding="utf-8") as f:
        sopa = BeautifulSoup(f.read(), "html.parser")
    return sopa.find(id="pointcloud")


class PrecoDoPointCloud(unittest.TestCase):
    def setUp(self):
        self.secao = secao_pointcloud()

    def test_os_dois_links_do_asaas_estao_na_secao(self):
        hrefs = [a["href"] for a in self.secao.select('a[href*="asaas.com"]')]
        self.assertEqual(sorted(hrefs), sorted([LINK_INDIVIDUAL, LINK_EMPRESA]))

    def test_comprar_abre_em_nova_aba_e_conta_no_ga4(self):
        # Memória ga4-whatsapp-target-blank: sem _blank o evento se perde.
        for a in self.secao.select('a[href*="asaas.com"]'):
            self.assertEqual(a.get("target"), "_blank", a["href"])
            self.assertIn("noopener", a.get("rel", []), a["href"])
            self.assertTrue(a.get("data-pagamento-plano"), a["href"])

    def test_preco_de_reserva_no_html(self):
        # O banco (vitrine_de_planos) troca estes números; sem banco, ficam.
        individual = self.secao.select_one('[data-preco-parcela="pointcloud"]')
        empresa = self.secao.select_one('[data-preco-equipe="pointcloud"]')
        self.assertEqual(individual.get_text(strip=True), "R$ 149,90")
        self.assertEqual(empresa.get_text(strip=True), "R$ 329,90")

    def test_acima_do_limite_vai_para_o_whatsapp(self):
        self.assertTrue(self.secao.select('a[href^="https://wa.me/"][target="_blank"]'))

    def test_download_mantem_o_marcador(self):
        baixar = self.secao.select('a[href$="PLAB-PointCloud-Setup.exe"]')
        self.assertTrue(baixar)
        for a in baixar:
            self.assertEqual(a.get("data-download-plugin"), "pointcloud")


if __name__ == "__main__":
    unittest.main()
