import { useState, useRef, useEffect } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send } from "lucide-react";
import mifoto from "../assets/pc-optimized.jpg";

const API_URL = import.meta.env.VITE_API_URL || "";

const WELCOME_MESSAGE = {
  id: "welcome",
  role: "model",
  content:
    "¡Hola! Soy Guadalupe. Puedes preguntarme sobre mi stack, proyectos, experiencia o lo que necesites saber. ¿En qué puedo ayudarte?",
};

/* ─── Helper: detectar URLs y clasificarlas ─── */
function parseMessageLinks(text) {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = [];
  let lastIndex = 0;

  const getLinkConfig = (url) => {
    const lower = url.toLowerCase();
    if (lower.endsWith(".pdf"))                                         return { type: "button", label: "📄 Descargar CV" };
    if (lower.includes("github.com"))                                   return { type: "button", label: "🐙 Ver GitHub" };
    if (lower.includes("linkedin.com"))                                 return { type: "button", label: "💼 Ver LinkedIn" };
    if (lower.includes("youtube.com") || lower.includes("youtu.be"))   return { type: "button", label: "▶ Ver canal" };
    if (lower.includes("portfolio") || lower.includes("proyecto") || lower.includes("project")) {
      return { type: "button", label: "🚀 Ver proyecto" };
    }
    return { type: "link" };
  };

  text.replace(urlRegex, (match, url, offset) => {
    if (lastIndex < offset) parts.push({ type: "text", content: text.slice(lastIndex, offset) });
    parts.push({ url, ...getLinkConfig(url) });
    lastIndex = offset + match.length;
  });

  if (lastIndex < text.length) parts.push({ type: "text", content: text.slice(lastIndex) });
  return parts.length ? parts : [{ type: "text", content: text }];
}

