import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [authLoading, setAuthLoading] = useState(true);

    useEffect(() => {
        try {
            const savedToken = localStorage.getItem("token");
            const savedUser = localStorage.getItem("user");

            if (savedToken && savedUser) {
                setToken(savedToken);
                setUser(JSON.parse(savedUser));
            }
        } catch (error) {
            console.error("Failed to restore auth state:", error);
            localStorage.removeItem("token");
            localStorage.removeItem("user");
        } finally {
            setAuthLoading(false);
        }
    }, []);

    function login(authToken, authUser) {
        localStorage.setItem("token", authToken);
        localStorage.setItem("user", JSON.stringify(authUser));
        setToken(authToken);
        setUser(authUser);
    }

    function logout() {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setToken(null);
        setUser(null);
    }
    
    function updateUser(updatedUser) {
        localStorage.setItem("user", JSON.stringify(updatedUser));
         setUser(updatedUser);
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                authLoading,
                isAuthenticated: !!token,
                login,
                logout,
                updateUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}