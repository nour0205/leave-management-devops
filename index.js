const express = require("express");
const app = express();

require("dotenv").config();

const authRoutes = require("./dashboard/routes/authRoutes");
const userRoutes = require("./dashboard/routes/userRoutes");
const leaveRoutes = require("./dashboard/routes/leaveRoutes");
const notificationRoutes = require("./dashboard/routes/notificationRoutes");

const path = require("path");

const mongoose = require("mongoose");

const port = 3000;
const mongoURI = "mongodb://mongo:27017/my_app";
const dbUrl = "postgresql://postgres:nour1234@postgres:5432/dashboarddb";

if (process.env.NODE_ENV !== "test") {
  mongoose
    .connect(mongoURI)
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => console.error("MongoDB connection error:", err));
}
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/leaves", leaveRoutes);
app.use("/api/notifications", notificationRoutes);

const frontendPath = path.join(__dirname, "public");

if (process.env.NODE_ENV !== "test") {
  app.use(express.static(frontendPath));

  app.get(/^\/(?!api).*/, (req, res) => {
    res.sendFile("index.html", { root: frontendPath });
  });
}

if (process.env.NODE_ENV !== "test") {
  app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`);
  });
}
module.exports = app;
