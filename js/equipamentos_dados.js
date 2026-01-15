window.bancoEquipamentos = {
    // --- POP 1 (Já existente) ---
   "ES-GRI-A01": {
        "Rack 01 Equipamentos": {
            "foto": "img/gria1.jpeg",
            "equipamentos": [
                { u: 44, nome: "Patch Panel", tipo: "passivo" },
                { u: 42, nome: "Switch Core", tipo: "rede" }
            ]
        }, // <--- ESSA VÍRGULA É OBRIGATÓRIA para adicionar o próximo rack

        "Rack 02 Elétrico": {
            "foto": "img/gria1eletr.jpeg",
            "equipamentos": [
                { u: 44, nome: "DIO Centralx", tipo: "passivo" },
                { u: 10, nome: "Retificadora", tipo: "dc" }
            ]
        } // <--- O último rack do POP não precisa de vírgula aqui
    },

    // --- NOVO POP (Para você copiar e adaptar) ---
    "SC-FLN-A01": {
        "Rack 01 - Principal": {
            "foto": "https://link-da-foto-aqui.com",
            "equipamentos": [
                { u: 44, nome: "DIO 24F", tipo: "passivo" },
                { u: 40, nome: "OLT HUAWEI", tipo: "rede" },
                { u: 10, nome: "RETIFICADORA", tipo: "dc" }
            ]
        },
        "Rack 02 - Baterias": {
            "foto": "", // Deixe vazio se não tiver foto
            "equipamentos": [
                { u: 10, nome: "BANCO 01", tipo: "energia" },
                { u: 5, nome: "BANCO 02", tipo: "energia" }
            ]
        }
    }, // <--- Vírgula para o próximo POP

    "PR-CUR-B02": {
        "Rack Unico": {
            "foto": "",
            "equipamentos": [
                { u: 44, nome: "PATCH PANEL", tipo: "passivo" }
            ]
        }
    } 
    // <--- O último POP não precisa de vírgula aqui
};