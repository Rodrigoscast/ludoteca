"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const WORDS = [
  "ABACATE", "ALGORITMO", "BANANA", "BRASIL", "CACHORRO", "CAMPO",
  "DADO", "ELEFANTE", "FLAMINGO", "FOGUETE", "GATO", "GIRASSOL",
  "HACKER", "IGLU", "JOGO", "KARATE", "LIVRO", "MELANCIA", "NINJA",
  "ORBITA", "PICOLE", "QUEIJO", "ROBOTO", "SOLDADO", "TEXTO",
  "UNICORNIO", "VALOR", "WEB", "XADREZ", "YOUTUBE", "ZEBRA"
];

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

const MAX_ERRORS = 6; // cabeça, tronco, braço E, braço D, perna E, perna D

export default function ForcaPage() {
  const router = useRouter();
  const [secret, setSecret] = useState<string>(() => pickWord());
  const [guesses, setGuesses] = useState<Set<string>>(new Set());
  const [status, setStatus] = useState<"playing" | "win" | "lose">("playing");

  const normalized = useMemo(() => secret.toUpperCase(), [secret]);
  const wrongs = useMemo(
    () => Array.from(guesses).filter((g) => !normalized.includes(g)).length,
    [guesses, normalized]
  );

  const masked = useMemo(
    () =>
      normalized
        .split("")
        .map((ch) => (ch === " " ? " " : guesses.has(ch) ? ch : " _ "))
        .join(""),
    [normalized, guesses]
  );

  useEffect(() => {
    if (status !== "playing") return;
    // Vitória
    const allRevealed = normalized
      .split("")
      .every((ch) => ch === " " || guesses.has(ch));
    if (allRevealed) setStatus("win");
    // Derrota
    if (wrongs >= MAX_ERRORS) setStatus("lose");
  }, [guesses, normalized, wrongs, status]);

  // Teclado físico
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (status !== "playing") return;
      const key = e.key.toUpperCase();
      if (/^[A-Z]$/.test(key)) handleGuess(key);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [status]);

  function handleGuess(letter: string) {
    if (guesses.has(letter) || status !== "playing") return;
    const next = new Set(guesses);
    next.add(letter);
    setGuesses(next);
  }

  function resetGame() {
    setSecret(pickWord());
    setGuesses(new Set());
    setStatus("playing");
  }

  const partsToShow = Math.min(wrongs, MAX_ERRORS);

  return (
    <main className="min-h-screen px-6 py-8 flex flex-col items-center">
      {/* Top bar */}
      <div className="w-full max-w-5xl flex items-center justify-between mb-6">
        <Button
          variant="ghost"
          className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-400/10 cursor-pointer"
          onClick={() => router.back()}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>

        <div className="text-sm text-muted-foreground">
          Erros:{" "}
          <span className={wrongs > 0 ? "text-rose-400" : ""}>
            {wrongs}/{MAX_ERRORS}
          </span>
        </div>
      </div>

      <motion.h1
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="text-5xl font-extrabold mb-10 text-center flex flex-row items-center justify-center gap-10 w-full"
      >
        <div className="flex items-center justify-center w-20 h-20 rounded-full bg-card border-5 border-cyan-400">
            <img src="/icons/hangman.png" alt="Jogo da Forca" className="w-12 h-12" /> 
        </div>
        <p><span className="text-cyan-400">Jogo da Forca</span></p>
        <div className="w-20" />
      </motion.h1>

      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Forca (SVG) */}
        <Card className="bg-card/80 border-border backdrop-blur-md">
          <CardContent className="p-6">
            <div className="w-full flex justify-center">
              <HangmanDrawing show={partsToShow} />
            </div>

            <div className="mt-6 text-center">
              <p className="tracking-widest text-2xl font-mono">
                {masked}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Teclado & Ações */}
        <Card className="bg-card/80 border-border backdrop-blur-md">
          <CardContent className="p-6 flex flex-col gap-6">
            <div className="grid grid-cols-12 gap-2">
              {ALPHABET.map((l) => {
                const tried = guesses.has(l);
                const isWrong = tried && !normalized.includes(l);
                return (
                  <button
                    key={l}
                    onClick={() => handleGuess(l)}
                    disabled={tried || status !== "playing"}
                    className={[
                      "col-span-2 md:col-span-1 h-10 rounded-md text-sm font-semibold transition",
                      tried
                        ? isWrong
                          ? "bg-rose-500/30 text-rose-200 border border-rose-500/40"
                          : "bg-emerald-500/30 text-emerald-200 border border-emerald-500/40"
                        : "bg-slate-700/60 hover:bg-slate-600/70 border border-slate-600",
                      status !== "playing" ? "opacity-50 cursor-not-allowed" : ""
                    ].join(" ")}
                  >
                    {l}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Dica: palavra com {normalized.length} letras
                {normalized.includes(" ") ? " (tem espaço)" : ""}.
              </div>
              <Button
                onClick={resetGame}
                className="bg-cyan-500 hover:bg-cyan-600"
              >
                <RotateCw className="w-4 h-4 mr-2" />
                Reiniciar
              </Button>
            </div>

            {/* Status */}
            <AnimatePresence>
              {status !== "playing" && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="rounded-lg border border-border bg-slate-800/70 p-4 text-center"
                >
                  {status === "win" ? (
                    <div className="text-emerald-300 text-lg font-semibold">
                      🎉 Você venceu! A palavra era <span className="text-emerald-400">{normalized}</span>.
                    </div>
                  ) : (
                    <div className="text-rose-300 text-lg font-semibold">
                      💀 Você perdeu! A palavra era <span className="text-rose-400">{normalized}</span>.
                    </div>
                  )}
                  <Button
                    onClick={resetGame}
                    className="mt-4 bg-cyan-500 hover:bg-cyan-600"
                  >
                    Jogar novamente
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

function pickWord() {
  return WORDS[Math.floor(Math.random() * WORDS.length)];
}

/** SVG da forca + animação progressiva das partes do boneco */
function HangmanDrawing({ show }: { show: number }) {
  // Gallows sempre visível; boneco aparece conforme "show"
  // Animação por "stroke-dasharray" e "opacity"
  const lineProps = "stroke-white/90";
  const partVariant = {
    hidden: { pathLength: 0, opacity: 0 },
    show: { pathLength: 1, opacity: 1, transition: { duration: 0.6 } }
  };

  return (
    <svg
      viewBox="0 0 220 220"
      className="w-[280px] h-[280px]"
      fill="none"
      strokeWidth={4}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Base da forca */}
      <motion.line x1="10" y1="210" x2="210" y2="210" className={lineProps} />
      <motion.line x1="50" y1="210" x2="50" y2="20" className={lineProps} />
      <motion.line x1="50" y1="20" x2="140" y2="20" className={lineProps} />
      <motion.line x1="140" y1="20" x2="140" y2="45" className={lineProps} />

      {/* 1 - Cabeça */}
      <AnimatePresence>
        {show >= 1 && (
          <motion.circle
            cx="140"
            cy="65"
            r="20"
            stroke="white"
            variants={partVariant}
            initial="hidden"
            animate="show"
          />
        )}
      </AnimatePresence>

      {/* 2 - Tronco */}
      <AnimatePresence>
        {show >= 2 && (
          <motion.line
            x1="140"
            y1="85"
            x2="140"
            y2="135"
            stroke="white"
            variants={partVariant}
            initial="hidden"
            animate="show"
          />
        )}
      </AnimatePresence>

      {/* 3 - Braço esquerdo */}
      <AnimatePresence>
        {show >= 3 && (
          <motion.line
            x1="140"
            y1="100"
            x2="115"
            y2="120"
            stroke="white"
            variants={partVariant}
            initial="hidden"
            animate="show"
          />
        )}
      </AnimatePresence>

      {/* 4 - Braço direito */}
      <AnimatePresence>
        {show >= 4 && (
          <motion.line
            x1="140"
            y1="100"
            x2="165"
            y2="120"
            stroke="white"
            variants={partVariant}
            initial="hidden"
            animate="show"
          />
        )}
      </AnimatePresence>

      {/* 5 - Perna esquerda */}
      <AnimatePresence>
        {show >= 5 && (
          <motion.line
            x1="140"
            y1="135"
            x2="120"
            y2="170"
            stroke="white"
            variants={partVariant}
            initial="hidden"
            animate="show"
          />
        )}
      </AnimatePresence>

      {/* 6 - Perna direita */}
      <AnimatePresence>
        {show >= 6 && (
          <motion.line
            x1="140"
            y1="135"
            x2="160"
            y2="170"
            stroke="white"
            variants={partVariant}
            initial="hidden"
            animate="show"
          />
        )}
      </AnimatePresence>
    </svg>
  );
}
