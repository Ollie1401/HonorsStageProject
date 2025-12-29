import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
    res.json({ ok: true, app: "DailyThrive", message: "API is running" });
});

const PORT = process.env.PORT || 5050;

app.listen(PORT, () => {
    console.log(`DailyThrive API running on http://localhost:${PORT}`);
});
