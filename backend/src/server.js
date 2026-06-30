const path = require("path");
const express = require("express");
const cors = require("cors");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const pool = require("./db");
const apiRouter = require("./routes/api");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: "2mb" }));

app.use("/api", apiRouter);
app.use(express.static(path.join(__dirname, "../../frontend")));

app.get("/", (_req, res) => {
  res.sendFile(path.join(__dirname, "../../frontend/index.html"));
});

app.listen(PORT, async () => {
  console.log(`Employee ERP API running at http://localhost:${PORT}`);
  console.log(`Frontend served at http://localhost:${PORT}`);

  try {
    await pool.query("SELECT 1");
    console.log("Database connected");
  } catch (err) {
    console.error("\nDatabase connection failed:", err.message);
    console.error("Edit backend/.env and set DB_PASSWORD to your MySQL root password, then restart.\n");
  }
});
