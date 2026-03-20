import { Routes, Route } from "react-router-dom";
import NavBar from "./components/NavBar";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import Planner from "./pages/Planner";
import Goals from "./pages/Goals";
import Log from "./pages/Log";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import Register from "./pages/Register";

export default function App() {
    return (
        <>
            <NavBar />
            <main style={{ padding: 16 }}>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route
                        path="/planner"
                        element={
                            <ProtectedRoute>
                                <Planner />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/goals"
                        element={
                            <ProtectedRoute>
                                <Goals />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/log"
                        element={
                            <ProtectedRoute>
                                <Log />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/profile"
                        element={
                            <ProtectedRoute>
                                <Profile />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/settings"
                        element={
                            <ProtectedRoute>
                                <Settings />
                            </ProtectedRoute>
                        }
                    />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                </Routes>
            </main>
        </>
    );
}