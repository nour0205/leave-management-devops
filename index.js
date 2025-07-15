const express = require("express");
const app = express();
const port = 3000;

const leaveRoutes = require("./dashboard/routes/leaveRoutes");

const userRoutes = require("./dashboard/routes/userRoutes");

const teamRoutes = require("./dashboard/routes/teamRoutes");

const notificationRoutes = require("./dashboard/routes/notificationRoutes");

const managerRoutes = require("./dashboard/routes/managerRoutes");

const roleRoutes = require("./dashboard/routes/roleRoutes"); // for /roles

const path = require("path");

const mongoose = require("mongoose");

if (process.env.NODE_ENV !== "test") {
  mongoose
    .connect(
      "mongodb+srv://nourkouider05:nour0205@cluster0.pbcypam.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
    )
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => console.error("MongoDB connection error:", err));
}
app.use(express.json());

app.use("/api/leaves", leaveRoutes);
app.use("/api/users", userRoutes);
app.use("/api/teams", teamRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/manager", managerRoutes);
app.use("/api/roles", roleRoutes);

const frontendPath = path.join(__dirname, "frontend/dist");

if (process.env.NODE_ENV !== "test") {
  app.use(express.static(frontendPath));

  app.get("*", (req, res) => {
    res.sendFile("index.html", { root: frontendPath });
  });
}

if (process.env.NODE_ENV !== "test") {
  app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`);
  });
}
module.exports = app;
