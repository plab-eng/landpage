# Catálogo automático — o site mostra o que o release do add-in entrega

> **Para quem executa (agente):** use `superpowers:subagent-driven-development` (recomendado) ou `superpowers:executing-plans`, tarefa por tarefa. Os passos usam checkbox (`- [ ]`). **Leia "Decisões" e "Travas" antes da Tarefa 1.**

**Objetivo:** quando o José publica um release do add-in, a página de planos passa a listar sozinha os botões que esse release entrega. O que ainda não saiu continua como "Em breve", numa lista curta que ele mantém.

**Arquitetura:**
1. O `build/pack.ps1` (repo P-LAB) roda um console novo, `PLAB.Catalogo`. Ele carrega o `ModuleRegistry` do próprio add-in e grava `catalogo.json`, com botão, painel e flag de licença, lidos do código que monta a ribbon.
2. O `catalogo.json` sobe como anexo do release em `plab-eng/P-LAB-releases`, que é público.
3. O `pack.ps1` dispara o deploy do `landpage`.
4. No workflow do site, `scripts/montar_catalogo.py` baixa o anexo do último release e reescreve as listas dos cartões de módulo em `planos.html`. Isso acontece **antes** da tradução DeepL.
5. O HTML gerado é commitado de volta no repositório, junto do cache de tradução.

**Tecnologia:** C# net48 (console), PowerShell (`pack.ps1`), Python 3.12 com stdlib e BeautifulSoup já instalado no workflow, GitHub Actions.

## Restrições globais

- **Repo P-LAB:** `C:\Users\usuario\projetos\P-LAB`, branch `suite`. **O José trabalha nele em paralelo.** Antes de cada tarefa lá, rode `git status --short`. Se algum arquivo que a tarefa toca aparecer modificado, **pare e chame o José**.
- **Repo landpage:** `C:\Users\usuario\projetos\landpage`, branch `main`. **Push na `main` publica o site e gasta cota do DeepL.** Commit local e pergunte antes de subir. O workflow também commita de volta (cache de tradução e, depois desta tarefa, o `planos.html`). Por isso, **sempre `git pull --rebase` antes de editar e antes de dar push.**
- Não mexer no preço: ele já vem do banco pela RPC `vitrine_de_planos`, pelo script no fim de `planos.html`.
- Não mexer no cartão Assistant: ele é fixo ("Premium · em teste").
- Commits em português, explicando o porquê, com a linha `Co-Authored-By` que o harness indicar.

## Decisões (não reabrir)

1. **Lançado é o que está no último release publicado**, não o que está na branch. A `suite` recebe trabalho em andamento todo dia, e o release é o que o cliente baixa (o botão "Baixar agora" já aponta para `P-LAB-releases/releases/latest`).
2. **O catálogo sai do código que monta a ribbon**, por reflexão sobre `ModuleRegistry.All`. Não existe lista digitada à mão do que foi lançado. A flag de cada botão é o `RequiredModule` do comando, que é o que a licença de fato cobra. Comando fora de `PluginCommand` (ex.: Reportar Problema) recebe a flag `livre`.
3. **Módulo oculto não se anuncia.** Painel ou botão com flag que `TierFlags.IsKnown` não reconhece (hoje só `vega`, os botões MRV) fica fora do catálogo.
4. **O gerador roda na máquina do José, dentro do `pack.ps1`.** Ele precisa do Revit 2024 instalado para carregar os tipos do add-in, e o `pack.ps1` já só roda lá (Inno Setup).
5. **Os cartões são montados no build do site, antes da tradução.** Montar no navegador deixaria `/en` e `/es` em português (o `translate.py` só traduz o HTML que existe no build).
6. **Onde cada flag aparece no site:**

| Flag do botão | Cartão |
|---|---|
| `free`, `livre` | P-LAB Free |
| `tools` | Tools |
| `mep` | MEP |
| `documentacao` | Documentação |
| `export` | Tools, MEP **e** Documentação (painel Export, de todo módulo pago) |
| `assistant` | nenhum (o cartão Assistant é fixo) |

7. **"Em breve" é curadoria do José**, em `scripts/catalogo_site.json`. Um item "Em breve" some sozinho quando um botão com o mesmo texto aparece no release. A comparação ignora maiúsculas, acentos, quebras de linha e espaços repetidos.
8. **O rótulo vem da ribbon.** Quando o texto da ribbon não serve para o site (ex.: "Calcular\nQueda Tensão"), o nome do site vai em `renomear`, pelo `id` do botão.
9. **Falha nunca derruba o site.** Se o release não tiver `catalogo.json`, se o download falhar ou se o JSON vier inválido, o script avisa no log e deixa `planos.html` como está.
10. **Gatilhos do deploy do site:** push (como hoje); `repository_dispatch` do tipo `release-addin`, que o José dispara depois do release; uma rodada diária às 06:17 de Brasília como reserva; e botão manual.
11. **Fora de escopo:** `solucoes.html` (os badges por botão continuam à mão) e a publicação do release em si (continua sendo o `gh release create` que o José roda).

