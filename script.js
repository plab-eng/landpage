const meusProjetos = [
    {
        nome: "tableGEMA v2.1",
        desc: "Exportação profissional de tabelas sem abrir o Revit. Ganho de 90% de produtividade.",
        tech: "Python | Headless BIM",
        videoSrc: "videos/Exportar planilhas.mp4",
        posterSrc: "images/capa_tabelas.jpg"
    },
    {
        nome: "ExportSheets P-LAB",
        desc: "Automação de pranchas (PDF/DWG) com subpastas inteligentes e nomenclatura padrão.",
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

    // Lógica de Play/Pause no Hover
    const vids = document.querySelectorAll('.card-video');
    vids.forEach(v => {
        const container = v.parentElement;
        container.addEventListener('mouseenter', () => v.play());
        container.addEventListener('mouseleave', () => { 
            v.pause(); 
            v.currentTime = 0; 
        });
    });
}

window.onload = carregarProjetos;