// ─── Emoji Picker — selector de emojis por categoría ──────────────────────────
import { useState, useRef, useEffect } from 'react';

const EMOJI_DATA = {
    '😀 Caras': [
        '😀','😃','😄','😁','😆','😅','🤣','😂','🙂','😊',
        '😇','🥰','😍','🤩','😘','😗','😚','😙','🥲','😋',
        '😛','😜','🤪','😝','🤑','🤗','🤭','🫢','🤫','🤔',
        '🫡','🤐','🤨','😐','😑','😶','🫥','😏','😒','🙄',
        '😬','🤥','😌','😔','😪','🤤','😴','😷','🤒','🤕',
        '🤢','🤮','🥵','🥶','🥴','😵','🤯','🤠','🥳','🥸',
        '😎','🤓','🧐','😕','🫤','😟','🙁','😮','😯','😲',
        '😳','🥺','🥹','😦','😧','😨','😰','😥','😢','😭',
        '😱','😖','😣','😞','😓','😩','😫','🥱','😤','😡',
        '😠','🤬','😈','👿','💀','☠️','💩','🤡','👹','👺',
    ],
    '👋 Gestos': [
        '👋','🤚','🖐️','✋','🖖','🫱','🫲','🫳','🫴','👌',
        '🤌','🤏','✌️','🤞','🫰','🤟','🤘','🤙','👈','👉',
        '👆','🖕','👇','☝️','🫵','👍','👎','✊','👊','🤛',
        '🤜','👏','🙌','🫶','👐','🤲','🤝','🙏','💪','🦾',
    ],
    '💻 Tech': [
        '💻','🖥️','🖨️','⌨️','🖱️','🖲️','💾','💿','📀','📱',
        '📲','☎️','📞','📟','📠','🔋','🔌','🌐','🔍','🔎',
        '🔐','🔑','🗝️','🔒','🔓','📡','🛰️','🤖','👾','🎮',
        '🕹️','📊','📈','📉','🧮','⚙️','🔧','🔩','🛠️','⛓️',
    ],
    '📝 Objetos': [
        '📝','✏️','🖊️','🖋️','✒️','📁','📂','🗂️','📅','📆',
        '🗒️','🗓️','📇','📋','📌','📍','📎','🖇️','📐','📏',
        '🗑️','📦','📫','📬','📭','📮','📪','📨','📩','📤',
        '📥','🏷️','🔖','💡','🔦','🏮','🪔','📔','📕','📖',
    ],
    '⭐ Símbolos': [
        '❤️','🧡','💛','💚','💙','💜','🖤','🤍','🤎','💔',
        '❤️‍🔥','💕','💞','💓','💗','💖','💘','💝','⭐','🌟',
        '✨','⚡','🔥','💥','🎯','✅','❌','⚠️','⛔','🚫',
        '💯','🔴','🟠','🟡','🟢','🔵','🟣','⚪','⚫','🟤',
        '🔶','🔷','🔸','🔹','▶️','⏸️','⏹️','🔄','🔀','🔂',
        '➕','➖','✖️','➗','♾️','‼️','⁉️','❓','❗','〰️',
    ],
    '🚀 Viajes': [
        '🚀','🛸','✈️','🛫','🛬','🚁','🛶','⛵','🚤','🛳️',
        '🚂','🚆','🚇','🚈','🚉','🚗','🚕','🚙','🚌','🚎',
        '🏎️','🚒','🚑','🚐','🛻','🚚','🚛','🚜','🏍️','🛵',
        '🚲','🛴','🏠','🏡','🏢','🏣','🏤','🏥','🏦','🏨',
    ],
    '🎵 Actividad': [
        '🎵','🎶','🎼','🎧','🎤','🎬','🎭','🎨','🎪','🎫',
        '🎗️','🏆','🥇','🥈','🥉','⚽','🏀','🏈','⚾','🥎',
        '🎾','🏐','🏉','🎱','🏓','🏸','🥊','🎯','🎲','🧩',
        '🎮','🕹️','🎰','🎳','🧘','🏋️','🚴','🏊','🤸','⛷️',
    ],
    '🍕 Comida': [
        '🍕','🍔','🍟','🌭','🥪','🌮','🌯','🫔','🥙','🧆',
        '🥚','🍳','🥘','🍲','🫕','🥣','🥗','🍿','🧈','🧂',
        '🍎','🍊','🍋','🍌','🍉','🍇','🍓','🫐','🍒','🍑',
        '🥭','🍍','🥥','🥝','☕','🍵','🧃','🥤','🍶','🍺',
    ],
};

export default function EmojiPicker({ onSelect, onClose }) {
    const [activeCategory, setActiveCategory] = useState(Object.keys(EMOJI_DATA)[0]);
    const [search, setSearch] = useState('');
    const ref = useRef(null);

    useEffect(() => {
        function handleClickOutside(e) {
            if (ref.current && !ref.current.contains(e.target)) onClose();
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);

    const categories = Object.keys(EMOJI_DATA);

    // Filtro simple: busca en todas las categorías
    let emojis = EMOJI_DATA[activeCategory];
    if (search) {
        emojis = Object.values(EMOJI_DATA).flat();
    }

    return (
        <div
            ref={ref}
            className="absolute top-10 left-0 z-50 bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded-xl shadow-2xl w-[320px] overflow-hidden"
            onMouseDown={e => e.stopPropagation()}
        >
            {/* Search */}
            <div className="p-2 border-b border-[var(--border-color)]">
                <input
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Buscar emoji…"
                    className="w-full px-3 py-1.5 bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-lg text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none focus:border-fuchsia-500/60"
                    autoFocus
                />
            </div>

            {/* Category tabs */}
            {!search && (
                <div className="flex gap-0.5 px-2 py-1 border-b border-[var(--border-color)] overflow-x-auto scrollbar-none">
                    {categories.map(cat => {
                        const icon = cat.split(' ')[0];
                        return (
                            <button
                                key={cat}
                                type="button"
                                onClick={() => setActiveCategory(cat)}
                                title={cat.split(' ').slice(1).join(' ')}
                                className={`flex-shrink-0 w-8 h-8 rounded-lg text-base flex items-center justify-center transition-colors ${
                                    activeCategory === cat
                                        ? 'bg-fuchsia-500/20 ring-1 ring-fuchsia-500/50'
                                        : 'hover:bg-[var(--bg-surface)]'
                                }`}
                            >{icon}</button>
                        );
                    })}
                </div>
            )}

            {/* Emoji grid */}
            <div className="grid grid-cols-8 gap-0.5 p-2 max-h-[200px] overflow-y-auto">
                {emojis.map((emoji, i) => (
                    <button
                        key={`${emoji}-${i}`}
                        type="button"
                        onClick={() => { onSelect(emoji); onClose(); }}
                        className="w-8 h-8 flex items-center justify-center text-lg rounded-lg hover:bg-[var(--bg-surface)] transition-colors cursor-pointer"
                        title={emoji}
                    >{emoji}</button>
                ))}
            </div>
        </div>
    );
}