## Travas (parar e chamar o José)

- **Trava 1, arquivos do José:** antes de tocar `src/PLAB.Revit/PLAB.Revit.csproj` ou `build/pack.ps1`, confira `git status --short`. Arquivo modificado por ele: pare.
- **Trava 2, release:** não rode `gh release create` nem `gh release upload`. Publicar release é com o José.
- **Trava 3, site:** não dê push no `landpage` sem o José dizer "pode publicar" nesta sessão.
- **Trava 4, dispatch:** não dispare `repository_dispatch` sem o José pedir. Ele publica o site.

## Mapa de arquivos

**P-LAB**

| Arquivo | O que muda | Tarefa |
|---|---|---|
| `tools/PLAB.Catalogo/PLAB.Catalogo.csproj` | novo console net48 | 1 |
| `tools/PLAB.Catalogo/Program.cs` | carrega o add-in e grava o JSON | 1 |
| `tools/PLAB.Catalogo/ItemCatalogo.cs` | formato do JSON | 1 |
| `src/PLAB.Revit/PLAB.Revit.csproj` | `InternalsVisibleTo` para o console | 1 |
| `build/pack.ps1` | gera `catalogo.json` e mostra os comandos de release e de dispatch | 2 |

**landpage**

| Arquivo | O que muda | Tarefa |
|---|---|---|
| `scripts/catalogo_site.json` | curadoria: cartões, renomear, ocultar, em breve | 3 |
| `scripts/montar_catalogo.py` | baixa o catálogo e reescreve as listas | 3 |
| `scripts/test_montar_catalogo.py` | testes (unittest, stdlib) | 3 |
| `planos.html` | marcadores `<!-- catalogo:... -->` nas quatro listas | 4 |
| `.github/workflows/translate-deploy.yml` | gatilhos novos, passo do catálogo, commit do HTML | 5 |
| `SETUP-TRADUCAO.md` | como o catálogo funciona e o que o José edita | 5 |

## Formato do `catalogo.json` (contrato entre os dois repos)

```json
{
  "versao": "1.0.8",
  "gerado_em": "2026-09-14T12:00:00Z",
  "botoes": [
    {
      "id": "PLAB_Tools_ClashWorks",
      "rotulo": "Clash Works",
      "painel": "Tools",
      "flag": "tools",
      "flag_painel": "tools",
      "comando": "PLAB.Revit.Modules.Tools.ClashWorksCommand"
    }
  ]
}
```

- `rotulo`: o `Label` do `ButtonSpec` com `\n` trocado por espaço.
- `flag`: o `RequiredModule` do comando, ou `livre`.
- `flag_painel`: o `ModuleId` do botão, ou o do módulo quando o botão não tem um próprio. É só diagnóstico: o site usa `flag`.
- A ordem de `botoes` é a ordem da ribbon.
- Flags válidas em `flag`: `free`, `tools`, `mep`, `documentacao`, `export`, `assistant`, `livre`. Qualquer outra faz o gerador falhar.

---

## FASE 1 — add-in (repo P-LAB, branch `suite`)

### Tarefa 1: o console `PLAB.Catalogo` gera o catálogo a partir da ribbon

**Arquivos:**
- Criar: `tools/PLAB.Catalogo/PLAB.Catalogo.csproj`, `tools/PLAB.Catalogo/Program.cs`, `tools/PLAB.Catalogo/ItemCatalogo.cs`
- Modificar: `src/PLAB.Revit/PLAB.Revit.csproj` (acrescentar um `ItemGroup`)

**Interfaces:**
- Consome: `PLAB.Revit.Core.Modules.ModuleRegistry.All` (internal), `IPlabModule` (`ModuleId`, `PanelTitle`, `Buttons`), `ButtonSpec` (`Name`, `Label`, `ClassName`, `ModuleId`, `Children`, `StackItems`), `PLAB.Revit.Core.Licensing.PluginCommand` (propriedade protegida `RequiredModule`) e `PLAB.Core.Licensing.TierFlags.IsKnown`.
- Produz: o executável `tools/PLAB.Catalogo/bin/Release/net48/PLAB.Catalogo.exe`, chamado como `PLAB.Catalogo.exe <saida.json> [<pasta do Revit>]`. Sai com `0` quando gravou e `1` quando o catálogo está vazio ou traz flag inválida. O JSON segue o contrato acima.

- [ ] **Passo 1: Trava 1**

