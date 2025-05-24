const router = require("express").Router();
const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const authMiddleware = require("../middlewares/authMiddleware");
const nodemailer = require("nodemailer");
const multer = require("multer");
const { Storage } = require("@google-cloud/storage");
const { v4: uuidv4 } = require("uuid");
const AWS = require("aws-sdk");
const Review = require("../models/reviewModel");
const Report = require("../models/reportModel");
const forumQuestion = require("../models/forumQuestionModel");
const mongoose = require("mongoose");

// Configure Multer Memory Storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

// Create a Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.SENDER_EMAIL,
    pass: process.env.SENDER_EMAIL_PASSWORD,
  },
});

// Google Cloud Storage Setup
const GoogleStorage = new Storage({
  projectId: "proud-stage-416018",
  keyFilename: "proud-stage-416018-d682ff695aac.json",
});

function generateOTP() {
  const otp = Math.floor(100000 + Math.random() * 900000);
  return otp.toString();
}

// const generateOTP = (length) => {
//   const digits = '0123456789';
//   let otp = '';

//   for (let i = 0; i < length; i++) {
//     const randomIndex = Math.floor(Math.random() * digits.length);
//     otp += digits[randomIndex];
//   }

//   return otp;
// }

// user registration

router.post("/register", async (req, res) => {
  try {
    // check if user already exists
    const userExists = await User.findOne({
      $or: [{ email: req.body.email }, { phoneNumber: req.body.phoneNumber }],
    });
    if (userExists) {
      return res.status(409).send({
        message: "User already exists with this email or number",
        success: false,
      });
    }

    // hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);
    req.body.password = hashedPassword;

    // create new user
    const newUser = new User({ ...req.body, paymentRequired: true });
    await newUser.save();
    res.send({
      message: "User created successfully",
      success: true,
    });
  } catch (error) {
    res.status(500).send({
      message: error.message,
      data: error,
      success: false,
    });
  }
});

// Send OTP for verification

router.post("/otp", async (req, res) => {
  try {
    const email = req.body.email;
    const phoneNumber = req.body.phoneNumber;

    // check if user already exists
    const userExists = await User.findOne({
      $or: [{ email }, { phoneNumber }],
    });
    if (userExists) {
      return res.status(409).send({
        message: "User already exists with this email or number",
        success: false,
      });
    }

    const randomOTP = generateOTP();
    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: "OTP to Verify Email!",
      text: `Here is your 6 digits OTP "${randomOTP}" to verify email.`,
    };
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log("Error sending email:", error);
        return res.status(500).send("Error sending email.");
      }
      console.log("Email sent:", info.response);
      res.send({
        message: "Email sent successfully",
        success: true,
        data: randomOTP,
      });
    });
  } catch (error) {
    res.status(500).send({
      message: error.message,
      data: error,
      success: false,
    });
  }
});

router.post("/contact-us", async (req, res) => {
  try {
    const { name, email, message } = req.body;

    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: process.env.OWNER_EMAIL,
      subject: "Contact Form Submission",
      text: `${name} has successfully submitted a contact form. Here are the details:
      
- Name: ${name}  
- Email: ${email}  
- Message: ${message}`,
    };

    // Debug log: Verify the recipient and details
    console.log("Mail Options:", mailOptions);

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
        return res.status(500).json({
          message: "Error sending email.",
          success: false,
        });
      }
      console.log("Email sent:", info.response);
      return res.json({
        message: "Email sent successfully",
        success: true,
        data: null,
      });
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      success: false,
    });
  }
});


// user login

router.post("/login", async (req, res) => {
  try {
    // check if user exists
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res
        .status(200)
        .send({ message: "User does not exist", success: false });
    }

    if (user.isBlocked) {
      return res.status(403).send({
        message: "You are blocked. Please contact your moderator",
        success: false,
      });
    }

    // check password
    const validPassword = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (!validPassword) {
      return res
        .status(200)
        .send({ message: "Invalid password", success: false });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.send({
      message: "User logged in successfully",
      success: true,
      data: token,
      response: user,
    });
  } catch (error) {
    res.status(500).send({
      message: error.message,
      data: error,
      success: false,
    });
  }
});

