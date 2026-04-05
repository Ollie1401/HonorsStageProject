import { createContext, useContext, useEffect, useState } from "react";
import { getProfile } from "../services/profileService";

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
                const parsedUser = JSON.parse(savedUser);
                setToken(savedToken);
                setUser(parsedUser);

                getProfile(savedToken)
                    .then((profileData) => {
                        const fullUser = {
                            ...parsedUser,
                            ...profileData.profile,
                            token: savedToken,
                        };

                        localStorage.setItem("user", JSON.stringify(fullUser));
                        setUser(fullUser);
                    })
                    .catch((err) => {
                        console.error("Failed to refresh profile on load", err);
                    });
            }
        } catch (error) {
            console.error("Failed to restore auth state:", error);
            localStorage.removeItem("token");
            localStorage.removeItem("user");
        } finally {
            setAuthLoading(false);
        }
    }, []);

    useEffect(() => {
        const theme = user?.theme_preference || "light";
        document.documentElement.setAttribute("data-theme", theme);
    }, [user]);

    async function login(authToken, authUser) {
        localStorage.setItem("token", authToken);

        try {
            const profileData = await getProfile(authToken);

            const fullUser = {
                ...authUser,
                ...profileData.profile,
                token: authToken,
            };

            localStorage.setItem("user", JSON.stringify(fullUser));
            setToken(authToken);
            setUser(fullUser);
        } catch (error) {
            console.error("Failed to fetch profile after login", error);

            localStorage.setItem("user", JSON.stringify(authUser));
            setToken(authToken);
            setUser(authUser);
        }
    }

    function logout() {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setToken(null);
        setUser(null);
    }
    
    function updateUser(updatedUser) {
        setUser((currentUser) => {
            const mergedUser = {
                ...(currentUser || {}),
                ...updatedUser,
            };

            localStorage.setItem("user", JSON.stringify(mergedUser));
            return mergedUser;
        });
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