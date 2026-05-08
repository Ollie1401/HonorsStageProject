import dotenv from "dotenv";
import pg from "pg";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from server root
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const { Pool } = pg;

// Safety check
if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set in server/.env");
}

// Detect if using local DB
const isLocal = process.env.DATABASE_URL.includes("localhost");

export const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: isLocal ? false : { rejectUnauthorized: false },
});

// Test connection on startup
pool.connect()
    .then(client => {
        console.log("Database connected");
        client.release();
    })
    .catch(err => {
        console.error("Database connection error:", err.message);
    });