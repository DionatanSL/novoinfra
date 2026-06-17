// ── Acessos via Firestore ──────────────────────────────────────
let dbAcessos = [];
let currentPage = 1;
let _dbFirestore = null;

async function getDB() {
    if (_dbFirestore) return _dbFirestore;
    const { initializeApp, getApps } = await import("https://www.gstatic.com/firebasejs/11.9.0/firebase-app.js");
    const { getFirestore } = await import("https://www.gstatic.com/firebasejs/11.9.0/firebase-firestore.js");
    if (!getApps().length) initializeApp(window.firebaseConfig);
    _dbFirestore = getFirestore();
    return _dbFirestore;
}

async function registrarAcesso() {
    const tec   = document.getElementById("tecNome").value;
    const pop   = document.getElementById("tecPop").value;
    const chave = document.getElementById("tecChave").value;
    const coord = document.getElementById("tecCoordenador").value;
    const motivo= document.getElementById("tecMotivo").value;

    if (!tec || !pop || !coord) return alert("Selecione Técnico, POP e Coordenador!");

    const registro = {
        id:         Date.now(),
        nome:       tec,
        pop:        pop,
        chave:      chave,
        coordenador: coord,
        motivo:     motivo,
        status:     "Pendente",
        entrada:    new Date().toLocaleString(),
        entradaPor: loggedUser || "admin"
    };

    try {
        const db = await getDB();
        const { collection, addDoc } = await import("https://www.gstatic.com/firebasejs/11.9.0/firebase-firestore.js");
        await addDoc(collection(db, "acessos"), registro);
        await carregarTabelaAcessosFirestore();
    } catch (err) {
        console.error("Erro ao registrar acesso:", err);
        alert("Erro ao salvar. Verifique a conexão.");
    }
}

async function carregarTabelaAcessosFirestore() {
    try {
        const db = await getDB();
        const { collection, getDocs, orderBy, query } = await import("https://www.gstatic.com/firebasejs/11.9.0/firebase-firestore.js");
        const q    = query(collection(db, "acessos"), orderBy("id", "desc"));
        const snap = await getDocs(q);
        dbAcessos  = snap.docs.map(d => ({ docId: d.id, ...d.data() }));
        carregarTabelaAcessos();
    } catch (err) {
        console.error("Erro ao carregar acessos:", err);
    }
}

async function confirmarEntrega(docId) {
    try {
        const db = await getDB();
        const { doc, updateDoc } = await import("https://www.gstatic.com/firebasejs/11.9.0/firebase-firestore.js");
        await updateDoc(doc(db, "acessos", docId), {
            status:  "Entregue",
            saida:   new Date().toLocaleString(),
            saidaPor: loggedUser || "admin"
        });
        await carregarTabelaAcessosFirestore();
    } catch (err) {
        console.error("Erro ao confirmar entrega:", err);
    }
}

function carregarTabelaAcessos() {
    const tbody = document.getElementById("corpoAcessos");
    if (!tbody) return;

    const inicio     = (currentPage - 1) * 10;
    const itensPagina = dbAcessos.slice(inicio, inicio + 10);

    tbody.innerHTML = itensPagina.map(a => `
        <tr class="${a.status === 'Pendente' ? 'row-pendente' : 'row-entregue'}">
            <td>${a.nome}</td>
            <td>${a.pop}</td>
            <td>${a.chave}</td>
            <td><strong>${a.coordenador}</strong></td>
            <td>${a.motivo}</td>
            <td style="font-size:0.75rem">${a.entrada}<br><small class="user-tag">NOC: ${a.entradaPor}</small></td>
            <td style="text-align:center">
                ${a.status === 'Pendente'
                    ? `<input type="checkbox" class="check-box" onchange="confirmarEntrega('${a.docId}')">`
                    : `<span style="color:#10b981">✔ ${a.saida || ''}</span><br><small class="user-tag">NOC: ${a.saidaPor || ''}</small>`}
            </td>
        </tr>`).join('');

    renderPagi(Math.ceil(dbAcessos.length / 10) || 1);
}
// ==============================================================
// FIM DO BLOCO DE GESTÃO DE CHAVES
// ==============================================================
function renderPagi(t) {
    let h = '<button class="page-btn" onclick="currentPage=Math.max(1,currentPage-1);carregarTabelaAcessos()">«</button>';
    for (let i = 1; i <= Math.min(t, 5); i++) h += `<button class="page-btn ${i === currentPage ? 'active' : ''}" onclick="currentPage=${i};carregarTabelaAcessos()">${i}</button>`;
    h += '<button class="page-btn" onclick="currentPage=Math.min(t,currentPage+1);carregarTabelaAcessos()">»</button>';
    document.getElementById("paginacao").innerHTML = h;
}

