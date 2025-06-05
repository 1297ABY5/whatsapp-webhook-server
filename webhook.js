// webhook.js

const express = require("express");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

const VERIFY_TOKEN = "unicorn@2024"; // Must match Meta webhook setup

// Webhook verification
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("✅ WEBHOOK_VERIFIED");
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// Receiving messages from WhatsApp
app.post("/webhook", (req, res) => {
  console.log("🔥 Webhook Payload Received:");
  console.log(JSON.stringify(req.body, null, 2)); // This line prints full JSON

  const entry = req.body.entry?.[0];
  const changes = entry?.changes?.[0];
  const value = changes?.value;
  const messages = value?.messages;

  if (messages) {
    messages.forEach((msg) => {
      console.log("💬 Received Message:", msg);
      // You can act on messages here
    });
  }

  res.sendStatus(200);
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Webhook server running on port ${PORT}`);
});
