window.bancoEquipamentos = {
    "ES-GRI-A01": {
        "Rack 01 Equipamentos": {
            "tamanho": 44, // ✅ Agora dentro do rack correto
            "foto": "img/gria1.jpeg",
            "equipamentos": [
                { u: 44, nome: "Patch Panel", tipo: "passivo" },
                { u: 42, nome: "Switch Core", tipo: "rede" }
            ]
        },

        "Rack 02 Elétrico": {
            "tamanho": 12, // ✅ Correto
            "foto": "img/gria1eletr.jpeg",
            "equipamentos": [
                { u: 12, nome: "DIO Centralx", tipo: "passivo" }, // ⚠️ Mudei de 44 para 12 para caber no rack
                { u: 10, nome: "Retificadora", tipo: "dc" }
            ]
        }
    },

    "SC-FLN-A01": {
        "Rack 01 - Principal": {
            "tamanho": 44,
            "foto": "https://link-da-foto-aqui.com",
            "equipamentos": [
                { u: 44, nome: "DIO 24F", tipo: "passivo" },
                { u: 40, nome: "OLT HUAWEI", tipo: "rede" },
                { u: 10, nome: "RETIFICADORA", tipo: "dc" }
            ]
        },
        "Rack 02 - Baterias": {
            "tamanho": 12,
            "foto": "",
            "equipamentos": [
                { u: 10, nome: "BANCO 01", tipo: "energia" },
                { u: 5, nome: "BANCO 02", tipo: "energia" }
            ]
        }
    },

    "PR-CUR-B02": {
        "Rack Unico": {
            "tamanho": 44, // ✅ Agora dentro do rack correto
            "foto": "",
            "equipamentos": [
                { u: 44, nome: "PATCH PANEL", tipo: "passivo" }
            ]
        }
    }
};