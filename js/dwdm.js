window.bancoDWDM = {
    "CHASSI-01": {
        nome: "Huawei OptiX OSN 1800 V", // Nome do Chassi
        pop: "ES-GRI-A01",              // Nome do POP
        totalSlots: 15,
        slots: {
            2: { 
                placa: "G3M4SV", 
                status: "online", 
                // 👇 ALTERE AQUI A DESCRIÇÃO TÉCNICA
                desc: "Placa de Agregação de Canais 1G/10G (Muxponder)", 
                // 👇 ALTERE AQUI A OBSERVAÇÃO (REMARK)
                remark: "Atendimento Link Principal - Rota Vitória/Guaçuí",
                portas: [
                    { p: 1, status: "ocupada", rota: "Link SDH" }
                ]
            },
            // Repita o padrão para os outros slots...
        }
    }
};