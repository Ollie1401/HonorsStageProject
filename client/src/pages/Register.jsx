import { useState } from "react";
import { registerUser } from "../services/authService";

export default function Register() {
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
            const data = await registerUser(email, password);
            setMessage(`Account created for ${data.user.email}`);
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
            <h1>Register</h1>
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
                        minLength={8}
                        style={{ display: "block", width: "100%", padding: 8, marginTop: 4 }}
                    />
                </label>

                <button type="submit" disabled={loading} style={{ padding: 10 }}>
                    {loading ? "Creating account..." : "Register"}
                </button>
            </form>

            {message && <p style={{ marginTop: 12 }}>{message}</p>}
            {error && <p style={{ marginTop: 12, color: "red" }}>{error}</p>}
        </div>
    );
}