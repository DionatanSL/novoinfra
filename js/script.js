// ==============================================================
// 🛠️ MOTOR PRINCIPAL: INICIALIZAÇÃO SEM CORTES
// ==============================================================
function initUI() {
    carregarPops(); 
    carregarGeradores(); 
    carregarEnergia(); 
    carregarTabelaAcessos();
    carregarBaterias();
    
    // Radar climático sempre ativo via API
    if (typeof window.carregarClimaNOC === "function") {
        window.carregarClimaNOC();
    }

    setTimeout(() => { 
        initSearchDropdowns(); 
        initMap(); 
        initCharts(); 
    }, 150);
}

// ==============================================================
// 📡 INVENTÁRIO DE POPS: MOTOR DINÂMICO DE AUDITORIA
// ==============================================================
// 1. Função de Limpeza Profunda (Normalização)
// 🛠️ FUNÇÃO AUXILIAR: Extrai o ID (Ex: ES-ACZ-A01) para não haver erro de nome
function extrairID(nome) {
    if (!nome) return "";
    return nome.split(/[\s\(]/)[0].toUpperCase().trim();
}

function carregarPops() {
    const tbody = document.querySelector("#tabelaPops tbody");
    if (!tbody || !window.popsList) return;

    tbody.innerHTML = window.popsList.map((p, i) => {
        const d = window.detalhesPops[p] || {};
        
        // Localiza coordenadas no exactCoords
        const idBusca = p.match(/[A-Z]{2}-[A-Z0-9]{3}-A\d+/i)?.[0]?.toUpperCase() || p.toUpperCase();
        const chaveCoords = Object.keys(exactCoords).find(key => key.toUpperCase().includes(idBusca));
        const coordenadas = exactCoords[chaveCoords];

        return `
            <tr onclick="togglePopDetails('details-${i}')" style="cursor: pointer; border-bottom: 1px solid #1e293b;">
                <td style="padding: 15px; color: #f8fafc;"><strong>${p}</strong></td>
                <td style="padding: 15px; text-align: right;">
                    <div style="display: inline-flex; align-items: center; background: rgba(16, 185, 129, 0.1); color: #10b981; padding: 4px 12px; border-radius: 20px; font-size: 0.75rem; border: 1px solid rgba(16, 185, 129, 0.2); font-weight: bold;">
                        <span style="height: 8px; width: 8px; background-color: #10b981; border-radius: 50%; display: inline-block; margin-right: 8px; box-shadow: 0 0 8px #10b981;"></span>
                        ONLINE
                    </div>
                </td>
            </tr>
            <tr id="details-${i}" style="display:none; background: #0f172a;">
                <td colspan="2" style="padding: 20px;">
                    <div style="padding: 20px; border-left: 4px solid #00c3ff;">
                        <p class="m-0">📍 <b>PONTO:</b> <span style="color: #f1f5f9;">${d.pop || p}</span></p>
                        <p class="m-0">🔌 <b>INSTALACAO:</b> <span style="color: #f1f5f9;">${d.instalacao || ''}</span></p>
                        <p class="m-0">📞 <b>CONTATOS:</b> <span style="color: #f1f5f9;">${d.contatos || ''}</span></p>
                        <p class="m-0">⚡ <b>FORMA:</b> <span style="color: #f1f5f9;">${d.forma || ''}</span></p>
                        <p class="m-0">👤 <b>TITULAR:</b> <span style="color: #f1f5f9;">${d.titular || ''}</span></p>
                        <p class="m-0">🆔 <b>CPF/CNPJ:</b> <span style="color: #f1f5f9;">${d.cpf || ''}</span></p>

                        <div style="margin-top: 20px;">
                            ${coordenadas ? `
                                <button onclick="event.stopPropagation(); copiarLinkMaps(${coordenadas[0]}, ${coordenadas[1]})" 
                                    style="width: 100%; padding: 12px; background: #4285F4; color: #fff; border: none; border-radius: 5px; font-weight: bold; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;">
                                    📋 COPIAR (GOOGLE MAPS)
                                </button>
                            ` : `
                                <div style="width: 100%; padding: 10px; background: rgba(239, 68, 68, 0.1); border: 1px dashed #ef4444; border-radius: 5px; color: #ef4444; text-align: center; font-size: 0.85rem; font-weight: bold;">
                                    ⚠️ Localização não cadastrada no sistema
                                </div>
                            `}
                        </div>
                    </div>
                </td>
            </tr>`;
    }).join('');
}

function copiarLinkMaps(lat, lng) {
    const url = `https://www.google.com/maps?q=${lat},${lng}`;
    
    navigator.clipboard.writeText(url).then(() => {
        // Alerta de topo customizado
        const aviso = document.createElement("div");
        aviso.innerHTML = "📍 Localização copiada com sucesso! 🚀";
        Object.assign(aviso.style, {
            position: "fixed", top: "20px", left: "50%", transform: "translateX(-50%)",
            backgroundColor: "#10b981", color: "#fff", padding: "12px 25px",
            borderRadius: "30px", zIndex: "10000", fontWeight: "bold", boxShadow: "0 4px 15px rgba(0,0,0,0.4)",
            fontSize: "0.9rem"
        });
        document.body.appendChild(aviso);
        setTimeout(() => aviso.remove(), 3000);
    });
}

// --- FUNÇÕES DE AÇÃO ---

function acionarFocoMapa(idPop) {
    // Busca o marcador real dentro do objeto de marcadores do Leaflet usando o ID
    const chaveReal = Object.keys(markers).find(k => extrairID(k) === idPop);
    const marker = markers[chaveReal];

    if (marker) {
        map.setView(marker.getLatLng(), 16); 
        marker.openPopup();
        document.getElementById('map').scrollIntoView({ behavior: 'smooth' });
    } else {
        alert("Erro técnico: Marcador não pôde ser focado.");
    }
}

function copiarParaGoogleMaps(lat, lng) {
    // URL formatada corretamente (Corrigido: ${lat})
    const urlFinal = `https://www.google.com/maps?q=${lat},${lng}`;
    
    navigator.clipboard.writeText(urlFinal).then(() => {
        alert("✅ Link do Google Maps copiado! Pode enviar no WhatsApp.");
    }).catch(err => {
        console.error("Erro ao copiar:", err);
        alert("Erro ao copiar o link.");
    });
}

function togglePopDetails(id) {
    const el = document.getElementById(id);
    if (el) el.style.display = (el.style.display === "none" || el.style.display === "") ? "table-row" : "none";
}

// 2. Função para Copiar o Link do Google Maps
function copiarLinkMaps(lat, lng) {
    const url = `https://www.google.com/maps?q=${lat},${lng}`;
    navigator.clipboard.writeText(url).then(() => {
        alert("✅ Link do Google Maps copiado com sucesso!");
    }).catch(err => {
        // Fallback para navegadores antigos
        const tempInput = document.createElement("input");
        tempInput.value = url;
        document.body.appendChild(tempInput);
        tempInput.select();
        document.execCommand("copy");
        document.body.removeChild(tempInput);
        alert("✅ Link copiado!");
    });
}

// 3. Função para focar no mapa interno
function focarNoMapa(pTabela, pCoords) {
    const marker = markers[pTabela] || markers[pCoords];
    if (marker) {
        map.setView(marker.getLatLng(), 16); 
        marker.openPopup();
        document.getElementById('map').scrollIntoView({ behavior: 'smooth' });
    } else {
        alert("Ops! Marcador não localizado no mapa principal.");
    }
}

// Função para focar o mapa no marcador do POP
function focarNoMapa(nomePop) {
    if (typeof markers !== 'undefined' && markers[nomePop]) {
        const marker = markers[nomePop];
        map.setView(marker.getLatLng(), 16); // Ajusta o zoom para o POP
        marker.openPopup();
        
        // Rola a página suavemente para o mapa
        document.querySelector('#map').scrollIntoView({ behavior: 'smooth' });
    } else {
        alert("Coordenadas não encontradas para este POP no mapa.");
    }
}

// Função para gerar e copiar o link do Google Maps
function copiarLinkGoogleMaps(nomePop) {
    if (typeof exactCoords !== 'undefined' && exactCoords[nomePop]) {
        const coords = exactCoords[nomePop];
        // Gera o link formatado: https://www.google.com/maps?q=latitude,longitude
        const linkMaps = `https://www.google.com/maps?q=${coords[0]},${coords[1]}`;
        
        navigator.clipboard.writeText(linkMaps).then(() => {
            alert(`Link do Google Maps para ${nomePop} copiado com sucesso!`);
        }).catch(err => {
            console.error('Erro ao copiar: ', err);
        });
    }
}

// Função para abrir/fechar detalhes (certifique-se que ela existe)
function togglePopDetails(id) {
    const el = document.getElementById(id);
    if (el) {
        el.style.display = (el.style.display === "none" || el.style.display === "") ? "table-row" : "none";
    }
}
// ==============================================================
// 🎯 AUTO-PESQUISA GERAL (ESTILO ELITE)
// ==============================================================

function autoFiltroPops() {
    // 1. Pega o valor digitado no campo neon
    const campo = document.getElementById("inputAutoBuscaPops");
    const termo = campo.value.toUpperCase().trim();
    
    // 2. Busca todas as linhas da sua tabela de POPs
    // Se a sua tabela tiver o id 'tabelaPops', garantimos a precisão:
    const linhas = document.querySelectorAll("#tabelaPops tbody tr, .pop-row");

    linhas.forEach(linha => {
        // Ignora linhas de cabeçalho ou detalhes que devem ficar ocultos
        if (linha.classList.contains('pop-details')) return;

        const texto = linha.innerText.toUpperCase();
        
        // 3. Filtro instantâneo
        if (texto.includes(termo)) {
            linha.style.display = ""; // Mostra o craque
        } else {
            linha.style.display = "none"; // Manda pro banco de reservas
            
            // Tenta esconder a linha de detalhes se ela existir (ex: details-0, details-1)
            const idDetalhe = linha.getAttribute("onclick")?.match(/'(details-\d+)'/)?.[1];
            if (idDetalhe) {
                const elDetalhe = document.getElementById(idDetalhe);
                if (elDetalhe) elDetalhe.style.display = "none";
            }
        }
    });
}
// --- 1. FUNÇÃO DO GRÁFICO (HOME) ---
function renderizarGraficoBaterias() {
    const canvas = document.getElementById('graficoBaterias');
    // Se o canvas não existir ou a planilha ainda não carregou, sai da função
    if (!canvas || !window.bancoBaterias || Object.keys(window.bancoBaterias).length === 0) return;

    let ok = 0, alerta = 0, critico = 0;
    const listaAlertas = [];

    // LÊ DA PLANILHA (Sem nada fake)
    Object.keys(window.bancoBaterias).forEach(pop => {
        const d = window.bancoBaterias[pop];
        const saude = parseInt(d.saude) || 0;
        const ano = parseInt(d.ano) || 0;

        if (saude < 90 || ano < 2023) {
            critico++;
            listaAlertas.push(`🔴 ${pop}: ${saude}%`);
        } else if (saude < 95 || ano < 2024) {
            alerta++;
            listaAlertas.push(`⚠️ ${pop}: ${saude}%`);
        } else {
            ok++;
        }
    });

    // Cria o gráfico usando Chart.js
    if (window.chartBaterias) window.chartBaterias.destroy();
    window.chartBaterias = new Chart(canvas, {
        type: 'doughnut',
        data: {
            labels: ['OK', 'Alerta', 'Crítico'],
            datasets: [{
                data: [ok, alerta, critico],
                backgroundColor: ['#22c55e', '#eab308', '#ff4444'],
                borderWidth: 0
            }]
        },
        options: { 
            responsive: true, 
            maintainAspectRatio: false, 
            cutout: '75%',
            plugins: { legend: { display: false } }
        }
    });

    // Atualiza o carrossel de texto da Home
    const label = document.getElementById('texto-carrossel-baterias');
    if (label && listaAlertas.length > 0) {
        label.innerText = listaAlertas[0];
    }
}

// --- 2. FUNÇÃO DA TABELA (PÁGINA BATERIAS) ---
function carregarBaterias() {
    const tbody = document.querySelector("#tabelaBaterias tbody");
    if (!tbody || !window.bancoBaterias) return;

    const itens = Object.keys(window.bancoBaterias);
    if (itens.length === 0) return;

    tbody.innerHTML = itens.map((pop, i) => {
        const d = window.bancoBaterias[pop];
        return `
            <tr style="cursor:pointer" onclick="this.nextElementSibling.style.display = (this.nextElementSibling.style.display === 'none' ? 'table-row' : 'none')">
                <td><strong>${pop}</strong></td>
                <td class="${parseInt(d.saude) < 92 ? 'text-warning' : 'text-success'} fw-bold">${d.saude}%</td>
                <td class="text-title-cyan">${d.vdc}V</td>
            </tr>
            <tr style="display:none; background: #0f172a;">
                <td colspan="3">
                    <div class="p-3" style="border-left: 4px solid #00d2ff; font-size: 0.8rem;">
                        <b>🧪 TIPO:</b> ${d.tipo} | <b>📅 ANO:</b> ${d.ano} | <b>⏳ AUTONOMIA:</b> ${d.autonomia}h<br>
                        <b>📚 BANCOS:</b> ${d.bancos} | <b>🔌 MONITOR:</b> ${d.monitor} | <b>🛡️ BMS:</b> ${d.bms}
                    </div>
                </td>
            </tr>`;
    }).join('');
}
// ==============================================================
// ⚡ AUTO-PESQUISA EM TEMPO REAL (DIONATAN LIMA)
// ==============================================================

function autoFiltro() {
    // 1. Pega o valor na hora que você digita
    const campo = document.getElementById("inputAutoBusca");
    const termo = campo.value.toUpperCase().trim();
    
    // 2. Seleciona as linhas da tabela ou os cards
    // Certifique-se de que seus itens tenham a classe 'pop-row' ou use 'tr'
    const itens = document.querySelectorAll(".pop-row, tr, .card-pop");

    itens.forEach(item => {
        // Ignora o cabeçalho se for tabela
        if (item.tagName === 'TH') return;

        const conteudo = item.innerText.toUpperCase();
        
        // 3. O filtro acontece instantaneamente
        if (conteudo.includes(termo)) {
            item.style.display = ""; // Mostra o craque
        } else {
            item.style.display = "none"; // Manda pro banco
        }
    });

    // Log para você ver a mágica no F12
    console.log("🔍 Filtrando em tempo real: " + termo);
}
// ==============================================================
// 🗄️ MANUTENÇÃO DE GERADORES: FICHA TÉCNICA TOTAL
// ==============================================================
function carregarGeradores() {
    const tbody = document.getElementById("corpoGeradores");
    if(!tbody) return;
    
    tbody.innerHTML = geradoresData.map((g, i) => `
        <tr class="gerador-row ${g.status === 'OK' ? 'status-ok' : 'status-maint'}" 
            onclick="toggleGeradorDetails('gen-details-${i}')" style="cursor:pointer">
            <td>${g.marca}</td><td>${g.potencia}</td><td><strong>${g.local}</strong></td>
            <td>${g.cidade}</td><td>${g.prox}</td><td><strong>${g.status}</strong></td>
        </tr>
        <tr id="gen-details-${i}" class="gerador-details" style="display:none; background: #0b1320;">
            <td colspan="6">
                <div class="p-3 border border-secondary rounded">
                    <div class="row">
                        <div class="col-md-6">
                            <p class="detail-text"><b>⛽ COMBUSTÍVEL:</b> ${g.combustivel}</p>
                            <p class="detail-text"><b>📡 MONITORAMENTO:</b> ${g.monitoramento}</p>
                            <p class="detail-text"><b>⚡ CONSUMO:</b> ${g.consumo}</p>
                            <p class="detail-text"><b>⚙️ MOTOR:</b> ${g.motor}</p>
                        </div>
                        <div class="col-md-6">
                            <p class="detail-text"><b>🔌 FASES:</b> ${g.fase}</p>
                            <p class="detail-text"><b>📊 CAPACIDADE:</b> ${g.cap}</p>
                            <p class="detail-text"><b>⏳ AUTONOMIA:</b> ${g.autonomia}</p>
                        </div>
                    </div>
                </div>
            </td>
        </tr>
    `).join('');
}

// ==============================================================
// ⚡ MOTOR DE FILTRAGEM DE ENERGIA (HUAWEI, ZTE, CPS, SPS, XPS)
// ==============================================================

// 1. Função que desenha a tabela (O que você já tem)
function renderizarTabelaEnergia(lista) {
    const ce = document.getElementById("corpoEnergia");
    if(!ce) return;

    ce.innerHTML = lista.map(e => {
        const statusText = e.status || "● NORMAL";
        const isCritical = statusText.includes("⚠️") || statusText.includes("❌") || (e.dc && parseFloat(e.dc) < 51);

        return `
            <tr class="${isCritical ? 'row-pendente' : ''}">
                <td><strong>${e.id}</strong></td>
                <td><span class="badge ${isCritical ? 'bg-danger' : 'bg-success'}">${statusText}</span></td>
                <td>${e.ac}</td>
                <td><span class="${isCritical ? 'text-danger fw-bold' : 'text-title-cyan'}" style="font-weight:bold">${e.dc}</span></td>
            </tr>`;
    }).join('');
}

// 2. Função de Inicialização (Carrega tudo ao abrir)
function carregarEnergia() {
    const todas = [...energiaHuawei, ...energiaZTE, ...energiaCPS, ...energiaSPS, ...energiaXPS];
    renderizarTabelaEnergia(todas);
    
    const totalPopsElement = document.getElementById("totalPops");
    if(totalPopsElement) totalPopsElement.innerText = popsList.length; 
}

// 3. FUNÇÃO DE FILTRO (A que estava faltando para os botões funcionarem)
function filtrarEnergia(tipo) {
    // Une todas as fontes do data.js
    const todas = [...energiaHuawei, ...energiaZTE, ...energiaCPS, ...energiaSPS, ...energiaXPS];

    // Lógica: Se for 'TODOS', mostra tudo. Se não, filtra pelo ID (Marca)
    const filtradas = (tipo === 'TODOS') 
        ? todas 
        : todas.filter(f => f.id.includes(tipo));

    // Renderiza apenas as filtradas
    renderizarTabelaEnergia(filtradas);

    // Gerencia o visual do botão (Classe active para o brilho neon)
    document.querySelectorAll('.btn-filter').forEach(btn => btn.classList.remove('active'));
    if (event && event.target) {
        event.target.classList.add('active');
    }
}

// Função do Botão de Filtro
function filtrarEnergia(tipo) {
    // Une as 66 fontes monitoradas
    const todas = [...energiaHuawei, ...energiaZTE, ...energiaCPS, ...energiaSPS, ...energiaXPS];

    if (tipo === 'TODOS') {
        renderizarTabelaEnergia(todas);
    } else {
        // Filtra as fontes que contenham a marca no ID (Ex: "HUAWEI")
        const filtradas = todas.filter(f => f.id.includes(tipo));
        renderizarTabelaEnergia(filtradas);
    }
}


function initSearchDropdowns() {
    const tp = document.getElementById("tecPop"), tn = document.getElementById("tecNome"), tc = document.getElementById("tecCoordenador");
    if(!tp || !tn || !tc) return;
    tp.innerHTML = `<option value="">POP...</option>` + popsList.map(i => `<option value="${i}">${i}</option>`).join('');
    tn.innerHTML = `<option value="">Téc...</option>` + tecNames.map(i => `<option value="${i}">${i}</option>`).join('');
    tc.innerHTML = `<option value="">Coord...</option><option>Dionatan</option><option>Hemerson</option><option>Renan</option><option>Rogerio</option>`;
    new Choices(tp, { searchEnabled: true, itemSelectText: '' });
    new Choices(tn, { searchEnabled: true, itemSelectText: '' });
    new Choices(tc, { searchEnabled: true, itemSelectText: '' });
}
// Agrupamento das bases fornecidas
const todasAsFontes = [
    ...energiaZTE, 
    ...energiaHuawei, 
    ...energiaCPS, 
    ...energiaSPS, 
    ...energiaXPS
];

let filaAlarmesAtivos = [];
let indiceSlide = 0;

function processarAlarmesTecnicos() {
    let alertas = [];

    todasAsFontes.forEach(item => {
        // Conversão dos valores para números (remove o "V")
        const vAC = item.ac === "---" ? null : parseFloat(item.ac);
        const vDC = item.dc === "---" ? null : parseFloat(item.dc);

        // 1. REGRA: FALHA DE AC (Se AC ou DC forem "---")
        if (item.ac === "---" || item.dc === "---" || item.status === "❌ OFFLINE") {
            alertas.push(`🔴 FALHA DE AC - ${item.id}`);
        } 
        
        // 2. REGRA: DC FORA DO PADRÃO (Inferior a 53.0V)
        else if (vDC !== null && vDC < 52.0) {
            alertas.push(`⚠️ DC FORA DO PADRÃO - ${item.id} (${vDC}V)`);
        }

        // 3. REGRA: AC IRREGULAR (Gatilhos 127V e 220V)
        if (vAC !== null) {
            if (vAC > 50 && vAC < 150) { // Sistema 127V
                if (vAC < 100 || vAC > 135) alertas.push(`⚡ AC 127V IRREGULAR - ${item.id} (${vAC}V)`);
            } else if (vAC >= 150) { // Sistema 220V
                if (vAC < 200 || vAC > 235) alertas.push(`⚡ AC 220V IRREGULAR - ${item.id} (${vAC}V)`);
            }
        }
    });

    filaAlarmesAtivos = alertas;
}

// Função de Busca (Filtra baseado no ID ou Status)
function filtrarRetificadoras() {
    const termo = document.getElementById("inputBuscaRet").value.toUpperCase();
    const itens = document.querySelectorAll(".item-fonte"); // Certifique-se que seus itens tenham esta classe

    itens.forEach(item => {
        const texto = item.innerText.toUpperCase();
        item.style.display = texto.includes(termo) ? "" : "none";
    });
}

// Função do Carrossel (3 segundos)
function rotacionarDisplay() {
    const display = document.getElementById("container-alarme-ret");
    const label = document.getElementById("texto-alarme-ret");

    if (filaAlarmesAtivos.length === 0) {
        display.style.display = "none";
        return;
    }

    display.style.display = "flex";
    label.innerText = filaAlarmesAtivos[indiceSlide % filaAlarmesAtivos.length];
    indiceSlide++;
}

// Inicialização
setInterval(processarAlarmesTecnicos, 5000); // Atualiza alarmes a cada 5s
setInterval(rotacionarDisplay, 3000);        // Troca slide a cada 3s

// Execução imediata
processarAlarmesTecnicos();

// ==============================================================
// 🌤️ RADAR METEOROLÓGICO: HG BRASIL WEATHER (SINCRO TOTAL)
// ==============================================================
window.carregarClimaNOC = async function() {
    const container = document.getElementById("clima-container");
    if (!container) return;

    // Chave ad37e7d0 vinculada ao domínio 172.20.0.82
    const apiKey = 'ad37e7d0'; 
    const cidades = [
        { nome: "Vitoria,ES", uf: "ES" },
        { nome: "Salvador,BA", uf: "BA" },
        { nome: "Rio de Janeiro,RJ", uf: "RJ" },
        { nome: "Sao Paulo,SP", uf: "SP" }
    ];

    try {
        container.innerHTML = '<p class="text-muted">🛰️ Sincronizando com satélites HG...</p>';
        
        const promessasClima = cidades.map(async (c) => {
            // format=json-cors é vital para evitar erro de bloqueio no browser
            const url = `https://api.hgbrasil.com/weather?format=json-cors&key=${apiKey}&city_name=${c.nome}`;
            const resposta = await fetch(url);
            const d = await resposta.json();
            
            const res = d.results;
            const isNoite = res.currently === "noite"; 
            
            // Mapeamento de emojis HG (Dia vs Noite)
            const emojis = {
                "clear_day": "☀️",
                "clear_night": "🌙",
                "cloud": "☁️",
                "cloudly_day": "🌤️",
                "cloudly_night": "☁️",
                "rain": "🌧️",
                "storm": "⛈️"
            };
            const emoji = emojis[res.condition_slug] || (isNoite ? "🌙" : "☀️");

            return `
                <div class="weather-item shadow-sm">
                    <div class="weather-state">${res.city}</div>
                    <div class="weather-temp">${emoji} ${res.temp}°C</div>
                    <div class="weather-desc">${res.description}</div>
                </div>`;
        });

        const resultados = await Promise.all(promessasClima);
        container.innerHTML = resultados.join('');
        console.log("✅ NOC: Radar climático HG atualizado.");
    } catch (err) {
        console.error("Erro no radar HG:", err);
        container.innerHTML = `<p class="text-danger">Aguardando resposta do servidor HG...</p>`;
    }
};

function filtrar() { 
    const f = document.getElementById("busca").value.toLowerCase(); 
    document.querySelectorAll("#tabelaPops tbody tr.pop-row").forEach(l => l.style.display = l.innerText.toLowerCase().includes(f) ? "" : "none"); 
}
function renderizarGraficoVdcDionatan() {
    const canvas = document.getElementById('graficoVdc');
    
    // Se o canvas não existe ou não está visível, cancela para não dar erro
    if (!canvas || canvas.offsetParent === null) return;

    const ctx = canvas.getContext('2d');

    // Limpa gráfico anterior para evitar sobreposição
    if (window.meuChartVdc) {
        window.meuChartVdc.destroy();
    }

    // Cores e Dados
    const dados = [
        (typeof energiaHuawei !== 'undefined') ? energiaHuawei.length : 0,
        (typeof energiaZTE !== 'undefined') ? energiaZTE.length : 0,
        (typeof energiaCPS !== 'undefined') ? energiaCPS.length : 0,
        (typeof energiaSPS !== 'undefined') ? energiaSPS.length : 0,
        (typeof energiaXPS !== 'undefined') ? energiaXPS.length : 0
    ];

    window.meuChartVdc = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Huawei', 'ZTE', 'CPS', 'SPS', 'XPS'],
            datasets: [{
                data: dados,
                backgroundColor: ['#ff0000', '#00d2ff', '#3b82f6', '#eab308', '#a855f7'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false, // OBRIGATÓRIO
            cutout: '72%',
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: '#fff',
                        font: { size: 9 },
                        padding: 8,
                        boxWidth: 8,
                        usePointStyle: true // Deixa a legenda redondinha e compacta
                    }
                }
            }
        }
    });
}

// Sincronização com o seu Menu (showPage)
// Adicione isso logo abaixo da função acima
const originalShowPage = window.showPage;
window.showPage = function(id) {
    if (typeof originalShowPage === 'function') originalShowPage(id);
    
    // Quando clicar em Home, espera a tela abrir e desenha o gráfico
    if (id === 'home' || id === 'dashboard') {
        setTimeout(renderizarGraficoVdcDionatan, 300);
    }
};

// Disparo ao carregar a página pela primeira vez
window.addEventListener('load', () => setTimeout(renderizarGraficoVdcDionatan, 800));