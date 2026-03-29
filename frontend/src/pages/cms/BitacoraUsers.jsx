import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { cmsApi } from '../../lib/cmsApi';

/* ─── Iconos inline ────────────────────────────────────────────────────────── */
const IconUser = () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
);
const IconEdit = () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
);
const IconTrash = () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
);
const IconPlus = () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
);
const IconKey = () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
    </svg>
);

/* ─── Modal genérico ────────────────────────────────────────────────────────── */
function Modal({ title, onClose, children }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
            <div className="relative z-10 w-full max-w-md rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-default)] shadow-2xl p-6 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-[var(--text-primary)]">{title}</h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                        aria-label="Cerrar"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
}

/* ─── Formulario de usuario (crear / editar) ─────────────────────────────────── */
function UserForm({ initial = {}, onSubmit, loading, error, isEdit = false }) {
    const [username, setUsername] = useState(initial.username || '');
    const [password, setPassword] = useState('');
    const [role, setRole]         = useState(initial.role || 'editor');

    function handleSubmit(e) {
        e.preventDefault();
        const payload = { username, role };
        // En edición, la contraseña es opcional (solo si se escribe algo)
        if (password) payload.password = password;
        // En creación es obligatoria
        if (!isEdit) payload.password = password;
        onSubmit(payload);
    }

    const inputClass = "w-full bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded-lg px-3 py-2.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-secondary)] focus:ring-1 focus:ring-[var(--accent-secondary)] transition-all";

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                    Usuario
                </label>
                <input
                    type="text"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    className={inputClass}
                    placeholder="nombre_usuario"
                    minLength={3}
                    required
                    autoComplete="username"
                />
            </div>

            <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                    Contraseña {isEdit && <span className="normal-case font-normal">(dejar vacío para no cambiarla)</span>}
                </label>
                <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className={inputClass}
                    placeholder={isEdit ? '••••••••  (sin cambios)' : 'Mínimo 8 caracteres'}
                    minLength={isEdit ? undefined : 8}
                    required={!isEdit}
                    autoComplete={isEdit ? 'new-password' : 'new-password'}
                />
            </div>

            <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                    Rol
                </label>
                <select
                    value={role}
                    onChange={e => setRole(e.target.value)}
                    className={inputClass}
                >
                    <option value="admin">Admin</option>
                    <option value="editor">Editor</option>
                </select>
            </div>

            {error && (
                <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                    {error}
                </p>
            )}

            <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-fuchsia-600 to-cyan-600 text-white text-sm font-bold transition-all hover:from-fuchsia-500 hover:to-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {loading ? 'Guardando…' : (isEdit ? 'Guardar cambios' : 'Crear usuario')}
            </button>
        </form>
    );
}

/* ─── Confirmación de borrado ─────────────────────────────────────────────────── */
function ConfirmDelete({ username, onConfirm, onCancel, loading, error }) {
    return (
        <div className="flex flex-col gap-4">
            <p className="text-sm text-[var(--text-secondary)]">
                ¿Seguro que quieres eliminar al usuario <span className="font-bold text-[var(--text-primary)]">{username}</span>?
                Esta acción no se puede deshacer.
            </p>
            {error && (
                <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                    {error}
                </p>
            )}
            <div className="flex gap-3">
                <button
                    type="button"
                    onClick={onCancel}
                    className="flex-1 py-2.5 rounded-xl border border-[var(--border-color)] text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] transition-all"
                >
                    Cancelar
                </button>
                <button
                    type="button"
                    onClick={onConfirm}
                    disabled={loading}
                    className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-bold transition-all disabled:opacity-50"
                >
                    {loading ? 'Eliminando…' : 'Eliminar'}
                </button>
            </div>
        </div>
    );
}

