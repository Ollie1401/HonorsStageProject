import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getPlannerEntries, completePlannerEntry } from "../services/plannerService";
import { getGoals } from "../services/goalsService";
import { useLocation } from "react-router-dom";

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

    function getTodayLocalDate() {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, "0");
        const day = String(now.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    }

    const today = getTodayLocalDate();

    const [plannerEntries, setPlannerEntries] = useState([]);
    const [goals, setGoals] = useState([]);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const location = useLocation();

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
    }, [isAuthenticated, location]);

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
            <div className="page">
                <h1>DailyThrive</h1>
                <p>Your health planner for meals, workouts, goals and progress.</p>

                <div className="actions-row">
                    <button onClick={() => navigate("/login")} className="btn">
                        Login
                    </button>
                    <button onClick={() => navigate("/register")} className="btn btn-secondary">
                        Register
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="page">
            <h1>Home</h1>

            {message && <p className="message message-success">{message}</p>}
            {error && <p className="message message-error">{error}</p>}
            {loading && <p>Loading home page...</p>}

            <div className="page-grid">
                <div className="card hero-card">
                    <div className="emoji-xl">
                        {getAvatarEmoji(user?.selected_avatar)}
                    </div>
                    <h2>
                        {getGreeting()}, {user?.username || "User"}
                    </h2>
                    <p>
                        <strong>Title:</strong> {user?.selected_title || user?.title || "New Member"}
                    </p>
                    <p>
                        <strong>Total Points:</strong> {user?.points || 0}
                    </p>
                </div>

                <div className="card card-soft">
                    <h2>Today’s Progress</h2>
                    <p><strong>Total Planned:</strong> {todaysEntries.length}</p>
                    <p><strong>Meals:</strong> {mealCountToday}</p>
                    <p><strong>Workouts:</strong> {workoutCountToday}</p>
                    <p><strong>Appointments:</strong> {appointmentCountToday}</p>
                </div>

                <div className="card card-soft">
                    <h2>Goals Snapshot</h2>
                    <p><strong>Active Goals:</strong> {activeGoals.length}</p>
                    <p><strong>Completed Goals:</strong> {completedGoals.length}</p>

                    {activeGoals.slice(0, 2).map((goal) => (
                        <div key={goal.id} className="stack">
                            <strong>{goal.title}</strong>
                            {goal.deadline && (
                                <p className="small-text">Deadline: {goal.deadline}</p>
                            )}
                        </div>
                    ))}

                    {activeGoals.length === 0 && <p>No active goals yet.</p>}
                </div>

                <div className="card card-soft">
                    <h2>Quick Actions</h2>

                    <div className="quick-actions">
                        <button onClick={() => navigate("/planner")} className="btn btn-secondary">
                            Go to Planner
                        </button>

                        <button onClick={() => navigate("/log")} className="btn btn-secondary">
                            Go to Log
                        </button>

                        <button onClick={() => navigate("/goals")} className="btn btn-secondary">
                            View Goals
                        </button>

                        <button onClick={() => navigate("/rewards")} className="btn btn-secondary">
                            View Rewards
                        </button>
                    </div>
                </div>
            </div>

            <div className="spaced-top stack">
                <h2>Today’s Planner</h2>

                {todaysEntries.length === 0 ? (
                    <p>No planner entries for today.</p>
                ) : (
                    <div className="card">
                        {todaysEntries.map((entry) => (
                            <div key={entry.id} className="card">
                                <h3>{entry.title}</h3>
                                <p><strong>Type:</strong> {entry.entry_type}</p>
                                {entry.notes && <p><strong>Notes:</strong> {entry.notes}</p>}

                                <div className="actions-row">
                                    <button
                                        onClick={() => handleCompletePlannerEntry(entry.id)}
                                        className="btn btn-small"
                                    >
                                        Mark Complete
                                    </button>

                                    <button
                                        onClick={() => navigate("/planner")}
                                        className="btn btn-small btn-secondary"
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