#!/usr/bin/env bash
# =====================================================================
# P-LAB — Compressão da mídia do Viewer (grade de imagens + carrossel de vídeos)
# ---------------------------------------------------------------------
# Requer: ffmpeg (com libx264, aac e libwebp).
# Uso:    bash scripts/comprimir-midia.sh
#
# Edite o BLOCO DE MAPEAMENTO: à esquerda o arquivo BRUTO que você colou
# (pode ter espaços/acentos), à direita o nome LIMPO de saída (sem extensão)
# referenciado em viewer.html. O script:
#   1) IMAGENS  -> WebP q80, largura máx. 700px (grade compacta);
#   2) VÍDEOS   -> H.264 CRF 27, 720p de altura, +faststart, AAC ~96k;
#   3) POSTERS  -> .webp de um frame de cada vídeo (interface visível, não preto).
# Sempre reporta o peso antes/depois.
# =====================================================================
set -euo pipefail
cd "$(dirname "$0")/.."   # raiz do projeto

CRF=27                 # 26–28: menor = mais qualidade/peso
POSTER_TS="00:00:03"   # instante do frame do poster (evita tela preta no início)
IMG_MAXW=700           # largura máxima das imagens da grade
IMG_Q=80               # qualidade WebP

kb () { du -k "$1" 2>/dev/null | cut -f1; }

# ===================== BLOCO DE MAPEAMENTO ============================
# IMAGENS (grade fixa): "arquivo_bruto|nome_limpo"
IMAGENS=(
  "images/image1.png|viewer-tela-inicial"
  "images/image2.png|viewer-projetos"
  "images/image3.png|viewer-modelo-ifc"
)
# VÍDEOS (carrossel): "arquivo_bruto|nome_limpo"  (gera vídeo + poster)
VIDEOS=(
  "videos/video1.mp4|viewer-medicao"
  "videos/video2.mp4|viewer-anotacoes-ifc"
  "videos/video3.mp4|viewer-anotacoes-pdf"
)
# =====================================================================

echo "==> IMAGENS (grade)"
for item in "${IMAGENS[@]}"; do
  src="${item%%|*}"; name="${item##*|}"
  [ -f "$src" ] || { echo "  ! pulando (não encontrado): $src"; continue; }
  out="images/${name}.webp"
  before=$(kb "$src")
  ffmpeg -y -loglevel error -i "$src" \
    -vf "scale='min(${IMG_MAXW},iw)':-2" -c:v libwebp -quality "$IMG_Q" "$out"
  echo "  $src ($before KB) -> $out ($(kb "$out") KB)"
done

echo "==> VÍDEOS (carrossel) + posters"
for item in "${VIDEOS[@]}"; do
  src="${item%%|*}"; name="${item##*|}"
  [ -f "$src" ] || { echo "  ! pulando (não encontrado): $src"; continue; }
  out="videos/${name}.mp4"
  poster="images/${name}-poster.webp"
  before=$(kb "$src")
  # Escala para 720p de ALTURA só se for maior; largura par mantém a proporção.
  ffmpeg -y -loglevel error -i "$src" \
    -vf "scale=-2:'min(720,ih)'" \
    -c:v libx264 -profile:v high -crf "$CRF" -preset slow -pix_fmt yuv420p \
    -movflags +faststart -c:a aac -b:a 96k "$out"
  ffmpeg -y -loglevel error -ss "$POSTER_TS" -i "$out" -frames:v 1 \
    -vf "scale=${IMG_MAXW}:-2" -c:v libwebp -quality "$IMG_Q" "$poster"
  echo "  $src ($before KB) -> $out ($(kb "$out") KB)  poster:$poster ($(kb "$poster") KB)"
done

echo "Concluído."
