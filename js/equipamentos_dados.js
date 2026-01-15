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
    }
};
//   Modelo de DGO,totalPortas,Visual no Sistema 144,96,72,48,36,24,12//
