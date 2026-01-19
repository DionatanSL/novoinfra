


// ==============================================================
// 📡 INVENTÁRIO DE POPS: MOTOR DE AUDITORIA E GEOLOCALIZAÇÃO
// ==============================================================

// ==============================================================
// 🛠️ MOTOR DE MAPEAMENTO E BOTÕES (VERSÃO CORRIGIDA)
// ==============================================================

// Função auxiliar para normalizar nomes e evitar erros de "nome não encontrado"
function normalizarNome(nome) {
    return nome.toUpperCase()
               .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Remove acentos
               .replace(/[^A-Z0-9]/g, ''); // Mantém apenas letras e números
}

// ==============================================================
// 🛠️ MOTOR DE BUSCA INTELIGENTE (RESOLUÇÃO DE CONFLITOS)
// ==============================================================

// Extrai apenas o ID (ex: ES-ACZ-A01) para garantir o match
function extrairID(nome) {
    if (!nome) return "";
    // Pega tudo antes do primeiro espaço ou parênteses e limpa símbolos
    return nome.split(/[\s\(]/)[0].toUpperCase().replace(/[^A-Z0-9-]/g, '');
}

// ==============================================================
// 🛠️ MOTOR DE BUSCA POR CÓDIGO (DIONATAN LIMA - NOC BLINDADO)
// ==============================================================

// Extrai apenas o ID (ex: ES-ACZ-A01) para garantir o funcionamento
function obterCodigoId(nome) {
    if (!nome) return "";
    // Pega a primeira parte antes do espaço ou parênteses
    return nome.split(/[\s\(]/)[0].trim().toUpperCase();
}

/// 🛠️ FUNÇÃO AUXILIAR: Normaliza o nome para evitar erros de sincronia
// 1. Função de Limpeza Profunda (Normalização)
function normalizar(texto) {
    if (!texto) return "";
    return texto.toString()
        .toUpperCase()                              // Tudo em maiúsculo
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Remove acentos
        .replace(/[^A-Z0-9]/g, "")                 // Remove TUDO que não for letra ou número
        .trim();
}

function carregarPops() { 
    const tbody = document.querySelector("#tabelaPops tbody");
    if(!tbody) return;
    
    tbody.innerHTML = popsList.map((p, i) => {
        const d = detalhesPops[p] || {};
        
        // 🔍 LÓGICA DE SINCRONIA (PARTE 1)
        // Normalizamos o nome do POP atual e buscamos no exatCoords um match normalizado
        const popNormalizado = normalizar(p.split(' ')[0]); // Foca no ID (Ex: ES-ACZ-A01)
        
        const chaveCoords = Object.keys(exactCoords).find(key => {
            return normalizar(key.split(' ')[0]) === popNormalizado;
        });

        const coordenadas = exactCoords[chaveCoords];

        const infoHtml = `
            <div class="audit-details" style="background: #0f172a; padding: 15px; border-radius: 8px; border-left: 4px solid #00c3ff; margin-top: 10px; color: #fff;">
                <p class="detail-text" style="margin-bottom: 5px;"><b>📍 Ponto:</b> ${d.ponto || p}</p>
                <p class="detail-text" style="margin-bottom: 5px;"><b>🔌 Instalação:</b> ${d.instalacao || ''} | <b>⚡ Elétrica:</b> ${d.eletrica || ''}</p>
                <p class="detail-text" style="margin-bottom: 5px;"><b>🏢 Titular:</b> ${d.titular || ''} | <b>📜 CNPJ:</b> ${d.cnpj || ''}</p>
                <p class="detail-text" style="margin-bottom: 5px;"><b>📞 Contatos:</b> ${d.contatos || ''}</p>
                <p class="detail-text" style="margin-bottom: 5px;"><b>🏠 Endereço:</b> ${d.endereco || ''}</p>
                <p class="detail-text" style="margin-bottom: 5px;"><b>🖥️ Monitoramento:</b> ${d.monitoramento || ''}</p>
            </div>
        `;

        return `
            <tr class="pop-row" onclick="togglePopDetails('details-${i}')" style="cursor: pointer;">
                <td><strong>${p}</strong></td>
                <td><span class="text-success fw-bold">✔ ONLINE</span></td>
            </tr>
            <tr id="details-${i}" class="pop-details" style="display:none">
                <td colspan="2">
                    ${infoHtml}
                    <div class="mt-3">
                        <button class="btn-marca" onclick="event.stopPropagation(); focarNoMapa('${p}', '${chaveCoords}')" style="background: #00d2ff; color: #000; border: none; padding: 5px 15px; border-radius: 4px; font-weight: bold; cursor: pointer;">🎯 MAPA</button>
                        
                        ${coordenadas ? `
                        <button class="btn-marca" onclick="event.stopPropagation(); copiarLinkMaps(${coordenadas[0]}, ${coordenadas[1]})" style="background: #4285F4; color: #fff; border: none; padding: 5px 15px; border-radius: 4px; font-weight: bold; margin-left: 10px; cursor: pointer;">
                            <i class="fas fa-copy"></i> GOOGLE MAPS
                        </button>` : ''}
                    </div>
                </td>
            </tr>`;
    }).join(''); 
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
// --- FUNÇÕES DE SUPORTE ---

function focarNoMapa(nomeOriginal, chaveCoords) {
    // Tenta encontrar o marcador pelo nome da lista, pelo nome do banco ou pelo ID normalizado
    const idBusca = normalizar(nomeOriginal);
    const chaveMarker = Object.keys(markers).find(k => normalizar(k) === idBusca);
    const marker = markers[nomeOriginal] || markers[chaveCoords] || markers[chaveMarker];

    if (marker) {
        map.setView(marker.getLatLng(), 16); 
        marker.openPopup();
        document.getElementById('map').scrollIntoView({ behavior: 'smooth' });
    } else {
        console.warn("Marcador não encontrado para ID:", idBusca);
        alert("Marcador deste POP não encontrado no mapa.");
    }
}

function copiarLinkGoogleMaps(lat, lng) {
    const link = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    navigator.clipboard.writeText(link).then(() => {
        alert("✅ Link do Google Maps copiado para a área de transferência!");
    });
}

function togglePopDetails(id) {
    const el = document.getElementById(id);
    if (el) el.style.display = (el.style.display === "none" || el.style.display === "") ? "table-row" : "none";
}

// --- FUNÇÕES DE SUPORTE ---

function focarNoMapa(nomeOriginal, chaveCoords) {
    // Tenta achar o marcador no mapa de todas as formas (pelo nome ou pelo ID)
    let marker = markers[nomeOriginal] || markers[chaveCoords];
    
    if (!marker) {
        const idBusca = simplificarNome(nomeOriginal);
        const chaveReal = Object.keys(markers).find(k => simplificarNome(k) === idBusca);
        marker = markers[chaveReal];
    }

    if (marker) {
        map.setView(marker.getLatLng(), 16); 
        marker.openPopup();
        document.querySelector('#map').scrollIntoView({ behavior: 'smooth' });
    } else {
        alert("Localização física não encontrada no mapa interno.");
    }
}

function copiarGoogleMaps(chave) {
    const coords = exactCoords[chave];
    if (coords) {
        // Link oficial que abre o app no celular ou o site no PC
        const url = `https://www.google.com/maps/search/?api=1&query=${coords[0]},${coords[1]}`;
        
        navigator.clipboard.writeText(url).then(() => {
            alert("✅ Link do Google Maps copiado! Pode colar no WhatsApp ou Navegador.");
        });
    }
}

function togglePopDetails(id) {
    const el = document.getElementById(id);
    if (el) el.style.display = (el.style.display === "none" || el.style.display === "") ? "table-row" : "none";
}

// --- FUNÇÕES DE SUPORTE ---

function focarNoMapa(nomeOriginal, chaveCoords) {
    // Tenta achar o marcador pelo nome da lista ou pela chave da coordenada
    let marker = markers[nomeOriginal] || markers[chaveCoords];
    
    // Se não achar, tenta buscar pelo ID simplificado dentro dos marcadores
    if (!marker) {
        const idBusca = limparNomePop(nomeOriginal);
        const chaveReal = Object.keys(markers).find(k => limparNomePop(k) === idBusca);
        marker = markers[chaveReal];
    }

    if (marker) {
        map.setView(marker.getLatLng(), 16); 
        marker.openPopup();
        document.querySelector('#map').scrollIntoView({ behavior: 'smooth' });
    } else {
        alert("Marcador não encontrado no mapa. Verifique se o POP está cadastrado no mapa.");
    }
}

function copiarLinkGoogleMaps(chave) {
    const coords = exactCoords[chave];
    if (coords) {
        // Link direto para o Google Maps
        const url = `https://www.google.com/maps?q=${coords[0]},${coords[1]}`;
        
        navigator.clipboard.writeText(url).then(() => {
            alert("✅ Link do Google Maps copiado com sucesso!");
        }).catch(err => {
            console.error('Erro ao copiar link: ', err);
        });
    }
}

function togglePopDetails(id) {
    const el = document.getElementById(id);
    if (el) {
        el.style.display = (el.style.display === "none" || el.style.display === "") ? "table-row" : "none";
    }
}

// --- FUNÇÕES DE SUPORTE ---

function focarNoMapa(nomeTabela, chaveCoordenada) {
    // Tenta pelo nome completo ou pela chave da coordenada sincronizada
    let marker = markers[nomeTabela] || markers[chaveCoordenada];
    
    // Se ainda não achar, busca pelo Código ID dentro dos marcadores
    if (!marker) {
        const idBusca = obterCodigoId(nomeTabela);
        const chaveReal = Object.keys(markers).find(k => obterCodigoId(k) === idBusca);
        marker = markers[chaveReal];
    }

    if (marker) {
        map.setView(marker.getLatLng(), 16); 
        marker.openPopup();
        document.querySelector('#map').scrollIntoView({ behavior: 'smooth' });
    } else {
        alert("Marcador não carregado. Verifique se o código ID existe no mapa.");
    }
}

function copiarLinkGoogleMaps(chave) {
    const c = exactCoords[chave];
    if (c) {
        // Link universal do Google Maps
        const url = `https://www.google.com/maps?q=${c[0]},${c[1]}`;
        
        navigator.clipboard.writeText(url).then(() => {
            alert("✅ Link do Google Maps copiado para o seu técnico!");
        }).catch(err => {
            console.error("Erro ao copiar:", err);
        });
    }
}

function togglePopDetails(id) {
    const el = document.getElementById(id);
    if (el) el.style.display = (el.style.display === "none" || el.style.display === "") ? "table-row" : "none";
}

// --- FUNÇÕES DE CONTROLE ---

function focarNoMapa(nomeTabela, chaveCoordenada) {
    // Busca o marcador. Se não achar pelo nome completo, tenta pelo ID simplificado
    const idSimplificado = extrairID(nomeTabela);
    let marker = markers[nomeTabela] || markers[chaveCoordenada];
    
    if (!marker) {
        // Busca exaustiva nos marcadores pelo ID
        const chaveMarker = Object.keys(markers).find(k => extrairID(k) === idSimplificado);
        marker = markers[chaveMarker];
    }

    if (marker) {
        map.setView(marker.getLatLng(), 16); 
        marker.openPopup();
        document.querySelector('#map').scrollIntoView({ behavior: 'smooth' });
    } else {
        console.error("Erro Mapa: Nome tabela:", nomeTabela, "ID:", idSimplificado);
        alert("Marcador visual não encontrado. Tente o botão 'GOOGLE MAPS' para abrir no navegador.");
    }
}

function copiarLinkMaps(chave) {
    const c = exactCoords[chave];
    if (c) {
        const url = `https://www.google.com/maps?q=${c[0]},${c[1]}`;
        navigator.clipboard.writeText(url).then(() => {
            alert("✅ Link do Google Maps copiado!");
        });
    }
}

// --- FUNÇÕES DE CONTROLE ---

function focarNoMapa(nomeTabela, chaveCoordenada) {
    // Tenta encontrar o marcador de todas as formas possíveis
    const marker = markers[nomeTabela] || markers[chaveCoordenada];
    
    if (marker) {
        map.setView(marker.getLatLng(), 16); 
        marker.openPopup();
        document.querySelector('#map').scrollIntoView({ behavior: 'smooth' });
    } else {
        alert("O marcador deste POP ainda não foi carregado no mapa. Verifique se o nome no exatCoords é idêntico ao marcador.");
    }
}

function copiarLinkMaps(chave) {
    const c = exactCoords[chave];
    if (c) {
        const lat = c[0];
        const lng = c[1];
        const url = `https://www.google.com/maps?q=${lat},${lng}`;
        
        // Comando moderno de cópia
        navigator.clipboard.writeText(url).then(() => {
            alert("✅ Link do Google Maps copiado!");
        }).catch(() => {
            // Backup caso o navegador bloqueie o clipboard
            const el = document.createElement('textarea');
            el.value = url;
            document.body.appendChild(el);
            el.select();
            document.execCommand('copy');
            document.body.removeChild(el);
            alert("✅ Link copiado!");
        });
    }
}

function togglePopDetails(id) {
    const el = document.getElementById(id);
    if (el) el.style.display = (el.style.display === "none" || el.style.display === "") ? "table-row" : "none";
}

// --- FUNÇÕES DE SUPORTE CORRIGIDAS ---

function focarNoMapa(nomeOriginal, chaveCoords) {
    // Tenta encontrar o marcador pelo nome da lista ou pelo nome da coordenada
    const marker = markers[nomeOriginal] || markers[chaveCoords];
    
    if (marker) {
        map.setView(marker.getLatLng(), 16); 
        marker.openPopup();
        document.querySelector('#map').scrollIntoView({ behavior: 'smooth' });
    } else {
        alert("Localização não mapeada visualmente. Use o botão 'COPIAR GOOGLE MAPS'.");
    }
}

function copiarLinkMaps(chave) {
    const c = exactCoords[chave];
    if (c) {
        const url = `https://www.google.com/maps?q=${c[0]},${c[1]}`;
        navigator.clipboard.writeText(url).then(() => {
            alert("✅ Link do Google Maps copiado com sucesso!");
        });
    }
}

function togglePopDetails(id) {
    const el = document.getElementById(id);
    if (el) el.style.display = (el.style.display === "none" || el.style.display === "") ? "table-row" : "none";
}

// --- FUNÇÕES DE SUPORTE ---

// 1. Função para focar o mapa no marcador
function focarNoMapa(nomePop) {
    if (typeof markers !== 'undefined' && markers[nomePop]) {
        const marker = markers[nomePop];
        map.setView(marker.getLatLng(), 16); 
        marker.openPopup();
        document.querySelector('#map').scrollIntoView({ behavior: 'smooth' });
    } else {
        alert("Marcador não encontrado no mapa para: " + nomePop);
    }
}

// 2. Função para copiar o link do Google Maps
function copiarLinkGoogleMaps(key) {
    const coords = exactCoords[key];
    if (coords) {
        const lat = coords[0];
        const lng = coords[1];
        const url = `https://www.google.com/maps?q=${lat},${lng}`;
        
        navigator.clipboard.writeText(url).then(() => {
            alert("Link do Google Maps copiado para a área de transferência!");
        }).catch(err => {
            console.error('Erro ao copiar: ', err);
        });
    }
}

// 3. Função para abrir/fechar detalhes
function togglePopDetails(id) {
    const el = document.getElementById(id);
    if (el) {
        el.style.display = (el.style.display === "none" || el.style.display === "") ? "table-row" : "none";
    }
}

// 📍 COORDENADAS INTEGRAIS
window.exactCoords = {'BA-EUS-A01 (EUNAPOLIS)': [-16.374662, -39.585704], 'BA-IBH-A01 (ITABELA)': [-16.57279, -39.557738], 'BA-IBTN-A01 (ITABATA)': [-18.008108, -39.861817], 'BA-IMJ-A01 (ITamaju)': [-17.026639, -39.538854], 'BA-TAF-A01 (LOJA)': [-17.551144, -39.729505], 'BA-TAF-A02 (HOTEL)': [-17.538654, -39.742205], 'ES-ACZ-A01 (ARACRUZ)': [-19.822545, -40.272434], 'ES-ACZ-A02 (COQUEIRAL)': [-19.931655, -40.147128], 'ES-ACZ-A04 (JACUPEMBA)': [-19.585053, -40.193742], 'ES-ACZ-A05 (BARRA DO RIACHO)': [-19.829555, -40.062154], 'ES-ACZ-A07 (GUARANA NOVO)': [-19.679979, -40.264969], 'ES-AHE-A01 (ANCHIETA)': [-20.811767, -40.633954], 'ES-ALR-A01 (POP ALEGRE)': [-20.764161, -41.531956], 'ES-AVQ-A01 (ATILIO VIVACQUA)': [-20.915943, -41.195779], 'ES-BDI-A02': [-18.761592, -40.892891], 'ES-CCA-A01 (POLITINTAS)': [-20.337618, -40.390493], 'ES-CCA-A02 (CONTORNO)': [-20.238288, -40.369419], 'ES-CIM-A03 (NOVO POP DE CACHOEIRO)': [-20.847965, -41.119641], 'ES-CIM-A04 (AEROPORTO)': [-20.835864, -41.180374], 'ES-CNA-A01 (COLATINA)': [-19.513981, -40.64476], 'ES-CRPN-A01 (CARAPINA)': [-20.215026, -40.268716], 'ES-CSE-A02 (CASTELO)': [-20.614943, -41.204592], 'ES-DGM-A03 (DOMINGOS MARTINS)': [-20.360587, -40.660184], 'ES-GRI-A01 (GUARAPARI)': [-20.66041, -40.500874], 'ES-GRI-A02 (GUARAPARI)': [-20.621919, -40.461439], 'ES-IIU-A01 (IBIRACU)': [-19.829213, -40.368768], 'ES-IOH-A01 (ICONHA)': [-20.794237, -40.809491], 'ES-JNV-A02': [-19.758935, -40.385583], 'ES-LNS-A01 (LINHARES)': [-19.400466, -40.065571], 'ES-LNS-A02': [-19.399466, -40.05832], 'ES-LNS-A03': [-19.35492, -40.061876], 'ES-MAFL-A01 (MARECHAL)': [-20.408973, -40.672868], 'ES-MRZS-A01 (MARATAIZES)': [-21.010776, -40.809641], 'ES-NOAL-A01 (NOVA ALMEIDA)': [-20.057748, -40.191579], 'ES-NVI-A04 (HOTEL/BTS)': [-18.707108, -40.392159], 'ES-PKO-A01 (PEDRO CANARIO)': [-18.301681, -39.956964], 'ES-PMA-A01 (PIUMA)': [-20.837413, -40.728706], 'ES-SEA-A03 (SERRA SEDE)': [-20.127635, -40.30758], 'ES-SEA-A07 (PORTO CANOA)': [-20.157964, -40.253327], 'ES-SEA-A08 (LARANJEIRAS)': [-20.200111, -40.254912], 'ES-SMT-A01 (SAO MATEUS)': [-18.716935, -39.861274], 'ES-SMT-A02 (GURIRI)': [-18.736588, -39.75655], 'ES-SORT-A01 (SORETAMA)': [-19.191433, -40.096052], 'ES-VIA-A02 (VIANA)': [-20.391646, -40.497256], 'ES-VNI-A01 (VENDA NOVA)': [-20.324244, -41.139179], 'ES-VTA-A00 (IX VITORIA)': [-20.311216, -40.30826], 'ES-VTA-A01 (LONDON)': [-20.311277, -40.290596], 'ES-VTA-A02 (TRADE)': [-20.31885, -40.330432], 'ES-VTA-A07 (RNP)': [-20.273267, -40.30433], 'ES-VTA-A08 (CHURRASCARIA)': [-20.308237, -40.292991], 'ES-VTA-A09 (SALAO)': [-20.295413, -40.294766], 'ES-VTA-A10 (BIKE)': [-20.28473, -40.291561], 'ES-VTA-A11 (VITORIA MALL)': [-20.27952, -40.293002], 'ES-VTA-A12 (LAGUNA)': [-20.285044, -40.298038], 'ES-VTA-A13 (CENTRO COMERCIAL SOUZA NEVES)': [-20.262401, -40.267213], 'ES-VTA-A14 (LARGO DO JARDI)': [-20.257083, -40.269224], 'ES-VTA-A15 (JARDIM CAMBURI)': [-20.249541, -40.272198], 'ES-VTA-A16 (DATACENTER VIPREDE-EMBRATEL)': [-20.321567, -40.337801], 'ES-VTA-A17 (PRODEST)': [-20.313427, -40.296794], 'ES-VTA-A18': [-20.319098, -40.335077], 'ES-VVA-A00 (VILLAGGIO ITAPARICA)': [-20.378245, -40.308944], 'ES-VVA-A02 (VILA PARK)': [-20.336428, -40.292108], 'ES-VVA-A03 (CAPUABA)': [-20.34023, -40.327547], 'ES-VVA-A06 (BOBS)': [-20.357999, -40.295304], 'ES-VVA-A07 (ITAPOÃ)': [-20.350796, -40.288131], 'ES-VVA-A08 (PRAIA DA COSTA)': [-20.341553, -40.285537], 'ES-VVA-A09 (GRAN CANAL)': [-20.333078, -40.279865], 'ES-VVA-A10': [-20.357265, -40.310954], 'ES-VVA-A11 (VARDINS VENEZA)': [-20.481094, -40.353875], 'ES-VVA-A12 (COBILANDIA)': [-20.354609, -40.354882], 'ES-VVA-A13 (JOCKEy)': [-20.382796, -40.315109], 'ES-VVA-A14 (BARRAMARES)': [-20.440275, -40.346294], 'ES-VVA-A15 (SAO CONRADO)': [-20.435658, -40.333011], 'ES-VVA-A16 (PONTA DA FRUTA)': [-20.507115, -40.360186], 'POP-ENTERNET-CENTRO-PKN (PRESIDENTE KENNEDY)': [-21.100466, -41.044009], 'POP-REDE SIM-PKO': [-18.291475, -39.955971], 'RJ-BJO-A01 (BOM JESUS)': [-21.137787, -41.674225], 'RJ-BPI-A01 (BARRA DO PIRAÍ)': [-22.470169, -43.824306], 'RJ-CPS-A04': [-21.763344, -41.333724], 'RJ-RSD-A01 (RESENDE)': [-22.462374, -44.447195], 'RNP - RACK 01': [-20.274867, -40.302289], 'SP-LNA-A01 (LORENA)': [-22.733039, -45.120192], 'SP-SJC-A01 (SÃO JOSE DOS CAMPOS)': [-23.179933, -45.88572], 'SP-SPO-A01 (ALOG)': [-23.546038, -46.635785], 'SP-SPO-A02 (TERREMARK)': [-23.493795, -46.80962], 'SP-TTE-A01 (TAUBATE)': [-23.00809, -45.550902]};

const tecNames = ["Rainer O.", "Tarick S.", "Fabricio M.", "Allan D.", "Daniel M.", "Fabiano R.", "Ivan M.", "Matheus F.", "Rogerio S.", "Wesley M.", "Matheus L.", "Daniel F.", "Rodolfo F.", "Daniel D.", "Deivison R.", "Alexandre P.", "Antonio M.", "Henrique D.", "Idomar S.", "Alecio R.", "Carlos H.", "Andre L.", "Yago R.", "Hemerson T.", "Alexandre F.", "Alexandre R.", "Alexsandre C.", "Amanda G.", "André F.", "Arthur G.", "Arthur S.", "Bruno M.", "Bruno D.", "Carlos H.", "Cleison O.", "Davidson C.", "Rabelo L.", "Jessica D.", "Deric N.", "Diego G.", "Dionatan S.", "Douglas M.", "Douglas P.", "Douglas R.", "Eduardo F.", "Eduardo S.", "Evandro S.", "Everton M.", "Fabio J.", "Felipe C.", "Felipe F.", "Franklin R.", "Guilherme O.", "Hemerson T.", "Henrique E.", "Herick G.", "Hodirley V.", "Ingrid C.", "Izaac C.", "Izaque F.", "Jhonys F.", "João C.", "José M.", "Julia D.", "Lays S.", "Leandro C.", "Leandro R.", "Leonardo M.", "Lucas C.", "Lucas F.", "Lucas G.", "Lucas L.", "Luciano B.", "Luiz M.", "Marcelo F.", "Marcelo M.", "Marcio F.", "Pierry J.", "Marcio S.", "Matheus F.", "Maxmiliano C.", "Michellly A.", "Mismana M.", "Moroni G.", "Nathalia M.", "Nathan P.", "Nickolas J.", "Nilton C.", "Odair S.", "Oziel A.", "Paulo V.", "Rafael S.", "Renan W.", "Roberto C.", "Rodrigo S.", "Taina S.", "Thabata K.", "Vanessa C.", "Warleson D.", "Wesley F.", "Willian D.", "Jair v.", "Cleberson W.", "Victor E.", "Amario C.", "Guilherme P.", "Matheus H.", "Emanuel D.", "Fhilipe L.", "Luiz F.", "Adão L.", "Juan M.", "Horlando L.", "Carlos H.", "Danilo S.", "Carlos E.", "Valdionor F.", "Adilson O.", "Raimundo X.", "Delson A.", "Gustavo S.", "Andrei S.", "Elcimar F."];

// BASE INTEGRAL RETIFICADORAS 66 itens
// ⚡ BASE ZTE ATUALIZADA (11 FONTES)
const energiaZTE = [
    { id: "ES-CIM-A03-FONTE-ZTE-001", status: "✅ ONLINE", ac: "222 V", dc: "54.5 V" },
    { id: "ES-LNS-A01-FONTE-ZTE-001", status: "✅ ONLINE", ac: "222 V", dc: "54.5 V" },
    { id: "ES-LNS-A01-FONTE-ZTE-002", status: "✅ ONLINE", ac: "222 V", dc: "54.5 V" },
    { id: "ES-VTA-A00-FONTE-ZTE", status: "✅ ONLINE", ac: "222 V", dc: "54.5 V" },
    { id: "ES-VTA-A01-FONTE-ZTE", status: "✅ ONLINE", ac: "222 V", dc: "54.5 V" },
    { id: "RJO BARRA DO PIRAI - FONTE ZTE", status: "✅ ONLINE", ac: "227 V", dc: "52.5 V" },
    { id: "RJO RESENDE - FONTE ZTE", status: "✅ ONLINE", ac: "222 V", dc: "52.51 V" },
    { id: "SP-IAQ-A01 - MANOEL FEIO ZTE", status: "✅ ONLINE", ac: "243 V", dc: "52.5 V" },
    { id: "SPO-LNA-A01- LORENA- ZTE", status: "✅ ONLINE", ac: "224 V", dc: "52.49 V" },
    { id: "SPO-TTE-A01- TAUBATE - ZTE", status: "✅ ONLINE", ac: "228 V", dc: "52.5 V" },
    { id: "SPO SÃO JOSE CAMPOS - ZTE", status: "✅ ONLINE", ac: "229 V", dc: "52.5 V" }
];

// ⚡ BASE HUAWEI ATUALIZADA (17 FONTES)
const energiaHuawei = [
    { id: "BA-IBTN-A01-FONTE-HUAWEI-001", status: "✅ ONLINE", ac: "224.8 V", dc: "53.5 V" },
    { id: "ES-ACZ-A05-FONTE-HUAWEI-001", status: "✅ ONLINE", ac: "223.2 V", dc: "53.5 V" },
    { id: "ES-AHE-A01-FONTE-HUAWEI", status: "⚠️ ALERTA", ac: "214.7 V", dc: "49.6 V" },
    { id: "ES-CNA-A01-FONTE-HUAWEI", status: "✅ ONLINE", ac: "213.7 V", dc: "53.5 V" },
    { id: "ES-CSE-A02-FONTE-HUAWEI-001", status: "✅ ONLINE", ac: "219.7 V", dc: "53.5 V" },
    { id: "ES-DGM-A03-FONTE-HUAWEI-001", status: "✅ ONLINE", ac: "127.7 V", dc: "53.5 V" },
    { id: "ES-LNS-A02-FONTE-HUAWEI-001", status: "✅ ONLINE", ac: "224.3 V", dc: "53.5 V" },
    { id: "ES-LNS-A03-FONTE-HUAWEI-001", status: "✅ ONLINE", ac: "225.6 V", dc: "53.5 V" },
    { id: "ES-NOAL-A01-FONTE-HUAWEI-001", status: "✅ ONLINE", ac: "126.7 V", dc: "53.5 V" },
    { id: "ES-PMA-A01-FONTE-HUAWEI-001", status: "✅ ONLINE", ac: "128.3 V", dc: "53.5 V" },
    { id: "ES-SEA-A03-FONTE-HUAWEI-001", status: "✅ ONLINE", ac: "123.0 V", dc: "53.5 V" },
    { id: "ES-SMT-A02-FONTE-HUAWEI-001", status: "✅ ONLINE", ac: "119.5 V", dc: "53.5 V" },
    { id: "ES-SP4-A04-FONTE-HUAWEI-001", status: "✅ ONLINE", ac: "201.6 V", dc: "53.5 V" },
    { id: "VES-VVA-A00-FONTE-HUAWEI-001", status: "✅ ONLINE", ac: "126.5 V", dc: "53.5 V" },
    { id: "VES-VVA-A14-FONTE-HUAWEI-001", status: "✅ ONLINE", ac: "128.2 V", dc: "53.5 V" },
    { id: "VES-VVA-A15-FONTE-HUAWEI-001", status: "✅ ONLINE", ac: "127.7 V", dc: "53.5 V" },
    { id: "VES-VVA-A16-FONTE-HUAWEI-001", status: "✅ ONLINE", ac: "120.3 V", dc: "53.5 V" }
];

// 🟦 BASE CPS (12 FONTES)
const energiaCPS = [
    { id: "BA-IMJ-A01-CPS-001", ac: "---", dc: "54.49 V", status: "✅ ONLINE" },
    { id: "ES-ACZ-A01-CPS-001", ac: "215 V", dc: "54.47 V", status: "✅ ONLINE" },
    { id: "ES-BJO-A01-CPS-001", ac: "223 V", dc: "54.49 V", status: "✅ ONLINE" },
    { id: "ES-CCA-A01-CPS-001", ac: "223 V", dc: "54.56 V", status: "✅ ONLINE" },
    { id: "ES-CIM-A03-CPS-001", ac: "219 V", dc: "54.48 V", status: "✅ ONLINE" },
    { id: "ES-CRPN-A01-CPS-001", ac: "---", dc: "54.48 V", status: "✅ ONLINE" },
    { id: "ES-JNV-A02-CPS-001", ac: "222 V", dc: "54.48 V", status: "✅ ONLINE" },
    { id: "ES-SMT-A01-CPS-001", ac: "---", dc: "54.49 V", status: "✅ ONLINE" },
    { id: "ES-VTA-A00-CPS-001", ac: "217 V", dc: "54.01 V", status: "✅ ONLINE" },
    { id: "ES-VTA-A00-CPS-002", ac: "217 V", dc: "54.48 V", status: "✅ ONLINE" },
    { id: "ES-VVA-A02-CPS-001", ac: "---", dc: "54.45 V", status: "✅ ONLINE" },
    { id: "RJ-CPS-A04-CPS-001", ac: "---", dc: "54.48 V", status: "✅ ONLINE" }
];

// 🟨 BASE SPS (14 FONTES)
const energiaSPS = [
    { id: "BA-EUS-A01-SPS-001", ac: "124 V", dc: "54.48 V", status: "✅ ONLINE" },
    { id: "BA-TAF-A01-SPS-001", ac: "123 V", dc: "54.46 V", status: "✅ ONLINE" },
    { id: "BA-TAF-A02-SPS-001", ac: "225 V", dc: "54.47 V", status: "✅ ONLINE" },
    { id: "ES-ACZ-A04-SPS-001", ac: "216 V", dc: "54.49 V", status: "✅ ONLINE" },
    { id: "ES-ACZ-A07-SPS-001", ac: "127 V", dc: "54.47 V", status: "✅ ONLINE" },
    { id: "ES-ALG-A01-SPS-001", ac: "226 V", dc: "54.48 V", status: "✅ ONLINE" },
    { id: "ES-AVQ-SPS-001", ac: "---", dc: "53.32 V", status: "⚠️ DC FORA DO PADRÃO" },
    { id: "ES-CIM-A04-SPS-001", ac: "---", dc: "---", status: "❌ OFFLINE" },
    { id: "ES-CSE-A02-SPS-001", ac: "219 V", dc: "54.39 V", status: "✅ ONLINE" },
    { id: "ES-SEA-A07-SPS-001", ac: "215 V", dc: "54.49 V", status: "✅ ONLINE" },
    { id: "ES-SEA-A08-SPS-001", ac: "216 V", dc: "54.48 V", status: "✅ ONLINE" },
    { id: "ES-VTA-A08-SPS-001", ac: "220 V", dc: "54.48 V", status: "✅ ONLINE" },
    { id: "ES-VTA-A15-SPS-001", ac: "218 V", dc: "54.49 V", status: "✅ ONLINE" },
    { id: "ES-VVA-A00-SPS-002", ac: "220 V", dc: "54.48 V", status: "✅ ONLINE" }
];

// 🟥 BASE XPS (12 FONTES)
const energiaXPS = [
    { id: "BA-IBH-A01-XPS-001", ac: "---", dc: "53.91 V", status: "✅ ONLINE" },
    { id: "ES-BDI-A02-XPS-001", ac: "---", dc: "52.75 V", status: "⚠️ DC BAIXA" },
    { id: "ES-CCA-A02-XPS-001", ac: "---", dc: "53.20 V", status: "✅ ONLINE" },
    { id: "ES-GRI-A01-XPS-001", ac: "---", dc: "---", status: "❌ OFFLINE" },
    { id: "ES-GRI-A02-XPS-001", ac: "---", dc: "53.29 V", status: "✅ ONLINE" },
    { id: "ES-IIU-A01-XPS-001", ac: "---", dc: "54.03 V", status: "✅ ONLINE" },
    { id: "ES-IOH-A01-XPS-001", ac: "---", dc: "54.02 V", status: "✅ ONLINE" },
    { id: "ES-MAFL-A01-XPS-001", ac: "---", dc: "54.18 V", status: "✅ ONLINE" },
    { id: "ES-MRZS-A01-XPS-002", ac: "---", dc: "54.02 V", status: "✅ ONLINE" },
    { id: "ES-NVI-A04-XPS-001", ac: "---", dc: "54.12 V", status: "✅ ONLINE" },
    { id: "ES-PKO-A01-XPS-001", ac: "---", dc: "---", status: "❌ OFFLINE" },
    { id: "ES-VTA-A04-XPS-001", ac: "---", dc: "---", status: "⚠️ SEM TELEMETRIA" }
];

// 🗄️ BASE INTEGRAL DE GERADORES (8 ITENS)
const geradoresData = [
    { marca: "STEMAC", motor: "FPT", potencia: "55/50 KVA", local: "IX-VTA-1", prox: "13/02/2026", cidade: "VITORIA", status: "OK", combustivel: "Diesel Comum", monitoramento: "Sem monitoramento", consumo: "60A", fase: "Trifásico", cap: "51%", autonomia: "6 Horas" },
    { marca: "STEMAC", motor: "BAUDOUIN", potencia: "32/29 KVA", local: "BASE-VVA", prox: "15/02/2026", cidade: "VILA VELHA", status: "OK", combustivel: "Diesel Comum", monitoramento: "Ativo", consumo: "30A", fase: "Trifásico", cap: "40%", autonomia: "8 Horas" },
    { marca: "TOYAMA", motor: "IMPORTADO", potencia: "6 KVA", local: "LONDON-VTA", prox: "04/02/2026", cidade: "VITORIA", status: "OK", combustivel: "Gasolina", monitoramento: "Sem monitoramento", consumo: "12A", fase: "Monofásico", cap: "60%", autonomia: "4 Horas" },
    { marca: "TOYAMA", motor: "IMPORTADO", potencia: "27.5 KVA", local: "AT3-ACZ", prox: "13/02/2026", cidade: "ARACRUZ", status: "OK", combustivel: "Diesel S10", monitoramento: "Ativo", consumo: "25A", fase: "Bifásico", cap: "45%", autonomia: "10 Horas" },
    { marca: "TOYAMA", motor: "IMPORTADO", potencia: "6 KVA", local: "ALMOX-VVA", prox: "13/04/2026", cidade: "VILA VELHA", status: "OK", combustivel: "Gasolina", monitoramento: "Sem monitoramento", consumo: "0A", fase: "Monofásico", cap: "0%", autonomia: "0 Horas" },
    { marca: "TOYAMA", motor: "IMPORTADO", potencia: "6.5 KVA", local: "BASE-CIM", prox: "10/05/2026", cidade: "CACHOEIRO", status: "OK", combustivel: "Gasolina", monitoramento: "Sem monitoramento", consumo: "14A", fase: "Monofásico", cap: "55%", autonomia: "5 Horas" },
    { marca: "TOYAMA", motor: "IMPORTADO", potencia: "6.5 KVA", local: "BASE-LNS", prox: "02/03/2026", cidade: "LINHARES", status: "OK", combustivel: "Gasolina", monitoramento: "Sem monitoramento", consumo: "15A", fase: "Monofásico", cap: "50%", autonomia: "5 Horas" },
    { marca: "STEMAC", motor: "FPT", potencia: "55/50 KVA", local: "IX-VTA-2", prox: "13/02/2026", cidade: "VITORIA", status: "OK", combustivel: "Diesel Comum", monitoramento: "Sem monitoramento", consumo: "60A", fase: "Trifásico", cap: "51%", autonomia: "6 Horas" }
];