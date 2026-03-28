const API_URL = import.meta.env.VITE_API_URL;

function getAuthHeaders() {
    const token = localStorage.getItem("token");

    return {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
    };
}

export async function getPlannerEntries() {
    const response = await fetch(`${API_URL}/planner`, {
        method: "GET",
        headers: getAuthHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || "Failed to fetch planner entries");
    }

    return data;
}

export async function createPlannerEntry(entry) {
    const response = await fetch(`${API_URL}/planner`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(entry),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || "Failed to create planner entry");
    }

    return data;
}

export async function completePlannerEntry(id) {
    const response = await fetch(`${API_URL}/planner/${id}/complete`, {
        method: "PATCH",
        headers: getAuthHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || "Failed to complete planner entry");
    }

    return data;
}

export async function deletePlannerEntry(id) {
    const response = await fetch(`${API_URL}/planner/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || "Failed to delete planner entry");
    }

    return data;
}