const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// ===== DADOS DA Z-API =====
const INSTANCE_ID = "3ED1927A969522F1812C6A599C5ED5B8";
const TOKEN = "32603F70D04CE126A636CC41";
const CLIENT_TOKEN = "SEU_CLIENT_TOKEN_AQUI"; // <<< OBRIGATÓRIO
const DESTINO = "5527997115756"; // 55 + DDD + número

app.post("/api/alerta", async (req, res) => {
  const { mensagem } = req.body;

  try {
    const response = await axios.post(
      `https://api.z-api.io/instances/${INSTANCE_ID}/token/${TOKEN}/send-text`,
      {
        phone: DESTINO,
        message: mensagem
      },
      {
        headers: {
          "Content-Type": "application/json",
          "client-token": CLIENT_TOKEN
        }
      }
    );

    console.log("✅ Z-API OK:", response.data);
    res.json({ status: "enviado", response: response.data });

  } catch (error) {
    console.error("❌ Z-API ERRO STATUS:", error.response?.status);
    console.error("❌ Z-API ERRO DATA:", error.response?.data);

    res.status(500).json(error.response?.data || { erro: "Erro Z-API" });
  }
});

app.listen(3000, () => {
  console.log("🚀 Servidor de alarmes rodando na porta 3000");
});
