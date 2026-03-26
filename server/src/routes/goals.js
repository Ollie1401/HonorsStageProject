import express from "express";
import { pool } from "../db.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT id, title, description, deadline, points_reward, is_completed, created_at, completed_at
       FROM goals
       WHERE user_id = $1
       ORDER BY is_completed ASC, deadline ASC NULLS LAST, created_at DESC`,
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
        const { title, description, deadline } = req.body;

        if (!title) {
            return res.status(400).json({
                ok: false,
                error: "Title is required",
            });
        }

        const result = await pool.query(
            `INSERT INTO goals (user_id, title, description, deadline)
       VALUES ($1, $2, $3, $4)
       RETURNING id, title, description, deadline, points_reward, is_completed, created_at, completed_at`,
            [
                req.user.userId,
                title,
                description || null,
                deadline || null,
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
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const goalResult = await client.query(
            `SELECT id, points_reward, is_completed
       FROM goals
       WHERE id = $1 AND user_id = $2`,
            [req.params.id, req.user.userId]
        );

        if (goalResult.rows.length === 0) {
            await client.query("ROLLBACK");
            return res.status(404).json({
                ok: false,
                error: "Goal not found",
            });
        }

        const goal = goalResult.rows[0];

        if (goal.is_completed) {
            await client.query("ROLLBACK");
            return res.status(400).json({
                ok: false,
                error: "Goal is already completed",
            });
        }

        const updatedGoal = await client.query(
            `UPDATE goals
       SET is_completed = TRUE,
           completed_at = NOW()
       WHERE id = $1
       RETURNING id, title, description, deadline, points_reward, is_completed, created_at, completed_at`,
            [req.params.id]
        );

        await client.query(
            `UPDATE users
   SET points = points + 100
   WHERE id = $1`,
            [req.user.userId]
        );

        const userPoints = await client.query(
            `SELECT points, unlocked_avatars, unlocked_titles FROM users WHERE id = $1`,
            [req.user.userId]
        );

        const totalPoints = userPoints.rows[0].points;
        const unlockedAvatars = userPoints.rows[0].unlocked_avatars || ["default-avatar"];
        const unlockedTitles = userPoints.rows[0].unlocked_titles || ["New Member"];

        let newAvatar = null;
        let newTitle = null;

        
if (totalPoints >= 500 && !unlockedTitles.includes("Getting Started")) {
  newTitle = "Getting Started";
}
if (totalPoints >= 1000 && !unlockedTitles.includes("Goal Crusher")) {
  newTitle = "Goal Crusher";
}
if (totalPoints >= 1500 && !unlockedTitles.includes("Wellness Warrior")) {
  newTitle = "Wellness Warrior";
}
if (totalPoints >= 2000 && !unlockedAvatars.includes("lotus-avatar")) {
  newAvatar = "lotus-avatar";
}
if (totalPoints >= 2500 && !unlockedTitles.includes("DailyThrive Star")) {
  newTitle = "DailyThrive Star";
}
if (totalPoints >= 3000 && !unlockedTitles.includes("Unstoppable")) {
  newTitle = "Unstoppable";
}
if (totalPoints >= 5000 && !unlockedAvatars.includes("elite-athlete-avatar")) {
  newAvatar = "elite-athlete-avatar";
}
        if (newAvatar) {
            await client.query(
                `UPDATE users SET unlocked_avatars = array_append(unlocked_avatars, $1)
     WHERE id = $2`,
                [newAvatar, req.user.userId]
            );
        }

        if (newTitle) {
            await client.query(
                `UPDATE users SET unlocked_titles = array_append(unlocked_titles, $1)
     WHERE id = $2`,
                [newTitle, req.user.userId]
            );
        }

        await client.query("COMMIT");

        return res.json({
            ok: true,
            message: "Goal completed successfully",
            goal: updatedGoal.rows[0],
            totalPoints,
            newAvatarUnlocked: newAvatar,
            newTitleUnlocked: newTitle,
        });
    } catch (error) {
        await client.query("ROLLBACK");
        console.error("Complete goal error:", error);
        return res.status(500).json({
            ok: false,
            error: "Server error while completing goal",
        });
    } finally {
        client.release();
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