`git status --short`. Se `src/PLAB.Revit/PLAB.Revit.csproj` estiver modificado, pare.

- [ ] **Passo 2: deixar o console enxergar o `ModuleRegistry`**

Em `src/PLAB.Revit/PLAB.Revit.csproj`, antes do `</Project>`:

```xml
  <!-- O gerador do catalogo do site (tools/PLAB.Catalogo) le o ModuleRegistry,
       que e internal. So ele enxerga: nada muda para o add-in. -->
  <ItemGroup>
    <InternalsVisibleTo Include="PLAB.Catalogo" />
  </ItemGroup>
```

- [ ] **Passo 3: o projeto**

`tools/PLAB.Catalogo/PLAB.Catalogo.csproj`:

```xml
<Project Sdk="Microsoft.NET.Sdk">

  <!-- Gera o catalogo.json do site a partir da ribbon do add-in (ver
       landpage/docs/superpowers/plans/2026-09-14-catalogo-automatico.md).
       net48 + x64 porque carrega o PLAB.Revit de Revit 2024. Roda na maquina
       do Jose, dentro do build/pack.ps1. -->
  <PropertyGroup>
    <OutputType>Exe</OutputType>
    <TargetFramework>net48</TargetFramework>
    <LangVersion>latest</LangVersion>
    <Platforms>x64</Platforms>
    <PlatformTarget>x64</PlatformTarget>
    <AssemblyName>PLAB.Catalogo</AssemblyName>
    <RootNamespace>PLAB.Catalogo</RootNamespace>
  </PropertyGroup>

  <ItemGroup>
    <ProjectReference Include="..\..\src\PLAB.Revit\PLAB.Revit.csproj" />
  </ItemGroup>

  <ItemGroup>
    <Reference Include="System.Runtime.Serialization" />
  </ItemGroup>

</Project>
```

O `PLAB.Revit` referencia `RevitAPI`, `RevitAPIUI` e `Newtonsoft.Json` com `Private=false`, então essas DLLs **não** são copiadas para o `bin` do console. Em runtime, o `Program.cs` procura cada uma na pasta do Revit.

- [ ] **Passo 4: o formato**

`tools/PLAB.Catalogo/ItemCatalogo.cs`:

```csharp
using System.Collections.Generic;
using System.Runtime.Serialization;

namespace PLAB.Catalogo
{
    /// <summary>Um botao da ribbon, como o site precisa saber dele.</summary>
    [DataContract]
    internal sealed class ItemCatalogo
    {
        [DataMember(Name = "id", Order = 1)] public string Id;
        [DataMember(Name = "rotulo", Order = 2)] public string Rotulo;
        [DataMember(Name = "painel", Order = 3)] public string Painel;
        [DataMember(Name = "flag", Order = 4)] public string Flag;
        [DataMember(Name = "flag_painel", Order = 5)] public string FlagPainel;
        [DataMember(Name = "comando", Order = 6)] public string Comando;
    }

    /// <summary>O arquivo inteiro. Contrato com landpage/scripts/montar_catalogo.py.</summary>
    [DataContract]
    internal sealed class Catalogo
    {
        [DataMember(Name = "versao", Order = 1)] public string Versao;
        [DataMember(Name = "gerado_em", Order = 2)] public string GeradoEm;
        [DataMember(Name = "botoes", Order = 3)] public List<ItemCatalogo> Botoes = new List<ItemCatalogo>();
    }
}
```

- [ ] **Passo 5: o gerador**

`tools/PLAB.Catalogo/Program.cs`:

