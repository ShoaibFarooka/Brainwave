const express = require("express");
const app = express();
const morgan = require('morgan');
const chalk = require('chalk');
require("dotenv").config();
const dbConfig = require("./config/dbConfig");
const cors = require('cors')
const path = require("path");
const port = process.env.PORT || 5000;

const usersRoute = require("./routes/usersRoute");
const plansRoute = require("./routes/planRoute");
const examsRoute = require("./routes/examsRoute");
const resportsRoute = require("./routes/reportsRoute");
const studyRoute = require("./routes/studyRoute");
const reviewsRoute = require("./routes/reviewsRoute");
const forumQuestionRoute = require("./routes/forumQuestionRoute");
const chatgptRoute = require("./routes/chatRoute");
const awsBucketRoute = require("./uploads/awsBucket");

//Express Middlewares 
// app.use(cors({
//   origin: "https://www.stjosephkibadaengine.com"
//   origin: "http://localhost:3001"

// }));
app.use(cors());

morgan.format('short', (tokens, req, res) => {
  const method = tokens.method(req, res);
  const url = tokens.url(req, res);
  const status = tokens.status(req, res);
  const responseTime = Math.round(tokens['response-time'](req, res)); // Remove decimals
  let colorStatus = status >= 400 ? chalk.red(status) : chalk.green(status);

  return `${chalk.blue(method)} ${chalk.yellow(url)} ${colorStatus} ${responseTime}ms`;
});
app.use(morgan('short'))
app.use('/uploads', express.static(path.join(__dirname, 'Photos')));
app.use(express.json({ limit: "110mb" })); // Adjust the limit as needed
app.use(express.urlencoded({ limit: "110mb", extended: true }));

//Server Status Endpoint
app.get('/', (req, res) => {
  res.send('Server is Up!');
});

//Endpoint Routes
app.use("/api/chatgpt", chatgptRoute);
app.use("/api/users", usersRoute);
app.use("/api/image", awsBucketRoute);
app.use("/api/exams", examsRoute);
app.use("/api/reports", resportsRoute);
app.use("/api/study", studyRoute);
app.use("/api/reviews", reviewsRoute);
app.use("/api/forum", forumQuestionRoute);
app.use("/api/plans", plansRoute);



app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});