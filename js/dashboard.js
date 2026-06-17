// ==============================================================
// 🔐 MANUTENÇÃO: NAVEGAÇÃO COM TRAVA DE ACESSO (VERSÃO PRO)
// ==============================================================
function showPage(id) {
    // 1. BLOQUEIO DE SEGURANÇA: Área de Acesso Pops
    if (id === 'acessopops') {
        const senhaAcesso = prompt("ÁREA RESTRITA: Digite a senha de administrador para acessar:");
        
        // Validação com a senha definida por você (123)
        if (senhaAcesso !== "123") {
            alert("❌ Senha incorreta! Acesso negado pela auditoria do NOC.");
            return; // Corta a jogada aqui mesmo
        }
    }

    // 2. TRANSIÇÃO DE TELAS (LIMPEZA DE CAMPO)
    document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
    
    const el = document.getElementById(id);
    if(el) {
        el.classList.add("active");
    }

    // Carrega usuários ao abrir página admin
    if (id === 'usuariosPage' && typeof carregarUsuarios === "function") {
        carregarUsuarios();
    }

    // Destaca item ativo no menu
    document.querySelectorAll(".sidebar li").forEach(li => li.classList.remove("active-item"));
    const navEl = document.getElementById("nav-" + id);
    if (navEl) navEl.classList.add("active-item");

    // 3. RE-GATILHO DE MAPA E CLIMA (Garante que o radar não suma)
    if(id === 'home') {
        setTimeout(() => {
            if (typeof map !== 'undefined' && map !== null) {
                map.invalidateSize();
            }
            if (typeof window.carregarClimaNOC === "function") {
                window.carregarClimaNOC();
            }
        }, 200);
    }
}

// ==============================================================
// 🛠️ CONTROLE DE SUBMENUS E EXPANSÕES (ZAGA BLINDADA)
// ==============================================================
function toggleSubMenu(id) { 
    const el = document.getElementById(id);
    if(el) el.style.display = (el.style.display === 'block') ? 'none' : 'block'; 
}

function togglePopDetails(id) { 
    const el = document.getElementById(id);
    if(!el) return;
    const isV = el.style.display === 'table-row';
    document.querySelectorAll('.pop-details').forEach(d => d.style.display = 'none');
    el.style.display = isV ? 'none' : 'table-row';
}

function toggleGeradorDetails(id) {
    const el = document.getElementById(id);
    if(!el) return;
    const isV = el.style.display === 'table-row';
    document.querySelectorAll('.gerador-details').forEach(d => d.style.display = 'none');
    el.style.display = isV ? 'none' : 'table-row';
}

// 🔋 SOLUÇÃO DEFINITIVA: FUNÇÃO PARA ABRIR OS DETALHES DAS BATERIAS
function toggleBateriaDetails(id) {
    const el = document.getElementById(id);
    if(!el) {
        console.error("NOC: Erro ao localizar o banco de baterias!", id);
        return;
    }
    const isVisible = el.style.display === 'table-row';
    
    // Fecha as outras abas para o painel não ficar bagunçado
    document.querySelectorAll('.bateria-details').forEach(d => d.style.display = 'none');
    
    // Mostra o Raio-X da bateria selecionada
    el.style.display = isVisible ? 'none' : 'table-row';
}