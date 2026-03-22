const API_URL = import.meta.env.VITE_API_URL;

function getAuthHeaders() {
    const token = localStorage.getItem("token");

    return {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
    };
}

export async function getGoals() {
    const response = await fetch(`${API_URL}/goals`, {
        method: "GET",
        headers: getAuthHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || "Failed to fetch goals");
    }

    return data;
}

export async function createGoal(goal) {
    const response = await fetch(`${API_URL}/goals`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(goal),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || "Failed to create goal");
    }

    return data;
}

export async function completeGoal(id) {
    const response = await fetch(`${API_URL}/goals/${id}/complete`, {
        method: "PATCH",
        headers: getAuthHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || "Failed to complete goal");
    }

    return data;
}

export async function deleteGoal(id) {
    const response = await fetch(`${API_URL}/goals/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || "Failed to delete goal");
    }

    return data;
}