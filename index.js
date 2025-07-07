const express = require("express");
const app = express();
const port = 3000;
const itemsRoute = require("./routes/items");

const mongoose = require("mongoose");

mongoose
  .connect(
    "mongodb+srv://nourkouider05:nour0205@cluster0.pbcypam.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
  )
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.use(express.json());
app.use("/api/items", itemsRoute);

app.get("/", (req, res) => {
  res.send("Hello DevOps World!");
});

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
