const API_URL = import.meta.env.VITE_API_URL;

function getAuthHeaders() {
    const token = localStorage.getItem("token");

    return {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
    };
}

export async function getSettings() {
    const response = await fetch(`${API_URL}/settings`, {
        method: "GET",
        headers: getAuthHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || "Failed to fetch settings");
    }

    return data;
}

export async function updateThemePreference(themePreference) {
    const response = await fetch(`${API_URL}/settings/theme`, {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify({ themePreference }),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || "Failed to update theme");
    }

    return data;
}

export async function updateUsernameSetting(username) {
    const response = await fetch(`${API_URL}/settings/username`, {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify({ username }),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || "Failed to update username");
    }

    return data;
}

export async function changePassword(currentPassword, newPassword) {
    const response = await fetch(`${API_URL}/settings/password`, {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify({ currentPassword, newPassword }),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || "Failed to update password");
    }

    return data;
}

export async function exportUserData() {
    const response = await fetch(`${API_URL}/settings/export`, {
        method: "GET",
        headers: getAuthHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || "Failed to export data");
    }

    return data;
}

export async function deleteAccount(password) {
    const response = await fetch(`${API_URL}/settings/account`, {
        method: "DELETE",
        headers: getAuthHeaders(),
        body: JSON.stringify({ password }),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || "Failed to delete account");
    }

    return data;
}