```csharp
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Runtime.CompilerServices;
using System.Runtime.Serialization;
using System.Runtime.Serialization.Json;

namespace PLAB.Catalogo
{
    /// <summary>
    /// Le a ribbon do add-in (ModuleRegistry.All) e grava o catalogo.json que o
    /// site usa para listar o que o release entrega. O que decide a flag de cada
    /// botao e o RequiredModule do COMANDO — e o que a licenca cobra de fato.
    /// </summary>
    internal static class Program
    {
        private static readonly HashSet<string> FlagsValidas = new HashSet<string>(StringComparer.Ordinal)
        {
            "free", "tools", "mep", "documentacao", "export", "assistant", "livre",
        };

        private static int Main(string[] args)
        {
            if (args.Length < 1)
            {
                Console.Error.WriteLine("uso: PLAB.Catalogo.exe <saida.json> [<pasta do Revit>]");
                return 1;
            }

            string saida = Path.GetFullPath(args[0]);
            string pastaRevit = args.Length > 1 ? args[1] : @"C:\Program Files\Autodesk\Revit 2024";

            // RevitAPI/RevitAPIUI/Newtonsoft nao sao copiados (Private=false no
            // PLAB.Revit): vem da pasta do Revit instalado. Registrar ANTES de
            // tocar em qualquer tipo do add-in — por isso Gerar e outro metodo.
            AppDomain.CurrentDomain.AssemblyResolve += (s, e) =>
            {
                string arquivo = Path.Combine(pastaRevit, new AssemblyName(e.Name).Name + ".dll");
                return File.Exists(arquivo) ? Assembly.LoadFrom(arquivo) : null;
            };

            try
            {
                return Gerar(saida);
            }
            catch (Exception ex)
            {
                Console.Error.WriteLine("catalogo: falhou — " + ex);
                return 1;
            }
        }

        [MethodImpl(MethodImplOptions.NoInlining)]
        private static int Gerar(string saida)
        {
            Assembly addin = typeof(PLAB.Revit.Core.Modules.ModuleRegistry).Assembly;
            var catalogo = new Catalogo
            {
                Versao = Versao(addin),
                GeradoEm = DateTime.UtcNow.ToString("yyyy-MM-ddTHH:mm:ssZ"),
            };

            foreach (PLAB.Revit.Core.Modules.IPlabModule modulo in PLAB.Revit.Core.Modules.ModuleRegistry.All)
            {
                // Modulo oculto (hoje: Vega) nao se anuncia.
                if (!PLAB.Core.Licensing.TierFlags.IsKnown(modulo.ModuleId)) continue;

                foreach (PLAB.Revit.Core.Modules.ButtonSpec spec in Achatar(modulo.Buttons))
                {
                    string flag = FlagDoComando(addin, spec.ClassName);
                    if (flag != "livre" && !PLAB.Core.Licensing.TierFlags.IsKnown(flag)) continue;

                    string flagPainel = string.IsNullOrEmpty(spec.ModuleId) ? modulo.ModuleId : spec.ModuleId;
                    if (flag != "livre" && !string.Equals(flag, flagPainel, StringComparison.Ordinal))
                    {
                        // Nao e erro: o painel pode mostrar o botao para uma licenca
                        // que o comando recusa. Fica no log para o Jose decidir.
                        Console.Error.WriteLine("aviso: " + spec.Name + " cobra '" + flag + "' mas o painel mostra com '" + flagPainel + "'");
                    }

                    catalogo.Botoes.Add(new ItemCatalogo
                    {
                        Id = spec.Name,
                        Rotulo = (spec.Label ?? spec.Name).Replace("\r", "").Replace("\n", " ").Trim(),
                        Painel = modulo.PanelTitle,
                        Flag = flag,
                        FlagPainel = flagPainel,
                        Comando = spec.ClassName,
                    });
                }
            }

            if (catalogo.Botoes.Count == 0)
            {
                Console.Error.WriteLine("catalogo: nenhum botao encontrado — nao grava arquivo vazio");
                return 1;
            }

            var invalidas = catalogo.Botoes.Where(b => !FlagsValidas.Contains(b.Flag)).ToList();
            if (invalidas.Count > 0)
            {
                foreach (var b in invalidas)
                    Console.Error.WriteLine("catalogo: flag invalida '" + b.Flag + "' em " + b.Id);
                return 1;
            }

            Directory.CreateDirectory(Path.GetDirectoryName(saida));
            using (var arquivo = File.Create(saida))
            {
                new DataContractJsonSerializer(typeof(Catalogo)).WriteObject(arquivo, catalogo);
            }

            Console.WriteLine("catalogo: " + catalogo.Botoes.Count + " botoes da versao " + catalogo.Versao + " -> " + saida);
            return 0;
        }

        /// <summary>Pulldown e pilha viram os botoes de dentro, na mesma ordem.</summary>
        private static IEnumerable<PLAB.Revit.Core.Modules.ButtonSpec> Achatar(
            IEnumerable<PLAB.Revit.Core.Modules.ButtonSpec> specs)
        {
            foreach (var spec in specs)
            {
                if (spec.Children != null)
                {
                    foreach (var filho in Achatar(spec.Children)) yield return filho;
                }
                else if (spec.StackItems != null)
                {
                    foreach (var item in Achatar(spec.StackItems)) yield return item;
                }
                else if (!string.IsNullOrEmpty(spec.ClassName))
                {
                    yield return spec;
                }
            }
        }

        /// <summary>
        /// RequiredModule do comando, sem executar construtor nem tocar no Revit:
        /// instancia "crua" (GetUninitializedObject) e le a propriedade protegida.
        /// Comando fora de PluginCommand nao tem gate: "livre".
        /// </summary>
        private static string FlagDoComando(Assembly addin, string nomeDaClasse)
        {
            Type tipo = addin.GetType(nomeDaClasse, throwOnError: true);
            if (!typeof(PLAB.Revit.Core.Licensing.PluginCommand).IsAssignableFrom(tipo)) return "livre";

            object instancia = FormatterServices.GetUninitializedObject(tipo);
            PropertyInfo propriedade = tipo.GetProperty("RequiredModule",
                BindingFlags.Instance | BindingFlags.Public | BindingFlags.NonPublic);
            return (string)propriedade.GetValue(instancia);
        }

        private static string Versao(Assembly addin)
        {
            var info = addin.GetCustomAttribute<AssemblyInformationalVersionAttribute>();
            string v = info != null ? info.InformationalVersion : addin.GetName().Version.ToString();
            int mais = v.IndexOf('+'); // o SDK anexa "+<commit>"
            return mais >= 0 ? v.Substring(0, mais) : v;
        }
    }
}
```

