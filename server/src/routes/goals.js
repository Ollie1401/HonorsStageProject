import express from "express";
import { pool } from "../db.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT id, title, description, target_date, points, is_completed, completed_at, created_at
       FROM goals
       WHERE user_id = $1
       ORDER BY is_completed ASC, target_date ASC NULLS LAST, created_at DESC`,
            [req.user.userId]
        );

        return res.json({
            ok: true,
            goals: result.rows,
        });
    } catch (error) {
        console.error("Get goals error:", error);
        return res.status(500).json({
            ok: false,
            error: "Server error while fetching goals",
        });
    }
});

router.post("/", authenticateToken, async (req, res) => {
    try {
        const { title, description, targetDate, points } = req.body;

        if (!title) {
            return res.status(400).json({
                ok: false,
                error: "Title is required",
            });
        }

        const result = await pool.query(
            `INSERT INTO goals (user_id, title, description, target_date, points)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, title, description, target_date, points, is_completed, completed_at, created_at`,
            [
                req.user.userId,
                title,
                description || null,
                targetDate || null,
                points || 10,
            ]
        );

        return res.status(201).json({
            ok: true,
            message: "Goal created successfully",
            goal: result.rows[0],
        });
    } catch (error) {
        console.error("Create goal error:", error);
        return res.status(500).json({
            ok: false,
            error: "Server error while creating goal",
        });
    }
});

router.patch("/:id/complete", authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `UPDATE goals
       SET is_completed = TRUE,
           completed_at = NOW()
       WHERE id = $1 AND user_id = $2 AND is_completed = FALSE
       RETURNING id, title, points, is_completed, completed_at`,
            [id, req.user.userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                ok: false,
                error: "Goal not found or already completed",
            });
        }

        return res.json({
            ok: true,
            message: "Goal completed successfully",
            goal: result.rows[0],
            pointsAwarded: result.rows[0].points,
        });
    } catch (error) {
        console.error("Complete goal error:", error);
        return res.status(500).json({
            ok: false,
            error: "Server error while completing goal",
        });
    }
});

router.delete("/:id", authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `DELETE FROM goals
       WHERE id = $1 AND user_id = $2
       RETURNING id`,
            [id, req.user.userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                ok: false,
                error: "Goal not found",
            });
        }

        return res.json({
            ok: true,
            message: "Goal deleted successfully",
        });
    } catch (error) {
        console.error("Delete goal error:", error);
        return res.status(500).json({
            ok: false,
            error: "Server error while deleting goal",
        });
    }
});

export default router;