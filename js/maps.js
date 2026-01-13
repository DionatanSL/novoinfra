// --- ARQUIVO COMPLETO: js/maps.js ---
var map = null; // Variável global para o Leaflet

function initMap() {
    if (map) {
        setTimeout(() => map.invalidateSize(), 200);
        return;
    }
    
    try {
        // Inicializa o mapa focado na região central dos seus POPs (ES)
        map = L.map('mapa-container').setView([-19.5, -40.5], 7);
        
        // Adiciona a camada de mapa Dark Mode (CartoDB)
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);

        // Percorre a base de dados exata do data.js e marca todos os 86 POPs
        for (let nomePop in exactCoords) {
            if (exactCoords[nomePop]) {
                L.marker(exactCoords[nomePop])
                    .addTo(map)
                    .bindPopup(`<b>${nomePop}</b>`);
            }
        }
    } catch (e) {
        console.error("Erro ao carregar o mapa:", e);
    }
}

function focarNoMapa(name) {
    if(exactCoords[name] && map) {
        showPage('home');
        setTimeout(() => {
            map.setView(exactCoords[name], 14);
            // Abre o popup do marcador automaticamente
            map.eachLayer((layer) => {
                if (layer instanceof L.Marker && layer.getPopup().getContent().includes(name)) {
                    layer.openPopup();
                }
            });
        }, 300);
    }
}

function copiarGPS(name) {
    const coords = exactCoords[name];
    if(coords) {
        const texto = coords[0] + "," + coords[1];
        navigator.clipboard.writeText(texto).then(() => alert("Coordenadas copiadas!"));
    }
}