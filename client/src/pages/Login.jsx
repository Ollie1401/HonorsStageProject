import { useState } from "react";
import { loginUser } from "../services/authService";
import { useAuth } from "../context/AuthContext";

export default function Login() {
    const { login } = useAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(event) {
        event.preventDefault();
        setMessage("");
        setError("");
        setLoading(true);

        try {
            const data = await loginUser(email, password);

            login(data.token, data.user);

            setMessage(`Logged in as ${data.user.email}`);
            setEmail("");
            setPassword("");
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div>
            <h1>Login</h1>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 400 }}>
                <label>
                    Email
                    <input
                        type="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        required
                        style={{ display: "block", width: "100%", padding: 8, marginTop: 4 }}
                    />
                </label>

                <label>
                    Password
                    <input
                        type="password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        required
                        style={{ display: "block", width: "100%", padding: 8, marginTop: 4 }}
                    />
                </label>

                <button type="submit" disabled={loading} style={{ padding: 10 }}>
                    {loading ? "Logging in..." : "Login"}
                </button>
            </form>

            {message && <p style={{ marginTop: 12 }}>{message}</p>}
            {error && <p style={{ marginTop: 12, color: "red" }}>{error}</p>}
        </div>
    );
}