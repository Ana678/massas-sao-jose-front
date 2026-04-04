import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

const VALID_EMAIL = "admin";
const VALID_PASSWORD = "massas@saojose";

export interface AuthContextType {
    isAuthenticated: boolean;
    login: (email: string, password: string) => boolean;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be inside AuthProvider");
    return ctx;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(
        () => localStorage.getItem("pm_auth") === "1"
    );

    const login = useCallback((user: string, password: string) => {
        if (user.trim().toLowerCase() === VALID_EMAIL && password === VALID_PASSWORD) {
            localStorage.setItem("pm_auth", "1");
            setIsAuthenticated(true);
            return true;
        }
        return false;
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem("pm_auth");
        setIsAuthenticated(false);
    }, []);

    return (
        <AuthContext.Provider value={{ isAuthenticated, login, logout }
        }>
            {children}
        </AuthContext.Provider>
    );
};
