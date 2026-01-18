// js/dwdm.js
window.bancoDWDM = {
    "CHASSI-01": {
        nome: "Huawei OptiX OSN 1800 V",
        totalSlots: 15,
        slots: {
            1: { placa: "TMF1AUX", status: "online", desc: "Controle e Sistema" },
            2: { placa: "G3M4SV",  status: "online", desc: "Agregação de Serviços" },
            3: { 
                placa: "G3DA PXF", 
                status: "online", 
                desc: "Amplificador Óptico OA",
                portas: Array.from({length: 12}, (_, i) => ({ p: i+1, status: "ocupada" }))
            },
            5: { placa: "G3SCC",   status: "online", desc: "Controle" },
            14: { placa: "PIU",    status: "online", desc: "Energia" },
            15: { placa: "PIU",    status: "online", desc: "Energia" }
        }
    }
};
console.log("✅ Banco DWDM carregado com sucesso.");