/* ─── Renderizado de contenido con URLs ─── */
function MessageContent({ content }) {
  const parts = parseMessageLinks(content);
  return (
    <div className="space-y-1 break-words" style={{ overflowWrap: "anywhere" }}>
      {parts.map((part, idx) => {
        if (part.type === "text") {
          return <span key={idx}>{part.content}</span>;
        }
        if (part.type === "button") {
          return (
            <a
              key={idx}
              href={part.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 mt-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-br from-white/10 to-white/5 border border-white/20 hover:border-white/40 hover:from-white/15 hover:to-white/10 transition-all duration-200 font-medium text-xs"
            >
              {part.label}
            </a>
          );
        }
        if (part.type === "link") {
          return (
            <a
              key={idx}
              href={part.url}
              target="_blank"
              rel="noopener noreferrer"
              className="break-all underline opacity-80 hover:opacity-100 transition-opacity"
            >
              {part.url}
            </a>
          );
        }
        return null;
      })}
    </div>
  );
}

/* ─── Indicador de escritura ─── */
function TypingIndicator() {
  return (
    <div className="flex items-end gap-2 justify-start">
      <img
        src={mifoto}
        alt="Guadalupe"
        width="24"
        height="24"
        loading="lazy"
        decoding="async"
        className="w-6 h-6 rounded-full object-cover shrink-0 mb-1"
      />
      <div className="px-4 py-3 rounded-2xl rounded-bl-sm bg-[var(--bg-elevated)] border border-[var(--border-subtle)] flex gap-1 items-center">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-2 h-2 rounded-full bg-[var(--text-muted)]"
            style={{
              animation: `chatbot-bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

/* ─── Burbuja de mensaje ─── */
function MessageBubble({ msg }) {
  const isUser = msg.role === "user";
  return (
    <div
      className={`flex items-end gap-2 ${isUser ? "justify-end" : "justify-start"}`}
    >
      {!isUser && (
        <img
          src={mifoto}
          alt="Guadalupe"
          width="24"
          height="24"
          loading="lazy"
          decoding="async"
          className="w-6 h-6 rounded-full object-cover shrink-0 mb-1"
        />
      )}
      <div
        className={`max-w-[78%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
          isUser
            ? "rounded-br-sm bg-gradient-to-br from-fuchsia-600 to-cyan-600 text-white"
            : "rounded-bl-sm bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)]"
        }`}
      >
        <MessageContent content={msg.content} />
      </div>
    </div>
  );
}

/* ─── COMPONENTE PRINCIPAL ─── */
export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);       // { msg, isWarning }
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  /* Scroll automático al último mensaje */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  /* Focus en el input al abrir */
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    const userMsg = { id: Date.now(), role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setError(null);
    setIsLoading(true);

    try {
      /* Historial sin el mensaje de bienvenida ni el que acabamos de añadir */
      const history = messages
        .filter((m) => m.id !== "welcome")
        .map((m) => ({ role: m.role, content: m.content }));

      const res = await fetch(`${API_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, history }),
      });

      const data = await res.json();

      if (!res.ok) {
        const err = new Error(data.error || "Error desconocido");
        err.isWarning = data.isWarning ?? false;
        throw err;
      }

      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, role: "model", content: data.reply },
      ]);
    } catch (err) {
      setError({ msg: err.message || "No he podido responder. Inténtalo de nuevo.", isWarning: err.isWarning ?? false });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* ── Estilos de la animación de los puntos ── */}
      <style>{`
        @keyframes chatbot-bounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-6px); opacity: 1; }
        }
      `}</style>

      {/* ── Panel de chat ── */}
      <AnimatePresence>
        {isOpen && (
          <Motion.div
            key="chat-panel"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className={`
              fixed z-50 flex flex-col
              bottom-0 right-0
              sm:bottom-24 sm:right-6
              sm:w-[380px] sm:h-[500px] sm:rounded-2xl sm:shadow-2xl
              w-full h-[100dvh] rounded-none
              bg-[var(--bg-surface)] border border-[var(--border-color)]
              overflow-hidden
            `}
            role="dialog"
            aria-label="Chat con Guadalupe"
          >
            {/* HEADER */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-[var(--border-color)] bg-[var(--bg-elevated)] shrink-0">
              <div className="relative">
                <img
                  src={mifoto}
                  alt="Guadalupe"
                  width="36"
                  height="36"
                  loading="lazy"
                  decoding="async"
                  className="w-9 h-9 rounded-full object-cover ring-2 ring-fuchsia-500/40"
                />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-[var(--bg-elevated)]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[var(--text-primary)]">Guadalupe</p>
                <p className="text-xs text-[var(--text-muted)] truncate">
                  Desarrolladora Full Stack · Respondo al instante
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] transition-colors"
                aria-label="Cerrar chat"
              >
                <X size={18} />
              </button>
            </div>

            {/* MENSAJES */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 scroll-smooth">
              {messages.map((msg) => (
                <MessageBubble key={msg.id} msg={msg} />
              ))}
              {isLoading && <TypingIndicator />}
              {error && (
                <div
                  className={`text-xs text-center rounded-xl px-3 py-2 border ${
                    error.isWarning
                      ? "text-amber-700 bg-amber-400/10 border-amber-400/30 dark:text-amber-300"
                      : "text-red-400 bg-red-500/10 border-red-500/20"
                  }`}
                >
                  {error.msg}
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* INPUT */}
            <div className="px-3 pb-6 sm:pb-3 pt-2 border-t border-[var(--border-subtle)] bg-[var(--bg-surface)] shrink-0">
              <div className="flex items-end gap-2 bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded-xl px-3 py-2 focus-within:border-[var(--accent-secondary)]/60 transition-colors">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isLoading}
                  placeholder="Escribe tu pregunta…"
                  rows={1}
                  maxLength={500}
                  className="flex-1 resize-none bg-transparent text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none leading-relaxed max-h-28 overflow-y-auto disabled:opacity-50"
                  style={{ fieldSizing: "content" }}
                  aria-label="Mensaje para Guadalupe"
                />
                <button
                  onClick={sendMessage}
                  disabled={isLoading || !input.trim()}
                  className="shrink-0 p-1 sm:p-1.5 w-7 h-7 sm:w-auto sm:h-auto rounded-lg bg-gradient-to-br from-fuchsia-600 to-cyan-600 text-white disabled:opacity-40 hover:opacity-90 transition-opacity flex items-center justify-center"
                  aria-label="Enviar mensaje"
                >
                  <Send size={15} />
                </button>
              </div>
              <p className="text-[10px] text-[var(--text-muted)] text-center mt-1.5">
                Enter para enviar · Shift+Enter para nueva línea
              </p>
            </div>
          </Motion.div>
        )}
      </AnimatePresence>

      {/* ── Botón flotante — solo visible cuando el panel está cerrado ── */}
      {!isOpen && (
        <Motion.button
          onClick={() => setIsOpen(true)}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-fuchsia-600 to-cyan-600 text-white shadow-lg shadow-fuchsia-500/30 flex items-center justify-center"
          aria-label="Abrir chat con Guadalupe"
        >
          <MessageCircle size={22} />
          {/* Pulso de atención */}
          <span className="absolute inset-0 rounded-full bg-gradient-to-br from-fuchsia-600 to-cyan-600 animate-ping opacity-25" />
        </Motion.button>
      )}
    </>
  );
}
