const router = require("express").Router();
const multer = require("multer");
const AWS = require("aws-sdk");
const { v4: uuidv4 } = require("uuid");

const storage = multer.memoryStorage();
const upload = multer({ storage }); // Multer to handle file uploads

// Configure AWS S3
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

// Image upload route
router.post("/", upload.single("image"), async (req, res) => {
  console.log("Image upload route is active: /api/image/upload");
  // console.log(req.file, "req.file");

  try {
    const folderName = "Questions";
    const filename = `${folderName}/${uuidv4()}-${req.file.originalname}`;

    const params = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: filename,
      Body: req.file.buffer,
      ContentType: req.file.mimetype || "application/octet-stream",
    };

    const s3Response = await s3.upload(params).promise();

    res.status(200).json({ success: true, imageUrl: s3Response.Location });
  } catch (error) {
    console.error("Error uploading to S3:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;