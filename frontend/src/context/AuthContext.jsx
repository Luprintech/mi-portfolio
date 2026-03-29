import { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import { cmsApi } from '../lib/cmsApi';

const AuthContext = createContext(null);

/** Decodifica el payload del JWT sin verificar firma (solo para display en cliente). */
function decodeJwtPayload(token) {
    try {
        const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
        return JSON.parse(atob(base64));
    } catch {
        return {};
    }
}

export function AuthProvider({ children }) {
    const [token, setToken] = useState(() => sessionStorage.getItem('cms_token'));
    const [authStatus, setAuthStatus] = useState(() => (token ? 'checking' : 'anonymous'));
    const [username, setUsername] = useState(null);
    const [role, setRole] = useState(() => {
        const saved = sessionStorage.getItem('cms_token');
        return saved ? (decodeJwtPayload(saved).role || null) : null;
    });

    const login = useCallback((newToken) => {
        sessionStorage.setItem('cms_token', newToken);
        setToken(newToken);
        setRole(decodeJwtPayload(newToken).role || null);
        setAuthStatus('authenticated');
    }, []);

    const logout = useCallback(() => {
        sessionStorage.removeItem('cms_token');
        setToken(null);
        setUsername(null);
        setRole(null);
        setAuthStatus('anonymous');
    }, []);

    useEffect(() => {
        let cancelled = false;

        if (!token) {
            setUsername(null);
            setRole(null);
            setAuthStatus('anonymous');
            return undefined;
        }

        setAuthStatus('checking');

        cmsApi.verify(token)
            .then(({ username: verifiedUsername }) => {
                if (cancelled) return;
                setUsername(verifiedUsername || null);
                // role ya está en el JWT decodificado; lo refrescamos aquí también
                setRole(decodeJwtPayload(token).role || null);
                setAuthStatus('authenticated');
            })
            .catch(() => {
                if (cancelled) return;
                sessionStorage.removeItem('cms_token');
                setToken(null);
                setUsername(null);
                setRole(null);
                setAuthStatus('anonymous');
            });

        return () => {
            cancelled = true;
        };
    }, [token]);

    const value = useMemo(() => ({
        token,
        username,
        role,
        isAdmin: role === 'admin',
        authStatus,
        isAuthenticated: authStatus === 'authenticated',
        login,
        logout,
    }), [authStatus, login, logout, role, token, username]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
