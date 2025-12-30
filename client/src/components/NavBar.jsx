import { NavLink } from "react-router-dom";

const linkStyle = ({ isActive }) => ({
  fontWeight: isActive ? "700" : "400",
  textDecoration: "none",
  padding: "6px 8px",
  borderRadius: "8px",
});

export default function NavBar() {
  return (
    <nav style={{ display: "flex", gap: 10, padding: 12, borderBottom: "1px solid #ddd" }}>
      <NavLink to="/" style={linkStyle}>Home</NavLink>
      <NavLink to="/planner" style={linkStyle}>Planner</NavLink>
      <NavLink to="/goals" style={linkStyle}>Goals</NavLink>
      <NavLink to="/log" style={linkStyle}>Log</NavLink>
      <NavLink to="/profile" style={linkStyle}>Profile</NavLink>
      <NavLink to="/settings" style={linkStyle}>Settings</NavLink>
      <NavLink to="/login" style={linkStyle}>Login</NavLink>
      <NavLink to="/register" style={linkStyle}>Register</NavLink>
    </nav>
  );
}
