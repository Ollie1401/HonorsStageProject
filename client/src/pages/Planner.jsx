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
        <div>
            <h1>Planner</h1>

            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 16,
                    maxWidth: 700,
                }}
            >
                <button onClick={goToPreviousMonth} style={{ padding: "8px 12px" }}>
                    ← Previous
                </button>

                <h2 style={{ margin: 0 }}>{getMonthName(currentMonth)}</h2>

                <button onClick={goToNextMonth} style={{ padding: "8px 12px" }}>
                    Next →
                </button>
            </div>

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(7, 1fr)",
                    gap: 8,
                    maxWidth: 700,
                    marginBottom: 24,
                }}
            >
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((dayName) => (
                    <div
                        key={dayName}
                        style={{
                            fontWeight: "bold",
                            textAlign: "center",
                            padding: 8,
                        }}
                    >
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
                            style={{
                                minHeight: 100,
                                border: isSelected ? "2px solid #333" : "1px solid #ddd",
                                borderRadius: 8,
                                background: isSelected ? "#f3f3f3" : "white",
                                padding: 8,
                                textAlign: "left",
                                cursor: "pointer",
                            }}
                        >
                            <div style={{ fontWeight: "bold", marginBottom: 6 }}>
                                {date.getDate()}
                            </div>

                            {dayEntries.slice(0, 2).map((entry) => (
                                <div
                                    key={entry.id}
                                    style={{
                                        fontSize: 11,
                                        marginBottom: 4,
                                        padding: "2px 4px",
                                        borderRadius: 4,
                                        background: "#eaeaea",
                                        overflow: "hidden",
                                        whiteSpace: "nowrap",
                                        textOverflow: "ellipsis",
                                    }}
                                >
                                    {entry.title}
                                </div>
                            ))}

                            {entryCount > 2 && (
                                <div style={{ fontSize: 11, marginTop: 4 }}>
                                    +{entryCount - 2} more
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>

            {showEntryForm && selectedDate && (
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
                    <h2 style={{ marginTop: 0 }}>Add Entry for {selectedDate}</h2>

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
                                <option value="workout">Workout</option>
                                <option value="appointment">Appointment</option>
                                <option value="meal">Meal</option>
                                <option value="other">Other</option>
                            </select>
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

                        <div style={{ display: "flex", gap: 10 }}>
                            <button type="submit" disabled={loading} style={{ padding: 10 }}>
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
                                style={{ padding: 10 }}
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {message && <p>{message}</p>}
            {error && <p style={{ color: "red" }}>{error}</p>}

            {selectedDate && (
                <>
                    <h2>Entries for {selectedDate}</h2>

                    {selectedDateEntries.length === 0 ? (
                        <p>No planner entries for this date.</p>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                            {selectedDateEntries.map((entry) => (
                                <div
                                    key={entry.id}
                                    style={{
                                        border: "1px solid #ddd",
                                        borderRadius: 8,
                                        padding: 12,
                                    }}
                                >
                                    <h3 style={{ margin: "0 0 8px 0" }}>{entry.title}</h3>
                                    <p><strong>Type:</strong> {entry.entry_type}</p>
                                    {entry.notes && <p><strong>Notes:</strong> {entry.notes}</p>}
                                    <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                                        <button
                                            onClick={() => handleComplete(entry.id)}
                                            style={{ padding: "6px 10px" }}
                                        >
                                            Mark Complete
                                        </button>

                                        <button
                                            onClick={() => handleDelete(entry.id)}
                                            style={{ padding: "6px 10px" }}
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