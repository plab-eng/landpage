# Tradução automática do site P-LAB (PT → EN/ES)

Você escreve o conteúdo **só em português** (arquivos na raiz). As versões em
**inglês** (`/en/`) e **espanhol** (`/es/`) são geradas automaticamente como
**HTML real** (indexável pelo Google) usando a **DeepL API**, com um **cache**
que evita gastar a cota traduzindo o que já foi traduzido.

---

## Como funciona (visão geral)

```
Você edita (PT)        →   git push   →   GitHub Actions roda translate.py   →   publica
index.html, viewer.html...                 gera /en e /es via DeepL              site nos 3 idiomas
(raiz = fonte)                             (só o texto novo gasta cota)
```

- **Fonte:** os `.html` da raiz, em português.
- **Geradas:** `/en/` e `/es/` — **não** ficam no Git, são recriadas a cada deploy.
- **Cache:** `scripts/.translation-cache.json` — **fica** no Git. É ele que
  preserva as traduções e economiza a cota. Editou um parágrafo? Só aquele
  parágrafo é re-enviado ao DeepL; o resto vem do cache (zero caracteres).

---

## Passo 1 — Criar a chave da DeepL API

1. Acesse **https://www.deepl.com/pro-api** e crie uma conta **DeepL API**.
   - Serve tanto o plano **Free** quanto o **Developer** (crédito único de
     **1 milhão de caracteres**). O endpoint usado é o `api-free.deepl.com`.
2. No painel da conta, vá em **Account → API keys** e copie sua
   **Authentication Key for DeepL API** (algo como `xxxxxxxx-xxxx-...:fx`).
3. **Não** cole essa chave em nenhum arquivo do site. Ela vai só no secret (passo 2).

> A cada execução, o script imprime quantos caracteres foram enviados ao DeepL,
> para você acompanhar o consumo (veja o passo 5).

---

## Passo 2 — Guardar a chave no repositório (secret)

1. No GitHub, abra o repositório **plab-eng/landpage**.
2. Vá em **Settings → Secrets and variables → Actions → New repository secret**.
3. Preencha:
   - **Name:** `DEEPL_API_KEY`
   - **Secret:** cole a sua chave da DeepL
4. Clique em **Add secret**.

---

## Passo 3 — Apontar o GitHub Pages para o GitHub Actions

O site agora é publicado **pelo workflow** (não mais direto da branch), porque
as pastas `/en` e `/es` são geradas na hora.

1. **Settings → Pages**.
2. Em **Build and deployment → Source**, selecione **GitHub Actions**.
3. Salve. (Não precisa escolher branch nesse modo.)

---

## Passo 4 — Disparar a primeira tradução

Qualquer push na branch `main` dispara o workflow **“Traduzir e publicar (i18n)”**.

```bash
git add .
git commit -m "Ativa i18n automático"
git push
```

Acompanhe em **Actions** (aba do repositório). O workflow vai:
1. Instalar o Python e gerar `/en` e `/es` com o `translate.py`.
2. **Commitar de volta** o `scripts/.translation-cache.json` atualizado
   (com a mensagem `... [skip ci]`, que evita um novo disparo em loop).
3. Publicar o site (raiz + `/en` + `/es`) no GitHub Pages.

Ao terminar, os endereços ficam assim:
- Português: `https://plab-eng.github.io/landpage/`
- Inglês: `https://plab-eng.github.io/landpage/en/`
- Espanhol: `https://plab-eng.github.io/landpage/es/`

O seletor de idioma (🌐 no topo) alterna entre as três versões mantendo a página atual.

---

## Passo 5 — Ler o relatório de consumo

No log do passo **“Traduzir...”** (em Actions) aparece:

```
== Relatório de tradução ==
Modo:                         DeepL
Páginas processadas:          6 (x 2 idiomas)
Trechos vindos do CACHE:      178
Trechos traduzidos (novos):   360
Caracteres enviados ao DeepL: 17222
Cache: scripts/.translation-cache.json (360 entradas)
```