Se `ButtonSpec` tiver outro tipo de item além de `Children`, `StackItems` e botão com `ClassName` (confira o arquivo antes), inclua o caso em `Achatar` em vez de deixá-lo sumir.

- [ ] **Passo 6: compilar e rodar contra o código de hoje**

```bash
dotnet build tools/PLAB.Catalogo/PLAB.Catalogo.csproj -c Release 2>&1 | grep -E "error CS[0-9]|Build succeeded|Compila"
tools/PLAB.Catalogo/bin/Release/net48/PLAB.Catalogo.exe build/artifacts/catalogo.json
```

Esperado:
- `catalogo: N botoes da versao 1.0.x -> ...`, com saída 0.
- O arquivo contém `PLAB_Tools_ClashWorks` (flag `tools`), `PLAB_Mep_QuedaTensao` (flag `mep`), `PLAB_Tools_ExportSchedules` (flag `export`), `PLAB_Reportar_Problema` (flag `livre`), e **nenhum** botão MRV.
- Avisos de `flag_painel` diferente podem aparecer: anote para o José e não corrija.

Confira com:
```bash
python -c "import json;d=json.load(open('build/artifacts/catalogo.json',encoding='utf-8'));print(d['versao'],len(d['botoes']));[print(b['flag'],b['painel'],b['id'],b['rotulo'],sep=' | ') for b in d['botoes']]"
```

Mostre a saída ao José. **Se algum botão pronto não aparecer, ou aparecer com a flag errada, pare**: o site vai listar exatamente isso.

Se o console falhar com `FileNotFoundException` de uma DLL do Revit, a pasta padrão não é a dele. Rode de novo passando a pasta como segundo argumento.

- [ ] **Passo 7: commit**

`build/artifacts/` não entra no repositório. Confira com `git check-ignore build/artifacts/catalogo.json`; se não estiver ignorado, **não** o adicione.

```bash
git add tools/PLAB.Catalogo/PLAB.Catalogo.csproj tools/PLAB.Catalogo/Program.cs tools/PLAB.Catalogo/ItemCatalogo.cs src/PLAB.Revit/PLAB.Revit.csproj
git diff --cached --stat
git commit -m "Catalogo do site: console le a ribbon e grava catalogo.json com botao, painel e flag"
```

---

### Tarefa 2: o `pack.ps1` gera o catálogo e mostra os comandos de publicação

**Arquivos:** modificar `build/pack.ps1`.

- [ ] **Passo 1: Trava 1**

`git status --short`. Se `build/pack.ps1` estiver modificado, pare.

- [ ] **Passo 2: gerar junto dos outros artefatos**

Em `build/pack.ps1`, logo **antes** do bloco `Passo "Compilando o instalador"`:

```powershell
# ---------------------------------------------------------------- 4b) catalogo
# O site (plab-eng/landpage) lista os botoes a partir deste arquivo, anexado
# ao release. Sai do MESMO codigo da ribbon: nao ha lista a manter a mao.
Passo "Gerando o catalogo de botoes do site"

$CatalogoProj = Join-Path $RepoRaiz "tools\PLAB.Catalogo\PLAB.Catalogo.csproj"
$CatalogoExe  = Join-Path $RepoRaiz "tools\PLAB.Catalogo\bin\Release\net48\PLAB.Catalogo.exe"
$CatalogoPath = Join-Path $ArtifactDir "catalogo.json"

dotnet build $CatalogoProj -c Release | Out-Null
if ($LASTEXITCODE -ne 0) { throw "build do PLAB.Catalogo falhou" }

& $CatalogoExe $CatalogoPath
if ($LASTEXITCODE -ne 0) { throw "catalogo.json nao foi gerado (ver mensagens acima)" }
```

- [ ] **Passo 3: o comando de release leva o catálogo, e o site é avisado**

No bloco final, troque a linha que imprime o `gh release create` por:

