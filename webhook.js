const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");

const app = express();
app.use(bodyParser.json());

const VERIFY_TOKEN = "unicorn@2024";
const WHATSAPP_TOKEN = "EAAc56xZCJD84BO9Y2FjTZCpga1IbE0WT9ZCfGKJSjQJ2mHadWUUtmZBYV3gILGDbGo9UapiBBbPM06ZB119eqjaKpWIWrwLLGlXW0Oq2tNHy38f1lsZCmYs6C4BUF4bs6gnPuYL1R91UFydhrkDbJFzokqkUnv0nsgrjfeLRZCL2KJf6gnn6T3ySgVzZAB6tG8bmyjjNVWrAG4cNvNsfA6PT2fOu8G1reEPvCVqZBXIQUoEOlMZAp6";
const PHONE_NUMBER_ID = "545308368676274";
const OPENAI_API_KEY = "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";

// Webhook verification
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("✅ Webhook verified");
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// Handle incoming WhatsApp messages
app.post("/webhook", async (req, res) => {
  try {
    const entry = req.body.entry?.[0];
    const changes = entry?.changes?.[0];
    const message = changes?.value?.messages?.[0];
    const from = message?.from;
    const text = message?.text?.body;

    if (text && from) {
      console.log(`💬 Received from ${from}: ${text}`);

      // Get ChatGPT reply
      const openaiRes = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-3.5-turbo",
          messages: [
            { role: "system", content: "You are a helpful and professional operations manager." },
            { role: "user", content: text }
          ]
        },
        {
          headers: {
            Authorization: `Bearer ${OPENAI_API_KEY}`,
            "Content-Type": "application/json"
          }
        }
      );

      const reply = openaiRes.data.choices?.[0]?.message?.content || "Sorry, I couldn't process that.";

      // Send reply back via WhatsApp
      await axios.post(
        `https://graph.facebook.com/v19.0/${PHONE_NUMBER_ID}/messages`,
        {
          messaging_product: "whatsapp",
          to: from,
          text: { body: reply }
        },
        {
          headers: {
            Authorization: `Bearer ${WHATSAPP_TOKEN}`,
            "Content-Type": "application/json"
          }
        }
      );

      console.log("✅ Replied:", reply);
    }

    res.sendStatus(200);
  } catch (error) {
    console.error("❌ Error in webhook handler:", error.response?.data || error.message);
    res.sendStatus(500);
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Webhook server running on port ${PORT}`);
});
