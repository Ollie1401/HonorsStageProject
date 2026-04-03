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
        <div className="page">
            <h1>Log</h1>
            <p>Track completed meals, workouts, appointments and other entries.</p>

            <div className="card card-soft form-card">
                <h2>Add Log Entry</h2>

                <form onSubmit={handleSubmit} className="form-stack">
                    <label className="form-label">
                        Title
                        <input
                            type="text"
                            value={title}
                            onChange={(event) => setTitle(event.target.value)}
                            required
                        />
                    </label>

                    <label className="form-label">
                        Type
                        <select
                            value={entryType}
                            onChange={(event) => setEntryType(event.target.value)}
                        >
                            <option value="meal">Meal</option>
                            <option value="workout">Workout</option>
                            <option value="appointment">Appointment</option>
                            <option value="other">Other</option>
                        </select>
                    </label>

                    <label className="form-label">
                        Date
                        <input
                            type="date"
                            value={entryDate}
                            onChange={(event) => setEntryDate(event.target.value)}
                            required
                        />
                    </label>

                    <label className="form-label">
                        Notes
                        <textarea
                            value={notes}
                            onChange={(event) => setNotes(event.target.value)}
                            rows="4"
                        />
                    </label>

                    <button type="submit" disabled={loading} className="btn">
                        {loading ? "Saving..." : "Add to Log"}
                    </button>
                </form>
            </div>

            {message && <p className="message message-success">{message}</p>}
            {error && <p className="message message-error">{error}</p>}

            <h2>Logged Entries</h2>

            {entries.length === 0 ? (
                <p>No log entries yet.</p>
            ) : (
                Object.keys(groupedEntries)
                    .sort((a, b) => b.localeCompare(a))
                    .map((date) => (
                        <div key={date} className="section-block">
                            <h3>{date}</h3>

                            <div className="stack">
                                {groupedEntries[date].map((entry) => (
                                    <div key={entry.id} className="card">
                                        <h4>{entry.title}</h4>
                                        <p><strong>Type:</strong> {entry.entry_type}</p>
                                        <p><strong>Source:</strong> {entry.source}</p>
                                        {entry.notes && <p><strong>Notes:</strong> {entry.notes}</p>}

                                        <button
                                            onClick={() => handleDelete(entry.id)}
                                            className="btn btn-small btn-secondary"
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