```powershell
Write-Host "  gh release create v$Versao '$ZipPath' '$ExePath' '$CatalogoPath' --repo plab-eng/P-LAB-releases --title 'P-LAB $Versao' --notes '...'" -ForegroundColor Green
Write-Host ""
Write-Host "Depois do release, para o site listar os botoes novos na hora:" -ForegroundColor Green
Write-Host ""
Write-Host "  gh api repos/plab-eng/landpage/dispatches -f event_type=release-addin" -ForegroundColor Green
Write-Host ""
Write-Host "(Sem isso o site se atualiza sozinho na rodada diaria das 06:17.)" -ForegroundColor Green
```

Mantenha a linha "O zip PRECISA ir anexado".

- [ ] **Passo 4: conferir sem publicar (Trava 2)**

```powershell
pwsh build\pack.ps1 -SkipBuild
```

Esperado:
- passa pelo passo "Gerando o catalogo de botoes do site";
- `build\artifacts\catalogo.json` existe;
- as linhas finais mostram o `gh release create` com os **três** arquivos e o `gh api ... dispatches`.

**Não rode nenhuma das duas.**

Se `-SkipBuild` falhar por falta de `bin\Release` antigo, avise o José. O `pack.ps1` completo compila tudo e demora.

- [ ] **Passo 5: commit**

```bash
git add build/pack.ps1
git commit -m "pack.ps1: gera catalogo.json para o site e mostra o comando de avisar o landpage"
```

---

## FASE 2 — site (repo landpage, branch `main`)

Pode ser feita antes do primeiro release com catálogo: sem o anexo, o script não muda nada (Decisão 9).

### Tarefa 3: o script que monta as listas, com testes

**Arquivos:**
- Criar: `scripts/catalogo_site.json`, `scripts/montar_catalogo.py`, `scripts/test_montar_catalogo.py`

**Interfaces:**
- Consome: o `catalogo.json` do contrato e os marcadores `<!-- catalogo:<cartao> -->` / `<!-- /catalogo:<cartao> -->` em `planos.html` (Tarefa 4).
- Produz:
  - `normalizar(texto) -> str`
  - `validar_catalogo(dados) -> dict` (lança `ValueError`)
  - `baixar_catalogo(url, timeout=20) -> dict | None`
  - `itens_do_cartao(catalogo, config, cartao) -> list[tuple[str, bool]]`, onde `bool` é "em breve"
  - `render_lista(itens, recuo, nl) -> str`
  - `aplicar(html_texto, catalogo, config) -> str` (lança `ValueError`)
  - `main() -> int`, que sempre devolve 0
  - variáveis de ambiente: `CATALOGO_URL` (padrão: último release) e `PLANOS_HTML` (padrão: `planos.html` na raiz).

- [ ] **Passo 1: a curadoria**

`git pull --rebase` e depois crie `scripts/catalogo_site.json`:

```json
{
  "_leia": "Curadoria do catálogo do site (docs/superpowers/plans/2026-09-14-catalogo-automatico.md). Lançado vem do catalogo.json do último release do add-in; aqui só entra o que o release não diz: nome melhor para o site, botão para esconder e a lista de Em breve. Item de Em breve some sozinho quando um botão com o mesmo texto sai num release.",
  "cartoes": {
    "free": { "flags": ["free", "livre"] },
    "tools": { "flags": ["tools", "export"] },
    "mep": { "flags": ["mep", "export"] },
    "documentacao": { "flags": ["documentacao", "export"] }
  },
  "renomear": {
    "PLAB_Mep_QuedaTensao": "Calcular Queda de Tensão",
    "PLAB_Mep_TagsHidAutomatica": "Tag Automática",
    "PLAB_Tools_CotaAutomatica": "Cota Automática"
  },
  "ocultar": [],
  "em_breve": {
    "free": [
      "Transferir Parâmetros",
      "Eliminar Duplicados",
      "Limpar Grupos",
      "Alinhar Tags / Spots",
      "Numerar Detalhes",
      "Ordenar Viewports"
    ],
    "tools": [
      "Visibilidade Links",
      "Exportar Worksets"
    ],
    "mep": [
      "Conectar Tubos",
      "Anotar Circuitos, Conduletes e Disjuntores",
      "Quadros: monitorar e redimensionar",
      "Verificador NBR 5410",
      "Croqui → Hidrossanitário",
      "Prumadas, suportes e seta de fluxo",
      "Verificador NBR 8160 / 5626"
    ],
    "documentacao": []
  }
}
```

Os `id` de `renomear` saem do inventário da ribbon. Confira no `catalogo.json` gerado na Tarefa 1 e corrija se algum `id` for outro. As listas de `em_breve` são **cópia exata** do que `planos.html` marca hoje como "Em breve". Confira contra o arquivo antes de seguir, porque o José edita essa página com frequência.

- [ ] **Passo 2: os testes que falham**

`scripts/test_montar_catalogo.py`:

```python
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
```

