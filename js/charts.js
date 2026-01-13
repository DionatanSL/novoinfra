function initCharts() {
    if (graficoVdc) graficoVdc.destroy();
    if (graficoTermico) graficoTermico.destroy();
    
    graficoVdc = new Chart(document.getElementById('graficoVdc'), { 
        type: 'bar', 
        data: { 
            labels: energiaZTE.map(e => e.id.substring(0,8)), 
            datasets: [{ 
                label: 'Voltagem DC',
                data: energiaZTE.map(e => parseFloat(e.dc.replace(' V', ''))), 
                backgroundColor: '#00c3ff' 
            }] 
        }, 
        options: { 
            maintainAspectRatio: false,
            plugins: { legend: { display: false } }
        } 
    });

    graficoTermico = new Chart(document.getElementById('graficoTermico'), { 
        type: 'doughnut', 
        data: { labels: ['Normal', 'Alerta'], datasets: [{ data: [80, 20], backgroundColor: ['#10b981', '#f59e0b'] }] }, 
        options: { maintainAspectRatio: false } 
    });
}