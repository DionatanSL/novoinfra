// ==============================================================
// 🧭 MAPA OPERACIONAL — VERSÃO FINAL BLINDADA (SP, ES, RJ, BA)
// ==============================================================

console.log("🧭 mapa-operacional.js carregado");

// 🔒 Estados permitidos (REGRA ABSOLUTA)
const ESTADOS_MAPA = ['SP', 'ES', 'RJ', 'BA'];

// ==============================================================
// 🗺️ FUNÇÃO PRINCIPAL (CHAMADA PELO SCRIPT.JS)
// ==============================================================

window.construirMapaOperacional = function (alarmes = []) {
    console.log("🗺️ Construindo mapa operacional");

    const mapa = document.getElementById('mapa-operacional');
    if (!mapa) {
        console.warn("⚠️ Elemento #mapa-operacional não encontrado");
        return;
    }

    // Limpa o mapa sempre
    mapa.innerHTML = '';

    // =============================
    // 🔎 AGRUPAMENTO POR ESTADO
    // =============================

    const alarmesPorEstado = {
        SP: [],
        ES: [],
        RJ: [],
        BA: []
    };

    alarmes.forEach(al => {
        const uf = (al.uf || al.estado || '').toUpperCase().trim();

        // 🚫 BLOQUEIA TUDO QUE NÃO FOR OS 4 ESTADOS
        if (!ESTADOS_MAPA.includes(uf)) return;

        alarmesPorEstado[uf].push(al);
    });

    // =============================
    // 🎨 RENDERIZAÇÃO DO MAPA
    // =============================

    ESTADOS_MAPA.forEach(uf => {
        const qtd = alarmesPorEstado[uf].length;

        const bloco = document.createElement('div');
        bloco.className = 'estado-bloco ' + (qtd > 0 ? 'estado-critico' : 'estado-ok');

        bloco.innerHTML = `
            <div class="estado-sigla">${uf}</div>
            <div class="estado-qtd">${qtd} alarmes</div>
        `;

        mapa.appendChild(bloco);
    });

    console.log("✅ Mapa operacional renderizado:", alarmesPorEstado);
};

// ==============================================================
// 🧱 CSS DE SEGURANÇA (CASO NÃO EXISTA NO PROJETO)
// ==============================================================

(function injectCSS() {
    if (document.getElementById('css-mapa-operacional')) return;

    const style = document.createElement('style');
    style.id = 'css-mapa-operacional';
    style.innerHTML = `
        #mapa-operacional {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 12px;
            margin-top: 15px;
        }

        .estado-bloco {
            padding: 14px;
            border-radius: 10px;
            text-align: center;
            font-family: Arial, sans-serif;
            box-shadow: 0 4px 10px rgba(0,0,0,.25);
            transition: transform .2s ease;
        }

        .estado-bloco:hover {
            transform: scale(1.05);
        }

        .estado-ok {
            background: linear-gradient(135deg, #0f766e, #0d9488);
            color: #eafffa;
        }

        .estado-critico {
            background: linear-gradient(135deg, #7f1d1d, #dc2626);
            color: #fff;
            animation: pulse 1.5s infinite;
        }

        .estado-sigla {
            font-size: 26px;
            font-weight: bold;
        }

        .estado-qtd {
            margin-top: 6px;
            font-size: 14px;
            opacity: .9;
        }

        @keyframes pulse {
            0% { box-shadow: 0 0 0 rgba(220,38,38,.6); }
            70% { box-shadow: 0 0 25px rgba(220,38,38,.8); }
            100% { box-shadow: 0 0 0 rgba(220,38,38,.6); }
        }
    `;
    document.head.appendChild(style);
})();