Rode `python -m unittest scripts/test_montar_catalogo.py`. Esperado: erro de import (`montar_catalogo` não existe).

- [ ] **Passo 3: implementar**

`scripts/montar_catalogo.py`:

```python
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
```

Rode `python -m unittest scripts/test_montar_catalogo.py -v`. Esperado: todos passam.

Se o teste `test_crlf_funciona` falhar, confira que o grupo `nl` está sendo usado no `render_lista` e que nada no caminho converte `\r\n`.

- [ ] **Passo 4: commit local**

```bash
git add scripts/catalogo_site.json scripts/montar_catalogo.py scripts/test_montar_catalogo.py
git commit -m "Catálogo do site: script monta os cartões a partir do release do add-in, com testes"
```

---

### Tarefa 4: marcadores em `planos.html`

**Arquivos:** modificar `planos.html` (os quatro `<ul class="plano-lista">` dos cartões P-LAB Free, Tools, MEP e Documentação).

- [ ] **Passo 1: marcar sem mudar o que aparece**

`git pull --rebase`. Em cada um dos quatro cartões, envolva os `<li>` **que já existem** com os marcadores, no mesmo recuo dos `<li>`. Exemplo do Free:

```html
                        <ul class="plano-lista">
                            <!-- catalogo:free -->
                            <li data-i18n="md-free-1">Transferir Estado</li>
                            ...os outros li como estão hoje...
                            <!-- /catalogo:free -->
                        </ul>
```

Os marcadores são `catalogo:free`, `catalogo:tools`, `catalogo:mep` e `catalogo:documentacao`. **O cartão Assistant não recebe marcador.** Acima do primeiro cartão, acrescente:

```html
                <!-- Listas entre <!-- catalogo:... --> são geradas no deploy por
                     scripts/montar_catalogo.py a partir do release do add-in.
                     Para mudar "Em breve", nome ou esconder um botão, edite
                     scripts/catalogo_site.json — edição à mão aqui é sobrescrita. -->
```

Atenção: um comentário HTML não pode conter `-->` antes do fim. Escreva o comentário acima **sem** repetir o `-->` dos marcadores, por exemplo "Listas entre os marcadores catalogo:...".

- [ ] **Passo 2: conferir que nada visível mudou**

```bash
git diff planos.html | grep "^[-+]" | grep -v "catalogo" | grep -v "^[-+][-+]"
```

Esperado: só a linha do comentário novo. Nenhum `<li>` alterado.

- [ ] **Passo 3: pré-visualizar com o catálogo gerado na Tarefa 1, numa CÓPIA**

A cópia existe porque o catálogo local vem da branch `suite`, que ainda **não** é o release. Commitar o resultado anunciaria botão não lançado (Decisão 1).

```bash
cp planos.html /tmp/planos-preview.html
CATALOGO_URL="file:///C:/Users/usuario/projetos/P-LAB/build/artifacts/catalogo.json" PLANOS_HTML=/tmp/planos-preview.html python scripts/montar_catalogo.py
diff planos.html /tmp/planos-preview.html
```

Mostre o `diff` ao José: é como a página vai ficar no próximo release. Ajuste `renomear`, `ocultar` e `em_breve` em `scripts/catalogo_site.json` conforme ele pedir e repita até ele aprovar. (No Windows, use o scratchpad da sessão no lugar de `/tmp`.)

- [ ] **Passo 4: commit local**

```bash
git add planos.html scripts/catalogo_site.json
git commit -m "planos.html: marcadores do catálogo automático nos cartões de módulo"
```

---

### Tarefa 5: o workflow roda o catálogo, escuta o release e guarda o resultado

**Arquivos:** modificar `.github/workflows/translate-deploy.yml` e `SETUP-TRADUCAO.md`.

- [ ] **Passo 1: gatilhos**

Troque o bloco `on:` por:

```yaml
on:
  push:
    branches: [ main ]
    paths-ignore:
      - 'en/**'
      - 'es/**'
      - '**/*.md'
  # Release novo do add-in: build/pack.ps1 (repo P-LAB) mostra o comando
  #   gh api repos/plab-eng/landpage/dispatches -f event_type=release-addin
  repository_dispatch:
    types: [ release-addin ]
  # Reserva: se ninguém avisar, o catálogo é conferido uma vez por dia
  # (09:17 UTC = 06:17 em Brasília). Sem mudança, o cache de tradução faz
  # a rodada custar zero de DeepL.
  schedule:
    - cron: '17 9 * * *'
  workflow_dispatch:
```

- [ ] **Passo 2: o catálogo antes da tradução**

Logo **antes** do passo `Traduzir (gera /en e /es; usa cache para economizar a cota)`:

