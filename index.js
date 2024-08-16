const express = require("express");
const config = require("./config/variables");
const http = require("http");
const appRoutes = require("./route/");
const handleResponse = require("./helpers/response");
const {connectDB }= require("./config/database");
const rtracer = require("cls-rtracer");

const app = express();
const server = http.createServer(app);

const PORT = config.PORT;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(rtracer.expressMiddleware());

// Routes
app.get("/", (req, res) => {
  return res.send("Welcome to bill payment service");
});

app.use("/api", appRoutes);

// UNHANDLED ROUTES
app.all("*", (req, res) => {
  return res.status(404).json({
    status: "error",
    data: { message: `Route ${req.originalUrl} not found` },
  });
});

app.use((err, req, res, next) => {
  console.log(err);
  return handleResponse(
    req,
    res,
    { message: "An error occurred, try again later" },
    500
  );

  next();
});

server.listen(PORT, async () => {
  connectDB();
  console.log(`REST API running on port ${PORT}`);
});

process.on("SIGINT", () => {
  console.log("SIGINT signal received");
  process.exit(1);
});

process.on("SIGTERM", () => {
  console.log("SIGTERM signal received");
  process.exit(1);
});

process.on("SIGQUIT", () => {
  console.log("SIGQUIT signal received");
  process.exit(1);
});
