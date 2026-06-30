const express = require("express");
const pool = require("../db");
const { TABLES } = require("../tables");
const { normalizeRow, normalizeRows } = require("../normalize");
const { seedDatabase } = require("../seed");

const router = express.Router();

function isValidTable(table) {
  return TABLES.includes(table);
}

router.get("/health", async (_req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ ok: true, database: "connected" });
  } catch (err) {
    res.status(503).json({ ok: false, error: err.message });
  }
});

router.post("/seed", async (_req, res) => {
  try {
    await seedDatabase(pool);
    res.json({ ok: true, message: "Sample data restored" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:table", async (req, res) => {
  const { table } = req.params;
  if (!isValidTable(table)) return res.status(404).json({ error: "Unknown table" });

  try {
    const [rows] = await pool.query(`SELECT * FROM \`${table}\``);
    res.json(normalizeRows(rows));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:table/:id", async (req, res) => {
  const { table, id } = req.params;
  if (!isValidTable(table)) return res.status(404).json({ error: "Unknown table" });

  try {
    const [rows] = await pool.query(`SELECT * FROM \`${table}\` WHERE id = ?`, [id]);
    if (!rows.length) return res.status(404).json({ error: "Not found" });
    res.json(normalizeRow(rows[0]));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/:table", async (req, res) => {
  const { table } = req.params;
  if (!isValidTable(table)) return res.status(404).json({ error: "Unknown table" });

  const data = { ...req.body };
  delete data.id;
  delete data.created_at;
  delete data.updated_at;
  delete data.uploaded_at;

  const keys = Object.keys(data).filter((k) => data[k] !== undefined);
  if (!keys.length) return res.status(400).json({ error: "No data provided" });

  try {
    const columns = keys.map((k) => `\`${k}\``).join(", ");
    const placeholders = keys.map(() => "?").join(", ");
    const [result] = await pool.query(
      `INSERT INTO \`${table}\` (${columns}) VALUES (${placeholders})`,
      keys.map((k) => data[k])
    );

    const [rows] = await pool.query(`SELECT * FROM \`${table}\` WHERE id = ?`, [result.insertId]);
    res.status(201).json(normalizeRow(rows[0]));
  } catch (err) {
    const status = err.code === "ER_DUP_ENTRY" ? 409 : 500;
    res.status(status).json({ error: err.sqlMessage || err.message });
  }
});

router.put("/:table/:id", async (req, res) => {
  const { table, id } = req.params;
  if (!isValidTable(table)) return res.status(404).json({ error: "Unknown table" });

  const data = { ...req.body };
  delete data.id;
  delete data.created_at;

  const keys = Object.keys(data).filter((k) => data[k] !== undefined);
  if (!keys.length) return res.status(400).json({ error: "No data provided" });

  try {
    const sets = keys.map((k) => `\`${k}\` = ?`).join(", ");
    const [result] = await pool.query(
      `UPDATE \`${table}\` SET ${sets} WHERE id = ?`,
      [...keys.map((k) => data[k]), id]
    );

    if (result.affectedRows === 0) return res.status(404).json({ error: "Not found" });

    const [rows] = await pool.query(`SELECT * FROM \`${table}\` WHERE id = ?`, [id]);
    res.json(normalizeRow(rows[0]));
  } catch (err) {
    const status = err.code === "ER_DUP_ENTRY" ? 409 : 500;
    res.status(status).json({ error: err.sqlMessage || err.message });
  }
});

router.delete("/:table/:id", async (req, res) => {
  const { table, id } = req.params;
  if (!isValidTable(table)) return res.status(404).json({ error: "Unknown table" });

  try {
    const [result] = await pool.query(`DELETE FROM \`${table}\` WHERE id = ?`, [id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: "Not found" });
    res.json({ ok: true });
  } catch (err) {
    const status = err.code === "ER_ROW_IS_REFERENCED_2" ? 409 : 500;
    res.status(status).json({ error: err.sqlMessage || err.message });
  }
});

module.exports = router;
