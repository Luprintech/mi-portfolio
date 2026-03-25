import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function ProtectedRoute({ children }) {
    const { isAuthenticated, authStatus } = useAuth();

    if (authStatus === 'checking') {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[var(--bg-primary)] text-[var(--text-primary)]">
                <div className="h-8 w-8 rounded-full border-2 border-fuchsia-500/30 border-t-fuchsia-500 animate-spin" />
            </div>
        );
    }

    if (!isAuthenticated) return <Navigate to="/bitacora" replace />;
    return children;
}
