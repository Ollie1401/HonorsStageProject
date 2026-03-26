import { useEffect, useState } from "react";
import {
  getProfile,
  updateAvatar,
  updateUsername,
  updateTitle,
} from "../services/profileService";
import { useAuth } from "../context/AuthContext";

const avatarOptions = [
  { id: "default-avatar", label: "Default Avatar", emoji: "🙂" },
  { id: "lotus-avatar", label: "Lotus Avatar", emoji: "🪷" },
  { id: "elite-athlete-avatar", label: "Elite Athlete Avatar", emoji: "🏃" },
];

function getAvatarEmoji(avatarId) {
  const avatar = avatarOptions.find((item) => item.id === avatarId);
  return avatar ? avatar.emoji : "🙂";
}

export default function Profile() {
  const { updateUser } = useAuth();

  const [profile, setProfile] = useState(null);
  const [usernameInput, setUsernameInput] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

useEffect(() => {
  async function fetchProfile() {
    try {
      setError("");
      const data = await getProfile();
      setProfile(data.profile);
      setUsernameInput(data.profile.username || "");
    } catch (err) {
      setError(err.message);
    }
  }

  fetchProfile();
}, []);
  async function handleAvatarChange(avatarId) {
    try {
      setMessage("");
      setError("");
      const data = await updateAvatar(avatarId);
      setProfile(data.profile);
      updateUser(data.profile);
      setMessage("Avatar updated successfully");
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleUsernameUpdate() {
    try {
      setMessage("");
      setError("");
      const data = await updateUsername(usernameInput);
      setProfile(data.profile);
      updateUser(data.profile);
      setMessage("Username updated successfully");
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleTitleChange(title) {
    try {
      setMessage("");
      setError("");
      const data = await updateTitle(title);
      setProfile(data.profile);
      updateUser(data.profile);
      setMessage("Title updated successfully");
    } catch (err) {
      setError(err.message);
    }
  }

  if (!profile) {
    return <p>Loading profile...</p>;
  }

  return (
    <div>
      <h1>Profile</h1>

      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 48, marginBottom: 8 }}>
          {getAvatarEmoji(profile.selected_avatar)}
        </div>
        <h2 style={{ margin: "0 0 4px 0" }}>
          {profile.username || "Set your username"}
        </h2>
        <p style={{ margin: "0 0 12px 0" }}>
          {profile.selected_title || "New Member"}
        </p>
        <p><strong>Email:</strong> {profile.email}</p>
        <p><strong>Total Points:</strong> {profile.points}</p>
      </div>

      {message && <p>{message}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      <div style={{ marginBottom: 24 }}>
        <h2>Set Username</h2>
        <input
          type="text"
          value={usernameInput}
          onChange={(event) => setUsernameInput(event.target.value)}
          placeholder="Enter username"
          style={{ padding: 8, marginRight: 8 }}
        />
        <button onClick={handleUsernameUpdate} style={{ padding: "8px 12px" }}>
          Save Username
        </button>
      </div>

      <div style={{ marginBottom: 24 }}>
        <h2>Choose Your Avatar</h2>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          {avatarOptions.map((avatar) => {
            const isUnlocked = profile.unlocked_avatars?.includes(avatar.id);
            const isSelected = profile.selected_avatar === avatar.id;

            return (
              <div
                key={avatar.id}
                style={{
                  border: isSelected ? "2px solid #333" : "1px solid #ddd",
                  borderRadius: 8,
                  padding: 12,
                  minWidth: 160,
                  opacity: isUnlocked ? 1 : 0.5,
                }}
              >
                <div style={{ fontSize: 32, marginBottom: 8 }}>{avatar.emoji}</div>
                <p style={{ margin: "0 0 8px 0" }}>
                  <strong>{avatar.label}</strong>
                </p>
                <p style={{ margin: "0 0 8px 0" }}>
                  {isUnlocked ? "Unlocked" : "Locked"}
                </p>

                <button
                  onClick={() => handleAvatarChange(avatar.id)}
                  disabled={!isUnlocked || isSelected}
                  style={{ padding: "6px 10px" }}
                >
                  {isSelected ? "Selected" : "Select"}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <h2>Choose Your Title</h2>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {profile.unlocked_titles?.map((title) => {
            const isSelected = profile.selected_title === title;

            return (
              <div
                key={title}
                style={{
                  border: isSelected ? "2px solid #333" : "1px solid #ddd",
                  borderRadius: 8,
                  padding: 12,
                  maxWidth: 300,
                }}
              >
                <p style={{ margin: "0 0 8px 0" }}>
                  <strong>{title}</strong>
                </p>
                <button
                  onClick={() => handleTitleChange(title)}
                  disabled={isSelected}
                  style={{ padding: "6px 10px" }}
                >
                  {isSelected ? "Selected" : "Select"}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}