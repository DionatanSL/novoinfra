window.bancoEquipamentos = {
    "ES-GRI-A01": {
        "Rack 01 Equipamentos": {
            "tamanho": 44, 
            "foto": "img/gria1.jpeg",
            "equipamentos": [
                // 🔹 MODELO DGO (Grade 12x12)
                { 
                    u: 1, 
                    nome: "DGO 144 Fibras", 
                    tipo: "passivo", 
                    tamanhoU: 4, 
                    totalPortas: 144, // 👈 Altere aqui para mudar o tamanho da grade
                    desc: "📍 Distribuidor Geral Óptico Central",
                    portas: [
                        { p: 1, status: "ocupada", rota: "Cabo 48F - Fibra 01 (Rota Mar)" },
                        { p: 13, status: "ocupada", rota: "Cabo 48F - Fibra 13 (Rota Terra)" }
                    ]
                },

                // 🔹 MODELO SWITCH (Horizontal)
                { 
                    u: 5, 
                    nome: "Switch Huawei 24P", 
                    tipo: "rede", 
                    tamanhoU: 1, 
                    totalPortas: 24, // 👈 Altere para 24, 48, etc.
                    desc: "📊 Switch de Acesso - Core",
                    portas: [
                        { p: 1, status: "ocupada", rota: "Uplink Fibra - Porta 01" },
                        { p: 10, status: "ocupada", rota: "Servidor Proxmox - Porta 10" }
                    ]
                }
            ]
        },

        "Rack 02 Elétrico": {
            "tamanho": 12,
            "foto": "img/gria1eletr.jpeg",
            "equipamentos": [
                // 🔹 MODELO ELÉTRICO (Disjuntores)
                { 
                    u: 1, 
                    nome: "Retificadora XPS", 
                    tipo: "dc", 
                    tamanhoU: 2, 
                    totalPortas: 10, // 👈 Aqui define quantos disjuntores aparecem
                    desc: "⚡ Sistema de Energia -48V DC",
                    portas: [
                        { p: 1, status: "ocupada", rota: "Disjuntor 01: Switch Core" },
                        { p: 2, status: "ocupada", rota: "Disjuntor 02: OLT Huawei" }
                    ]
                },
                { 
                    u: 4, 
                    nome: "Régua AC", 
                    tipo: "energia", 
                    tamanhoU: 1, 
                    totalPortas: 8, // 👈 8 tomadas
                    desc: "🔌 Tomadas 127V/220V",
                    portas: [
                        { p: 1, status: "ocupada", rota: "Tomada 01: Monitor" }
                    ]
                }
            ]
        }
    },

    "ES-VVA-A12": {
        "Rack 01 Equipamentos": {
            "tamanho": 44, 
            "foto": "img/vvaa12_equip.jpeg",
            "equipamentos": [
                // 🔹 MODELO DGO (Grade 12x12)
                { 
                    u: 1, 
                    nome: "DGO e Acomodador de Cabo", 
                    tipo: "passivo", 
                    tamanhoU: 6, 
                    totalPortas: 144, // 👈 Altere aqui para mudar o tamanho da grade
                    desc: "📍 Distribuidor Geral Óptico - DGO-01",
                    portas: []
                },

                // 🔹 MODELO SWITCH (Horizontal)
                { 
                    u: 9, 
                    nome: "Switch Huawei 6730", 
                    tipo: "rede", 
                    tamanhoU: 1, 
                    totalPortas: 48, // 👈 Altere para 24, 48, etc.
                    desc: "📊 SW-HUAWEI-6730-U09",
                    portas: []
                },

                { 
                    u: 11, 
                    nome: "Acomodador de Cabo", 
                    tipo: "passivo", 
                    tamanhoU: 1, 
                    totalPortas: 24, 
                    desc: "📍 Organizador Frontal - CM-01",
                    portas: []
                },

                { 
                    u: 13, 
                    nome: "Roteador Cisco 1900", 
                    tipo: "rede", 
                    tamanhoU: 1, 
                    totalPortas: 24, 
                    desc: "🌐 RT-CISCO-1900-U13",
                    portas: []
                },

                { 
                    u: 23, 
                    nome: "OLT Huawei SmartAX MA5800", 
                    tipo: "rede", 
                    tamanhoU: 12, 
                    totalPortas: 16, 
                    desc: "📡 OLT-HUAWEI-MA5800-U23-34",
                    portas: []
                },

                { 
                    u: 43, 
                    nome: "Régua de Tomada", 
                    tipo: "energia", 
                    tamanhoU: 2, 
                    totalPortas: 8, // 👈 8 tomadas
                    desc: "🔌 PDU-U43-44",
                    portas: []
                }
            ]
        },

        "Rack 02 Elétrico": {
            "tamanho": 44, 
            "foto": "img/vvaa12_eletr.jpeg",
            "equipamentos": [
                // 🔹 MODELO ELÉTRICO (Disjuntores)
                { 
                    u: 13, 
                    nome: "Régua de Disjuntores", 
                    tipo: "dc", 
                    tamanhoU: 7, 
                    totalPortas: 24, // 👈 Aqui define quantos disjuntores aparecem
                    desc: "⚡ Sistema de Distribuição Elétrica AC/DC",
                    portas: []
                },
                { 
                    u: 23, 
                    nome: "Fonte Huawei", 
                    tipo: "dc", 
                    tamanhoU: 2, 
                    totalPortas: 10, 
                    desc: "🔋 Retificador / Conversor AC/DC",
                    portas: []
                }
            ]
        }
    }
};
//   Modelo de DGO,totalPortas,Visual no Sistema 144,96,72,48,36,24,12//