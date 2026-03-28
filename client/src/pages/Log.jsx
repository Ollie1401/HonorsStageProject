import { useEffect, useMemo, useState } from "react";
import {
    getLogEntries,
    createLogEntry,
    deleteLogEntry,
} from "../services/logService";

function normalizeEntryDate(entryDate) {
    if (!entryDate) return "";
    return String(entryDate).split("T")[0];
}

export default function Log() {
    const today = new Date().toISOString().split("T")[0];

    const [entries, setEntries] = useState([]);
    const [title, setTitle] = useState("");
    const [entryType, setEntryType] = useState("meal");
    const [entryDate, setEntryDate] = useState(today);
    const [notes, setNotes] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function loadEntries() {
        try {
            setError("");
            const data = await getLogEntries();
            setEntries(data.entries);
        } catch (err) {
            setError(err.message);
        }
    }

    useEffect(() => {
        loadEntries();
    }, []);

    const groupedEntries = useMemo(() => {
        const groups = {};

        entries.forEach((entry) => {
            const dateKey = normalizeEntryDate(entry.entry_date);

            if (!groups[dateKey]) {
                groups[dateKey] = [];
            }

            groups[dateKey].push(entry);
        });

        return groups;
    }, [entries]);

    async function handleSubmit(event) {
        event.preventDefault();
        setMessage("");
        setError("");
        setLoading(true);

        try {
            await createLogEntry({
                title,
                entryType,
                entryDate,
                notes,
            });

            setMessage("Log entry added successfully");
            setTitle("");
            setEntryType("meal");
            setEntryDate(today);
            setNotes("");

            await loadEntries();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    async function handleDelete(id) {
        setMessage("");
        setError("");

        try {
            await deleteLogEntry(id);
            setMessage("Log entry deleted successfully");
            await loadEntries();
        } catch (err) {
            setError(err.message);
        }
    }

    return (
        <div>
            <h1>Log</h1>
            <p>Track completed meals, workouts, appointments and other entries.</p>

            <div
                style={{
                    border: "1px solid #ddd",
                    borderRadius: 12,
                    padding: 16,
                    maxWidth: 500,
                    marginBottom: 24,
                    background: "#fafafa",
                }}
            >
                <h2 style={{ marginTop: 0 }}>Add Log Entry</h2>

                <form
                    onSubmit={handleSubmit}
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 12,
                    }}
                >
                    <label>
                        Title
                        <input
                            type="text"
                            value={title}
                            onChange={(event) => setTitle(event.target.value)}
                            required
                            style={{ display: "block", width: "100%", padding: 8, marginTop: 4 }}
                        />
                    </label>

                    <label>
                        Type
                        <select
                            value={entryType}
                            onChange={(event) => setEntryType(event.target.value)}
                            style={{ display: "block", width: "100%", padding: 8, marginTop: 4 }}
                        >
                            <option value="meal">Meal</option>
                            <option value="workout">Workout</option>
                            <option value="appointment">Appointment</option>
                            <option value="other">Other</option>
                        </select>
                    </label>

                    <label>
                        Date
                        <input
                            type="date"
                            value={entryDate}
                            onChange={(event) => setEntryDate(event.target.value)}
                            required
                            style={{ display: "block", width: "100%", padding: 8, marginTop: 4 }}
                        />
                    </label>

                    <label>
                        Notes
                        <textarea
                            value={notes}
                            onChange={(event) => setNotes(event.target.value)}
                            rows="4"
                            style={{ display: "block", width: "100%", padding: 8, marginTop: 4 }}
                        />
                    </label>

                    <button type="submit" disabled={loading} style={{ padding: 10 }}>
                        {loading ? "Saving..." : "Add to Log"}
                    </button>
                </form>
            </div>

            {message && <p>{message}</p>}
            {error && <p style={{ color: "red" }}>{error}</p>}

            <h2>Logged Entries</h2>

            {entries.length === 0 ? (
                <p>No log entries yet.</p>
            ) : (
                Object.keys(groupedEntries)
                    .sort((a, b) => b.localeCompare(a))
                    .map((date) => (
                        <div key={date} style={{ marginBottom: 24 }}>
                            <h3>{date}</h3>

                            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                                {groupedEntries[date].map((entry) => (
                                    <div
                                        key={entry.id}
                                        style={{
                                            border: "1px solid #ddd",
                                            borderRadius: 8,
                                            padding: 12,
                                        }}
                                    >
                                        <h4 style={{ margin: "0 0 8px 0" }}>{entry.title}</h4>
                                        <p><strong>Type:</strong> {entry.entry_type}</p>
                                        <p><strong>Source:</strong> {entry.source}</p>
                                        {entry.notes && <p><strong>Notes:</strong> {entry.notes}</p>}

                                        <button
                                            onClick={() => handleDelete(entry.id)}
                                            style={{ marginTop: 8, padding: "6px 10px" }}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
            )}
        </div>
    );
}