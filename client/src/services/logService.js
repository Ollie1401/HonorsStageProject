const API_URL = import.meta.env.VITE_API_URL;

function getAuthHeaders() {
    const token = localStorage.getItem("token");

    return {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
    };
}

export async function getLogEntries() {
    const response = await fetch(`${API_URL}/log`, {
        method: "GET",
        headers: getAuthHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || "Failed to fetch log entries");
    }

    return data;
}

export async function createLogEntry(entry) {
    const response = await fetch(`${API_URL}/log`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(entry),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || "Failed to create log entry");
    }

    return data;
}

export async function deleteLogEntry(id) {
    const response = await fetch(`${API_URL}/log/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || "Failed to delete log entry");
    }

    return data;
}