import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";

// ─── Comandos disponibles ────────────────────────────────────────────────────

function buildCommands(t) {
  return {
    whoami: {
      hint: t("terminal.cmd_whoami_hint"),
      output: [
        { text: t("terminal.whoami_1"), color: "text-cyan-300" },
        { text: t("terminal.whoami_2"), color: "text-[var(--text-secondary)]" },
        { text: t("terminal.whoami_3"), color: "text-[var(--text-secondary)]" },
      ],
    },
    skills: {
      hint: t("terminal.cmd_skills_hint"),
      output: [
        { text: "→ Frontend",  color: "text-fuchsia-400",   indent: false },
        { text: "  React · TypeScript · Tailwind · Vite",                color: "text-[var(--text-secondary)]", indent: true },
        { text: "→ Backend",   color: "text-cyan-400",      indent: false },
        { text: "  Node.js · Express · Laravel · PostgreSQL",            color: "text-[var(--text-secondary)]", indent: true },
        { text: "→ DevOps",    color: "text-violet-400",    indent: false },
        { text: "  Docker · Nginx · VPS Linux · Raspberry Pi",           color: "text-[var(--text-secondary)]", indent: true },
        { text: "→ IA",        color: "text-emerald-400",   indent: false },
        { text: "  Gemini API · Prompt Engineering · n8n",               color: "text-[var(--text-secondary)]", indent: true },
        { text: "→ CMS",       color: "text-amber-400",     indent: false },
        { text: "  WordPress · Divi Builder",                            color: "text-[var(--text-secondary)]", indent: true },
      ],
    },
    proyectos: {
      hint: t("terminal.cmd_proyectos_hint"),
      output: [
        { text: "VocAcción    →  Full Stack (Laravel + React + IA Gemini)",  color: "text-cyan-300" },
        { text: "Calc3D       →  Estimación de costes 3D (Next.js)",        color: "text-fuchsia-300" },
        { text: "LuprinChef   →  App recetas con Firebase Auth (Next.js)",   color: "text-violet-300" },
        { text: t("terminal.proyectos_portfolio"), color: "text-emerald-300" },
        { text: t("terminal.proyectos_more"),      color: "text-[var(--text-muted)]" },
      ],
    },
    contacto: {
      hint: t("terminal.cmd_contacto_hint"),
      output: [
        { text: "📧  contacto@guadalupecano.es",                                  color: "text-cyan-300" },
        { text: "💼  linkedin.com/in/guadalupe-cano-moyano",                     color: "text-blue-300" },
        { text: "🐙  github.com/Luprintech",                                      color: "text-[var(--text-secondary)]" },
        { text: "▶  youtube.com/@Luprintech",                                    color: "text-red-300" },
        { text: t("terminal.contacto_available"),                                 color: "text-emerald-300" },
      ],
    },
    ayuda: {
      hint: t("terminal.cmd_ayuda_hint"),
      output: [
        { text: t("terminal.ayuda_header"),    color: "text-[var(--text-muted)]" },
        { text: "  whoami     " + t("terminal.cmd_whoami_hint"),   color: "text-cyan-300" },
        { text: "  skills     " + t("terminal.cmd_skills_hint"),   color: "text-fuchsia-300" },
        { text: "  proyectos  " + t("terminal.cmd_proyectos_hint"),color: "text-violet-300" },
        { text: "  contacto   " + t("terminal.cmd_contacto_hint"), color: "text-emerald-300" },
        { text: "  clear      " + t("terminal.cmd_clear_hint"),    color: "text-[var(--text-secondary)]" },
      ],
    },
    help: {
      hint: "",
      output: [{ text: t("terminal.help_alias"), color: "text-[var(--text-muted)]" }],
      alias: "ayuda",
    },
    // Aliases en inglés
    projects: { hint: "", output: [], alias: "proyectos" },
    contact:  { hint: "", output: [], alias: "contacto"  },
    skills_en:{ hint: "", output: [], alias: "skills"    },
  };
}

// ─── Componente ──────────────────────────────────────────────────────────────

