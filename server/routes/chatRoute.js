// routes/chatgpt.js
const express = require("express");
const axios = require("axios");
const router = express.Router();


router.post("/chat", async (req, res) => {
  try {
    const { messages } = req.body;

    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o",
        messages,
        max_tokens: 100,
        temperature: 0.5,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
      }
    );

    res.status(200).json({ success: true, data: response.data.choices[0].message.content });
  } catch (error) {
    console.error("Error fetching GPT-4 response:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});



module.exports = router;
