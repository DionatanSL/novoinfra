// ==================================================

const alarmesTeste = [
  { estado: 'BA', texto: 'BA - POP SSA sem energia' },
  { estado: 'BA', texto: 'BA - Link DWDM rompido' },
  { estado: 'ES', texto: 'ES - OLT offline' },
  { estado: 'RJ', texto: 'RJ - ICMP indisponível' }
];
function clicouEstado(uf) {
  const modal = document.getElementById('modalZabbixGlobal');
  const lista = document.getElementById('lista-alarmes-zabbix');

  modal.style.display = 'flex';
  lista.innerHTML = '';

  const filtrados = alarmesTeste.filter(a => a.estado === uf);

  if (filtrados.length === 0) {
    lista.innerHTML = `<p style="color:#22c55e;text-align:center">Nenhum alarme em ${uf}</p>`;
    return;
  }

  filtrados.forEach(a => {
    const div = document.createElement('div');
    div.style.padding = '10px';
    div.style.borderBottom = '1px solid #334155';
    div.style.color = 'white';
    div.innerText = a.texto;
    lista.appendChild(div);
  });
}

// 🚨 ZABBIX → ALARMES POR ESTADO (SIMPLES E SEGURO)
// ==================================================

(function () {

    function getAlarmes() {
        return Array.isArray(window.alarmesZabbix)
            ? window.alarmesZabbix
            : [];
    }

    function agruparPorEstado() {
        const porUF = {};

        getAlarmes().forEach(a => {
            if (!a.host) return;
            const uf = a.host.substring(0, 2);
            if (!porUF[uf]) porUF[uf] = [];
            porUF[uf].push(a);
        });

        return porUF;
    }

    // ============================
    // BOTÕES DOS ESTADOS
    // ============================
    window.montarBotoesEstados = function () {
        const container = document.getElementById("botoes-estados");
        if (!container) return;

        const porUF = agruparPorEstado();

        container.innerHTML = Object.keys(porUF).map(uf => `
            <button
                class="btn-estado ${porUF[uf].length ? "alarme" : ""}"
                onclick="mostrarAlarmesEstado('${uf}')"
            >
                ${uf} (${porUF[uf].length})
            </button>
        `).join("");
    };

    // ============================
    // LISTA DE ALARMES
    // ============================
    window.mostrarAlarmesEstado = function (uf) {
        const painel = document.getElementById("lista-alarmes");
        if (!painel) return;

        const alarmes = getAlarmes().filter(a =>
            a.host && a.host.startsWith(uf + "-")
        );

        painel.innerHTML = `
            <h3>Alarmes - ${uf}</h3>
            ${alarmes.length
                ? alarmes.map(a => `
                    <div class="linha-alarme p${a.priority || 1}">
                        <strong>${a.host}</strong><br>
                        ${a.msg || "Falha sem descrição"}
                    </div>
                `).join("")
                : `<p style="color:#22c55e;">✔ Nenhum alarme ativo</p>`
            }
        `;
    };

    // ============================
    // ESCUTA O MOTOR DO ZABBIX
    // ============================
    window.addEventListener("zabbix:update", montarBotoesEstados);

})();
