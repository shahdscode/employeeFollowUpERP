const { BOOLEAN_FIELDS, DATE_FIELDS, DATETIME_FIELDS } = require("./tables");

function normalizeRow(row) {
  if (!row) return row;
  const out = { ...row };

  for (const [key, value] of Object.entries(out)) {
    if (value == null) continue;

    if (typeof value === "bigint") {
      out[key] = Number(value);
      continue;
    }

    if (value instanceof Date) {
      if (DATE_FIELDS.has(key)) {
        out[key] = value.toISOString().slice(0, 10);
      } else if (DATETIME_FIELDS.has(key)) {
        out[key] = value.toISOString();
      } else if (typeof value === "object" && value.toISOString) {
        out[key] = value.toISOString().slice(11, 19);
      }
      continue;
    }

    if (typeof value === "string" && (key === "check_in" || key === "check_out" || key === "start_time" || key === "end_time")) {
      out[key] = value.slice(0, 5);
      continue;
    }

    if (BOOLEAN_FIELDS.has(key)) {
      out[key] = Boolean(value);
    }
  }

  return out;
}

function normalizeRows(rows) {
  return rows.map(normalizeRow);
}

module.exports = { normalizeRow, normalizeRows };
