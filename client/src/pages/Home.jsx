import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getPlannerEntries, completePlannerEntry } from "../services/plannerService";
import { getGoals } from "../services/goalsService";

function normalizeEntryDate(entryDate) {
    if (!entryDate) return "";
    return String(entryDate).split("T")[0];
}

function getGreeting() {
    const hour = new Date().getHours();

    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
}

function getAvatarEmoji(avatarId) {
    if (avatarId === "lotus-avatar") return "🪷";
    if (avatarId === "elite-athlete-avatar") return "🏃";
    return "🙂";
}

export default function Home() {
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();

    const today = new Date().toISOString().split("T")[0];

    const [plannerEntries, setPlannerEntries] = useState([]);
    const [goals, setGoals] = useState([]);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    async function loadHomeData() {
        if (!isAuthenticated) {
            setLoading(false);
            return;
        }

        try {
            setError("");
            setLoading(true);

            const [plannerData, goalsData] = await Promise.all([
                getPlannerEntries(),
                getGoals(),
            ]);

            setPlannerEntries(plannerData.entries || []);
            setGoals(goalsData.goals || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadHomeData();
    }, [isAuthenticated]);

    const todaysEntries = useMemo(() => {
        return plannerEntries.filter(
            (entry) => normalizeEntryDate(entry.entry_date) === today
        );
    }, [plannerEntries, today]);

    const activeGoals = useMemo(() => {
        return goals.filter((goal) => !goal.is_completed);
    }, [goals]);

    const completedGoals = useMemo(() => {
        return goals.filter((goal) => goal.is_completed);
    }, [goals]);

    const mealCountToday = todaysEntries.filter(
        (entry) => entry.entry_type === "meal"
    ).length;

    const workoutCountToday = todaysEntries.filter(
        (entry) => entry.entry_type === "workout"
    ).length;

    const appointmentCountToday = todaysEntries.filter(
        (entry) => entry.entry_type === "appointment"
    ).length;

    async function handleCompletePlannerEntry(id) {
        setMessage("");
        setError("");

        try {
            await completePlannerEntry(id);
            setMessage("Entry completed and moved to log");
            await loadHomeData();
        } catch (err) {
            setError(err.message);
        }
    }

    if (!isAuthenticated) {
        return (
            <div>
                <h1>DailyThrive</h1>
                <p>Your health planner for meals, workouts, goals and progress.</p>

                <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
                    <button onClick={() => navigate("/login")} style={{ padding: "10px 14px" }}>
                        Login
                    </button>
                    <button onClick={() => navigate("/register")} style={{ padding: "10px 14px" }}>
                        Register
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div>
            <h1>Home</h1>

            {message && <p>{message}</p>}
            {error && <p style={{ color: "red" }}>{error}</p>}
            {loading && <p>Loading home page...</p>}

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                    gap: 16,
                }}
            >
                <div
                    style={{
                        border: "1px solid #ddd",
                        borderRadius: 12,
                        padding: 16,
                        textAlign: "left",
                        background: "#fafafa",
                    }}
                >
                    <div style={{ fontSize: 36, marginBottom: 8 }}>
                        {getAvatarEmoji(user?.selected_avatar)}
                    </div>
                    <h2 style={{ marginTop: 0 }}>
                        {getGreeting()}, {user?.username || "User"}
                    </h2>
                    <p style={{ marginBottom: 6 }}>
                        <strong>Title:</strong> {user?.selected_title || "New Member"}
                    </p>
                    <p style={{ marginBottom: 0 }}>
                        <strong>Total Points:</strong> {user?.points || 0}
                    </p>
                </div>

                <div
                    style={{
                        border: "1px solid #ddd",
                        borderRadius: 12,
                        padding: 16,
                        textAlign: "left",
                        background: "#fafafa",
                    }}
                >
                    <h2 style={{ marginTop: 0 }}>Today’s Progress</h2>
                    <p><strong>Total Planned:</strong> {todaysEntries.length}</p>
                    <p><strong>Meals:</strong> {mealCountToday}</p>
                    <p><strong>Workouts:</strong> {workoutCountToday}</p>
                    <p><strong>Appointments:</strong> {appointmentCountToday}</p>
                </div>

                <div
                    style={{
                        border: "1px solid #ddd",
                        borderRadius: 12,
                        padding: 16,
                        textAlign: "left",
                        background: "#fafafa",
                    }}
                >
                    <h2 style={{ marginTop: 0 }}>Goals Snapshot</h2>
                    <p><strong>Active Goals:</strong> {activeGoals.length}</p>
                    <p><strong>Completed Goals:</strong> {completedGoals.length}</p>

                    {activeGoals.slice(0, 2).map((goal) => (
                        <div key={goal.id} style={{ marginTop: 10 }}>
                            <strong>{goal.title}</strong>
                            {goal.deadline && (
                                <p style={{ margin: "4px 0 0 0" }}>Deadline: {goal.deadline}</p>
                            )}
                        </div>
                    ))}

                    {activeGoals.length === 0 && <p>No active goals yet.</p>}
                </div>

                <div
                    style={{
                        border: "1px solid #ddd",
                        borderRadius: 12,
                        padding: 16,
                        textAlign: "left",
                        background: "#fafafa",
                    }}
                >
                    <h2 style={{ marginTop: 0 }}>Quick Actions</h2>

                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        <button onClick={() => navigate("/planner")} style={{ padding: "10px 12px" }}>
                            Go to Planner
                        </button>

                        <button onClick={() => navigate("/log")} style={{ padding: "10px 12px" }}>
                            Go to Log
                        </button>

                        <button onClick={() => navigate("/goals")} style={{ padding: "10px 12px" }}>
                            View Goals
                        </button>

                        <button onClick={() => navigate("/rewards")} style={{ padding: "10px 12px" }}>
                            View Rewards
                        </button>
                    </div>
                </div>
            </div>

            <div style={{ marginTop: 24 }}>
                <h2>Today’s Planner</h2>

                {todaysEntries.length === 0 ? (
                    <p>No planner entries for today.</p>
                ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        {todaysEntries.map((entry) => (
                            <div
                                key={entry.id}
                                style={{
                                    border: "1px solid #ddd",
                                    borderRadius: 8,
                                    padding: 12,
                                    textAlign: "left",
                                }}
                            >
                                <h3 style={{ margin: "0 0 8px 0" }}>{entry.title}</h3>
                                <p><strong>Type:</strong> {entry.entry_type}</p>
                                {entry.notes && <p><strong>Notes:</strong> {entry.notes}</p>}

                                <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
                                    <button
                                        onClick={() => handleCompletePlannerEntry(entry.id)}
                                        style={{ padding: "6px 10px" }}
                                    >
                                        Mark Complete
                                    </button>

                                    <button
                                        onClick={() => navigate("/planner")}
                                        style={{ padding: "6px 10px" }}
                                    >
                                        Open Planner
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}