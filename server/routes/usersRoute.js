const router = require("express").Router();
const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const authMiddleware = require("../middlewares/authMiddleware");
const nodemailer = require('nodemailer');
const multer = require("multer");
const { Storage } = require('@google-cloud/storage');
const { v4: uuidv4 } = require('uuid');

// Configure Multer Memory Storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Create a Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.SENDER_EMAIL,
    pass: process.env.SENDER_EMAIL_PASSWORD,
  },
});

// Google Cloud Storage Setup
const GoogleStorage = new Storage({
  projectId: 'proud-stage-416018',
  keyFilename: 'proud-stage-416018-d682ff695aac.json',
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
    const userExists = await User.findOne({ email: req.body.email });
    if (userExists) {
      return res
        .status(200)
        .send({ message: "User already exists", success: false });
    }

    // hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);
    req.body.password = hashedPassword;

    // create new user
    const newUser = new User(req.body);
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
    const randomOTP = generateOTP();
    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: 'OTP to Verify Email!',
      text: `Here is your 6 digits OTP "${randomOTP}" to verify email.`,
    };
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log('Error sending email:', error);
        return res.status(500).send('Error sending email.');
      }
      console.log('Email sent:', info.response);
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
      return res
        .status(403)
        .send({ message: "You are blocked. Please contact your moderator", success: false });
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
    if(users && users.length>0){
      res.send({
        users,
        success: true,
      });
    }else{
      console.error("No User Found");
      res.status(404).send({
        message:"No User Found",
        success: false,
      })
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: error.message });
    
  }
});

// get user info

router.post("/get-user-info", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.body.userId);
    setTimeout(() => {
      res.send({
        message: "User info fetched successfully",
        success: true,
        data: user,
      });
    }, 5000);
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
  const { name, email, school, class_, userId } = req.body;
  try {
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        name,
        email,
        school,
        class: class_
      },
      { new: true }
    );
    if (updatedUser) {
      res.send({
        message: "User info updated successfully",
        success: true,
        data: updatedUser,
      });
    }
    else {
      res.send({
        message: "Unable to update Info",
        success: false,
        data: 'error',
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

router.post("/update-user-photo", upload.single('profileImage'), authMiddleware, async (req, res) => {
  try {
    const { userId } = req.body;
    const profilePic = req.file;

    // Upload the image to Google Cloud Storage
    const bucketName = 'stjoseph';
    const filename = `${uuidv4()}-${profilePic.originalname}`;
    const file = GoogleStorage.bucket(bucketName).file(filename);

    await file.save(profilePic.buffer, {
      metadata: {
        contentType: profilePic.mimetype,
      },
    });

    const imageUrl = `https://storage.googleapis.com/${bucketName}/${filename}`;

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
    }
    else {
      res.send({
        message: "Unable to update Photo",
        success: false,
        data: 'error',
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

// block user
router.patch("/block-user",async (req, res) => {
  try {
    const { studentId } = req.body
    if(!studentId){
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
 
     await User.findByIdAndUpdate(studentId,{ isBlocked: !user.isBlocked }, { new: true });
      res.send({
        message: "User is blocked successfully",
        success: true,
      });
    }
  catch (error) {
    console.log(error);
    res.status(500).send({
      message: error.message,
      data: error,
      success: false,
    });
  }
});


module.exports = router;

