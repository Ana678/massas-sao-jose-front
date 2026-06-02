import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";

type User = {
	id: string;
	name: string;
	email?: string;
	role: "ADMIN" | "ENTREGADOR";
};

export type AuthContextType = {
	user: User | null;
	isAuthenticated: boolean;
	isAdmin: boolean;
	login: (userData: User, access: string, refresh: string) => void;
	logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
	const [user, setUser] = useState<User | null>(null);

	useEffect(() => {
		const storedUser = localStorage.getItem("@massas-sao-jose:user");
		if (storedUser) {
			setUser(JSON.parse(storedUser));
		}
	}, []);

	const login = (userData: User, access: string, refresh: string) => {
		setUser(userData);
		localStorage.setItem("@massas-sao-jose:user", JSON.stringify(userData));
		localStorage.setItem("@massas-sao-jose:access_token", access);
		localStorage.setItem("@massas-sao-jose:refresh_token", refresh);
	};

	const logout = () => {
		setUser(null);
		localStorage.removeItem("@massas-sao-jose:user");
		localStorage.removeItem("@massas-sao-jose:access_token");
		localStorage.removeItem("@massas-sao-jose:refresh_token");
		window.location.href = "/login";
	};

	return (
		<AuthContext.Provider
			value={{
				user,
				isAuthenticated: !!user,
				isAdmin: user?.role === "ADMIN",
				login,
				logout,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
}

export const useAuth = () => {
	const context = useContext(AuthContext);
	if (!context)
		throw new Error("useAuth deve ser usado dentro de um AuthProvider");
	return context;
};
