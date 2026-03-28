import express from "express";
import { pool } from "../db.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT id, title, entry_type, entry_date, notes, source, completed_at, created_at
             FROM log_entries
             WHERE user_id = $1
             ORDER BY entry_date DESC, created_at DESC`,
            [req.user.userId]
        );

        return res.json({
            ok: true,
            entries: result.rows,
        });
    } catch (error) {
        console.error("Get log entries error:", error);
        return res.status(500).json({
            ok: false,
            error: "Server error while fetching log entries",
        });
    }
});

router.post("/", authenticateToken, async (req, res) => {
    try {
        const { title, entryType, entryDate, notes } = req.body;

        if (!title || !entryType || !entryDate) {
            return res.status(400).json({
                ok: false,
                error: "Title, entryType and entryDate are required",
            });
        }

        const result = await pool.query(
            `INSERT INTO log_entries (user_id, title, entry_type, entry_date, notes, source, completed_at)
             VALUES ($1, $2, $3, $4, $5, 'manual', NOW())
             RETURNING id, title, entry_type, entry_date, notes, source, completed_at, created_at`,
            [req.user.userId, title, entryType, entryDate, notes || null]
        );

        return res.status(201).json({
            ok: true,
            message: "Log entry created successfully",
            entry: result.rows[0],
        });
    } catch (error) {
        console.error("Create log entry error:", error);
        return res.status(500).json({
            ok: false,
            error: "Server error while creating log entry",
        });
    }
});

router.delete("/:id", authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `DELETE FROM log_entries
             WHERE id = $1 AND user_id = $2
             RETURNING id`,
            [id, req.user.userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                ok: false,
                error: "Log entry not found",
            });
        }

        return res.json({
            ok: true,
            message: "Log entry deleted successfully",
        });
    } catch (error) {
        console.error("Delete log entry error:", error);
        return res.status(500).json({
            ok: false,
            error: "Server error while deleting log entry",
        });
    }
});

export default router;