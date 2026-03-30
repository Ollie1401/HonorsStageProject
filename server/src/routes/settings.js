import express from "express";
import bcrypt from "bcrypt";
import { pool } from "../db.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();
const validThemes = ["light", "dark"];

router.get("/", authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT
                id,
                email,
                username,
                points,
                selected_avatar,
                unlocked_avatars,
                selected_title,
                unlocked_titles, 
                theme_preference,
                created_at
             FROM users
             WHERE id = $1`,
            [req.user.userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                ok: false,
                error: "User not found",
            });
        }

        return res.json({
            ok: true,
            settings: result.rows[0],
        });
    } catch (error) {
        console.error("Get settings error:", error);
        return res.status(500).json({
            ok: false,
            error: "Server error while fetching settings",
        });
    }
});

router.patch("/username", authenticateToken, async (req, res) => {
    try {
        const { username } = req.body;

        if (!username || !username.trim()) {
            return res.status(400).json({
                ok: false,
                error: "Username is required",
            });
        }

        const trimmedUsername = username.trim();

        const result = await pool.query(
            `UPDATE users
             SET username = $1
             WHERE id = $2
             RETURNING
                id,
                email,
                username,
                points,
                selected_avatar,
                unlocked_avatars,
                selected_title,
                unlocked_titles,
                theme_preference,
                created_at`,
            [trimmedUsername, req.user.userId]
        );

        return res.json({
            ok: true,
            message: "Username updated successfully",
            settings: result.rows[0],
        });
    } catch (error) {
        console.error("Update username error:", error);
        return res.status(500).json({
            ok: false,
            error: "Server error while updating username",
        });
    }
});

router.patch("/theme", authenticateToken, async (req, res) => {
    try {
        const { themePreference } = req.body;

        if (!validThemes.includes(themePreference)) {
            return res.status(400).json({
                ok: false,
                error: "Invalid theme preference",
            });
        }

        const result = await pool.query(
            `UPDATE users
             SET theme_preference = $1
             WHERE id = $2
             RETURNING
                id,
                email,
                username,
                points,
                selected_avatar,
                unlocked_avatars,
                selected_title,
                unlocked_titles,
                theme_preference,
                created_at`,
            [themePreference, req.user.userId]
        );

        return res.json({
            ok: true,
            message: "Theme updated successfully",
            settings: result.rows[0],
        });
    } catch (error) {
        console.error("Update theme error:", error);
        return res.status(500).json({
            ok: false,
            error: "Server error while updating theme",
        });
    }
});

router.patch("/password", authenticateToken, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                ok: false,
                error: "Current password and new password are required",
            });
        }

        if (newPassword.length < 8) {
            return res.status(400).json({
                ok: false,
                error: "New password must be at least 8 characters long",
            });
        }

        const userResult = await pool.query(
            `SELECT password_hash
             FROM users
             WHERE id = $1`,
            [req.user.userId]
        );

        if (userResult.rows.length === 0) {
            return res.status(404).json({
                ok: false,
                error: "User not found",
            });
        }

        const passwordMatches = await bcrypt.compare(
            currentPassword,
            userResult.rows[0].password_hash
        );

        if (!passwordMatches) {
            return res.status(401).json({
                ok: false,
                error: "Current password is incorrect",
            });
        }

        const newPasswordHash = await bcrypt.hash(newPassword, 10);

        await pool.query(
            `UPDATE users
             SET password_hash = $1
             WHERE id = $2`,
            [newPasswordHash, req.user.userId]
        );

        return res.json({
            ok: true,
            message: "Password updated successfully",
        });
    } catch (error) {
        console.error("Change password error:", error);
        return res.status(500).json({
            ok: false,
            error: "Server error while updating password",
        });
    }
});

router.get("/export", authenticateToken, async (req, res) => {
    try {
        const userResult = await pool.query(
            `SELECT
                id,
                email,
                username,
                points,
                selected_avatar,
                unlocked_avatars,
                selected_title,
                unlocked_titles,
                theme_preference,
                created_at
             FROM users
             WHERE id = $1`,
            [req.user.userId]
        );

        const plannerResult = await pool.query(
            `SELECT id, title, entry_type, entry_date, notes, created_at
             FROM planner_entries
             WHERE user_id = $1
             ORDER BY entry_date ASC, created_at DESC`,
            [req.user.userId]
        );

        const goalsResult = await pool.query(
            `SELECT id, title, description, deadline, points_reward, is_completed, created_at, completed_at
             FROM goals
             WHERE user_id = $1
             ORDER BY created_at DESC`,
            [req.user.userId]
        );

        let logEntries = [];
        try {
            const logResult = await pool.query(
                `SELECT id, title, entry_type, entry_date, notes, source, completed_at, created_at
                 FROM log_entries
                 WHERE user_id = $1
                 ORDER BY entry_date DESC, created_at DESC`,
                [req.user.userId]
            );
            logEntries = logResult.rows;
        } catch (logError) {
            console.warn("Log export skipped:", logError.message);
        }

        return res.json({
            ok: true,
            exportData: {
                exportedAt: new Date().toISOString(),
                profile: userResult.rows[0] || null,
                plannerEntries: plannerResult.rows,
                goals: goalsResult.rows,
                logEntries,
            },
        });
    } catch (error) {
        console.error("Export data error:", error);
        return res.status(500).json({
            ok: false,
            error: "Server error while exporting user data",
        });
    }
});

router.delete("/account", authenticateToken, async (req, res) => {
    try {
        const { password } = req.body;

        if (!password) {
            return res.status(400).json({
                ok: false,
                error: "Password is required to delete your account",
            });
        }

        const userResult = await pool.query(
            `SELECT password_hash
             FROM users
             WHERE id = $1`,
            [req.user.userId]
        );

        if (userResult.rows.length === 0) {
            return res.status(404).json({
                ok: false,
                error: "User not found",
            });
        }

        const passwordMatches = await bcrypt.compare(
            password,
            userResult.rows[0].password_hash
        );

        if (!passwordMatches) {
            return res.status(401).json({
                ok: false,
                error: "Password is incorrect",
            });
        }

        await pool.query(
            `DELETE FROM users
             WHERE id = $1`,
            [req.user.userId]
        );

        return res.json({
            ok: true,
            message: "Account deleted successfully",
        });
    } catch (error) {
        console.error("Delete account error:", error);
        return res.status(500).json({
            ok: false,
            error: "Server error while deleting account",
        });
    }
});

export default router;