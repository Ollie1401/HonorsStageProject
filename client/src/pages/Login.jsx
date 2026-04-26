import { useState } from "react";
import { loginUser } from "../services/authService";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    async function handleSubmit(event) {
        event.preventDefault();
        setMessage("");
        setError("");
        setLoading(true);

        try {
            const data = await loginUser(email, password);

            await login(data.token, data.user);
            navigate("/");

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
        <div className="page auth-wrap">
            <h1>Login</h1>
            <form onSubmit={handleSubmit} className="card form-stack auth-card">
                <label className="form-label">
                    Email
                    <input
                        type="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        required                    />
                </label>

                <label className="form-label">
                    Password
                    <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        required
                    />

                    <label className="checkbox-row">
                        <input
                            type="checkbox"
                            checked={showPassword}
                            onChange={() => setShowPassword((current) => !current)}
                        />
                        Show password
                    </label>
                </label>

                <button type="submit" disabled={loading} className="btn btn-full">
                    {loading ? "Logging in..." : "Login"}
                </button>
            </form>

            {message && <p className="message message-success">{message}</p>}
            {error && <p className="message message-error">{error}</p>}
        </div>
    );
}