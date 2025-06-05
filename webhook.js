const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");

const app = express();
app.use(bodyParser.json());

// Replace with your long-lived access token
const WHATSAPP_TOKEN = 'EAAc56xZCJD84BO839AjjmG36BZC0LB7wCgzdPldfnLqWXcyPTXeR70HnJLNsrkjeHKgtIDHr1rlFyxPtnZBPDxlqGzjmHokQ5RNCJExm6wQfxvZBDYpdVdRXexrkZBBPug410MrebFMs8uZC3dEnd2zg9l4IUMeYVQvqINmvTlpZBz6EfL6ZCqlOG1gSETJSoZBmaZCKEt68hnzXVG';
const VERIFY_TOKEN = "unicorn@2024";
const FROM_BOSS = "971585865900";  // Your number in international format, no '+'
const PHONE_NUMBER_ID = "545308368676274";  // Replace this from Meta dashboard

// Verify webhook (GET)
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];
  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("WEBHOOK_VERIFIED");
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// Handle webhook messages (POST)
app.post("/webhook", async (req, res) => {
  try {
    const entry = req.body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;
    const messages = value?.messages;

    if (messages) {
      const msg = messages[0];
      const from = msg.from;
      const text = msg.text?.body;

      console.log("📩 Received:", text, "from", from);

      // Only respond to the boss
      if (from === FROM_BOSS) {
        await axios.post(
          `https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`,
          {
            messaging_product: "whatsapp",
            to: from,
            type: "text",
            text: {
              body: `👋 Hi Boss! I received: "${text}" and I'm on it.`,
            },
          },
          {
            headers: {
              Authorization: `Bearer ${WHATSAPP_TOKEN}`,
              "Content-Type": "application/json",
            },
          }
        );
        console.log("✅ Replied to Boss");
      }
    }

    res.sendStatus(200);
  } catch (error) {
    console.error("❌ Webhook Error:", error.message);
    res.sendStatus(500);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Webhook server running on port ${PORT}`);
});
