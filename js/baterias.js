// Armazena os dados carregados para uso nas exportações
window._dadosBaterias = [];

async function carregarBaterias() {
    const tbody = document.querySelector("#tabelaBaterias tbody");
    if (!tbody) return;

    const dados = await carregarDadosPlanilha();
    window._dadosBaterias = dados;

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

function toggleBateriaDetails(id) {
    const el = document.getElementById(id);
    if (!el) return;
    const visivel = el.style.display === 'table-row';
    document.querySelectorAll('[id^="bat-"]').forEach(r => r.style.display = 'none');
    el.style.display = visivel ? 'none' : 'table-row';
}

// ── Filtro de busca ────────────────────────────────────────────
function autoFiltro() {
    const termo = document.getElementById("inputAutoBusca").value.toLowerCase();
    document.querySelectorAll("#tabelaBaterias tbody tr.pop-row").forEach(tr => {
        tr.style.display = tr.innerText.toLowerCase().includes(termo) ? "" : "none";
    });
}

// ── Exportar Excel ─────────────────────────────────────────────
function exportarBateriasExcel() {
    const dados = window._dadosBaterias;
    if (!dados || dados.length === 0) {
        alert("Nenhum dado carregado para exportar.");
        return;
    }

    const linhas = dados.map(p => ({
        "POP": p.POP,
        "Saúde (%)": p.Saude,
        "Tensão DC (V)": p.VDC,
        "Tipo": p.Tipo,
        "Fabricação": p.Ano,
        "Autonomia (h)": p.Autonomia,
        "Monitoramento": p.Monitoramento,
        "Status": p.Status
    }));

    const ws = XLSX.utils.json_to_sheet(linhas);

    // Largura das colunas
    ws["!cols"] = [
        { wch: 35 }, { wch: 12 }, { wch: 15 },
        { wch: 20 }, { wch: 12 }, { wch: 15 },
        { wch: 15 }, { wch: 12 }
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Baterias");

    const data = new Date().toLocaleDateString("pt-BR").replace(/\//g, "-");
    XLSX.writeFile(wb, `Baterias_POPs_${data}.xlsx`);
}

// ── Exportar PDF ───────────────────────────────────────────────
function exportarBateriasPDF() {
    const dados = window._dadosBaterias;
    if (!dados || dados.length === 0) {
        alert("Nenhum dado carregado para exportar.");
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

    const data = new Date().toLocaleDateString("pt-BR");
    const hora = new Date().toLocaleTimeString("pt-BR");

    // Cabeçalho
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, 297, 297, "F");

    doc.setTextColor(0, 210, 255);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("NOC INFRAESTRUTURA", 14, 16);

    doc.setFontSize(11);
    doc.setTextColor(200, 200, 200);
    doc.text("Gestão de Baterias — 76 POPs", 14, 24);

    doc.setFontSize(9);
    doc.setTextColor(148, 163, 184);
    doc.text(`Gerado em: ${data} às ${hora}`, 14, 31);
    doc.text(`Total de registros: ${dados.length}`, 200, 31);

    // Linha separadora
    doc.setDrawColor(0, 210, 255);
    doc.setLineWidth(0.5);
    doc.line(14, 34, 283, 34);

    // Tabela
    const colunas = ["POP", "Saúde (%)", "Vdc (V)", "Tipo", "Fabricação", "Autonomia (h)", "Monitoramento", "Status"];
    const linhas = dados.map(p => [
        p.POP,
        `${p.Saude}%`,
        `${p.VDC}V`,
        p.Tipo || "—",
        p.Ano || "—",
        p.Autonomia ? `${p.Autonomia}h` : "—",
        p.Monitoramento || "—",
        p.Status || "—"
    ]);

    doc.autoTable({
        startY: 38,
        head: [colunas],
        body: linhas,
        styles: {
            fontSize: 8,
            cellPadding: 3,
            textColor: [226, 232, 240],
            fillColor: [15, 23, 42],
            lineColor: [30, 41, 59],
            lineWidth: 0.3
        },
        headStyles: {
            fillColor: [0, 60, 80],
            textColor: [0, 210, 255],
            fontStyle: "bold",
            fontSize: 8.5
        },
        alternateRowStyles: {
            fillColor: [11, 19, 32]
        },
        didParseCell(data) {
            if (data.section === "body" && data.column.index === 1) {
                const val = parseFloat(data.cell.raw);
                data.cell.styles.textColor = val < 92 ? [250, 204, 21] : [34, 197, 94];
                data.cell.styles.fontStyle = "bold";
            }
            if (data.section === "body" && data.column.index === 7) {
                const val = (data.cell.raw || "").toUpperCase();
                data.cell.styles.textColor = val === "NORMAL" ? [34, 197, 94] : [239, 68, 68];
                data.cell.styles.fontStyle = "bold";
            }
        },
        margin: { left: 14, right: 14 }
    });

    // Rodapé
    const totalPaginas = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPaginas; i++) {
        doc.setPage(i);
        doc.setFontSize(7);
        doc.setTextColor(100, 116, 139);
        doc.text(`Página ${i} de ${totalPaginas}  |  NOC Infraestrutura — Dionatan Lima`, 14, doc.internal.pageSize.height - 5);
    }

    const dataArq = data.replace(/\//g, "-");
    doc.save(`Baterias_POPs_${dataArq}.pdf`);
}
