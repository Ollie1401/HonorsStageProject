import { useEffect, useState } from "react";
import {
  getProfile,
  updateAvatar,
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
  const { user, updateUser } = useAuth();

  const [profile, setProfile] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

useEffect(() => {
  async function fetchProfile() {
    try {
      setError("");
      const data = await getProfile();
      setProfile(data.profile);
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
        updateUser({
            ...(user || {}),
            ...data.profile,
        });
        setMessage("Avatar updated successfully");
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
        updateUser({
            ...(user || {}),
            ...data.profile,
        });
        setMessage("Title updated successfully");
    } catch (err) {
      setError(err.message);
    }
  }

  if (!profile) {
    return <p>Loading profile...</p>;
  }

  return (
      <div className="page">
      <h1>Profile</h1>

        <div className="card hero-card section-block">
        <div className="emoji-xl">
          {getAvatarEmoji(profile.selected_avatar)}
        </div>
        <h2>
          {profile.username || "Set your username"}
        </h2>
        <p className="page-subtitle">
          {profile.selected_title || "New Member"}
        </p>
        <p><strong>Email:</strong> {profile.email}</p>
        <p><strong>Total Points:</strong> {profile.points}</p>
      </div>

          {message && <p className="message message-success">{message}</p>}
          {error && <p className="message message-error">{error}</p>}

      <div className="card hero-card section-block">
        <h2>Choose Your Avatar</h2>

        <div className="page-grid">
          {avatarOptions.map((avatar) => {
            const isUnlocked = profile.unlocked_avatars?.includes(avatar.id);
            const isSelected = profile.selected_avatar === avatar.id;

            return (
                <div key={avatar.id} className={`card option-card ${isSelected ? "selected" : ""} ${!isUnlocked ? "locked" : ""}`}>                <div className="emoji-lg">{avatar.emoji}</div>
                    <p className="page-subtitle">
                  <strong>{avatar.label}</strong>
                </p>
                    <p className="page-subtitle">
                  {isUnlocked ? "Unlocked" : "Locked"}
                </p>

                <button
                  onClick={() => handleAvatarChange(avatar.id)}
                  disabled={!isUnlocked || isSelected}
                  className="btn btn-small"
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

        <div className="stack">
          {profile.unlocked_titles?.map((title) => {
            const isSelected = profile.selected_title === title;

            return (
                <div key={title} className={`card option-card ${isSelected ? "selected" : ""}`}>
                    <p className="page-subtitle">
                  <strong>{title}</strong>
                </p>
                <button
                  onClick={() => handleTitleChange(title)}
                  disabled={isSelected}
                  className="btn btn-small"
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