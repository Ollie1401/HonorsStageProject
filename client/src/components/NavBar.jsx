import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const linkClass = ({ isActive }) =>
    isActive ? "nav-link active" : "nav-link";

export default function NavBar() {
    const { user, isAuthenticated, logout } = useAuth();
    const [menuOpen, setMenuOpen] = useState(false);

    function closeMenu() {
        setMenuOpen(false);
    }

    return (
        <nav className="navbar">
            <div className="nav-top">
                <NavLink to="/" className="nav-brand" onClick={closeMenu}>
                    DailyThrive
                </NavLink>

                <button
                    type="button"
                    className="nav-toggle"
                    onClick={() => setMenuOpen((prev) => !prev)}
                >
                    ☰
                </button>
            </div>

            <div className={`nav-links-wrap ${menuOpen ? "open" : ""}`}>
                <div className="nav-links">
                    <NavLink to="/" className={linkClass} onClick={closeMenu}>
                        Home
                    </NavLink>

                    {isAuthenticated && (
                        <>
                            <NavLink to="/planner" className={linkClass} onClick={closeMenu}>
                                Planner
                            </NavLink>
                            <NavLink to="/goals" className={linkClass} onClick={closeMenu}>
                                Goals
                            </NavLink>
                            <NavLink to="/log" className={linkClass} onClick={closeMenu}>
                                Log
                            </NavLink>
                            <NavLink to="/profile" className={linkClass} onClick={closeMenu}>
                                Profile
                            </NavLink>
                            <NavLink to="/rewards" className={linkClass} onClick={closeMenu}>
                                Rewards
                            </NavLink>
                            <NavLink to="/settings" className={linkClass} onClick={closeMenu}>
                                Settings
                            </NavLink>
                        </>
                    )}

                    {!isAuthenticated && (
                        <>
                            <NavLink to="/login" className={linkClass} onClick={closeMenu}>
                                Login
                            </NavLink>
                            <NavLink to="/register" className={linkClass} onClick={closeMenu}>
                                Register
                            </NavLink>
                        </>
                    )}
                </div>

                {isAuthenticated && (
                    <div className="nav-account">
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
                    </div>
                )}
            </div>
        </nav>
    );
}