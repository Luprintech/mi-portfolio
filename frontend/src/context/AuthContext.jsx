import { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import { cmsApi } from '../lib/cmsApi';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [token, setToken] = useState(() => sessionStorage.getItem('cms_token'));
    const [authStatus, setAuthStatus] = useState(() => (token ? 'checking' : 'anonymous'));
    const [username, setUsername] = useState(null);

    const login = useCallback((newToken) => {
        sessionStorage.setItem('cms_token', newToken);
        setToken(newToken);
        setAuthStatus('authenticated');
    }, []);

    const logout = useCallback(() => {
        sessionStorage.removeItem('cms_token');
        setToken(null);
        setUsername(null);
        setAuthStatus('anonymous');
    }, []);

    useEffect(() => {
        let cancelled = false;

        if (!token) {
            setUsername(null);
            setAuthStatus('anonymous');
            return undefined;
        }

        setAuthStatus('checking');

        cmsApi.verify(token)
            .then(({ username: verifiedUsername }) => {
                if (cancelled) return;
                setUsername(verifiedUsername || null);
                setAuthStatus('authenticated');
            })
            .catch(() => {
                if (cancelled) return;
                sessionStorage.removeItem('cms_token');
                setToken(null);
                setUsername(null);
                setAuthStatus('anonymous');
            });

        return () => {
            cancelled = true;
        };
    }, [token]);

    const value = useMemo(() => ({
        token,
        username,
        authStatus,
        isAuthenticated: authStatus === 'authenticated',
        login,
        logout,
    }), [authStatus, login, logout, token, username]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
