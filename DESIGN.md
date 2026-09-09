# P-LAB — Style Reference

> Blueprint control room at midnight — sala de comando de projeto.

**Theme:** dark-first (light suportado via `[data-theme]`)
**Derivado de:** Dovetail (refero.design) — "blueprint control room at midnight"

A P-LAB é um centro de comando escuro: canvas quase preto, wireframe de grade sutil ao fundo, e tipografia cinza que recua para que conteúdo e dados liderem. Um único verde funcional atua como acento cromático do sistema — aparece em eyebrows, ícones, números e estados ativos, nunca como ruído decorativo.

A tipografia é Inter em todas as camadas, com tracking progressivamente mais fechado conforme o tamanho cresce (de -0.17px em 14px a -2.3px em 64px), dando aos títulos qualidade de engenharia, não de marketing. Componentes são sem peso: raio 8px, bordas hairline, zero sombras, superfícies planas que se empilham por tom e não por elevação. O ritmo é compacto, técnico, instrumental — uma sala de ferramentas, não um pitch deck.

## Desvio consciente do Dovetail

O Dovetail manda botão primário **branco** e proíbe o acento como fundo de botão. A P-LAB mantém o **botão primário verde**: é o único ponto da página onde a marca aparece cromaticamente e é a CTA de conversão. Todo o resto do sistema (monocromia, tom por superfície, ausência de sombra) segue o Dovetail literalmente.

Para reverter ao padrão Dovetail, basta trocar `--btn-primary-bg` para `--color-snow` e `--btn-primary-fg` para `--color-page-ink`.

## Tokens — Colors

### Neutros (do Dovetail, sem alteração)

| Nome | Valor | Token | Papel |
|------|-------|-------|-------|
| Page Ink | `#0a0a0a` | `--bg` | Fundo da página — o canvas escuro sobre o qual tudo assenta |
| Deep Coal | `#141414` | `--bg-alt` | Nível alternativo de superfície: bandas e seções aninhadas |
| Card Carbon | `#1e1e1e` | `--surface` | Superfície de card, fundo de botão, e a linha da grade |
| Steel Border | `#313131` | `--border` | Hairline em molduras de imagem e divisores sutis |
| Graphite | `#454545` | `--border-strong` | Borda de botão outline e inputs |
| Ash | `#9f9f9f` | `--text-muted` | Texto secundário, traços de ícone |
| Snow | `#ffffff` | `--text` | Texto primário, links de nav, preenchimento de ícone |

### Acento (adaptado — substitui o azul cornflower `#6798ff`)

| Nome | Valor | Token | Papel |
|------|-------|-------|-------|
| P-LAB Green | `#34d07a` | `--accent` (dark) | Eyebrows, ícones de feature, números de stat, estados ativos, CTA primária |
| P-LAB Green Hi | `#5be39b` | `--accent-hover` | Hover de acento |
| P-LAB Green Deep | `#0e7a45` | `--accent` (light) | Mesmo papel no tema claro — contraste 5.0:1 com branco |
| Accent Soft | `rgba(52,208,122,.12)` | `--accent-soft` | Fundo de badge/pill de acento — **nunca** em bloco de conteúdo |

**Por que trocar o verde:** `#2EA043` / `#3FB950` são literalmente a paleta do GitHub. `#34d07a` é mais frio e mais saturado — lê como instrumento, não como repo.

## Tokens — Typography

### Inter — toda a UI e texto editorial · `--font-body` / `--font-title`

- **Substitui:** Sora (títulos) e IBM Plex Sans (corpo) — duas famílias viram uma
- **Pesos:** 400 corpo e meta · 500 nav e labels de botão · 600 headings
- **Fonte:** Google Fonts
- **OpenType:** `"liga" on`

### JetBrains Mono — apenas eyebrows, tags e códigos curtos · `--font-mono`

- Tracking **positivo** 0.85–1.0px — sensação de painel de instrumento
- **Nunca** em corpo de texto ou heading

### Type Scale

