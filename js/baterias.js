async function carregarBaterias() {
    const tbody = document.querySelector("#tabelaBaterias tbody");
    if (!tbody) return;

    const dados = await carregarDadosPlanilha();

    tbody.innerHTML = dados.map((p, i) => `
        <tr class="pop-row" onclick="toggleBateriaDetails('bat-${i}')" style="cursor:pointer">
            <td><strong>${p.POP}</strong></td>
            <td class="${p.Saude < 92 ? 'text-warning' : 'text-success'} fw-bold">${p.Saude}%</td>
            <td class="text-title-cyan">${p.VDC}V</td>
        </tr>

        <tr id="bat-${i}" style="display:none;background:#0f172a;">
            <td colspan="3">
                <div class="p-3 border-start border-info" style="background:rgba(30,41,59,0.5);border-radius:0 8px 8px 0;">
                    <div class="row">
                        <div class="col-md-6">
                            <p><b>🔋 TIPO:</b> ${p.Tipo}</p>
                            <p><b>📅 FABRICAÇÃO:</b> ${p.Ano}</p>
                            <p><b>⏳ AUTONOMIA:</b> <span class="text-title-yellow">${p.Autonomia}h</span></p>
                        </div>
                        <div class="col-md-6">
                            <p><b>🔌 MONITORAMENTO:</b> ${p.Monitoramento === "ATIVO" ? "🟢 ATIVO" : "🔴 INATIVO"}</p>
                            <p><b>🛡️ STATUS:</b> 
                                <span class="${p.Status === 'NORMAL' ? 'text-success' : 'text-danger'}">
                                    ${p.Status}
                                </span>
                            </p>
                        </div>
                    </div>
                </div>
            </td>
        </tr>
    `).join("");
}
