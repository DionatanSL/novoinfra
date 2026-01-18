// Localize esta função no seu script.js
function renderizarGraficoVdcDionatan() {
    const canvas = document.getElementById('graficoVdc');
    if (!canvas) return;

    // 1. A BUSCA DEFINITIVA: Verifica se já existe um gráfico associado a este ID
    const chartExistente = Chart.getChart("graficoVdc"); 
    
    // 2. Se existir, ele mata o gráfico antigo antes de continuar
    if (chartExistente) {
        chartExistente.destroy();
    }

    // 3. Agora o terreno está limpo para criar o novo
    const dadosZTE = window.energiaZTE || [];
    
    window.meuChartVdc = new Chart(canvas, {
        type: 'bar',
        data: {
            labels: dadosZTE.map(e => e.id.substring(0, 10)),
            datasets: [{
                label: 'Voltagem DC',
                data: dadosZTE.map(e => parseFloat(e.dc.replace(' V', '').replace(',', '.')) || 0),
                backgroundColor: '#00d2ff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } }
        }
    });
}