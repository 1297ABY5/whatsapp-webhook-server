const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");

const app = express();
app.use(bodyParser.json());

const VERIFY_TOKEN = "unicorn@2024";
const PHONE_NUMBER_ID = "545308368676274";
const ACCESS_TOKEN = "EAAc56xZCJD84BO9Y2FjTZCpga1IbE0WT9ZCfGKJSjQJ2mHadWUUtmZBYV3gILGDbGo9UapiBBbPM06ZB119eqjaKpWIWrwLLGlXW0Oq2tNHy38f1lsZCmYs6C4BUF4bs6gnPuYL1R91UFydhrkDbJFzokqkUnv0nsgrjfeLRZCL2KJf6gnn6T3ySgVzZAB6tG8bmyjjNVWrAG4cNvNsfA6PT2fOu8G1reEPvCVqZBXIQUoEOlMZAp6";
const OPENAI_API_KEY = "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";

const WHATSAPP_API_URL = "https://graph.facebook.com/v19.0";

// Webhook verification
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("✅ Webhook Verified");
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// Webhook message listener
app.post("/webhook", async (req, res) => {
  const messages = req.body.entry?.[0]?.changes?.[0]?.value?.messages;
  const phone_number_id = req.body.entry?.[0]?.changes?.[0]?.value?.metadata?.phone_number_id;

  if (messages) {
    for (const message of messages) {
      const from = message.from;
      const userMessage = message.text?.body;

      console.log("📩 Received:", userMessage);

      // Generate reply using ChatGPT
      const aiResponse = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-3.5-turbo",
          messages: [
            { role: "system", content: "You are a smart and polite assistant named Houston helping a renovation company owner manage projects, vendors, and staff." },
            { role: "user", content: userMessage }
          ],
          temperature: 0.7
        },
        {
          headers: {
            Authorization: `Bearer ${OPENAI_API_KEY}`,
            "Content-Type": "application/json"
          }
        }
      );

      const reply = aiResponse.data.choices[0].message.content.trim();

      // Send reply back to WhatsApp
      await axios.post(
        `${WHATSAPP_API_URL}/${PHONE_NUMBER_ID}/messages`,
        {
          messaging_product: "whatsapp",
          to: from,
          text: { body: reply }
        },
        {
          headers: {
            Authorization: `Bearer ${ACCESS_TOKEN}`,
            "Content-Type": "application/json"
          }
        }
      );

      console.log("✅ Replied:", reply);
    }
  }

  res.sendStatus(200);
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Webhook server running on port ${PORT}`);
});
