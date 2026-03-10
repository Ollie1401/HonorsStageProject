import express from "express";
import bcrypt from "bcrypt";
import { pool } from "../db.js";

const router = express.Router();

router.post("/register", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                ok: false,
                error: "Email and password are required",
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                ok: false,
                error: "Password must be at least 8 characters long",
            });
        }

        const existingUser = await pool.query(
            "SELECT id FROM users WHERE email = $1",
            [email]
        );

        if (existingUser.rows.length > 0) {
            return res.status(409).json({
                ok: false,
                error: "An account with this email already exists",
            });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const newUser = await pool.query(
            `INSERT INTO users (email, password_hash)
       VALUES ($1, $2)
       RETURNING id, email, created_at`,
            [email, passwordHash]
        );

        return res.status(201).json({
            ok: true,
            message: "User registered successfully",
            user: newUser.rows[0],
        });
    } catch (error) {
        console.error("Register error:", error);
        return res.status(500).json({
            ok: false,
            error: "Server error while registering user",
        });
    }
});

export default router;