// get all users
router.get("/get-all-users", async (req, res) => {
  try {
    const users = await User.find({ isAdmin: false }); // Filter for non-admin users
    if (users && users.length > 0) {
      const simplifiedUsers = users.map((user) => ({
        studentId: user._id,
        name: user.name,
        school: user.school,
        class: user.class,
        email: user.email,
        profileImage: user.profileImage,
        isAdmin: user.isAdmin,
        isBlocked: user.isBlocked,
      }));
      res.send({
        users: simplifiedUsers,
        success: true,
      });
    } else {
      console.error("No User Found");
      res.status(404).send({
        message: "No User Found",
        success: false,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: error.message });
  }
});

// get user info

router.post("/get-user-info", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.body.userId).select(
      "-password -createdAt -updatedAt -__v"
    );
    res.send({
      message: "User info fetched successfully",
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).send({
      message: error.message,
      data: error,
      success: false,
    });
  }
});

// update user info

router.post("/update-user-info", authMiddleware, async (req, res) => {
  const { name, email, school, class_, userId, schoolType, phoneNumber } =
    req.body;
  try {
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        name,
        email,
        school,
        class: class_,
        schoolType,
        phoneNumber,
      },
      { new: true }
    );
    if (updatedUser) {
      res.send({
        message: "User info updated successfully",
        success: true,
        data: updatedUser,
      });
    } else {
      res.send({
        message: "Unable to update Info",
        success: false,
        data: "error",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: error.message,
      data: error,
      success: false,
    });
  }
});

router.post(
  "/update-user-photo",
  upload.single("profileImage"),
  authMiddleware,
  async (req, res) => {
    try {
      const { userId } = req.body;
      const profilePic = req.file;

      var folderName = "Profile";

      // Generate a unique filename with original extension
      const filename = `${folderName}/${uuidv4()}-${profilePic.originalname}`;

      const params = {
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: filename,
        Body: profilePic.buffer,
        ContentType: profilePic.mimetype || "application/octet-stream",
      };

      // Upload image to S3
      const s3Response = await s3.upload(params).promise();

      const imageUrl = s3Response.Location;

      console.log(s3Response, "imageUrl");

      // Update the user's profile image URL in the database
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { profileImage: imageUrl },
        { new: true }
      );

      if (updatedUser) {
        res.send({
          message: "User photo updated successfully",
          success: true,
          data: updatedUser,
        });
      } else {
        res.send({
          message: "Unable to update Photo",
          success: false,
          data: "error",
        });
      }
    } catch (error) {
      console.log(error);
      res.status(500).send({
        message: error.message,
        data: error,
        success: false,
      });
    }
  }
);
// block user
router.patch("/block-user", async (req, res) => {
  try {
    console.log("request :", req.body);
    const { studentId } = req.body;
    if (!studentId) {
      return res.status(400).send({ message: "UserId is not provided" });
    }
    // Find user and check if admin
    const user = await User.findById(studentId); // Use findById to avoid unnecessary update
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    if (user.isAdmin) {
      return res.status(403).send({ message: "Cannot block admin users" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      studentId,
      { isBlocked: !user.isBlocked },
      { new: true }
    );

    if (updatedUser.isBlocked) {
      res.send({
        message: "User is blocked successfully",
        success: true,
      });
    } else {
      res.send({
        message: "User is unblocked successfully",
        success: true,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: error.message,
      data: error,
      success: false,
    });
  }
});

// delete user
router.delete("/delete-user", async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { studentId } = req.body;

    if (!studentId) {
      return res.status(400).send({ message: "UserId is not provided" });
    }

    const user = await User.findById(studentId).session(session);
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    if (user.isAdmin) {
      return res.status(403).send({ message: "Cannot delete admin users" });
    }

    await User.findByIdAndDelete(studentId).session(session);

    await Review.deleteMany({ user: user._id }).session(session);
    await Report.deleteMany({ user: user._id }).session(session);
    await forumQuestion.deleteMany({ user: user._id }).session(session);

    await session.commitTransaction();
    session.endSession();

    res.send({
      message: "User deleted successfully, along with all related data",
      success: true,
    });
  } catch (error) {
    // Abort transaction on error
    await session.abortTransaction();
    session.endSession();

    console.log(error);
    res.status(500).send({
      message: error.message,
      data: error,
      success: false,
    });
  }
});

module.exports = router;
