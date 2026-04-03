import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getProfile } from "../services/profileService";
import {
    getSettings,
    updateUsernameSetting,
    updateThemePreference,
    changePassword,
    exportUserData,
    deleteAccount,
} from "../services/settingsService";

export default function Settings() {
    const navigate = useNavigate();
    const { user, updateUser, logout } = useAuth();

    const [profile, setProfile] = useState(null);
    const [settings, setSettings] = useState(null);

    const [usernameInput, setUsernameInput] = useState("");
    const [themePreference, setThemePreference] = useState("light");

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [deletePassword, setDeletePassword] = useState("");

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    async function loadPageData() {
        try {
            setLoading(true);
            setError("");

            const [profileData, settingsData] = await Promise.all([
                getProfile(),
                getSettings(),
            ]);

            setProfile(profileData.profile);
            setSettings(settingsData.settings);

            setUsernameInput(profileData.profile.username || "");
            setThemePreference(settingsData.settings.theme_preference || "light");
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadPageData();
    }, []);

    async function handleUsernameSave() {
        try {
            setMessage("");
            setError("");

            const data = await updateUsernameSetting(usernameInput);
            setSettings(data.settings);
            setProfile((prev) => ({
                ...prev,
                username: data.settings.username,
            }));
            updateUser({
                ...(user || {}),
                username: data.settings.username,
            });
            setMessage("Username updated successfully");
        } catch (err) {
            setError(err.message);
        }
    }

    async function handleThemeSave() {
        try {
            setMessage("");
            setError("");

            const data = await updateThemePreference(themePreference);
            setSettings(data.settings);

            updateUser({
                ...(user || {}),
                theme_preference: data.settings.theme_preference,
            });

            setMessage("Theme updated successfully");
        } catch (err) {
            setError(err.message);
        }
    }

    async function handlePasswordChange(event) {
        event.preventDefault();

        try {
            setMessage("");
            setError("");

            await changePassword(currentPassword, newPassword);
            setCurrentPassword("");
            setNewPassword("");
            setMessage("Password updated successfully");
        } catch (err) {
            setError(err.message);
        }
    }

    async function handleExportData() {
        try {
            setMessage("");
            setError("");

            const data = await exportUserData();

            const blob = new Blob(
                [JSON.stringify(data.exportData, null, 2)],
                { type: "application/json" }
            );

            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = "dailythrive-data-export.json";
            link.click();
            window.URL.revokeObjectURL(url);

            setMessage("Data export downloaded successfully");
        } catch (err) {
            setError(err.message);
        }
    }

    async function handleDeleteAccount() {
        const confirmed = window.confirm(
            "Are you sure you want to permanently delete your account? This cannot be undone."
        );

        if (!confirmed) {
            return;
        }

        try {
            setMessage("");
            setError("");

            await deleteAccount(deletePassword);
            logout();
            navigate("/register");
        } catch (err) {
            setError(err.message);
        }
    }

    if (loading) {
        return <p>Loading settings...</p>;
    }

    if (!profile || !settings) {
        return <p>Unable to load settings.</p>;
    }

    return (
        <div className="page">
            <h1>Settings</h1>

            {message && <p className="message message-success">{message}</p>}
            {error && <p className="message message-error">{error}</p>}

            <div className="card card-soft stack">
                <h2>Account</h2>

                <div className="info-list">
                    <p><strong>Email:</strong> {profile.email}</p>
                    <p><strong>Username:</strong> {profile.username || "Not set"}</p>
                    <p><strong>Points:</strong> {profile.points || 0}</p>
                </div>

                <div className="stack">
                    <label className="form-label inline-field">
                        Username
                        <input
                            type="text"
                            value={usernameInput}
                            onChange={(event) => setUsernameInput(event.target.value)}
                        />
                    </label>

                    <div className="actions-row">
                        <button className="btn" onClick={handleUsernameSave}>
                            Save Username
                        </button>
                    </div>
                </div>
            </div>

            <div className="card card-soft stack">
                <h2>Appearance</h2>

                <label className="form-label inline-field">
                    Theme
                    <select
                        value={themePreference}
                        onChange={(event) => setThemePreference(event.target.value)}
                    >
                        <option value="light">Light</option>
                        <option value="dark">Dark</option>
                    </select>
                </label>

                <div className="actions-row">
                    <button className="btn" onClick={handleThemeSave}>
                        Save Theme
                    </button>
                </div>
            </div>

            <div className="card stack">
                <h2>Security</h2>

                <form onSubmit={handlePasswordChange} className="form-stack">
                    <label className="form-label inline-field">
                        Current Password
                        <input
                            type="password"
                            value={currentPassword}
                            onChange={(event) => setCurrentPassword(event.target.value)}
                        />
                    </label>

                    <label className="form-label inline-field">
                        New Password
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(event) => setNewPassword(event.target.value)}
                        />
                    </label>

                    <div className="actions-row">
                        <button type="submit" className="btn">
                            Change Password
                        </button>
                    </div>
                </form>
            </div>

            <div className="card stack">
                <h2>Data & Privacy</h2>
                <p>
                    Your data is stored securely and this page gives you direct control over export
                    and deletion.
                </p>

                <div className="actions-row">
                    <button className="btn btn-secondary" onClick={handleExportData}>
                        Export My Data
                    </button>
                </div>
            </div>

            <div className="card card-danger stack">
                <h2>Danger Zone</h2>
                <p>Deleting your account permanently removes your data.</p>

                <label className="form-label inline-field">
                    Confirm Password
                    <input
                        type="password"
                        value={deletePassword}
                        onChange={(event) => setDeletePassword(event.target.value)}
                    />
                </label>

                <div className="actions-row">
                    <button className="btn btn-danger" onClick={handleDeleteAccount}>
                        Delete My Account
                    </button>
                </div>
            </div>
        </div>
    );
}