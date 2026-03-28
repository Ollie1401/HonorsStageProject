import express from "express";
import { pool } from "../db.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT id, title, entry_type, entry_date, notes, created_at
       FROM planner_entries
       WHERE user_id = $1
       ORDER BY entry_date ASC, created_at DESC`,
            [req.user.userId]
        );

        return res.json({
            ok: true,
            entries: result.rows,
        });
    } catch (error) {
        console.error("Get planner entries error:", error);
        return res.status(500).json({
            ok: false,
            error: "Server error while fetching planner entries",
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
            `INSERT INTO planner_entries (user_id, title, entry_type, entry_date, notes)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, title, entry_type, entry_date, notes, created_at`,
            [req.user.userId, title, entryType, entryDate, notes || null]
        );

        return res.status(201).json({
            ok: true,
            message: "Planner entry created successfully",
            entry: result.rows[0],
        });
    } catch (error) {
        console.error("Create planner entry error:", error);
        return res.status(500).json({
            ok: false,
            error: "Server error while creating planner entry",
        });
    }
});

router.delete("/:id", authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `DELETE FROM planner_entries
       WHERE id = $1 AND user_id = $2
       RETURNING id`,
            [id, req.user.userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                ok: false,
                error: "Planner entry not found",
            });
        }

        return res.json({
            ok: true,
            message: "Planner entry deleted successfully",
        });
    } catch (error) {
        console.error("Delete planner entry error:", error);
        return res.status(500).json({
            ok: false,
            error: "Server error while deleting planner entry",
        });
    }
});

router.patch("/:id/complete", authenticateToken, async (req, res) => {
    const client = await pool.connect();

    try {
        const { id } = req.params;

        await client.query("BEGIN");

        const plannerResult = await client.query(
            `SELECT id, title, entry_type, entry_date, notes
             FROM planner_entries
             WHERE id = $1 AND user_id = $2`,
            [id, req.user.userId]
        );

        if (plannerResult.rows.length === 0) {
            await client.query("ROLLBACK");
            return res.status(404).json({
                ok: false,
                error: "Planner entry not found",
            });
        }

        const plannerEntry = plannerResult.rows[0];

        const logResult = await client.query(
            `INSERT INTO log_entries (user_id, title, entry_type, entry_date, notes, source, completed_at)
             VALUES ($1, $2, $3, $4, $5, 'planner', NOW())
             RETURNING id, title, entry_type, entry_date, notes, source, completed_at, created_at`,
            [
                req.user.userId,
                plannerEntry.title,
                plannerEntry.entry_type,
                plannerEntry.entry_date,
                plannerEntry.notes,
            ]
        );

        await client.query(
            `DELETE FROM planner_entries
             WHERE id = $1 AND user_id = $2`,
            [id, req.user.userId]
        );

        await client.query("COMMIT");

        return res.json({
            ok: true,
            message: "Planner entry marked complete and moved to log",
            entry: logResult.rows[0],
        });
    } catch (error) {
        await client.query("ROLLBACK");
        console.error("Complete planner entry error:", error);
        return res.status(500).json({
            ok: false,
            error: "Server error while completing planner entry",
        });
    } finally {
        client.release();
    }
});

export default router;