// ==============================================================
// MANUTENÇÃO: LIMPEZA DE ACESSOS COM TRAVA DE SEGURANÇA (ADMIN)
// ==============================================================
async function limparAcessos() {
    if (!confirm("🚨 Deseja apagar os registros ENTREGUES e manter os Pendentes?")) return;

    try {
        const db = await getDB();
        const { collection, getDocs, deleteDoc, doc, query, where }
            = await import("https://www.gstatic.com/firebasejs/11.9.0/firebase-firestore.js");

        const q    = query(collection(db, "acessos"), where("status", "==", "Entregue"));
        const snap = await getDocs(q);
        const dels = snap.docs.map(d => deleteDoc(doc(db, "acessos", d.id)));
        await Promise.all(dels);
        await carregarTabelaAcessosFirestore();
        alert(`✅ ${dels.length} registro(s) entregues removidos.`);
    } catch (err) {
        console.error("Erro ao limpar acessos:", err);
        alert("Erro ao limpar. Tente novamente.");
    }
}
/// ==============================================================
// FUNÇÃO PARA EXPORTAR PARA EXCEL (CSV)
// ==============================================================
function exportarAcessos() {
    if(typeof dbAcessos === 'undefined' || dbAcessos.length === 0) return alert("Nenhum dado encontrado para exportar!");

    let csv = "\uFEFFNome;POP;Chave;Coordenador;Motivo;Entrada;Saída;Status\n";
    
    dbAcessos.forEach(a => {
        csv += `${a.nome};${a.pop};${a.chave};${a.coordenador};${a.motivo};${a.entrada};${a.saida || '---'};${a.status}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", "relatorio_acessos_noc.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// ==============================================================
// 🔥 CONEXÃO COM O FIRESTORE (Firebase)
// ==============================================================
window.bancoBaterias = {};

async function conectarPlanilha() {
    try {
        console.log("🔥 Buscando baterias do Firestore...");

        const { initializeApp, getApps } = await import("https://www.gstatic.com/firebasejs/11.9.0/firebase-app.js");
        const { getFirestore, collection, getDocs } = await import("https://www.gstatic.com/firebasejs/11.9.0/firebase-firestore.js");

        if (!getApps().length) {
            initializeApp(window.firebaseConfig);
        }

        const db   = getFirestore();
        const snap = await getDocs(collection(db, "baterias"));

        window.bancoBaterias = {};
        snap.forEach(doc => {
            const d = doc.data();
            window.bancoBaterias[d.pop] = {
                saude:     d.saude     ?? 0,
                vdc:       d.vdc       ?? 0,
                ano:       d.ano       || "—",
                tipo:      d.tipo      || "—",
                autonomia: d.autonomia ?? 0,
                bancos:    d.bancos    ?? 0,
                monitor:   d.monitoramento || "—",
                bms:       d.bms       || "—"
            };
        });

        console.log("✅ Baterias carregadas do Firestore:", Object.keys(window.bancoBaterias).length);

        carregarTabelaBaterias();

        if (typeof renderizarGraficoBaterias === 'function') {
            renderizarGraficoBaterias();
        }

    } catch (err) {
        console.error("❌ Erro ao buscar baterias do Firestore:", err);
    }
}

function carregarTabelaBaterias() {
    const tbody = document.querySelector("#tabelaBaterias tbody");
    if (!tbody) return;

    const itens = Object.keys(window.bancoBaterias);
    
    if (itens.length === 0) {
        tbody.innerHTML = "<tr><td colspan='3'>Nenhum dado encontrado...</td></tr>";
        return;
    }

    tbody.innerHTML = itens.map((pop, i) => {
        const d = window.bancoBaterias[pop];
        return `
            <tr style="cursor:pointer" onclick="this.nextElementSibling.style.display = (this.nextElementSibling.style.display === 'none' ? 'table-row' : 'none')">
                <td><strong>${pop}</strong></td>
                <td class="${parseInt(d.saude) < 92 ? 'text-warning' : 'text-success'} fw-bold">${d.saude}%</td>
                <td class="text-title-cyan">${d.vdc}V</td>
            </tr>
            <tr style="display:none; background: #1e293b;">
                <td colspan="3">
                    <div class="p-2" style="font-size: 0.8rem; border-left: 3px solid #00d2ff;">
                        🧪 TIPO: ${d.tipo} | 📅 ANO: ${d.ano} | ⏳ AUTONOMIA: ${d.autonomia}h<br>
                        🔌 MONITOR: ${d.monitor} | 🛡️ BMS: ${d.bms}
                    </div>
                </td>
            </tr>`;
    }).join('');
}

// ==============================================================
// 📊 DATABASE - POPS (Google Sheets CSV)
// ==============================================================

// Inicia conexão (mantido)
if (typeof conectarPlanilha === 'function') {
    conectarPlanilha();
}

// 🔗 Link base da planilha
// 🌐 Variáveis globais
window.popsList    = [];
window.detalhesPops = {};

// ==============================================================
// 🔥 SINCRONIZAÇÃO DE POPs VIA FIRESTORE
// ==============================================================
async function sincronizarPopsFinal() {
    try {
        console.log("🔥 Buscando POPs do Firestore...");

        const { initializeApp, getApps } = await import("https://www.gstatic.com/firebasejs/11.9.0/firebase-app.js");
        const { getFirestore, collection, getDocs } = await import("https://www.gstatic.com/firebasejs/11.9.0/firebase-firestore.js");

        if (!getApps().length) {
            initializeApp(window.firebaseConfig);
        }

        const db   = getFirestore();
        const snap = await getDocs(collection(db, "pops"));

        window.popsList    = [];
        window.detalhesPops = {};

        snap.forEach(doc => {
            const d = doc.data();
            if (!d.pop) return;
            window.popsList.push(d.pop);
            window.detalhesPops[d.pop] = {
                ponto:        d.pop,
                instalacao:   d.instalacao   || "",
                eletrica:     d.forma        || "",
                titular:      d.titular      || "",
                cnpj:         d.cnpj         || "",
                contatos:     d.contatos     || "",
                endereco:     d.endereco     || "",
                monitoramento: d.monitoramento || ""
            };
        });

        console.log("✅ POPs carregados do Firestore:", window.popsList.length);

        if (typeof carregarPops === 'function')    carregarPops();
        if (typeof inicializarMapa === 'function') inicializarMapa();

    } catch (erro) {
        console.error("⚠️ Erro ao sincronizar POPs do Firestore:", erro);
    }
}

// ==============================================================
// 🧩 PROCESSAMENTO DO CSV
// ==============================================================
function processarCSV(csvText) {
    const linhas = csvText
        .split(/\r?\n/)
        .map(l => l.trim())
        .filter(Boolean);

    if (linhas.length < 2) return;

    const separador = linhas[0].includes(";") ? ";" : ",";

    window.popsList.length = 0;
    window.detalhesPops = {};

    for (let i = 1; i < linhas.length; i++) {
        const col = linhas[i]
            .split(separador)
            .map(v => v.replace(/^"|"$/g, "").trim());

        const nomePop = col[1];
        if (!nomePop) continue;

        window.popsList.push(nomePop);
        window.detalhesPops[nomePop] = {
            pop: col[1] || "---",             // B
            instalacao: col[2] || "---",      // C
            contatos: col[3] || "---",        // D
            forma: col[4] || "---",           // E
            titular: col[5] || "---",         // F
            cpf: col[6] || "---",             // G
            endereco: col[7] || "---",        // H
            monitoramento: col[8] || "---"    // I
        };
    }

    console.log(`✅ ${window.popsList.length} POPs carregados`);

    // Atualiza UI (mantido)
    if (typeof carregarPops === "function") carregarPops();
    if (typeof carregarMinimap === "function") carregarMinimap();
}

// ==============================================================
// 🚀 DISPARO INICIAL
// ==============================================================
sincronizarPopsFinal();

// ==============================================================
// 🔁 ATUALIZAÇÃO MANUAL (opcional)
// ==============================================================
window.atualizarPopsAgora = function () {
    localStorage.removeItem(CACHE_KEY_POPS);
    sincronizarPopsFinal();
};
