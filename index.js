const express = require("express");
const rateLimiter = require("./rateLimiter");


const app = express();

app.use(rateLimiter);

app.get("/api/data", (req, res) => {
  res.json({ message: "Success" });
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