/* ─── Badge de rol ────────────────────────────────────────────────────────────── */
function RoleBadge({ role }) {
    const styles = role === 'admin'
        ? 'bg-fuchsia-500/15 text-fuchsia-400 border-fuchsia-500/30'
        : 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30';
    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border uppercase tracking-wide ${styles}`}>
            {role}
        </span>
    );
}

/* ─── Componente principal ────────────────────────────────────────────────────── */
export default function BitacoraUsers() {
    const { token, username: currentUsername } = useAuth();

    const [users, setUsers]       = useState([]);
    const [loading, setLoading]   = useState(true);
    const [fetchError, setFetchError] = useState('');

    // Modales
    const [createOpen, setCreateOpen]   = useState(false);
    const [editTarget, setEditTarget]   = useState(null);   // user object
    const [deleteTarget, setDeleteTarget] = useState(null); // user object
    const [pwdTarget, setPwdTarget]     = useState(null);   // user object (cambiar solo pwd)

    const [modalLoading, setModalLoading] = useState(false);
    const [modalError, setModalError]     = useState('');

    /* ── Carga inicial ─── */
    const fetchUsers = useCallback(async () => {
        setLoading(true);
        setFetchError('');
        try {
            const data = await cmsApi.getUsers(token);
            setUsers(data.users || []);
        } catch (err) {
            setFetchError(err.message || 'Error al cargar usuarios');
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => { fetchUsers(); }, [fetchUsers]);

    /* ── Crear usuario ─── */
    async function handleCreate(payload) {
        setModalLoading(true);
        setModalError('');
        try {
            await cmsApi.createUser(token, payload);
            setCreateOpen(false);
            fetchUsers();
        } catch (err) {
            setModalError(err.message || 'Error al crear usuario');
        } finally {
            setModalLoading(false);
        }
    }

    /* ── Editar usuario ─── */
    async function handleEdit(payload) {
        setModalLoading(true);
        setModalError('');
        try {
            await cmsApi.updateUser(token, editTarget.id, payload);
            setEditTarget(null);
            fetchUsers();
        } catch (err) {
            setModalError(err.message || 'Error al actualizar usuario');
        } finally {
            setModalLoading(false);
        }
    }

    /* ── Cambiar contraseña ─── */
    async function handleChangePassword(payload) {
        setModalLoading(true);
        setModalError('');
        try {
            await cmsApi.updateUser(token, pwdTarget.id, { password: payload.password });
            setPwdTarget(null);
        } catch (err) {
            setModalError(err.message || 'Error al cambiar contraseña');
        } finally {
            setModalLoading(false);
        }
    }

    /* ── Eliminar usuario ─── */
    async function handleDelete() {
        setModalLoading(true);
        setModalError('');
        try {
            await cmsApi.deleteUser(token, deleteTarget.id);
            setDeleteTarget(null);
            fetchUsers();
        } catch (err) {
            setModalError(err.message || 'Error al eliminar usuario');
        } finally {
            setModalLoading(false);
        }
    }

    /* ── Toggle activo/inactivo ─── */
    async function handleToggleActive(user) {
        try {
            await cmsApi.updateUser(token, user.id, { active: !user.active });
            fetchUsers();
        } catch (err) {
            setFetchError(err.message || 'Error al actualizar estado');
        }
    }

    function closeModals() {
        setCreateOpen(false);
        setEditTarget(null);
        setDeleteTarget(null);
        setPwdTarget(null);
        setModalError('');
    }

    return (
        <div className="p-4 md:p-8 max-w-3xl mx-auto">
            {/* ── Cabecera ── */}
            <div className="flex items-center justify-between mb-8 gap-4 flex-wrap">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-2">
                        <IconUser /> Usuarios del CMS
                    </h1>
                    <p className="text-sm text-[var(--text-muted)] mt-1">
                        Gestiona los accesos al panel de administración
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => { setModalError(''); setCreateOpen(true); }}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-fuchsia-600 to-cyan-600 text-white text-sm font-bold hover:from-fuchsia-500 hover:to-cyan-500 transition-all shadow-lg shadow-fuchsia-500/20"
                >
                    <IconPlus /> Nuevo usuario
                </button>
            </div>

            {/* ── Estado de carga / error ── */}
            {loading && (
                <div className="flex items-center justify-center py-16">
                    <div className="w-10 h-10 border-4 border-fuchsia-500/30 border-t-fuchsia-500 rounded-full animate-spin" />
                </div>
            )}

            {fetchError && !loading && (
                <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-4">
                    {fetchError}
                </div>
            )}

            {/* ── Tabla de usuarios ── */}
            {!loading && !fetchError && (
                <div className="flex flex-col gap-3">
                    {users.length === 0 && (
                        <p className="text-center text-[var(--text-muted)] py-12">
                            No hay usuarios. Crea el primero.
                        </p>
                    )}
                    {users.map(user => (
                        <div
                            key={user.id}
                            className="flex items-center justify-between gap-4 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] px-4 py-3 flex-wrap"
                        >
                            {/* Info */}
                            <div className="flex items-center gap-3 min-w-0">
                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-fuchsia-600 to-cyan-500 flex items-center justify-center shrink-0">
                                    <span className="text-white text-sm font-bold uppercase">
                                        {user.username.slice(0, 1)}
                                    </span>
                                </div>
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="font-semibold text-[var(--text-primary)] text-sm truncate">
                                            {user.username}
                                        </span>
                                        {user.username === currentUsername && (
                                            <span className="text-[10px] bg-amber-500/15 text-amber-400 border border-amber-500/30 px-1.5 py-0.5 rounded-full uppercase font-semibold">
                                                tú
                                            </span>
                                        )}
                                        <RoleBadge role={user.role} />
                                        {!user.active && (
                                            <span className="text-[10px] bg-red-500/15 text-red-400 border border-red-500/30 px-1.5 py-0.5 rounded-full uppercase font-semibold">
                                                inactivo
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                                        Creado {new Date(user.created_at).toLocaleDateString('es-ES')}
                                    </p>
                                </div>
                            </div>

                            {/* Acciones */}
                            <div className="flex items-center gap-2 shrink-0">
                                {/* Toggle activo */}
                                {user.username !== currentUsername && (
                                    <button
                                        type="button"
                                        title={user.active ? 'Desactivar' : 'Activar'}
                                        onClick={() => handleToggleActive(user)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                                            user.active
                                                ? 'border-[var(--border-color)] text-[var(--text-muted)] hover:border-amber-500/50 hover:text-amber-400'
                                                : 'border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10'
                                        }`}
                                    >
                                        {user.active ? 'Desactivar' : 'Activar'}
                                    </button>
                                )}

                                {/* Cambiar contraseña */}
                                <button
                                    type="button"
                                    title="Cambiar contraseña"
                                    onClick={() => { setModalError(''); setPwdTarget(user); }}
                                    className="p-2 rounded-lg text-[var(--text-muted)] hover:text-cyan-400 hover:bg-cyan-500/10 border border-transparent hover:border-cyan-500/20 transition-all"
                                >
                                    <IconKey />
                                </button>

                                {/* Editar */}
                                <button
                                    type="button"
                                    title="Editar usuario"
                                    onClick={() => { setModalError(''); setEditTarget(user); }}
                                    className="p-2 rounded-lg text-[var(--text-muted)] hover:text-fuchsia-400 hover:bg-fuchsia-500/10 border border-transparent hover:border-fuchsia-500/20 transition-all"
                                >
                                    <IconEdit />
                                </button>

                                {/* Eliminar */}
                                {user.username !== currentUsername && (
                                    <button
                                        type="button"
                                        title="Eliminar usuario"
                                        onClick={() => { setModalError(''); setDeleteTarget(user); }}
                                        className="p-2 rounded-lg text-[var(--text-muted)] hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all"
                                    >
                                        <IconTrash />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* ── Modal: crear usuario ── */}
            {createOpen && (
                <Modal title="Nuevo usuario" onClose={closeModals}>
                    <UserForm
                        onSubmit={handleCreate}
                        loading={modalLoading}
                        error={modalError}
                        isEdit={false}
                    />
                </Modal>
            )}

            {/* ── Modal: editar usuario ── */}
            {editTarget && (
                <Modal title={`Editar usuario: ${editTarget.username}`} onClose={closeModals}>
                    <UserForm
                        initial={editTarget}
                        onSubmit={handleEdit}
                        loading={modalLoading}
                        error={modalError}
                        isEdit={true}
                    />
                </Modal>
            )}

            {/* ── Modal: cambiar contraseña ── */}
            {pwdTarget && (
                <Modal title={`Contraseña de ${pwdTarget.username}`} onClose={closeModals}>
                    <PasswordForm
                        onSubmit={handleChangePassword}
                        loading={modalLoading}
                        error={modalError}
                    />
                </Modal>
            )}

            {/* ── Modal: confirmar borrado ── */}
            {deleteTarget && (
                <Modal title="Eliminar usuario" onClose={closeModals}>
                    <ConfirmDelete
                        username={deleteTarget.username}
                        onConfirm={handleDelete}
                        onCancel={closeModals}
                        loading={modalLoading}
                        error={modalError}
                    />
                </Modal>
            )}
        </div>
    );
}

