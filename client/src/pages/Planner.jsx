import { useEffect, useMemo, useState } from "react";
import {
    getPlannerEntries,
    createPlannerEntry,
    completePlannerEntry,
    deletePlannerEntry,
} from "../services/plannerService";

function formatDateToYYYYMMDD(date) {
    return date.toISOString().split("T")[0];
}

function normalizeEntryDate(entryDate) {
    if (!entryDate) return "";
    return String(entryDate).split("T")[0];
}

function getMonthName(date) {
    return date.toLocaleString("default", { month: "long", year: "numeric" });
}

function buildCalendarDays(currentMonth) {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const startDay = firstDayOfMonth.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const calendarDays = [];

    for (let i = 0; i < startDay; i += 1) {
        calendarDays.push(null);
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
        calendarDays.push(new Date(year, month, day));
    }

    return calendarDays;
}

export default function Planner() {
    const today = new Date();

    const [entries, setEntries] = useState([]);
    const [currentMonth, setCurrentMonth] = useState(
        new Date(today.getFullYear(), today.getMonth(), 1)
    );
    const [selectedDate, setSelectedDate] = useState("");
    const [showEntryForm, setShowEntryForm] = useState(false);

    const [title, setTitle] = useState("");
    const [entryType, setEntryType] = useState("workout");
    const [notes, setNotes] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function loadEntries() {
        try {
            setError("");
            const data = await getPlannerEntries();
            setEntries(data.entries);
        } catch (err) {
            setError(err.message);
        }
    }

    useEffect(() => {
        loadEntries();
    }, []);

    const calendarDays = useMemo(() => buildCalendarDays(currentMonth), [currentMonth]);

    const selectedDateEntries = useMemo(() => {
        return entries.filter(
            (entry) => normalizeEntryDate(entry.entry_date) === selectedDate
        );
    }, [entries, selectedDate]);

    function getEntriesForDate(date) {
        const formattedDate = formatDateToYYYYMMDD(date);
        return entries.filter(
            (entry) => normalizeEntryDate(entry.entry_date) === formattedDate
        );
    }

    function goToPreviousMonth() {
        setCurrentMonth(
            new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
        );
    }

    function goToNextMonth() {
        setCurrentMonth(
            new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
        );
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setMessage("");
        setError("");
        setLoading(true);

        try {
            await createPlannerEntry({
                title,
                entryType,
                entryDate: selectedDate,
                notes,
            });

            setMessage("Planner entry created successfully");
            setTitle("");
            setEntryType("workout");
            setNotes("");
            setShowEntryForm(false);
            setSelectedDate("");

            await loadEntries();
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
            await completePlannerEntry(id);
            setMessage("Planner entry completed and moved to log");
            await loadEntries();
        } catch (err) {
            setError(err.message);
        }
    }

    async function handleDelete(id) {
        setMessage("");
        setError("");

        try {
            await deletePlannerEntry(id);
            setMessage("Planner entry deleted successfully");
            await loadEntries();
        } catch (err) {
            setError(err.message);
        }
    }

    return (
        <div className="page">
            <h1>Planner</h1>

            <div className="calendar-nav">
                <button onClick={goToPreviousMonth} className="btn btn-small btn-secondary">
                    ← Previous
                </button>

                <h2>{getMonthName(currentMonth)}</h2>

                <button onClick={goToNextMonth} className="btn btn-small btn-secondary">
                    Next →
                </button>
            </div>

            <div className="calendar-grid">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((dayName) => (
                    <div key={dayName} className="calendar-day-header">
                        {dayName}
                    </div>
                ))}

                {calendarDays.map((date, index) => {
                    if (!date) {
                        return <div key={`empty-${index}`} />;
                    }

                    const formattedDate = formatDateToYYYYMMDD(date);
                    const isSelected = formattedDate === selectedDate;
                    const dayEntries = getEntriesForDate(date);
                    const entryCount = dayEntries.length;

                    return (
                        <button
                            key={formattedDate}
                            onClick={() => {
                                setSelectedDate(formattedDate);
                                setShowEntryForm(true);
                            }}
                            className={`calendar-cell ${isSelected ? "selected" : ""}`}
                        >
                            <div>
                                {date.getDate()}
                            </div>

                            {dayEntries.slice(0, 2).map((entry) => (
                                <div key={entry.id} className="entry-pill">
                                    {entry.title}
                                </div>
                            ))}

                            {entryCount > 2 && (
                                <div className="small-text">
                                    +{entryCount - 2} more
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>

            {showEntryForm && selectedDate && (
                <div className="card card-soft form-card">
                    <h2>Add Entry for {selectedDate}</h2>

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
                                <option value="workout">Workout</option>
                                <option value="appointment">Appointment</option>
                                <option value="meal">Meal</option>
                                <option value="other">Other</option>
                            </select>
                        </label>

                        <label className="form-label">
                            Notes
                            <textarea
                                value={notes}
                                onChange={(event) => setNotes(event.target.value)}
                                rows="4"
                            />
                        </label>

                        <div className="actions-row">
                            <button type="submit" disabled={loading} className="btn">
                                {loading ? "Saving..." : "Add Entry to Selected Date"}
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    setShowEntryForm(false);
                                    setSelectedDate("");
                                    setTitle("");
                                    setEntryType("workout");
                                    setNotes("");
                                }}
                                className="btn btn-secondary"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {message && <p className="message message-success">{message}</p>}
            {error && <p className="message message-error">{error}</p>}

            {selectedDate && (
                <>
                    <h2>Entries for {selectedDate}</h2>

                    {selectedDateEntries.length === 0 ? (
                        <p>No planner entries for this date.</p>
                    ) : (
                            <div className="stack">
                            {selectedDateEntries.map((entry) => (
                                <div key={entry.id} className="card">
                                    <h3>{entry.title}</h3>
                                    <p><strong>Type:</strong> {entry.entry_type}</p>
                                    {entry.notes && <p><strong>Notes:</strong> {entry.notes}</p>}
                                    <div className="actions-row">
                                        <button
                                            onClick={() => handleComplete(entry.id)}
                                            className="btn btn-small"
                                        >
                                            Mark Complete
                                        </button>

                                        <button
                                            onClick={() => handleDelete(entry.id)}
                                            className="btn btn-small btn-secondary"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}