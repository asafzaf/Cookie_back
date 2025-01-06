const fs = require("fs");
const express = require("express");
const globalErrorHandler = require("../controllers/error.controller");
const mainRouter = require("../routers/main.router");
const logger = require("morgan");
const { NotFoundError } = require("../errors/errors");
const app = express();
const port = process.env.PORT || 3000;
const cors = require("cors");
const https = require("https");

const options = {
  key: fs.readFileSync("server.key"),
  cert: fs.readFileSync("server.cert"),
};

app.use(cors({
    origin: "*",
    methods: "GET,POST,PUT,DELETE",
    // allowedHeaders: "Content-Type,Authorization",
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(logger("dev"));

app.use("/", mainRouter);

app.all("*", (req, res, next) => {
  next(new NotFoundError(req.originalUrl));
});

app.use(globalErrorHandler);

const httpsServer = https.createServer(options, app);

const serv = httpsServer.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// const serv = app.listen(port, () => {
//   process.env.NODE_ENV === "test"
//     console.log(`Server is running on port ${port}`);
// });

process.on("unhandledRejection", (err) => {
  console.log(err.name, err.message);
  console.log("Unhandled Rejection! Shutting down...");
  serv.close(() => {
    process.exit(1);
  });
});

process.on("uncaughtException", (err) => {
  console.log(err.name, err.message);
  console.log("Uncaught Exception! Shutting down...");
  serv.close(() => {
    process.exit(1);
  });
});

module.exports = app;
