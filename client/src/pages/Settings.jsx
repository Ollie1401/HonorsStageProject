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

function cardStyle() {
    return {
        border: "1px solid #ddd",
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
        background: "#fafafa",
        textAlign: "left",
    };
}

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
        <div>
            <h1>Settings</h1>

            {message && <p>{message}</p>}
            {error && <p style={{ color: "red" }}>{error}</p>}

            <div style={cardStyle()}>
                <h2 style={{ marginTop: 0 }}>Account</h2>

                <p><strong>Email:</strong> {profile.email}</p>
                <p><strong>Username:</strong> {profile.username || "Not set"}</p>
                <p><strong>Points:</strong> {profile.points || 0}</p>

                <div style={{ marginTop: 16 }}>
                    <label>
                        Username
                        <input
                            type="text"
                            value={usernameInput}
                            onChange={(event) => setUsernameInput(event.target.value)}
                            style={{
                                display: "block",
                                padding: 8,
                                marginTop: 6,
                                width: "100%",
                                maxWidth: 300,
                            }}
                        />
                    </label>

                    <button
                        onClick={handleUsernameSave}
                        style={{ marginTop: 10, padding: "8px 12px" }}
                    >
                        Save Username
                    </button>
                </div>
            </div>

            <div style={cardStyle()}>
                <h2 style={{ marginTop: 0 }}>Appearance</h2>

                <label style={{ display: "block", marginBottom: 12 }}>
                    Theme
                    <select
                        value={themePreference}
                        onChange={(event) => setThemePreference(event.target.value)}
                        style={{
                            display: "block",
                            padding: 8,
                            marginTop: 6,
                            width: "100%",
                            maxWidth: 300,
                        }}
                    >
                        <option value="light">Light</option>
                        <option value="dark">Dark</option>
                    </select>
                </label>

                <button onClick={handleThemeSave} style={{ padding: "8px 12px" }}>
                    Save Theme
                </button>
            </div>

            <div style={cardStyle()}>
                <h2 style={{ marginTop: 0 }}>Security</h2>

                <form onSubmit={handlePasswordChange}>
                    <label style={{ display: "block", marginBottom: 12 }}>
                        Current Password
                        <input
                            type="password"
                            value={currentPassword}
                            onChange={(event) => setCurrentPassword(event.target.value)}
                            style={{
                                display: "block",
                                padding: 8,
                                marginTop: 6,
                                width: "100%",
                                maxWidth: 300,
                            }}
                        />
                    </label>

                    <label style={{ display: "block", marginBottom: 12 }}>
                        New Password
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(event) => setNewPassword(event.target.value)}
                            style={{
                                display: "block",
                                padding: 8,
                                marginTop: 6,
                                width: "100%",
                                maxWidth: 300,
                            }}
                        />
                    </label>

                    <button type="submit" style={{ padding: "8px 12px" }}>
                        Change Password
                    </button>
                </form>
            </div>

            <div style={cardStyle()}>
                <h2 style={{ marginTop: 0 }}>Data & Privacy</h2>
                <p>
                    Your data is stored securely and this page gives you direct control over export
                    and deletion.
                </p>

                <button
                    onClick={handleExportData}
                    style={{ padding: "8px 12px", marginRight: 10 }}
                >
                    Export My Data
                </button>
            </div>

            <div
                style={{
                    ...cardStyle(),
                    border: "1px solid #d66",
                    background: "#fff5f5",
                }}
            >
                <h2 style={{ marginTop: 0 }}>Danger Zone</h2>
                <p>Deleting your account permanently removes your data.</p>

                <label style={{ display: "block", marginBottom: 12 }}>
                    Confirm Password
                    <input
                        type="password"
                        value={deletePassword}
                        onChange={(event) => setDeletePassword(event.target.value)}
                        style={{
                            display: "block",
                            padding: 8,
                            marginTop: 6,
                            width: "100%",
                            maxWidth: 300,
                        }}
                    />
                </label>

                <button
                    onClick={handleDeleteAccount}
                    style={{ padding: "8px 12px" }}
                >
                    Delete My Account
                </button>
            </div>
        </div>
    );
}