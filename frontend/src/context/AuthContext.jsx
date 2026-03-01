import { createContext, useContext, useState, useCallback } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [token, setToken] = useState(() => sessionStorage.getItem('cms_token'));

    const login = useCallback((newToken) => {
        sessionStorage.setItem('cms_token', newToken);
        setToken(newToken);
    }, []);

    const logout = useCallback(() => {
        sessionStorage.removeItem('cms_token');
        setToken(null);
    }, []);

    return (
        <AuthContext.Provider value={{ token, isAuthenticated: !!token, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
