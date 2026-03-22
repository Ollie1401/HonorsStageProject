import { useEffect, useState } from "react";
import {
    getGoals,
    createGoal,
    completeGoal,
    deleteGoal,
} from "../services/goalsService";

export default function Goals() {
    const [goals, setGoals] = useState([]);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [deadline, setDeadline] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function loadGoals() {
        try {
            setError("");
            const data = await getGoals();
            setGoals(data.goals);
        } catch (err) {
            setError(err.message);
        }
    }

    useEffect(() => {
        loadGoals();
    }, []);

    async function handleSubmit(event) {
        event.preventDefault();
        setMessage("");
        setError("");
        setLoading(true);

        try {
            await createGoal({
                title,
                description,
                deadline,
            });

            setMessage("Goal created successfully");
            setTitle("");
            setDescription("");
            setDeadline("");

            await loadGoals();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    async function handleComplete(id) {
        setMessage("");
        setError("");

        try {
            const data = await completeGoal(id);

            if (data.rewardUnlocked) {
                setMessage("Goal completed! You earned 100 points and unlocked a reward milestone!");
            } else {
                setMessage("Goal completed! You earned 100 points.");
            }

            await loadGoals();
        } catch (err) {
            setError(err.message);
        }
    }

    async function handleDelete(id) {
        setMessage("");
        setError("");

        try {
            await deleteGoal(id);
            setMessage("Goal deleted successfully");
            await loadGoals();
        } catch (err) {
            setError(err.message);
        }
    }

    const activeGoals = goals.filter((goal) => !goal.is_completed);
    const completedGoals = goals.filter((goal) => goal.is_completed);

    return (
        <div>
            <h1>Goals</h1>

            <form
                onSubmit={handleSubmit}
                style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 12,
                    maxWidth: 500,
                    marginBottom: 24,
                }}
            >
                <label>
                    Goal Title
                    <input
                        type="text"
                        value={title}
                        onChange={(event) => setTitle(event.target.value)}
                        required
                        style={{ display: "block", width: "100%", padding: 8, marginTop: 4 }}
                    />
                </label>

                <label>
                    Description
                    <textarea
                        value={description}
                        onChange={(event) => setDescription(event.target.value)}
                        rows="3"
                        style={{ display: "block", width: "100%", padding: 8, marginTop: 4 }}
                    />
                </label>

                <label>
                    Deadline
                    <input
                        type="date"
                        value={deadline}
                        onChange={(event) => setDeadline(event.target.value)}
                        style={{ display: "block", width: "100%", padding: 8, marginTop: 4 }}
                    />
                </label>

                <p><strong>Reward:</strong> 100 points</p>

                <button type="submit" disabled={loading} style={{ padding: 10 }}>
                    {loading ? "Creating Goal..." : "Create Goal"}
                </button>
            </form>

            {message && <p>{message}</p>}
            {error && <p style={{ color: "red" }}>{error}</p>}

            <h2>Active Goals</h2>

            {activeGoals.length === 0 ? (
                <p>No active goals yet.</p>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
                    {activeGoals.map((goal) => (
                        <div
                            key={goal.id}
                            style={{
                                border: "1px solid #ddd",
                                borderRadius: 8,
                                padding: 12,
                            }}
                        >
                            <h3 style={{ margin: "0 0 8px 0" }}>{goal.title}</h3>
                            {goal.description && <p>{goal.description}</p>}
                            {goal.deadline && <p><strong>Deadline:</strong> {goal.deadline}</p>}
                            <p><strong>Reward:</strong> 100 points</p>

                            <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
                                <button
                                    onClick={() => handleComplete(goal.id)}
                                    style={{ padding: "6px 10px" }}
                                >
                                    Mark Complete
                                </button>

                                <button
                                    onClick={() => handleDelete(goal.id)}
                                    style={{ padding: "6px 10px" }}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <h2>Completed Goals</h2>

            {completedGoals.length === 0 ? (
                <p>No completed goals yet.</p>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {completedGoals.map((goal) => (
                        <div
                            key={goal.id}
                            style={{
                                border: "1px solid #ddd",
                                borderRadius: 8,
                                padding: 12,
                                opacity: 0.8,
                            }}
                        >
                            <h3 style={{ margin: "0 0 8px 0" }}>{goal.title}</h3>
                            {goal.description && <p>{goal.description}</p>}
                            {goal.deadline && <p><strong>Deadline:</strong> {goal.deadline}</p>}
                            <p><strong>Reward:</strong> 100 points</p>
                            <p><strong>Status:</strong> Completed</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}