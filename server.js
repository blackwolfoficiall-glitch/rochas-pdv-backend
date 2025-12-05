const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const fetch = require("node-fetch");

const MP_TOKEN = process.env.MP_ACCESS_TOKEN || null;
const PORT = process.env.PORT || 3000;

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send("Backend OK — PDV Rochas Açaí");
});

/* ===========================
   PAGAMENTO PIX / CARTÃO
=========================== */
app.post("/create_payment", async (req, res) => {
  try {
    const method = req.query.method;
    const { amount, description } = req.body;

    if (!amount) {
      return res.status(400).json({ error: "amount missing" });
    }

    // PIX
    if (method === "pix") {
      const r = await fetch("https://api.mercadopago.com/v1/payments", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${MP_TOKEN}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          transaction_amount: amount,
          description,
          payment_method_id: "pix",
          payer: { email: "cliente@email.com" }
        })
      });

      return res.json(await r.json());
    }

    // Cartão
    if (method === "debit" || method === "credit") {
      const r = await fetch("https://api.mercadopago.com/checkout/preferences", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${MP_TOKEN}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          items: [{ title: description, quantity: 1, unit_price: amount }],
          payment_methods: {
            excluded_payment_types: method === "debit"
              ? [{ id: "credit_card" }]
              : [{ id: "debit_card" }]
          }
        })
      });

      return res.json(await r.json());
    }

    res.status(400).json({ error: "Invalid payment method" });

  } catch (err) {
    res.status(500).json({ error: err.toString() });
  }
});

/* ===========================
   INICIAR SERVIDOR
=========================== */
app.listen(PORT, () => console.log("🚀 Backend PDV rodando", PORT));