- **Caracteres enviados ao DeepL** = o que descontou da sua cota nesta execução.
- Na **primeira** vez ele traduz o site inteiro. Depois, editando só um trecho,
  esse número cai para “o tamanho do trecho” — o resto vem do cache.

---

## Editar o conteúdo no dia a dia

1. Edite **apenas os arquivos em português** (raiz).
2. `git push`.
3. O workflow re-traduz só o que mudou e republica os 3 idiomas.

> Os nomes de produto (**P-LAB Viewer**, **P-LAB Hub**, **Export Schedules**,
> **Export Sheets**), as `tech-badge` (Python, C#, Revit API, IFC...) e siglas
> (BIM, PDF, DXF...) **não** são traduzidos — ficam iguais nos três idiomas.

---

## Rodar localmente (opcional)

Pré-requisito: `pip install beautifulsoup4`

- **Teste sem chave (mock)** — gera `/en` e `/es` com um prefixo `[EN]`/`[ES]`
  só para conferir estrutura, sem chamar o DeepL:
  ```bash
  python scripts/translate.py --mock
  ```
- **Tradução real local** — exporte a chave e rode:
  ```bash
  # Windows PowerShell:  $env:DEEPL_API_KEY="sua-chave"
  # Linux/Mac:           export DEEPL_API_KEY="sua-chave"
  python scripts/translate.py
  ```
- **Re-traduzir tudo do zero** (ignora o cache):
  ```bash
  python scripts/translate.py --force
  ```
- **Traduzir só uma página:**
  ```bash
  python scripts/translate.py viewer.html
  ```

---

## Trocar o domínio base (se o site mudar de endereço)

O endereço base aparece em **dois lugares** — atualize os dois:

1. **`scripts/translate.py`** → constante `BASE_URL` no topo (comentário
   `>>> DOMÍNIO BASE — TROQUE AQUI <<<`). Afeta canonical, og:url e hreflang.
2. **As tags `hreflang`** já gravadas no `<head>` de cada página PT e o
   **`sitemap.xml`** (gerados com o domínio antigo). O jeito mais simples de
   regerar tudo é rodar o `translate.py` (que reescreve canonical/og:url) e
   atualizar o `BASE` do bloco que gera o `sitemap.xml`.

Exemplos de `BASE_URL`:
- GitHub Pages: `https://plab-eng.github.io/landpage`
- Domínio próprio na Hostinger: `https://www.seudominio.com.br`

---

## Migrar a publicação para a Hostinger (FTP)

Toda a publicação está **isolada num único bloco** do workflow
`.github/workflows/translate-deploy.yml`. Para migrar:

1. Na Hostinger, pegue os dados de **FTP** (host, usuário, senha) no hPanel.
2. No GitHub, crie os secrets `FTP_HOST`, `FTP_USER`, `FTP_PASSWORD`
   (Settings → Secrets and variables → Actions).
3. No arquivo do workflow:
   - **Comente** os 3 passos do deploy do GitHub Pages
     (*Configurar GitHub Pages*, *Upload do artefato*, *Deploy no GitHub Pages*).
   - **Descomente** o passo **“Deploy via FTP (Hostinger)”** (já vem pronto no
     final do arquivo). Ele envia o conteúdo de `_site/` (raiz + `/en` + `/es`)
     para `public_html/`.
4. Atualize o `BASE_URL` (seção acima) para o seu domínio.

O resto do workflow (tradução + cache) continua igual.

---

## Resumo dos arquivos

| Arquivo | Papel | Versionado? |
|---|---|---|
| `index.html`, `viewer.html`, ... (raiz) | Conteúdo-fonte em PT | Sim |
| `scripts/translate.py` | Gera /en e /es via DeepL | Sim |
| `scripts/.translation-cache.json` | Cache de traduções (economia de cota) | **Sim** |
| `/en/`, `/es/` | Traduções geradas | **Não** (recriadas no deploy) |
| `.github/workflows/translate-deploy.yml` | Traduz + publica | Sim |
| `sitemap.xml` | URLs dos 3 idiomas (hreflang) | Sim |
