import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const linkClass = ({ isActive }) =>
    isActive ? "nav-link active" : "nav-link";

export default function NavBar() {
    const { user, isAuthenticated, logout } = useAuth();

    return (
        <nav className="navbar">
            <NavLink to="/" className={linkClass}>Home</NavLink>

            {isAuthenticated && (
                <>
                    <NavLink to="/planner" className={linkClass}>Planner</NavLink>
                    <NavLink to="/goals" className={linkClass}>Goals</NavLink>
                    <NavLink to="/log" className={linkClass}>Log</NavLink>
                    <NavLink to="/profile" className={linkClass}>Profile</NavLink>
                    <NavLink to="/rewards" className={linkClass}>Rewards</NavLink>
                    <NavLink to="/settings" className={linkClass}>Settings</NavLink>
                </>
            )}

            {!isAuthenticated ? (
                <>
                    <NavLink to="/login" className={linkClass}>Login</NavLink>
                    <NavLink to="/register" className={linkClass}>Register</NavLink>
                </>
            ) : (
                <>
                        <div className="nav-spacer" />
                        <div className="nav-user">
                        <div className="nav-avatar">
                      {user?.selected_avatar === "lotus-avatar"
                        ? "🪷"
                        : user?.selected_avatar === "elite-athlete-avatar"
                        ? "🏃"
                        : "🙂"}
                    </div>
                    <div><strong>{user?.username || "User"}</strong></div>
                    <div className="nav-title">{user?.selected_title || "New Member"}</div>
                    </div>

                    <button onClick={logout} className="btn btn-small btn-secondary">
                        Logout
                    </button>
                </>
            )}
        </nav>
    );
}