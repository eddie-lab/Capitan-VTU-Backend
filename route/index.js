const express = require("express");
const handleRequest = require("../helpers/request");
const AuthRoutes = require("./auth.route");
const UserRoutes = require("./user.route");
const PaymentRoutes = require("./payment.route");
const WebhookRoutes = require("./webhook.routes");

const app = express();

app.use(handleRequest);
app.use("/auth", AuthRoutes);
app.use("/user", UserRoutes);
app.use("/payment", PaymentRoutes);
app.use("/webhook", WebhookRoutes);

module.exports = app;

