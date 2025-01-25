// routes/chatgpt.js
const express = require("express");
const axios = require("axios");
const router = express.Router();
const AWS = require("aws-sdk");
const multer = require("multer");

const storage = multer.memoryStorage();
const upload = multer({ storage });

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

router.post("/image/upload", upload.single("image"), async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).send("No file uploaded.");
    }

    const params = {
      Bucket: process.env.AWS_S3_BUCKET_NAME, // Your S3 bucket name
      Key: `${Date.now()}-${file.originalname}`, // Unique file name
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: "public-read", // File should be publicly readable
    };

    const result = await s3.upload(params).promise();
    console.log("File uploaded successfully:", result);

    res.status(200).json({ success: true, url: result.Location });
  } catch (error) {
    console.error("Error uploading file:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post("/chat", async (req, res) => {
  console.log('Data: ', req.body);
  try {
    const start = performance.now();
    const { messages } = req.body;

    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o",
        messages,
        // max_tokens: 100,
        temperature: 0.5,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
      }
    );

    const end = performance.now();
    console.log('Time taken by openai api (s): ', (end - start) / 1000);
    res.status(200).json({ success: true, data: response.data.choices[0].message.content });
  } catch (error) {
    console.error("Error fetching GPT-4 response:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});



module.exports = router;
