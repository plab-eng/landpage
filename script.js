const meusProjetos = [
    {
        nome: "tableGEMA v2.0",
        desc: "Extração de tabelas Revit para Excel sem abrir o modelo. Ganho de 90% de produtividade.",
        tech: "Python | Excel COM",
        videoSrc: "videos/Exportar planilhas.mp4",
        posterSrc: "images/capa_tabelas.jpg"
    },
    {
        nome: "IFC Editor (Headless)",
        desc: "Edição de coordenadas e níveis IFC sem software nativo. Tecnologia de ponta P-LAB.",
        tech: "Python | Headless BIM",
        videoSrc: "videos/Mudar origem IFC.mp4",
        posterSrc: "images/capa_ifc.jpg"
    },
    {
        nome: "Workset Automator",
        desc: "Exportação em lote e organização de modelos. Automação inteligente para projetistas.",
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
                <video class="card-video" loop muted poster="${p.posterSrc}">
                    <source src="${p.videoSrc}" type="video/mp4">
                </video>
            </div>
            <h3>${p.nome}</h3>
            <p>${p.desc}</p>
            <small>Tech: <strong>${p.tech}</strong></small>
        `;
        container.appendChild(card);
    });

    const vids = document.querySelectorAll('.card-video');
    vids.forEach(v => {
        v.parentElement.addEventListener('mouseenter', () => v.play());
        v.parentElement.addEventListener('mouseleave', () => { v.pause(); v.currentTime = 0; });
    });
}

window.onload = carregarProjetos;