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

// ✔️ NEW – AI ­answer-checker
router.post("/check-answer", async (req, res) => {
  try {
    const questions = req.body;

    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Request body must be a non-empty array of questions",
      });
    }

    const results = [];

    for (const item of questions) {
      const { question, expectedAnswer, userAnswer } = item;

      if (!question || !expectedAnswer || !userAnswer) {
        results.push({
          question,
          success: false,
          error: "question, expectedAnswer and userAnswer are required",
        });
        continue;
      }

      const messages = [
        {
          role: "system",
          content:
            'You are an examiner. Compare the student\'s answer with the expected answer. Ignore the format just validate if answer is correct or not. ' +
            'Reply ONLY with valid JSON: {"isCorrect": true/false}.',
        },
        {
          role: "user",
          content: `QUESTION: ${question}\nEXPECTED ANSWER: ${expectedAnswer}\nSTUDENT ANSWER: ${userAnswer}`,
        },
      ];

      try {
        const { data } = await axios.post(
          "https://api.openai.com/v1/chat/completions",
          {
            model: "gpt-4o",
            messages,
            temperature: 0,
          },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            },
          }
        );

        const aiJson = JSON.parse(data.choices[0].message.content.trim());

        results.push({
          question,
          expectedAnswer,
          userAnswer,
          result: aiJson,
          success: true,
        });
      } catch (innerError) {
        console.error("OpenAI error:", innerError.message);
        results.push({
          question,
          expectedAnswer,
          userAnswer,
          success: false,
          error: "AI response failed or returned invalid JSON",
        });
      }
    }

    res.status(200).json({ success: true, data: results });
  } catch (error) {
    console.error("Answer-check error:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post("/explain-answer", async (req, res) => {
  try {
    const { question, expectedAnswer, userAnswer, imageUrl } = req.body;

    // console.log("Image Url: ", imageUrl);

    if (!question || !expectedAnswer || !userAnswer) {
      return res.status(400).json({
        success: false,
        error: "question, expectedAnswer, and userAnswer are required",
      });
    };

    const customContent = [
      {
        type: "text",
        text: [
          `QUESTION: ${question}`,
          `EXPECTED ANSWER: ${expectedAnswer}`,
          `STUDENT ANSWER: ${userAnswer}`,
          `Please provide a short and kind explanation (1–2 lines) why the student's answer is wrong, a brief reference to the correct method and steps to solve it if it is math question. Separate explanation with calculations and steps.`
        ]
          .filter(Boolean)
          .join('\n'),
      },
    ];

    if (imageUrl) {
      customContent.push({
        type: "image_url",
        image_url: {
          url: imageUrl,
        },
      });
    }

    const messages = [
      {
        role: "system",
        content:
          "You are a kind and helpful teacher. When given a question, the correct answer, the student's answer, and optionally an image, explain why the student's answer is incorrect in just 1–2 polite, beginner-friendly lines. Also mention the correct method, reasoning briefly and calculations for math question. Separate explanation with calculatons and steps.",
      },

      {
        role: "user",
        content: customContent
      },
    ];


    // console.log("Messages: ", messages);
    // GPT-4o request
    const { data } = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o",
        messages,
        temperature: 0.7,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
      }
    );

    const explanation = data.choices[0].message.content.trim();

    res.status(200).json({
      success: true,
      explanation,
    });
  } catch (error) {
    console.error("Explain-answer error:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});



module.exports = router;
