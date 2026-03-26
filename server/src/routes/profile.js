import express from "express";
import { pool } from "../db.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT id, email, username, points, selected_avatar, unlocked_avatars, selected_title, unlocked_titles
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
            profile: result.rows[0],
        });
    } catch (error) {
        console.error("Get profile error:", error);
        return res.status(500).json({
            ok: false,
            error: "Server error while fetching profile",
        });
    }
});

router.patch("/avatar", authenticateToken, async (req, res) => {
    try {
        const { avatar } = req.body;

        if (!avatar) {
            return res.status(400).json({
                ok: false,
                error: "Avatar is required",
            });
        }

        const userResult = await pool.query(
            `SELECT unlocked_avatars
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

        const unlockedAvatars = userResult.rows[0].unlocked_avatars || [];

        if (!unlockedAvatars.includes(avatar)) {
            return res.status(403).json({
                ok: false,
                error: "Avatar is not unlocked",
            });
        }

        const updatedUser = await pool.query(
            `UPDATE users
       SET selected_avatar = $1
       WHERE id = $2
       RETURNING id, email, points, selected_avatar, unlocked_avatars`,
            [avatar, req.user.userId]
        );

        return res.json({
            ok: true,
            message: "Avatar updated successfully",
            profile: updatedUser.rows[0],
        });
    } catch (error) {
        console.error("Update avatar error:", error);
        return res.status(500).json({
            ok: false,
            error: "Server error while updating avatar",
        });
    }
});

router.patch("/username", authenticateToken, async (req, res) => {
  const { username } = req.body;

  if (!username) {
    return res.status(400).json({
      ok: false,
      error: "Username required",
    });
  }

  const result = await pool.query(
    `UPDATE users
     SET username = $1
     WHERE id = $2
     RETURNING id, email, username, points, selected_avatar, unlocked_avatars, selected_title, unlocked_titles`,
    [username, req.user.userId]
  );

  return res.json({
    ok: true,
    profile: result.rows[0],
  });
});

router.patch("/title", authenticateToken, async (req, res) => {
  const { title } = req.body;

  if (!title) {
    return res.status(400).json({
      ok: false,
      error: "Title is required",
    });
  }

  const user = await pool.query(
    `SELECT unlocked_titles
     FROM users
     WHERE id = $1`,
    [req.user.userId]
  );

  if (user.rows.length === 0) {
    return res.status(404).json({
      ok: false,
      error: "User not found",
    });
  }

  const unlockedTitles = user.rows[0].unlocked_titles || [];

  if (!unlockedTitles.includes(title)) {
    return res.status(403).json({
      ok: false,
      error: "Title not unlocked",
    });
  }

  const result = await pool.query(
    `UPDATE users
     SET selected_title = $1
     WHERE id = $2
     RETURNING id, email, username, points, selected_avatar, unlocked_avatars, selected_title, unlocked_titles`,
    [title, req.user.userId]
  );

  return res.json({
    ok: true,
    profile: result.rows[0],
  });
});
export default router;