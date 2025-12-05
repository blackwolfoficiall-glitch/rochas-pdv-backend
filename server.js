const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const fetch = require("node-fetch");

const app = express();
app.use(cors());
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;
const MP_TOKEN = process.env.MP_ACCESS_TOKEN;

if (!MP_TOKEN) {
  console.log("⚠️ MP_ACCESS_TOKEN não configurado no Render!");
}

app.get("/", (req, res) => {
  res.send("Backend OK");
});

app.post("/create_payment", async (req, res) => {
  try {
    const method = (req.query.method || "").toLowerCase();
    const { amount, description } = req.body;

    if (!amount) return res.status(400).json({ error: "amount required" });

    if (method === "pix") {
      const r = await fetch("https://api.mercadopago.com/v1/payments", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${MP_TOKEN}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          transaction_amount: amount,
          description: description || "Pedido PDV Rochas Açaí",
          payment_method_id: "pix",
          payer: { email: "cliente@teste.com" }
        })
      });

      return res.json(await r.json());
    }

    if (method === "credit" || method === "debit") {
      const r = await fetch("https://api.mercadopago.com/checkout/preferences", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${MP_TOKEN}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          items: [
            {
              title: description || "Pedido PDV Rochas Açaí",
              quantity: 1,
              unit_price: amount
            }
          ]
        })
      });

      return res.json(await r.json());
    }

    return res.status(400).json({ error: "invalid method" });

  } catch (err) {
    console.error("ERRO:", err);
    return res.status(500).json({ error: "server error", details: err.toString() });
  }
});

app.listen(PORT, () => console.log(`🚀 Backend rodando na porta ${PORT}`));
