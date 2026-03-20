import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const linkStyle = ({ isActive }) => ({
    fontWeight: isActive ? "700" : "400",
    textDecoration: "none",
    padding: "6px 8px",
    borderRadius: "8px",
});

export default function NavBar() {
    const { user, isAuthenticated, logout } = useAuth();

    return (
        <nav
            style={{
                display: "flex",
                gap: 10,
                padding: 12,
                borderBottom: "1px solid #ddd",
                alignItems: "center",
                flexWrap: "wrap",
            }}
        >
            <NavLink to="/" style={linkStyle}>Home</NavLink>

            {isAuthenticated && (
                <>
                    <NavLink to="/planner" style={linkStyle}>Planner</NavLink>
                    <NavLink to="/goals" style={linkStyle}>Goals</NavLink>
                    <NavLink to="/log" style={linkStyle}>Log</NavLink>
                    <NavLink to="/profile" style={linkStyle}>Profile</NavLink>
                    <NavLink to="/settings" style={linkStyle}>Settings</NavLink>
                </>
            )}

            {!isAuthenticated ? (
                <>
                    <NavLink to="/login" style={linkStyle}>Login</NavLink>
                    <NavLink to="/register" style={linkStyle}>Register</NavLink>
                </>
            ) : (
                <>
                    <span style={{ marginLeft: "auto" }}>
                        Signed in as {user?.email}
                    </span>
                    <button onClick={logout} style={{ padding: "6px 10px" }}>
                        Logout
                    </button>
                </>
            )}
        </nav>
    );
}