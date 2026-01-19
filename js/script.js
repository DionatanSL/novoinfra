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
       
    }, 150);
}

// Função específica para a nova tela de Documentação
function atualizarTabelaDocumentacao() {
    const tabela = document.getElementById('tabelaDocCorpo');
    if (!tabela) return;

    // Pega a lista de POPs que você já usa no sistema
    const lista = window.popsList || JSON.parse(localStorage.getItem('bancoPops')) || [];

    tabela.innerHTML = ""; 
    lista.forEach(pop => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${pop.nome}</td>
            <td><button class="btn btn-sm btn-info" onclick="alert('Docs de ${pop.nome}')">Visualizar</button></td>
        `;
        tabela.appendChild(tr);
    });
}

// Interceptar o clique para carregar a tabela quando a página abrir
const originalShowPageDoc = window.showPage;
window.showPage = function(pageId) {
    if (typeof originalShowPageDoc === 'function') originalShowPageDoc(pageId);
    if (pageId === 'equipamentosPage') {
        atualizarTabelaDocumentacao();
    }
};

// ==============================================================
// 📡 INVENTÁRIO DE POPS: MOTOR DINÂMICO DE AUDITORIA
// js/script.js

// 🎨 INJEÇÃO DE ESTILO (Força o visual do Rack)
const style = document.createElement('style');
style.innerHTML = `
    .rack-frame { 
        width: 320px; margin: 0 auto; background: #020617; border: 6px solid #334155; 
        border-radius: 10px; padding: 10px; box-shadow: 0 0 30px rgba(0,0,0,0.8);
    }
    .u-row { 
        height: 20px; display: flex; align-items: center; margin-bottom: 2px; 
        background: #1e293b; border-radius: 2px; font-size: 10px; color: #94a3b8;
    }
    .u-idx { width: 30px; text-align: center; border-right: 1px solid #020617; font-weight: bold; }
    .u-info { flex-grow: 1; padding-left: 8px; font-weight: bold; text-transform: uppercase; white-space: nowrap; overflow: hidden; }
    
    /* Cores dos Equipamentos */
    .tipo-rede { background: #1e3a8a !important; color: #38bdf8; border-left: 4px solid #38bdf8; }
    .tipo-energia { background: #450a0a !important; color: #f87171; border-left: 4px solid #f87171; }
    .tipo-dc { background: #064e3b !important; color: #4ade80; border-left: 4px solid #4ade80; }
    .tipo-passivo { background: #334155 !important; color: #cbd5e1; }
    
    .btn-pop { width: 100%; text-align: left; background: #1a2234; border: 1px solid #334155; color: white; padding: 15px; margin-bottom: 10px; border-radius: 8px; cursor: pointer; transition: 0.3s; }
    .btn-pop:hover { background: #242f47; border-color: #00d2ff; }
`;
document.head.appendChild(style);

// 1. LISTA DE CIDADES (POPS)
function carregarTabelaEquipamentos() {
    const container = document.getElementById("conteudoEquipamentos");
    const btnVoltar = document.getElementById("btnVoltarRack");
    if (!container) return;

    if (btnVoltar) btnVoltar.style.display = "none";
    container.innerHTML = ""; 

    const dados = window.bancoEquipamentos || {};
    Object.keys(dados).forEach(pop => {
        const btn = document.createElement("button");
        btn.className = "btn-pop";
        btn.innerHTML = `<strong>📍 ${pop}</strong> <span style="float:right; color:#00d2ff;">Selecionar Racks ➔</span>`;
        btn.onclick = () => mostrarMenuRacks(pop);
        container.appendChild(btn);
    });
}

// 2. MENU DE RACKS (Cria os botões Rack 1, Rack 2...)
function mostrarMenuRacks(pop) {
    const container = document.getElementById("conteudoEquipamentos");
    const btnVoltar = document.getElementById("btnVoltarRack");
    
    if (btnVoltar) {
        btnVoltar.style.display = "block";
        btnVoltar.onclick = () => carregarTabelaEquipamentos();
    }

    container.innerHTML = `<h4 class="text-center mb-4" style="color:#00d2ff">Racks em ${pop}</h4>`;
    
    const racks = window.bancoEquipamentos[pop] || {};
    
    Object.keys(racks).forEach(nomeRack => {
        const btn = document.createElement("button");
        btn.className = "btn-pop";
        btn.style.borderLeft = "4px solid #00d2ff";
        btn.innerHTML = `<strong>🗄️ ${nomeRack}</strong>`;
        // Chamando a função de desenho flexível
        btn.onclick = () => desenharRack(pop, nomeRack);
        container.appendChild(btn);
    });
}

// 3. DESENHO DO RACK (Aceita 12U, 44U e Foto)
// ==============================================================
// 1. FUNÇÃO DE LIMPEZA (Normalização de IDs)
// ==============================================================
function extrairID(nome) {
    if (!nome) return "";
    return nome.split(/[\s\(]/)[0].toUpperCase().trim();
}

// ==============================================================
// 2. DESENHO DO RACK (Unificado e Corrigido)
// ==============================================================
// ==============================================================
// 2. DESENHO DO RACK (Unificado e Corrigido)
// ==============================================================
function desenharRack(pop, nomeRack) {
    const container = document.getElementById("conteudoEquipamentos");
    const btnVoltar = document.getElementById("btnVoltarRack");
    
    if (btnVoltar) btnVoltar.onclick = () => mostrarMenuRacks(pop);

    const idLimpo = extrairID(pop);
    const dadosRack = window.bancoEquipamentos[idLimpo] ? window.bancoEquipamentos[idLimpo][nomeRack] : null;

    if (!dadosRack) {
        console.error("Dados não encontrados para:", idLimpo, nomeRack);
        return;
    }

    const equipamentos = dadosRack.equipamentos || [];
    const linkFoto = dadosRack.foto;
    const totalU = parseInt(dadosRack.tamanho) || 44;

    container.innerHTML = `
        <h4 style="text-align:center; color:#00d2ff; margin-bottom:5px;">📍 ${idLimpo}</h4>
        <h5 style="text-align:center; color:#94a3b8; margin-bottom:15px;">${nomeRack} (${totalU}U)</h5>
    `;

    if (linkFoto && linkFoto !== "") {
        container.innerHTML += `
            <div style="text-align:center; margin-bottom:20px;">
                <button class="btn btn-sm" 
                        style="background: #0ea5e9; color: white; font-weight: bold; border-radius: 20px; padding: 5px 20px; border:none; box-shadow: 0 4px 10px rgba(0,0,0,0.3);"
                        onclick="abrirModalFoto('${linkFoto}', '${idLimpo} - ${nomeRack}')">
                    📸 VER FOTO REAL DO RACK
                </button>
            </div>
        `;
    }

    const moldura = document.createElement("div");
    moldura.className = "rack-frame";

    for (let u = 1; u <= totalU; u++) {
        const eq = equipamentos.find(e => e.u === u);
        const row = document.createElement("div");
        
        const alturaU = (eq && eq.tamanhoU) ? eq.tamanhoU : 1;
        row.className = "u-row" + (eq ? ` tipo-${eq.tipo}` : "");
        
        if (alturaU > 1) {
            row.style.height = (alturaU * 31) + "px"; 
            row.style.display = "flex";
            row.style.alignItems = "center";
        }

        if (eq) {
            row.style.cursor = "pointer";
            row.onclick = () => abrirModalByFace(eq); 
        }

        const labelU = (alturaU > 1) ? `${u}-${u + alturaU - 1}` : u;
        row.innerHTML = `<div class="u-idx">${labelU}</div><div class="u-info">${eq ? eq.nome : "—"}</div>`;
        
        moldura.appendChild(row);
        if (alturaU > 1) u += (alturaU - 1); 
    }
    
    container.appendChild(moldura);
}

// -------------------------------------------------------------
// 📸 FUNÇÃO PARA FOTO REAL (CORREÇÃO AQUI)
// -------------------------------------------------------------
window.abrirModalFoto = function(caminho, titulo) {
    const modal = document.getElementById('modalFoto');
    const img = document.getElementById('imagemAmpliada');
    const legenda = document.getElementById('legendaFoto');
    
    if (modal && img) {
        img.style.display = 'block'; // 👈 ISSO FAZ A FOTO VOLTAR A APARECER
        img.src = caminho;
        legenda.innerText = titulo;
        modal.style.display = 'flex';
    }
};

// -------------------------------------------------------------
// 🚀 FUNÇÃO "BY FACE" (MANTIDA ORIGINAL)
// -------------------------------------------------------------
window.abrirModalByFace = function(eq) {
    const modal = document.getElementById('modalFoto');
    const img = document.getElementById('imagemAmpliada');
    const legenda = document.getElementById('legendaFoto');

    if (!modal) return;
    img.style.display = 'none'; // Esconde a foto para mostrar as portas
    
    const totalPortas = eq.totalPortas || (eq.portas ? eq.portas.length : 0);
    let htmlPortas = `<div class="grid-portas">`;
    
    for (let i = 1; i <= totalPortas; i++) {
        const pDados = eq.portas ? eq.portas.find(p => p.p == i) : null;
        const cor = (pDados && pDados.status === 'ocupada') ? '#22c55e' : '#475569';
        const rota = (pDados && pDados.rota) ? pDados.rota : "Disponível/Vaga";

        htmlPortas += `
            <div class="porta" 
                 style="background:${cor}" 
                 title="Porta ${i}: ${rota}"> 
                ${i}
            </div>`;
    }
    htmlPortas += `</div>`;

    legenda.innerHTML = `
        <h3 style="color:#00d2ff; margin-bottom:10px;">🔍 ${eq.nome}</h3>
        <p style="text-align:left; color:white; font-size:14px; white-space: pre-line;">${eq.desc || ''}</p>
        <div style="margin-top:20px; text-align:left;">
            <strong style="color:#0ea5e9;">🌐 Painel Frontal (${totalPortas} Portas):</strong>
            ${htmlPortas}
        </div>
    `;

    modal.style.display = 'flex';
};

window.fecharModalFoto = function() {
    const modal = document.getElementById('modalFoto');
    if (modal) modal.style.display = 'none';
};

// -------------------------------------------------------------
// 4. FUNÇÃO DE NAVEGAÇÃO (MANTIDA ORIGINAL)
// -------------------------------------------------------------
window.showPage = function(pageId) {
    const idSujo = pageId.toLowerCase();

    if (idSujo === 'acessopops' || idSujo === 'equipamentospage') {
        const senha = prompt("🔒 Acesso Restrito. Digite a senha ADM:");
        if (senha !== "123") {
            alert("❌ Senha incorreta! Acesso negado.");
            return;
        }
    }
    // Esconde todas as páginas e mostra a selecionada
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const target = document.getElementById(pageId);
    if (target) target.classList.add('active');
};
// ==============================================================
/// ==============================================================
// 4. FUNÇÃO DE NAVEGAÇÃO (Versão Unificada com Trava DWDM)
// ==============================================================
window.showPage = function(pageId) {
    const idSujo = pageId.toLowerCase().trim();

    // 🔒 1. TRAVA DE SEGURANÇA: Lista de IDs que pedem senha
    const paginasPrivadas = ['acessopops', 'equipamentospage', 'dwdmpage'];

    if (paginasPrivadas.includes(idSujo)) {
        const senha = prompt("🔒 Acesso Restrito. Digite a senha ADM:");
        
        if (senha !== "123") {
            alert("❌ Senha incorreta! Acesso negado.");
            return; // 🛑 Cancela a execução e não mostra a página
        }
    }

    // 📋 2. LIMPEZA: Esconde todas as seções antes de mostrar a nova
    document.querySelectorAll('.page, .page-content, .content-section').forEach(p => {
        p.style.display = 'none';
    });

    // 📺 3. EXIBIÇÃO: Mostra a página selecionada
    const target = document.getElementById(pageId);
    if (target) {
        target.style.display = 'block';
    }

    // 🚀 4. GATILHOS EXTRAS (Gráficos e Tabelas)
    // Carrega a tabela se for a página de equipamentos
    if (idSujo === 'equipamentospage' && typeof carregarTabelaEquipamentos === 'function') {
        carregarTabelaEquipamentos();
    }
    
    // Inicia os gráficos se for a home ou dashboard
    if ((idSujo === 'homepage' || idSujo === 'dashboardpage') && typeof initCharts === 'function') {
        initCharts();
    }
};
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
// Função para fechar o modal da Central de Alarmes
window.fecharModalZabbix = function() {
    // Verifique se o ID no seu HTML é exatamente 'modalZabbixGlobal'
    const modal = document.getElementById('modalZabbixGlobal');
    if (modal) {
        modal.style.display = 'none';
    }
};
// --- FUNÇÃO DE NAVEGAÇÃO ---
// ==============================================================
// 4. FUNÇÃO DE NAVEGAÇÃO MESTRE (Com todos os gatilhos)
// ==============================================================
// ==============================================================
// 1. NAVEGAÇÃO PRINCIPAL E SEGURANÇA
// ==============================================================
window.showPage = function(pageId) {
    const idSujo = pageId.toLowerCase().trim();
    const paginasProtegidas = ['acessopops', 'equipamentospage', 'dwdmpage'];

    if (paginasProtegidas.includes(idSujo)) {
        const senha = prompt("🔒 Acesso Restrito. Digite a senha ADM:");
        if (senha !== "123") {
            alert("❌ Senha incorreta! Acesso negado.");
            return;
        }
    }

    document.querySelectorAll('.page, .page-content, .content-section').forEach(p => {
        p.style.display = 'none';
    });

    const target = document.getElementById(pageId);
    if (target) {
        target.style.display = 'block';
    }

    // Gatilhos específicos de carregamento
    if (idSujo === 'dwdmpage') {
        listarLocaisDWDM(); 
    }
    if (idSujo === 'equipamentospage' && typeof carregarTabelaEquipamentos === 'function') {
        carregarTabelaEquipamentos();
    }
    if ((idSujo === 'home' || idSujo === 'dashboardpage') && typeof initCharts === 'function') {
        initCharts();
    }
};

// ==============================================================
// 2. NÍVEL 1: HUB DE SELEÇÃO (CARDS DOS POPS)
// ==============================================================
window.listarLocaisDWDM = function() {
    const container = document.getElementById('conteudoDWDM');
    if (!container) return;

    if (!window.bancoDWDM || Object.keys(window.bancoDWDM).length === 0) {
        container.innerHTML = '<p class="text-center text-secondary">Nenhum chassi DWDM cadastrado.</p>';
        return;
    }

    let html = `
        <div style="text-align: left; margin-bottom: 20px;">
            <p class="text-secondary">Selecione a unidade para gerência modular:</p>
        </div>
        <div class="row g-4">`;

    Object.keys(window.bancoDWDM).forEach(idChassi => {
        const chassi = window.bancoDWDM[idChassi];
        html += `
            <div class="col-md-6 col-lg-4">
                <div class="card-pop-selecao" onclick="renderizarChassiDWDM('${idChassi}')">
                    <div class="card-pop-header">
                        <span style="color: #22c55e; font-size: 10px; font-weight: bold;">● STATUS: ONLINE</span>
                        <i class="fas fa-microchip" style="color: #0ea5e9; font-size: 1.2rem;"></i>
                    </div>
                    <div class="card-pop-body" style="text-align: left; margin-top: 15px;">
                        <small style="color: #0ea5e9; font-weight: bold; font-size: 10px; text-transform: uppercase;">Unidade Operacional</small>
                        <h4 style="color: white; margin: 5px 0; font-weight: 800;">${chassi.pop}</h4>
                        <p style="color: #94a3b8; font-size: 12px; margin: 0;">${chassi.nome}</p>
                    </div>
                    <div class="card-pop-footer">
                        <span>ABRIR LAYOUT DE PLACAS</span>
                        <i class="fas fa-arrow-right"></i>
                    </div>
                </div>
            </div>`;
    });

    html += `</div>
        <style>
            .card-pop-selecao { background: #1e293b; border-left: 5px solid #0ea5e9; border-radius: 8px; padding: 20px; cursor: pointer; transition: 0.3s; border: 1px solid #334155; }
            .card-pop-selecao:hover { transform: translateY(-5px); background: #2d3748; box-shadow: 0 10px 20px rgba(0,0,0,0.3); border-color: #0ea5e9; }
            .card-pop-header { display: flex; justify-content: space-between; align-items: center; }
            .card-pop-footer { margin-top: 20px; padding-top: 15px; border-top: 1px solid #334155; display: flex; justify-content: space-between; color: #0ea5e9; font-size: 11px; font-weight: bold; }
        </style>`;

    container.innerHTML = html;
};

// ==============================================================
// 3. NÍVEL 2: VISÃO DO CHASSI (LAYOUT MODULAR)
// ==============================================================
window.renderizarChassiDWDM = function(idChassi) {
    const container = document.getElementById('conteudoDWDM');
    const chassi = window.bancoDWDM[idChassi];
    if (!chassi) return;

    let html = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
            <button onclick="listarLocaisDWDM()" class="btn btn-sm btn-outline-info">
                <i class="fas fa-chevron-left"></i> Voltar para Seleção
            </button>
            <h5 style="color: white; margin: 0;">${chassi.pop} | <span style="color:#94a3b8; font-size: 14px;">${chassi.nome}</span></h5>
        </div>
        <div class="chassi-container-modular">
    `;

    for (let i = 1; i <= chassi.totalSlots; i++) {
        const slot = chassi.slots[i];
        if (slot) {
            html += `
                <div class="placa-slot-ativa" onclick='abrirDetalhePlaca(${JSON.stringify(slot)}, ${i}, "${idChassi}")'>
                    <div class="led-status-on"></div>
                    <span class="nome-placa-v">${slot.placa}</span>
                    <span class="num-slot-v">${i}</span>
                </div>`;
        } else {
            html += `<div class="placa-slot-vazia"><span class="num-slot-v">${i}</span></div>`;
        }
    }

    html += `</div>
        <style>
            .chassi-container-modular { display: flex; gap: 4px; background: #cbd5e1; padding: 15px; border: 4px solid #475569; border-radius: 8px; height: 320px; overflow-x: auto; }
            .placa-slot-ativa { width: 45px; height: 100%; background: #4ade80; border: 1px solid #166534; display: flex; flex-direction: column; align-items: center; cursor: pointer; transition: 0.2s; }
            .placa-slot-ativa:hover { filter: brightness(1.1); transform: scale(1.02); }
            .placa-slot-vazia { width: 45px; height: 100%; background: #f1f5f9; border: 1px solid #cbd5e1; display: flex; align-items: flex-end; justify-content: center; opacity: 0.6; }
            .led-status-on { width: 8px; height: 8px; background: #0f0; border-radius: 50%; margin-top: 5px; box-shadow: 0 0 5px #0f0; }
            .nome-placa-v { writing-mode: vertical-rl; font-size: 10px; font-weight: bold; margin-top: 15px; color: #064e3b; }
            .num-slot-v { margin-top: auto; font-size: 10px; font-weight: bold; padding-bottom: 5px; color: #064e3b; }
        </style>`;

    container.innerHTML = html;
};

// ==============================================================
// 4. NÍVEL 3: DETALHE DA PLACA E BOTÕES DE AÇÃO (NMS)
// ==============================================================
window.abrirDetalhePlaca = function(slot, num, idChassi) {
    const container = document.getElementById('conteudoDWDM');
    
    let html = `
        <div style="text-align: left; margin-bottom: 15px;">
            <button onclick="renderizarChassiDWDM('${idChassi}')" class="btn btn-sm btn-secondary">
                <i class="fas fa-chevron-left"></i> Voltar ao Chassi
            </button>
        </div>

        <div class="detalhe-placa-grid">
            <div class="col-portas-v">
                <span class="label-portas">Interfaces</span>
                ${slot.portas && slot.portas.length > 0 ? slot.portas.map(p => `
                    <div title="${p.rota || 'Disponível'}" class="porta-box ${p.status === 'ocupada' ? 'status-ocu' : 'status-liv'}">
                        P${p.p}
                    </div>
                `).join('') : '<small style="color:#94a3b8">N/A</small>'}
            </div>

            <div style="text-align: left;">
                <h4 style="margin: 0; color: #0ea5e9; font-weight: bold;">Slot ${num}: ${slot.placa}</h4>
                <hr style="border-top: 1px solid #cbd5e1; margin: 15px 0;">
                <p style="font-size: 14px;"><strong>📋 Descrição:</strong> ${slot.desc || 'Módulo DWDM'}</p>
                <p style="font-size: 14px;"><strong>📍 Observação:</strong> ${slot.remark || 'N/A'}</p>
                <div class="estado-fisico">
                    <small>Estado Físico:</small><br>
                    <strong style="color: #22c55e;">Instalada / Operacional</strong>
                </div>
            </div>

            <div class="col-acoes-nms">
                <button class="btn-nms-action" onclick="executarAcaoNMS('Alarmes', '${slot.placa}')">Browse Current Alarms</button>
                <button class="btn-nms-action" onclick="executarAcaoNMS('Performance', '${slot.placa}')">WDM Performance Browse</button>
                <button class="btn-nms-action" onclick="executarAcaoNMS('Configuração', '${slot.placa}')">WDM Configuration</button>
                <button class="btn-nms-action" onclick="executarAcaoNMS('Caminho Óptico', '${slot.placa}')">Path View</button>
                <button class="btn-nms-action" onclick="executarAcaoNMS('Versão Software', '${slot.placa}')">Board Software Version</button>
            </div>
        </div>

        <style>
            .detalhe-placa-grid { display: grid; grid-template-columns: 110px 1fr 280px; gap: 20px; background: #f8fafc; padding: 25px; border-radius: 8px; border-left: 10px solid #4ade80; color: #1e293b; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            .col-portas-v { display: flex; flex-direction: column; gap: 4px; border-right: 1px solid #cbd5e1; padding-right: 15px; max-height: 350px; overflow-y: auto; }
            .label-portas { font-size: 10px; font-weight: bold; color: #64748b; margin-bottom: 5px; text-transform: uppercase; }
            .porta-box { color: white; font-size: 10px; padding: 5px; text-align: center; border-radius: 2px; font-weight: bold; }
            .status-ocu { background: #22c55e; }
            .status-liv { background: #94a3b8; }
            .estado-fisico { margin-top: 30px; padding: 10px; background: #f1f5f9; border-radius: 4px; border: 1px solid #e2e8f0; }
            .col-acoes-nms { display: flex; flex-direction: column; gap: 6px; }
            .btn-nms-action { background: white; border: 1px solid #cbd5e1; padding: 8px; font-size: 12px; text-align: left; cursor: pointer; transition: 0.2s; color: #334155; font-weight: 500;}
            .btn-nms-action:hover { background: #f1f5f9; border-color: #0ea5e9; color: #0ea5e9; padding-left: 12px; }
        </style>
    `;
    container.innerHTML = html;
};

// ==============================================================
// 5. FUNÇÃO DE PROCESSAMENTO DE AÇÕES (SIMULADOR NMS)
// ==============================================================
window.executarAcaoNMS = function(tipo, placa) {
    // Aqui você pode integrar com seu backend futuramente
    console.log(`Solicitando ${tipo} para a placa ${placa}`);
    alert(`[GERÊNCIA DWDM]\n\nAção: ${tipo}\nAlvo: Placa ${placa}\n\nStatus: Buscando informações em tempo real no equipamento...`);
};

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


let indiceSlide = 0;



// Função de Busca (Filtra baseado no ID ou Status)
function filtrarRetificadoras() {
    const termo = document.getElementById("inputBuscaRet").value.toUpperCase();
    const itens = document.querySelectorAll(".item-fonte"); // Certifique-se que seus itens tenham esta classe

    itens.forEach(item => {
        const texto = item.innerText.toUpperCase();
        item.style.display = texto.includes(termo) ? "" : "none";
    });
}



// ==============================================================
// 🌤️ RADAR METEOROLÓGICO: HG BRASIL WEATHER (SINCRO TOTAL)
// ==============================================================
window.carregarClimaNOC = async function() {
    const container = document.getElementById("clima-container");
    if (!container) return;

    // Chave ad37e7d0 vinculada ao domínio 172.20.0.82
    const apiKey = 'e0555ec7'; 
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
function efetuarLogout() {
    // 1. Limpa o login do navegador (impede de entrar de novo sem senha)
    localStorage.removeItem('logado');
    localStorage.removeItem('usuarioAtivo');

    // 2. Sai do dashboard e volta para o login
    window.location.href = 'index.html'; 
}
// GATILHO PARA CARREGAR TUDO AO ABRIR OU ATUALIZAR A PAGINA
document.addEventListener("DOMContentLoaded", function() {
    console.log("🚀 Página carregada! Iniciando componentes...");

    // 1. Inicia o Clima (HG Brasil)
    if (typeof carregarClimaNOC === 'function') {
        carregarClimaNOC();
    }

    // 2. Inicia o Minimap (Ajuste o nome da função se for diferente)
    if (typeof carregarMinimap === 'function') {
        carregarMinimap();
    } else if (typeof initMap === 'function') {
        initMap();
    }
    
    // 3. Inicia os POPs
    if (typeof sincronizarPopsFinal === 'function') {
        sincronizarPopsFinal();
    }
});
function inicializarPainelSeguro() {
    console.log("🚀 Iniciando Resgate de Dados...");

    // 1. Tenta carregar Gestão de Acesso
    try {
        if (typeof carregarTabelaAcessos === 'function') {
            carregarTabelaAcessos();
            console.log("✅ Gestão de Acesso: OK");
        }
    } catch (e) { console.error("❌ Erro na Gestão de Acesso:", e); }

    // 2. Tenta carregar Geradores/POPs
    try {
        if (typeof sincronizarPopsFinal === 'function') {
            sincronizarPopsFinal();
            console.log("✅ Geradores: OK");
        }
    } catch (e) { console.error("❌ Erro nos Geradores:", e); }

    // 3. Tenta carregar Clima e Mapa
    try {
        if (typeof carregarClimaNOC === 'function') carregarClimaNOC();
        if (typeof carregarMinimap === 'function') carregarMinimap();
    } catch (e) { console.error("❌ Erro nos Componentes Visuais:", e); }
}

// Executa assim que o script carregar
inicializarPainelSeguro();

// Executa novamente quando a página estiver 100% pronta
window.addEventListener('load', inicializarPainelSeguro);
// ==============================================================
/// ==============================================================
// ==============================================================
// ⚡ MOTOR ZABBIX – FINAL DEFINITIVO COM CARROSSEL (UPGRADE PULSO)
// ==============================================================

window.alarmesZabbix = [];
window.ponteiroZabbix = 0;

(function () {

    console.log("🚀 Motor Zabbix carregado (AC + Modal + Carrossel)");

    /* ===== CONFIG ===== */
    const URL = "https://monitoramento.dinamicatelecom.com.br/api_jsonrpc.php";
    const TOKEN = "f895cfe5bb1033e0c30d515a612b78975599843e058b4185cfbb45ff243b67f2";

    const GRUPOS = [
        "FONTE CPS",
        "Fonte Huawei",
        "FONTE HUAWEI",
        "FONTE SPS",
        "FONTE XPS",
        "Fonte ZTE"
    ];

    /* ==================================================
       🔎 BUSCAR ALARMES ZABBIX
    ================================================== */
    async function buscarAlarmesZabbix() {
        try {
            const r1 = await fetch(URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    jsonrpc: "2.0",
                    method: "hostgroup.get",
                    params: {
                        output: ["groupid"],
                        filter: { name: GRUPOS }
                    },
                    auth: TOKEN,
                    id: 1
                })
            });

            const d1 = await r1.json();
            const groupIds = d1.result?.map(g => g.groupid) || [];

            if (groupIds.length === 0) {
                window.alarmesZabbix = [];
                window.ponteiroZabbix = 0;
                atualizarCardEnergiaAC();
                atualizarCarrosselEnergia();
                return;
            }

            const r2 = await fetch(URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    jsonrpc: "2.0",
                    method: "trigger.get",
                    params: {
                        output: ["description", "priority"],
                        selectHosts: ["name"],
                        groupids: groupIds,
                        filter: { value: 1 }
                    },
                    auth: TOKEN,
                    id: 2
                })
            });

            const d2 = await r2.json();

            window.alarmesZabbix = (d2.result || []).map(a => ({
                host: a.hosts?.[0]?.name?.toUpperCase() || "DESCONHECIDO",
                msg: a.description
                    .replace(/{HOST\.NAME}/g, "")
                    .replace(/{HOST\.CONN}/g, "")
                    .replace(/-{HOST\.CONN}/g, "")
                    .trim()
                    .toUpperCase(),
                priority: Number(a.priority)
            }));

            window.ponteiroZabbix = 0;

            console.log(`🚨 Alarmes ativos: ${window.alarmesZabbix.length}`);
            window.dispatchEvent(new Event("zabbix:update"));


            atualizarCardEnergiaAC();
            atualizarCarrosselEnergia();

        } catch (e) {
            console.error("❌ Erro Zabbix", e);
            window.alarmesZabbix = [];
            window.ponteiroZabbix = 0;
            atualizarCardEnergiaAC();
            atualizarCarrosselEnergia();
        }
    }

    /* ==================================================
       ⚡ CARD ENERGIA AC (UPGRADE PULSO REAL)
    ================================================== */
    function atualizarCardEnergiaAC() {
        const card = document.getElementById("card-energia-ac");
        const valor = document.getElementById("valor-energia-ac");

        if (!card || !valor) return;

        card.classList.remove("estado-normal", "estado-critico");

        // 🔥 remove overlay antigo
        const oldOverlay = card.querySelector(".pulse-overlay");
        if (oldOverlay) oldOverlay.remove();

        if (window.alarmesZabbix.length === 0) {
            card.classList.add("estado-normal");
            valor.innerHTML =
                "⚡ ENERGIA<br><span style='color:#22c55e;'>✅ NORMAL</span>";
        } else {
            card.classList.add("estado-critico");
            valor.innerHTML =
                "⚡ ENERGIA<br><span style='color:#ef4444;'>🚨 ALERTA</span>";

            // ✅ adiciona overlay pulsante
            const overlay = document.createElement("div");
            overlay.className = "pulse-overlay";
            card.style.position = "relative";
            card.appendChild(overlay);
        }
    }

    /* ==================================================
       🔁 CARROSSEL DE ALARMES
    ================================================== */
    function atualizarCarrosselEnergia() {
        const container = document.getElementById("container-alarme-ret");
        const texto = document.getElementById("texto-alarme-ret");

        if (!container || !texto) return;

        if (window.alarmesZabbix.length === 0) {
            container.style.display = "none";
            container.classList.remove("estado-critico-pulse");
            return;
        }

        container.style.display = "flex";
        container.classList.add("estado-critico-pulse");

        const item =
            window.alarmesZabbix[
                window.ponteiroZabbix % window.alarmesZabbix.length
            ];

        window.ponteiroZabbix++;

        const icones = ["ℹ️", "⚡", "⚠️", "🔥", "🚨", "☠️"];
        const icone = icones[item.priority] || "⚠️";

        texto.innerHTML = `
            <div style="display:flex; align-items:center; gap:10px;">
                <div style="font-size:1.6rem;">${icone}</div>
                <div style="overflow:hidden;">
                    <div style="
                        white-space:nowrap;
                        overflow:hidden;
                        text-overflow:ellipsis;
                        max-width:240px;
                        font-size:12px;
                        line-height:1.2;
                    ">
                        <span style="color:#38bdf8; font-weight:900;">
                            ${item.host}
                        </span><br>
                        <span style="color:#ffffff;">
                            ${item.msg}
                        </span>
                    </div>
                </div>
            </div>
        `;
    }

    /* ==================================================
       📋 MODAL
    ================================================== */
    window.consultarAlarmesGeraisZabbix = function () {
        const modal = document.getElementById("modalZabbixGlobal");
        const lista = document.getElementById("lista-alarmes-zabbix");
        const contador = document.getElementById("contador-alarmes");

        if (modal) modal.style.display = "flex";
        if (!lista) return;

        if (window.alarmesZabbix.length === 0) {
            lista.innerHTML =
                `<div style="text-align:center;color:#22c55e;">✅ Tudo Normal</div>`;
            if (contador) contador.innerText = "0 Eventos";
            return;
        }

        lista.innerHTML = window.alarmesZabbix.map(a => `
            <div class="alarme-card" style="
                border-left:5px solid #ef4444;
                background:rgba(30,41,59,0.6);
                padding:12px;
                margin-bottom:8px;
                border-radius:6px;
            ">
                <strong style="color:#f8fafc;font-size:13px;">
                    ${a.msg}
                </strong><br>
                <small style="color:#38bdf8;font-weight:bold;">
                    ${a.host}
                </small>
            </div>
        `).join("");

        if (contador)
            contador.innerText = `${window.alarmesZabbix.length} Eventos`;
    };

    window.fecharModalZabbix = function () {
        const modal = document.getElementById("modalZabbixGlobal");
        if (modal) modal.style.display = "none";
    };
/* ==================================================
   💓 CSS DO PULSO – INJEÇÃO SEGURA (UMA VEZ)
   Não altera nenhuma lógica existente
================================================== */
(function injetarCSSPulsoEnergia() {
    if (document.getElementById("css-pulso-energia")) return;

    const style = document.createElement("style");
    style.id = "css-pulso-energia";
    style.innerHTML = `
        .pulse-overlay {
            position: absolute;
            inset: -2px;
            border-radius: 12px;
            pointer-events: none;
            animation: pulseEnergia 1.6s ease-out infinite;
            box-shadow: 0 0 0 rgba(239,68,68,0.6);
        }

        @keyframes pulseEnergia {
            0% {
                box-shadow: 0 0 0 0 rgba(239,68,68,0.6);
                opacity: 1;
            }
            70% {
                box-shadow: 0 0 0 14px rgba(239,68,68,0);
                opacity: 0.6;
            }
            100% {
                box-shadow: 0 0 0 0 rgba(239,68,68,0);
                opacity: 1;
            }
        }
    `;
    document.head.appendChild(style);
})();

    /* ==================================================
       ▶ START
    ================================================== */
    buscarAlarmesZabbix();
    setInterval(buscarAlarmesZabbix, 30000);
    setInterval(atualizarCarrosselEnergia, 4000);

})();
/// ==============================================================
/// ⚡ MOTOR ZABBIX + MAPA OPERACIONAL REAL (VERSÃO NOC)
/// ==============================================================

/* ==================================================
   🌍 BASE DE DADOS DE POPs (EXISTENTE)
   - Usa exactCoords (já definido no projeto)
================================================== */

const basePOPs = Object.entries(exactCoords).map(([nome, coord]) => {
    const uf = nome.split("-")[0];
    return {
        nomeOriginal: nome,
        nomeKey: nome.toUpperCase(),
        uf,
        lat: coord[0],
        lng: coord[1]
    };
});

/* ==================================================
   🔗 CORRELAÇÃO ZABBIX × POP REAL
================================================== */

function correlacionarAlarmesComPOPs() {
    const mapa = {};

    basePOPs.forEach(pop => {
        mapa[pop.nomeKey] = {
            ...pop,
            alarmes: [],
            maxPriority: 0
        };
    });

    window.alarmesZabbix.forEach(al => {
        const host = al.host?.toUpperCase();
        if (!host) return;

        const pop = basePOPs.find(p => host.includes(p.nomeKey.split(" ")[0]));
        if (!pop) return;

        const ref = mapa[pop.nomeKey];
        ref.alarmes.push(al);
        ref.maxPriority = Math.max(ref.maxPriority, al.priority || 0);
    });

    return mapa;
}

/* ==================================================
   🧭 AGREGAÇÃO POR UF (ESTADO REAL)
================================================== */

function calcularEstadoPorUF() {
    const pops = correlacionarAlarmesComPOPs();
    const ufs = {};

    Object.values(pops).forEach(pop => {

        if (!ufs[pop.uf]) {
            ufs[pop.uf] = {
                totalPOPs: 0,
                popsComAlarme: 0,
                maxPriority: 0
            };
        }

        ufs[pop.uf].totalPOPs++;

        if (pop.alarmes.length > 0) {
            ufs[pop.uf].popsComAlarme++;
            ufs[pop.uf].maxPriority = Math.max(
                ufs[pop.uf].maxPriority,
                pop.maxPriority
            );
        }
    });

    return ufs;
}

/* ==================================================
   🗺️ RENDER MAPA OPERACIONAL (CARD)
================================================== */

function renderMapaOperacional() {
    const container = document.getElementById("container-grafico-vdc");
    if (!container) return;

    const ufs = calcularEstadoPorUF();

    container.innerHTML = `
        <div class="mapa-grid">
            ${Object.entries(ufs).map(([uf, d]) => {

                let estado = "normal";
                if (d.maxPriority >= 4) estado = "critico";
                else if (d.popsComAlarme > 0) estado = "atencao";

                return `
                    <div class="uf-card ${estado}">
                        <strong>${uf}</strong>
                        <small>${d.popsComAlarme}/${d.totalPOPs}</small>
                    </div>
                `;
            }).join("")}
        </div>
    `;
}


/* ==================================================
   🧭 MAPA OPERACIONAL – REATIVO AO ZABBIX (FINAL)
================================================== */

(function () {

    function construirMapaOperacional() {
        const container = document.getElementById("container-grafico-vdc");
        if (!container) return;

        if (!window.alarmesZabbix || !window.exactCoords) {
            console.warn("⚠️ Dados insuficientes para mapa");
            return;
        }

        const pops = Object.entries(exactCoords).map(([nome, coord]) => {
            const uf = nome.split("-")[0];
            return {
                nomeKey: nome.toUpperCase(),
                uf,
                alarmes: []
            };
        });

        // 🔗 correlaciona alarmes reais
        window.alarmesZabbix.forEach(al => {
            const host = al.host?.toUpperCase() || "";
            const pop = pops.find(p => host.includes(p.nomeKey.split(" ")[0]));
            if (pop) pop.alarmes.push(al);
        });

        // 📊 agrega por UF
        const porUF = {};
        pops.forEach(p => {
            if (!porUF[p.uf]) {
                porUF[p.uf] = { total: 0, alarmados: 0, critico: false };
            }

            porUF[p.uf].total++;

            if (p.alarmes.length > 0) {
                porUF[p.uf].alarmados++;
                if (p.alarmes.some(a => a.priority >= 4)) {
                    porUF[p.uf].critico = true;
                }
            }
        });

        // 🗺️ render
        container.innerHTML = `
            <div class="mapa-grid">
                ${Object.entries(porUF).map(([uf, d]) => `
                    <div class="uf-card ${
                        d.critico ? "critico" :
                        d.alarmados ? "atencao" : "normal"
                    }">
                        <strong>${uf}</strong>
                        <small>${d.alarmados}/${d.total}</small>
                    </div>
                `).join("")}
            </div>
        `;
    }

    // 🔔 escuta o evento REAL do motor
    window.addEventListener("zabbix:update", construirMapaOperacional);

})();
