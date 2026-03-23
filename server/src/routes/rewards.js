import express from "express";
import { pool } from "../db.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

const rewardMilestones = [
    {
        milestone: 1000,
        name: "Sun Sticker Pack",
        type: "stickers",
        description: "Unlock a bright sticker pack for your profile.",
    },
    {
        milestone: 2000,
        name: "Lotus Avatar",
        type: "avatar",
        description: "Unlock a calm lotus profile avatar.",
    },
    {
        milestone: 3000,
        name: "Goal Crusher Badge",
        type: "badge",
        description: "Unlock a badge for smashing your goals.",
    },
    {
        milestone: 4000,
        name: "Star Theme Unlock",
        type: "theme",
        description: "Unlock a star-themed app style.",
    },
    {
        milestone: 5000,
        name: "Elite Athlete Avatar",
        type: "avatar",
        description: "Unlock an elite athlete profile avatar.",
    },
];

router.get("/", authenticateToken, async (req, res) => {
    try {
        const userResult = await pool.query(
            `SELECT points FROM users WHERE id = $1`,
            [req.user.userId]
        );

        if (userResult.rows.length === 0) {
            return res.status(404).json({
                ok: false,
                error: "User not found",
            });
        }

        const totalPoints = userResult.rows[0].points || 0;

        const unlockedRewards = rewardMilestones.filter(
            (reward) => totalPoints >= reward.milestone
        );

        const nextReward =
            rewardMilestones.find((reward) => totalPoints < reward.milestone) || null;

        const pointsUntilNextReward = nextReward
            ? nextReward.milestone - totalPoints
            : 0;

        return res.json({
            ok: true,
            totalPoints,
            unlockedRewards,
            nextReward,
            pointsUntilNextReward,
            rewardMilestones,
        });
    } catch (error) {
        console.error("Get rewards error:", error);
        return res.status(500).json({
            ok: false,
            error: "Server error while fetching rewards",
        });
    }
});

export default router;