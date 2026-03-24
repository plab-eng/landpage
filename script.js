const meusProjetos = [
    {
        nome: "tableGEMA v2.1 Civil",
        desc: "Extração de tabelas Revit para Excel via Headless BIM. Ganho de 90% de produtividade.",
        tech: "Python | Excel COM",
        videoSrc: "videos/Exportar planilhas.mp4",
        posterSrc: "images/capa_tabelas.jpg"
    },
    {
        nome: "ExportSheets Civil P-LAB",
        desc: "Exportação profissional de pranchas (PDF/DWG) com organização automática.",
        tech: "C# | Revit API",
        videoSrc: "videos/Exportar Worksets.mp4",
        posterSrc: "images/capa_worksets.jpg"
    }
];

function carregarProjetos() {
    const container = document.getElementById('lista-projetos');
    if(!container) return;

    meusProjetos.forEach(p => {
        const card = document.createElement('div');
        card.className = 'skill-card';
        card.innerHTML = `
            <div class="card-video-container">
                <video class="card-video" loop muted playsinline poster="${p.posterSrc}">
                    <source src="${p.videoSrc}" type="video/mp4">
                </video>
            </div>
            <h3>${p.nome}</h3>
            <p>${p.desc}</p>
            <small>Tech: <strong>${p.tech}</strong></small>
        `;
        container.appendChild(card);
    });

    // Lógica de Play/Pause no Hover (Essencial P-LAB Civil)
    const vids = document.querySelectorAll('.card-video');
    vids.forEach(v => {
        const videoContainer = v.parentElement;
        
        // No Desktop: Play no mouseenter, Pause no mouseleave
        videoContainer.addEventListener('mouseenter', () => v.play());
        videoContainer.addEventListener('mouseleave', () => { 
            v.pause(); 
            v.currentTime = 0; // Opcional: Volta para o início
        });

        // No Mobile: Toca ao clicar (playsinline garante que não abra em tela cheia)
        videoContainer.addEventListener('click', () => {
            if (v.paused) {
                v.play();
            } else {
                v.pause();
            }
        });
    });
}

// O envio do formulário agora é gerenciado diretamente pelo HTML (action do FormSubmit)
// Removemos o eventListener 'submit' antigo para evitar conflitos.

window.onload = carregarProjetos;