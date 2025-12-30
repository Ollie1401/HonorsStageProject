import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { pool } from "./db.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
    res.json({ ok: true, app: "DailyThrive", message: "API is running" });
});

app.get("/db-test", async (req, res) => {
    try {
        const result = await pool.query("SELECT 1 AS ok;");
        res.json({ ok: true, db: result.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            ok: false,
            error: "Database connection failed",
        });
    }
});

const PORT = process.env.PORT || 5050;

app.listen(PORT, () => {
    console.log(`DailyThrive API running on http://localhost:${PORT}`);
});