| Papel | Tamanho | Line height | Letter spacing | Token |
|-------|---------|-------------|----------------|-------|
| caption | 12px | 1.4 | +0.85px | `--text-caption` |
| body-sm | 14px | 1.5 | -0.17px | `--text-body-sm` |
| body | 16px | 1.5 | -0.19px | `--text-body` |
| subheading | 20px | 1.4 | -0.42px | `--text-subheading` |
| heading-sm | 24px | 1.33 | -0.5px | `--text-heading-sm` |
| heading | 40px | 1.2 | -0.84px | `--text-heading` |
| heading-lg | 56px | 1.14 | -2.02px | `--text-heading-lg` |
| display | 64px | 1.13 | -2.3px | `--text-display` |

## Tokens — Spacing & Shapes

**Unidade base:** 8px · **Densidade:** compacta

Escala: 8 · 16 · 24 · 32 · 40 · 64 · 96 · 200

### Border Radius

| Elemento | Valor |
|----------|-------|
| tags / chips | 4px |
| cards | 8px |
| inputs | 8px |
| buttons | 8px |

### Layout

- **Largura máxima:** 1200px
- **Gap entre seções:** 64–96px
- **Padding de card:** 24–32px
- **Gap entre elementos:** 8–16px

## Components

### Botão primário (P-LAB)

Fundo `--accent`, texto `#0a0a0a`, raio 8px, padding 10px/16px, Inter 500 14px. Sem borda, sem sombra. Hover: `--accent-hover`, sem translate, sem escala.

### Botão secundário (outline)

Fundo transparente, borda 1px `#454545`, texto `#ffffff`, raio 8px, mesmo padding. Contrapartida de menor ênfase ao primário.

### Botão fantasma (nav)

Sem fundo, sem borda, texto branco 14px Inter 500.

### Card (feature / plugin / stat)

Fundo `#1e1e1e`, borda 1px `#1e1e1e` ou transparente — a separação vem do tom, não da borda. Raio 8px, padding 24–32px. Ícone de acento 20–24px acima do título. **Sem sombra em nenhum estado**, inclusive hover.

### Eyebrow

JetBrains Mono, 12px, uppercase, tracking +0.85px, cor `--accent`.

## Surfaces

| Nível | Nome | Valor | Uso |
|-------|------|-------|-----|
| 0 | Canvas | `#0a0a0a` | Fundo da página |
| 1 | Section | `#141414` | Banda alternada ou seção embutida |
| 2 | Card | `#1e1e1e` | Card, preenchimento de botão, superfície de input |

## Elevation

**Nenhuma.** A hierarquia vem de tom e hairline. `--card-shadow: none` nos dois temas.

## Grid Wireframe Motif

Padrão de grade 1px em `#1e1e1e` atrás do canvas escuro, em hero e seções de feature. Célula quadrada de ~56px, contraste muito baixo, nunca carrega conteúdo — existe para dar estrutura e intenção de engenharia a uma superfície plana.

Implementar como `repeating-linear-gradient` no fundo da página; **não** recriar com bordas em elementos individuais.

## Do's

- Raio 8px em todos os botões, cards e inputs. Única exceção: 4px em tags e chips.
- Fundo da página `#0a0a0a`; `#1e1e1e` exclusivo de card e botão, para a hierarquia de superfície ler por tom.
- Verde apenas em acento funcional: eyebrow, ícone de feature, número de stat, estado ativo de nav, CTA primária.
- Display 56–64px Inter 600 com tracking entre -2.0 e -2.3px.
- JetBrains Mono só em eyebrow, tag e label curto, com tracking positivo.
- Gap de seção 64–96px; gap de elemento 8–16px.

## Don'ts

- Não introduzir uma segunda cor cromática — o sistema é monocromático com um verde.
- Não usar sombra ou elevação para separar superfícies — usar o salto de tom entre `#0a0a0a`, `#141414` e `#1e1e1e`.
- Não usar gradiente em nenhuma superfície, botão ou fundo.
- Não usar verde como fundo de bloco de conteúdo ou banda inteira.
- Não usar raio pill ou 16px+ em card ou botão — o canto de 8px é a assinatura.
- Não descer corpo abaixo de 14px nem usar peso inferior a 400.
- Não usar `#000000` puro como fundo de página.