/* ─── Formulario solo de contraseña ─────────────────────────────────────────── */
function PasswordForm({ onSubmit, loading, error }) {
    const [password, setPassword]     = useState('');
    const [confirm, setConfirm]       = useState('');
    const [localError, setLocalError] = useState('');

    function handleSubmit(e) {
        e.preventDefault();
        if (password !== confirm) {
            setLocalError('Las contraseñas no coinciden');
            return;
        }
        setLocalError('');
        onSubmit({ password });
    }

    const inputClass = "w-full bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded-lg px-3 py-2.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-secondary)] focus:ring-1 focus:ring-[var(--accent-secondary)] transition-all";

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                    Nueva contraseña
                </label>
                <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className={inputClass}
                    placeholder="Mínimo 8 caracteres"
                    minLength={8}
                    required
                    autoComplete="new-password"
                />
            </div>
            <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                    Confirmar contraseña
                </label>
                <input
                    type="password"
                    value={confirm}
                    onChange={e => setConfirm(e.target.value)}
                    className={inputClass}
                    placeholder="Repite la contraseña"
                    minLength={8}
                    required
                    autoComplete="new-password"
                />
            </div>
            {(localError || error) && (
                <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                    {localError || error}
                </p>
            )}
            <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-fuchsia-600 to-cyan-600 text-white text-sm font-bold transition-all hover:from-fuchsia-500 hover:to-cyan-500 disabled:opacity-50"
            >
                {loading ? 'Guardando…' : 'Cambiar contraseña'}
            </button>
        </form>
    );
}
