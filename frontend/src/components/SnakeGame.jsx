import { useEffect, useRef, useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";

// ─── Constantes del juego ─────────────────────────────────────────────────────

const CELL  = 20;   // px por celda
const COLS  = 20;   // columnas del grid
const ROWS  = 20;   // filas del grid
const W     = CELL * COLS;
const H     = CELL * ROWS;
const SPEED_INIT  = 150; // ms por tick
const SPEED_MIN   =  60; // ms mínimo (máx velocidad)
const SPEED_STEP  =   5; // ms que se resta cada 5 puntos

const DIR = { UP: [0,-1], DOWN: [0,1], LEFT: [-1,0], RIGHT: [1,0] };

function rnd(max) { return Math.floor(Math.random() * max); }
function randomFood(snake) {
  let pos;
  do {
    pos = { x: rnd(COLS), y: rnd(ROWS) };
  } while (snake.some(s => s.x === pos.x && s.y === pos.y));
  return pos;
}
function initState() {
  const snake = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }];
  return { snake, dir: DIR.RIGHT, nextDir: DIR.RIGHT, food: randomFood(snake), score: 0, dead: false };
}

// ─── Componente ──────────────────────────────────────────────────────────────

export default function SnakeGame() {
  const { t } = useTranslation();
  const canvasRef = useRef(null);
  const stateRef  = useRef(initState());
  const loopRef   = useRef(null);
  const [score, setScore]         = useState(0);
  const [best,  setBest]          = useState(() => parseInt(localStorage.getItem("snake_best") || "0", 10));
  const [phase, setPhase]         = useState("idle"); // idle | playing | dead
  const [speed, setSpeed]         = useState(SPEED_INIT);
  const speedRef = useRef(SPEED_INIT);

  // ── Dibujo ─────────────────────────────────────────────────────────────────
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const { snake, food } = stateRef.current;

    // Fondo
    ctx.fillStyle = "rgba(10,10,20,0.97)";
    ctx.fillRect(0, 0, W, H);

    // Grid sutil
    ctx.strokeStyle = "rgba(255,255,255,0.03)";
    ctx.lineWidth = 0.5;
    for (let x = 0; x <= COLS; x++) {
      ctx.beginPath(); ctx.moveTo(x * CELL, 0); ctx.lineTo(x * CELL, H); ctx.stroke();
    }
    for (let y = 0; y <= ROWS; y++) {
      ctx.beginPath(); ctx.moveTo(0, y * CELL); ctx.lineTo(W, y * CELL); ctx.stroke();
    }

    // Comida — punto fuchsia pulsante (sin animación real, solo dibujo)
    ctx.save();
    ctx.shadowColor = "#e879f9";
    ctx.shadowBlur  = 14;
    ctx.fillStyle   = "#e879f9";
    ctx.beginPath();
    ctx.arc(food.x * CELL + CELL / 2, food.y * CELL + CELL / 2, CELL / 2 - 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Serpiente — degradado cabeza cyan → cola violeta
    snake.forEach((seg, i) => {
      const ratio = i / Math.max(snake.length - 1, 1);
      // cabeza: cyan, cola: violet
      const r = Math.round(34  + (139 - 34)  * ratio);
      const g = Math.round(211 + (92  - 211) * ratio);
      const b = Math.round(238 + (246 - 238) * ratio);
      ctx.save();
      if (i === 0) { ctx.shadowColor = "#22d3ee"; ctx.shadowBlur = 12; }
      ctx.fillStyle = `rgb(${r},${g},${b})`;
      ctx.beginPath();
      ctx.roundRect(seg.x * CELL + 2, seg.y * CELL + 2, CELL - 4, CELL - 4, 4);
      ctx.fill();
      ctx.restore();
    });
  }, []);

  // ── Tick ───────────────────────────────────────────────────────────────────
  const tick = useCallback(() => {
    const s = stateRef.current;
    s.dir = s.nextDir;
    const head = { x: s.snake[0].x + s.dir[0], y: s.snake[0].y + s.dir[1] };

    // Colisión con paredes
    if (head.x < 0 || head.x >= COLS || head.y < 0 || head.y >= ROWS) {
      s.dead = true; setPhase("dead"); return;
    }
    // Colisión consigo misma
    if (s.snake.some(seg => seg.x === head.x && seg.y === head.y)) {
      s.dead = true; setPhase("dead"); return;
    }

    s.snake.unshift(head);

    if (head.x === s.food.x && head.y === s.food.y) {
      s.score += 1;
      s.food = randomFood(s.snake);
      setScore(s.score);
      // Aumentar velocidad cada 5 puntos
      const newSpeed = Math.max(SPEED_MIN, SPEED_INIT - Math.floor(s.score / 5) * SPEED_STEP);
      if (newSpeed !== speedRef.current) {
        speedRef.current = newSpeed;
        setSpeed(newSpeed);
        clearInterval(loopRef.current);
        loopRef.current = setInterval(tick, newSpeed);
      }
    } else {
      s.snake.pop();
    }
    draw();
  }, [draw]);

  // ── Iniciar ────────────────────────────────────────────────────────────────
  const startGame = useCallback(() => {
    stateRef.current = initState();
    speedRef.current = SPEED_INIT;
    setScore(0);
    setSpeed(SPEED_INIT);
    setPhase("playing");
    draw();
    clearInterval(loopRef.current);
    loopRef.current = setInterval(tick, SPEED_INIT);
  }, [draw, tick]);

  // ── Parar al morir ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (phase === "dead") {
      clearInterval(loopRef.current);
      const s = stateRef.current;
      if (s.score > best) {
        setBest(s.score);
        localStorage.setItem("snake_best", String(s.score));
      }
      draw();
    }
  }, [phase, best, draw]);

  // ── Cleanup ────────────────────────────────────────────────────────────────
  useEffect(() => () => clearInterval(loopRef.current), []);

  // ── Dibujo inicial ─────────────────────────────────────────────────────────
  useEffect(() => { draw(); }, [draw]);

  // ── Teclado ────────────────────────────────────────────────────────────────
  useEffect(() => {
    const MAP = {
      ArrowUp:    DIR.UP,    w: DIR.UP,    W: DIR.UP,
      ArrowDown:  DIR.DOWN,  s: DIR.DOWN,  S: DIR.DOWN,
      ArrowLeft:  DIR.LEFT,  a: DIR.LEFT,  A: DIR.LEFT,
      ArrowRight: DIR.RIGHT, d: DIR.RIGHT, D: DIR.RIGHT,
    };
    function handleKey(e) {
      const next = MAP[e.key];
      if (!next) return;
      e.preventDefault();
      const cur = stateRef.current.dir;
      // No permitir 180°
      if (next[0] === -cur[0] && next[1] === -cur[1]) return;
      stateRef.current.nextDir = next;
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  // ── Swipe táctil ──────────────────────────────────────────────────────────
  const touchStart = useRef(null);
  function onTouchStart(e) { touchStart.current = e.touches[0]; }
  function onTouchEnd(e) {
    if (!touchStart.current) return;
    const dx = e.changedTouches[0].clientX - touchStart.current.clientX;
    const dy = e.changedTouches[0].clientY - touchStart.current.clientY;
    const cur = stateRef.current.dir;
    let next;
    if (Math.abs(dx) > Math.abs(dy)) {
      next = dx > 0 ? DIR.RIGHT : DIR.LEFT;
    } else {
      next = dy > 0 ? DIR.DOWN : DIR.UP;
    }
    if (next[0] === -cur[0] && next[1] === -cur[1]) return;
    stateRef.current.nextDir = next;
    touchStart.current = null;
  }

  // ── Botones de control táctil ─────────────────────────────────────────────
  function tap(dir) {
    const cur = stateRef.current.dir;
    if (dir[0] === -cur[0] && dir[1] === -cur[1]) return;
    stateRef.current.nextDir = dir;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.65 }}
      className="flex w-full flex-col items-center gap-10 md:flex-row md:items-center md:gap-14"
    >
      {/* ── Columna izquierda: contexto ───────────────────────────────────── */}
      <div className="flex flex-col gap-5 md:flex-1">
        <span className="typo-label text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--accent-primary)]">
          {t("snake.eyebrow")}
        </span>
        <h2 className="typo-title text-3xl font-bold tracking-tight text-[var(--text-primary)] md:text-4xl">
          {t("snake.title")}
        </h2>
        <p className="typo-body text-base leading-relaxed text-[var(--text-secondary)]">
          {t("snake.desc")}
        </p>

        {/* Puntuaciones */}
        <div className="flex gap-6">
          <div className="flex flex-col gap-0.5">
            <span className="typo-label text-xs uppercase tracking-wider text-[var(--text-muted)]">{t("snake.score")}</span>
            <span className="typo-title text-3xl font-extrabold text-[var(--accent-secondary)]">{score}</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="typo-label text-xs uppercase tracking-wider text-[var(--text-muted)]">{t("snake.best")}</span>
            <span className="typo-title text-3xl font-extrabold text-[var(--accent-primary)]">{best}</span>
          </div>
        </div>

        <p className="typo-label text-xs text-[var(--text-muted)]">{t("snake.controls")}</p>
      </div>

      {/* ── Columna derecha: juego ────────────────────────────────────────── */}
      <div className="flex flex-col items-center gap-4 shrink-0">
        {/* Canvas */}
        <div
          className="relative overflow-hidden rounded-2xl border border-[var(--border-color)] shadow-[0_0_40px_rgba(34,211,238,0.08)]"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <canvas
            ref={canvasRef}
            width={W}
            height={H}
            className="block"
            style={{ maxWidth: "min(400px, 90vw)", height: "auto", aspectRatio: "1/1" }}
          />

          {/* Overlay idle / dead */}
          {phase !== "playing" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/70 backdrop-blur-sm rounded-2xl">
              {phase === "dead" && (
                <div className="text-center">
                  <p className="typo-title text-2xl font-bold text-red-400">{t("snake.game_over")}</p>
                  <p className="typo-label mt-1 text-sm text-[var(--text-muted)]">
                    {t("snake.final_score")} <span className="text-[var(--accent-secondary)] font-bold">{score}</span>
                  </p>
                </div>
              )}
              <button
                onClick={startGame}
                className="rounded-xl bg-gradient-to-r from-fuchsia-500 via-violet-500 to-cyan-500 px-8 py-3 text-sm font-bold text-white shadow-[0_0_24px_rgba(139,92,246,0.35)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_36px_rgba(139,92,246,0.55)]"
              >
                {phase === "dead" ? t("snake.play_again") : t("snake.play")}
              </button>
            </div>
          )}
        </div>

        {/* Controles táctiles — solo mobile */}
        <div className="flex flex-col items-center gap-1 md:hidden">
          <button onClick={() => tap(DIR.UP)}    className="snake-btn">▲</button>
          <div className="flex gap-6">
            <button onClick={() => tap(DIR.LEFT)}  className="snake-btn">◄</button>
            <button onClick={() => tap(DIR.DOWN)}  className="snake-btn">▼</button>
            <button onClick={() => tap(DIR.RIGHT)} className="snake-btn">►</button>
          </div>
        </div>

        {/* Velocidad */}
        {phase === "playing" && (
          <p className="typo-label text-[11px] text-[var(--text-muted)]">
            {t("snake.speed")} {Math.round((SPEED_INIT - speed) / SPEED_STEP * SPEED_STEP / SPEED_STEP) + 1}x
          </p>
        )}
      </div>
    </motion.div>
  );
}
