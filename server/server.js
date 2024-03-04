const express = require("express");
const app = express();
require("dotenv").config();
app.use(express.json());
const dbConfig = require("./config/dbConfig");
const cors = require('cors')
const path = require("path");
const port = process.env.PORT || 5000;

const usersRoute = require("./routes/usersRoute");
const examsRoute = require("./routes/examsRoute");
const resportsRoute = require("./routes/reportsRoute");
const studyRoute = require("./routes/studyRoute");
const reviewsRoute = require("./routes/reviewsRoute");
const forumQuestionRoute = require("./routes/forumQuestionRoute");

//Express Middlewares 
app.use(cors({
  // origin: "https://www.stjosephkibadaengine.com"
  origin: "http://localhost:3001"

}));
app.use('/uploads', express.static(path.join(__dirname, 'Photos')));

//Server Status Endpoint
app.get('/', (req, res) => {
  res.send('Server is Up!');
});

//Endpoint Routes
app.use("/api/users", usersRoute);
app.use("/api/exams", examsRoute);
app.use("/api/reports", resportsRoute);
app.use("/api/study", studyRoute);
app.use("/api/reviews", reviewsRoute);
app.use("/api/forum", forumQuestionRoute);

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});