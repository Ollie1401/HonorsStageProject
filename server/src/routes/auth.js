import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
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

router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                ok: false,
                error: "Email and password are required",
            });
        }

        const userResult = await pool.query(
            "SELECT id, email, password_hash FROM users WHERE email = $1",
            [email]
        );

        if (userResult.rows.length === 0) {
            return res.status(401).json({
                ok: false,
                error: "Invalid email or password",
            });
        }

        const user = userResult.rows[0];

        const passwordMatches = await bcrypt.compare(password, user.password_hash);

        if (!passwordMatches) {
            return res.status(401).json({
                ok: false,
                error: "Invalid email or password",
            });
        }
        if (!process.env.JWT_SECRET) {
            return res.status(500).json({
                ok: false,
                error: "JWT secret is not configured",
            });
        }
        const token = jwt.sign(
            {
                userId: user.id,
                email: user.email,
            },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        return res.status(200).json({
            ok: true,
            message: "Login successful",
            token,
            user: {
                id: user.id,
                email: user.email,
            },
        });
    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({
            ok: false,
            error: "Server error while logging in",
        });
    }
});

export default router;