export default function TerminalWidget() {
  const { t } = useTranslation();
  const COMMANDS = useMemo(() => buildCommands(t), [t]);
  const WELCOME  = useMemo(() => [
    { text: t("terminal.welcome_1"), color: "text-emerald-400", type: "output" },
    { text: t("terminal.welcome_2"), color: "text-[var(--text-muted)]",  type: "output" },
    { text: t("terminal.easter_hint"), color: "text-amber-300", type: "output" },
    { text: "", type: "output" },
  ], [t]);

  const [history, setHistory]       = useState(WELCOME);
  const [input, setInput]           = useState("");
  const [cmdHistory, setCmdHistory] = useState([]);
  const [histIdx, setHistIdx]       = useState(-1);
  const outputRef = useRef(null);
  const inputRef  = useRef(null);

  // Scroll interno del terminal — NUNCA mueve la página, solo el contenedor
  useEffect(() => {
    const el = outputRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [history]);

  const runCommand = useCallback((raw) => {
    const cmd = raw.trim().toLowerCase();
    if (!cmd) return;

    setCmdHistory(prev => [cmd, ...prev]);
    setHistIdx(-1);

    // Entrada del usuario en el historial visual
    const userLine = { text: cmd, color: "text-[var(--text-primary)]", type: "input", prompt: true };

    if (cmd === "clear") {
      setHistory(WELCOME);
      return;
    }

    const def = COMMANDS[cmd];

    if (!def) {
      setHistory(prev => [
        ...prev,
        userLine,
        { text: `${t("terminal.not_found_1")} '${cmd}'. ${t("terminal.not_found_2")}`, color: "text-red-400", type: "output" },
        { text: "", type: "output" },
      ]);
      return;
    }

    // Si es alias (e.g. help → ayuda) resuelve la salida real
    const resolved = def.alias ? COMMANDS[def.alias] : def;

    setHistory(prev => [
      ...prev,
      userLine,
      ...resolved.output.map(line => ({ ...line, type: "output" })),
      { text: "", type: "output" },
    ]);
  }, [COMMANDS, WELCOME, t]);

  function handleKey(e) {
    if (e.key === "Enter") {
      runCommand(input);
      setInput("");
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const next = Math.min(histIdx + 1, cmdHistory.length - 1);
      setHistIdx(next);
      setInput(cmdHistory[next] ?? "");
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const next = Math.max(histIdx - 1, -1);
      setHistIdx(next);
      setInput(next === -1 ? "" : cmdHistory[next] ?? "");
    } else if (e.key === "Tab") {
      e.preventDefault();
      const match = Object.keys(COMMANDS).find(k => k.startsWith(input.toLowerCase()) && k !== input.toLowerCase());
      if (match) setInput(match);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: 0.1 }}
      className="w-full rounded-2xl border border-[var(--border-color)] bg-[var(--bg-elevated)] overflow-hidden shadow-[var(--shadow-md)] font-mono text-sm"
      onClick={() => inputRef.current?.focus()}
      role="region"
      aria-label={t("terminal.aria_label")}
    >
      {/* ── Barra de título estilo macOS ── */}
      <div className="flex items-center gap-2 border-b border-[var(--border-default)] bg-[var(--bg-surface)] px-4 py-3">
        <span className="h-3 w-3 rounded-full bg-red-500/80" aria-hidden="true" />
        <span className="h-3 w-3 rounded-full bg-amber-400/80" aria-hidden="true" />
        <span className="h-3 w-3 rounded-full bg-emerald-400/80" aria-hidden="true" />
        <span className="ml-3 text-xs text-[var(--text-muted)] select-none">
          lupe@portfolio:~
        </span>
        <span className="ml-auto text-[10px] text-[var(--text-muted)]/50 select-none hidden sm:block">
          {t("terminal.tab_hint")}
        </span>
      </div>

      {/* ── Contenido del terminal ── */}
      <div
        ref={outputRef}
        className="h-56 overflow-y-auto p-4 space-y-0.5 cursor-text"
        style={{ scrollbarWidth: "thin", scrollbarColor: "var(--border-default) transparent" }}
      >
        {history.map((line, i) => (
          <div key={i} className="leading-5">
            {line.type === "input" ? (
              <div className="flex gap-2">
                <span className="text-fuchsia-400 select-none shrink-0">
                  <span className="text-cyan-400">lupe</span>
                  <span className="text-[var(--text-muted)]">@portfolio</span>
                  <span className="text-[var(--text-muted)]">:~$</span>
                </span>
                <span className="text-[var(--text-primary)]">{line.text}</span>
              </div>
            ) : (
              <span className={line.color ?? "text-[var(--text-secondary)]"}>
                {line.text}
              </span>
            )}
          </div>
        ))}

        {/* Línea de input activa */}
        <div className="flex gap-2 items-center">
          <span className="text-fuchsia-400 select-none shrink-0 leading-5">
            <span className="text-cyan-400">lupe</span>
            <span className="text-[var(--text-muted)]">@portfolio</span>
            <span className="text-[var(--text-muted)]">:~$</span>
          </span>
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            className="flex-1 bg-transparent text-[var(--text-primary)] outline-none caret-cyan-400 min-w-0"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            aria-label={t("terminal.input_label")}
          />
        </div>
      </div>
    </motion.div>
  );
}