```yaml
      # Cartões de módulo de planos.html a partir do catalogo.json do último
      # release do add-in. Nunca falha o deploy: sem catálogo, nada muda.
      - name: Montar catálogo de botões (último release do add-in)
        run: python scripts/montar_catalogo.py
```

- [ ] **Passo 3: guardar o HTML gerado**

No passo `Commitar cache de tradução`, troque o nome e o `run` por:

```yaml
      - name: Commitar catálogo e cache de tradução
        run: |
          git config user.name  "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"
          git add scripts/.translation-cache.json planos.html
          if git diff --cached --quiet; then
            echo "Catálogo e cache sem mudanças — nada a commitar."
          else
            git commit -m "chore: catálogo do add-in e cache de tradução [skip ci]"
            git push
          fi
```

Quem edita o site localmente precisa de `git pull --rebase` antes de mexer. O workflow pode ter commitado `planos.html` desde a última vez.

- [ ] **Passo 4: documentar**

Em `SETUP-TRADUCAO.md`, acrescente uma seção **"Catálogo automático de botões"**:
- de onde vêm os botões (anexo `catalogo.json` do último release em `P-LAB-releases`, gerado pelo `build/pack.ps1`);
- quando roda: push, `release-addin`, todo dia às 06:17, botão manual;
- o que o José edita: `scripts/catalogo_site.json` (`renomear`, `ocultar`, `em_breve`) e **não** as listas entre os marcadores;
- como testar localmente (o comando do Passo 3 da Tarefa 4);
- que item de "Em breve" sai sozinho quando o botão aparece num release.

- [ ] **Passo 5: conferir o YAML e commitar local**

```bash
pip install pyyaml -q
python -c "import yaml; yaml.safe_load(open('.github/workflows/translate-deploy.yml',encoding='utf-8')); print('yaml ok')"
python -m unittest scripts/test_montar_catalogo.py
git add .github/workflows/translate-deploy.yml SETUP-TRADUCAO.md
git commit -m "Deploy do site: catálogo do add-in antes da tradução, gatilho de release e rodada diária"
```

- [ ] **Passo 6: publicar (⛔ Trava 3)**

Mostre ao José os commits das Tarefas 3 a 5 (`git log --oneline origin/main..HEAD`) e pergunte. Com o "pode publicar":

```bash
git pull --rebase
git push origin main
gh run watch "$(gh run list --limit 1 --json databaseId --jq '.[0].databaseId')" --exit-status
```

Esperado: o passo "Montar catálogo de botões" registra `catalogo: sem catálogo utilizável (HTTP Error 404...)`, porque o release v1.0.7 não tem o anexo. O deploy termina verde e a página continua igual. **É o comportamento certo até o próximo release.**

---

## Como o José usa, depois de pronto

1. Termina os botões e roda `pwsh build\pack.ps1`, como hoje. O passo novo gera `build\artifacts\catalogo.json`.
2. Roda o `gh release create` que o script mostra, agora com três arquivos.
3. Roda o `gh api repos/plab-eng/landpage/dispatches -f event_type=release-addin`. Se esquecer, o site se atualiza sozinho às 06:17.
4. Em poucos minutos, `plabdev.com.br/planos.html` lista os botões do release, e os "Em breve" que saíram somem sozinhos.
5. Para anunciar algo novo como "Em breve", ou trocar o nome de um botão no site, edita `scripts/catalogo_site.json` no landpage e dá push.

## Autorrevisão

- **Cobertura das decisões:**

| Decisão | Onde |
|---|---|
| 1 (release é a fonte) | Tarefa 3, URL `releases/latest/download`; prévia só em cópia (Tarefa 4) |
| 2 (sai do código da ribbon) | Tarefa 1, reflexão sobre `ModuleRegistry.All` e `RequiredModule` |
| 3 (oculto fora) | Tarefa 1, `IsKnown` |
| 4 (roda no `pack.ps1`) | Tarefa 2 |
| 5 (antes da tradução) | Tarefa 5, Passo 2 |
| 6 (flag por cartão) | `catalogo_site.json` + teste de export nos três cartões |
| 7 (Em breve sai sozinho) | `itens_do_cartao` + teste |
| 8 (renomear) | `renomear` + teste |
| 9 (falha não derruba) | `baixar_catalogo`/`main` devolvem sem mudar + teste |
| 10 (gatilhos) | Tarefa 5, Passo 1 |

- **Nomes conferidos entre as tarefas:**
  - `catalogo.json` com `id`, `rotulo`, `painel`, `flag`, `flag_painel` e `comando`, igual no C# (`ItemCatalogo`) e no Python (`validar_catalogo`)
  - flags válidas iguais nos dois lados
  - marcadores `catalogo:free|tools|mep|documentacao` iguais em `catalogo_site.json`, nos testes e em `planos.html`

