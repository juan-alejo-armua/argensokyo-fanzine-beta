// Nombre del PDF
const url = "revista.pdf"; // Cambiá por tu archivo

const container = document.getElementById("revista");

// Configuración de PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js";

let scale = 1.3; // escala inicial para zoom

// Cargar el PDF
const loadingTask = pdfjsLib.getDocument(url);
loadingTask.promise.then(function(pdf) {
    console.log("PDF cargado con " + pdf.numPages + " páginas");

    let promises = [];

    // Renderizar cada página en un canvas
    for (let i = 1; i <= pdf.numPages; i++) {
        promises.push(
            pdf.getPage(i).then(function(page) {
                let canvas = document.createElement("canvas");
                canvas.className = "pagina";
                let context = canvas.getContext("2d");

                let viewport = page.getViewport({ scale: scale });
                canvas.height = viewport.height;
                canvas.width = viewport.width;

                return page.render({ canvasContext: context, viewport: viewport }).promise.then(() => canvas);
            })
        );
    }

    // Cuando todas las páginas estén listas
    Promise.all(promises).then(pages => {
        pages.forEach(pageCanvas => container.appendChild(pageCanvas));

        // Inicializar Flipbook con Turn.js
        $("#revista").turn({
            width: 900,
            height: 600,
            autoCenter: true,
            display: "double",
            gradients: true
        });

        // Inicializar contador de páginas
        updatePageIndicator();
    });
});

// 🔹 Controles del flipbook
function prevPage() {
    $("#revista").turn("previous");
    updatePageIndicator();
}

function nextPage() {
    $("#revista").turn("next");
    updatePageIndicator();
}

function zoomIn() {
    scale += 0.2;
    location.reload();
}

function zoomOut() {
    if (scale > 0.5) {
        scale -= 0.2;
        location.reload();
    }
}

function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
    } else {
        if (document.exitFullscreen) document.exitFullscreen();
    }
}

// 🔹 Indicador de página
function updatePageIndicator() {
    const total = $("#revista").turn("pages");
    const current = $("#revista").turn("page");

    let indicator = document.getElementById("pageIndicator");
    if (!indicator) {
        indicator = document.createElement("div");
        indicator.id = "pageIndicator";
        indicator.style.textAlign = "center";
        indicator.style.marginTop = "10px";
        indicator.style.fontWeight = "bold";
        container.parentNode.appendChild(indicator);
    }

    indicator.textContent = `Página ${current} de ${total}`;
}