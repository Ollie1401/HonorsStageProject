const API_URL = import.meta.env.VITE_API_URL;

function getAuthHeaders() {
  const token = localStorage.getItem("token");

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

export async function getProfile() {
  const response = await fetch(`${API_URL}/profile`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to fetch profile");
  }

  return data;
}

export async function updateAvatar(avatar) {
  const response = await fetch(`${API_URL}/profile/avatar`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify({ avatar }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to update avatar");
  }

  return data;
}

export async function updateUsername(username) {
  const response = await fetch(`${API_URL}/profile/username`, {
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

export async function updateTitle(title) {
  const response = await fetch(`${API_URL}/profile/title`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify({ title }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to update title");
  }

  return data;
}