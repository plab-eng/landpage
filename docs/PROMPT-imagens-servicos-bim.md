# Prompts das imagens — página Serviços BIM

Para gerar no Codex (ou outro gerador de imagem). Cada imagem tem o nome de
arquivo que a página já espera: é só salvar em `images/` com esse nome, em
`.webp`, e me avisar.

## Estilo comum (vai no começo de TODOS os prompts)

> Isometric technical illustration in the same style as an existing website
> hero: clean fine-line architectural drawing in dark green (#0e4d2e) on a pure
> white background, flat soft beige and pale gold fills (#e8dcc0), small glowing
> pale-gold circular nodes connected by thin green "data circuit" lines with
> right-angle bends, a few minimal line-art clouds. Calm, precise, engineering
> mood. No people, no text, no letters, no logos, no watermarks, no UI
> screenshots. Generous white margin around the subject. High detail but
> uncluttered.

Proporção: **4:3 (1600 × 1200)** para os cartões; **800 × 567** para o topo.

---

## 1. Topo da página — `servicos-bim-hero.webp` (800 × 567)

> [estilo comum] A single mid-rise building shown in three layers side by
> side on one isometric platform: on the left a translucent point-cloud version
> made of tiny dots, in the middle a clean wireframe BIM model with visible
> pipes and electrical conduits inside the walls, on the right the finished
> solid building. Green circuit lines connect the three stages, with glowing
> gold nodes where they meet.

## 2. Famílias Revit paramétricas — `servico-familias.webp`

> [estilo comum] An exploded isometric view of building components floating
> above a grid: a door, a window, a wash basin with visible pipe connectors, an
> electrical panel, a light fixture and a septic tank made of stacked concrete
> rings. Each object has thin dimension lines and small parameter arrows
> showing it can be resized; tiny round connector points on the pipes glow
> gold.

## 3. Templates e padrões — `servico-templates.webp`

> [estilo comum] A neat isometric stack of standardized drawing sheets with
> identical title blocks, beside a tidy library shelf of uniform folders and a
> set of matching line-weight and color swatches. Green lines run from one
> master sheet to all the others, suggesting one standard applied everywhere.

## 4. Modelagem BIM — `servico-modelagem.webp`

> [estilo comum] A flat 2D floor plan sheet lying on the ground at the left
> rising into a full isometric house model at the right: walls extrude upward,
> and inside them blue-green water pipes, drainage pipes and electrical
> conduits are visible. Green circuit lines trace the transformation from plan
> to model.

## 5. Nuvem de pontos e as built — `servico-nuvem-pontos.webp`

> [estilo comum] A 3D laser scanner on a tripod in the corner of an existing
> room; the room is rendered as a dense cloud of tiny dots that gradually turns
> into clean solid BIM walls, columns and pipes on the other side. Thin scan
> rays fan out from the scanner in pale gold.

## 6. Coordenação e compatibilização — `servico-coordenacao.webp`

> [estilo comum] An isometric section of a building ceiling where a duct, a
> beam and a pipe cross each other; the clash points are highlighted with small
> glowing gold rings and check marks, and a cleaned-up rerouted version of the
> same pipes appears next to it. Green lines link both versions.

## 7. Implantação e cultura BIM — `servico-implantacao.webp`

> [estilo comum] A step-by-step isometric staircase of five platforms, each
> holding a simple object: a checklist board, a document with a seal, a desk
> with a monitor showing a wireframe model, a group table with three empty
> chairs, and a small flag on the top platform. Green circuit lines connect the
> steps upward.

## 8. Dados, 4D/5D e BI — `servico-dados.webp`

> [estilo comum] An isometric building model on the left connected by green
> data lines to floating flat elements on the right: a timeline bar chart
> (schedule), a stack of coins with a simple cost table, and a dashboard panel
> with bar and pie charts. No numbers or text, only shapes.

---

## Dicas

- Se a imagem vier com texto ou letras, repita o prompt reforçando "no text".
- Salve em `.webp`. Se o gerador entregar PNG, eu converto.
- Mantenha os nomes exatamente como acima: a página troca o espaço reservado
  pela imagem só pelo nome do arquivo.
