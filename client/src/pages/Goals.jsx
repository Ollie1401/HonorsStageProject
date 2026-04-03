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
        <div className="page">
            <h1>Goals</h1>

            <form onSubmit={handleSubmit} className="card form-stack form-card">
                <label className="form-label">
                    Goal Title
                    <input
                        type="text"
                        value={title}
                        onChange={(event) => setTitle(event.target.value)}
                        required
                    />
                </label>

                <label className="form-label">
                    Description
                    <textarea
                        value={description}
                        onChange={(event) => setDescription(event.target.value)}
                        rows="3"
                    />
                </label>

                <label className="form-label">
                    Deadline
                    <input
                        type="date"
                        value={deadline}
                        onChange={(event) => setDeadline(event.target.value)}
                    />
                </label>

                <p><strong>Reward:</strong> 100 points</p>

                <button type="submit" disabled={loading} className="btn">
                    {loading ? "Creating Goal..." : "Create Goal"}
                </button>
            </form>

            {message && <p className="message message-success">{message}</p>}
            {error && <p className="message message-error">{error}</p>}

            <h2>Active Goals</h2>

            {activeGoals.length === 0 ? (
                <p>No active goals yet.</p>
            ) : (
                <div className="stack section-block">
                    {activeGoals.map((goal) => (
                        <div key={goal.id} className="card">
                            <h3>{goal.title}</h3>
                            {goal.description && <p>{goal.description}</p>}
                            {goal.deadline && <p><strong>Deadline:</strong> {goal.deadline}</p>}
                            <p><strong>Reward:</strong> 100 points</p>

                            <div className="actions-row">
                                <button
                                    onClick={() => handleComplete(goal.id)}
                                    className="btn btn-small"
                                >
                                    Mark Complete
                                </button>

                                <button
                                    onClick={() => handleDelete(goal.id)}
                                    className="btn btn-small btn-secondary"
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
                    <div className="stack">
                    {completedGoals.map((goal) => (
                        <div key={goal.id} className="card card-muted">
                            <h3>{goal.title}</h3>
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