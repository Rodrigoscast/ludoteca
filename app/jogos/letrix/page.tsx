"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, RotateCw } from "lucide-react";
import { useRouter } from "next/navigation";

// palavras de 6 letras (sem acento)
const WORDS = [
  "CAMADA", "BANANA", "BRINCO", "PAPAGA", "ROSTOS", "FLORES",
  "JARDIM", "CORPOS", "BOLADO", "MESTRE", "LETRAS", "VENTOS",
  "PORTAS", "CINEMA", "SOMBRI", "LIVROS", "GIRASS", "AMIGOS"
];

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const WORD_LENGTH = 6;
const MAX_TRIES = 8;

export default function LetrixPage() {
  const router = useRouter();
  const [secret, setSecret] = useState(() => pickWord());
  const [grid, setGrid] = useState<string[][]>(Array(MAX_TRIES).fill(Array(WORD_LENGTH).fill("")));
  const [row, setRow] = useState(0);
  const [col, setCol] = useState(0);
  const [status, setStatus] = useState<"playing" | "win" | "lose">("playing");
  const [message, setMessage] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  // entrada por teclado físico
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (status !== "playing") return;
      const key = e.key.toUpperCase();

      if (key === "BACKSPACE") {
        if (col > 0) updateGrid(row, col - 1, "");
        setCol(Math.max(0, col - 1));
      } else if (key === "ENTER") {
        if (col === WORD_LENGTH) checkWord();
      } else if (/^[A-Z]$/.test(key) && col < WORD_LENGTH) {
        updateGrid(row, col, key);
        setCol(col + 1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  function updateGrid(r: number, c: number, letter: string) {
    setGrid((old) =>
      old.map((rowData, i) =>
        i === r ? rowData.map((ch, j) => (j === c ? letter : ch)) : rowData
      )
    );
  }

  function checkWord() {
    const current = grid[row].join("");
    if (current.length < WORD_LENGTH) return;

    const feedback = getFeedback(current, secret);

    if (current === secret) {
      setStatus("win");
    } else if (row + 1 === MAX_TRIES) {
      setStatus("lose");
    } else {
      setRow(row + 1);
      setCol(0);
    }

    // animação de cores nas letras
    const tiles = containerRef.current?.querySelectorAll(`[data-row='${row}']`);
    tiles?.forEach((tile, i) => {
      (tile as HTMLElement).style.animation = `flip 0.5s ${i * 0.15}s ease forwards`;
      (tile as HTMLElement).style.backgroundColor = feedback[i].color;
    });
  }

  function reset() {
    setSecret(pickWord());
    setGrid(Array(MAX_TRIES).fill(Array(WORD_LENGTH).fill("")));
    setRow(0);
    setCol(0);
    setStatus("playing");
    setMessage("");
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white flex flex-col items-center px-6 py-10">
      {/* topo */}
      <div className="w-full max-w-5xl flex items-center justify-between mb-6">
        <Button
          variant="ghost"
          className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-400/10 cursor-pointer"
          onClick={() => router.back()}
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
        </Button>

        <Button
          variant="ghost"
          className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-400/10 cursor-pointer"
          onClick={reset}
        >
          <RotateCw className="w-4 h-4 mr-2" /> Reiniciar
        </Button>
      </div>

      <motion.h1
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-5xl font-extrabold mb-10 text-center flex flex-row items-center justify-center gap-10 w-full"
      >
        <div className="flex items-center justify-center w-20 h-20 rounded-full bg-card border-5 border-cyan-400">
          <img src="/icons/alphabet.png" alt="Letrix" className="w-12 h-12" />
        </div>
        <p>
          <span className="text-cyan-400">Letrix</span>
        </p>
        <div className="w-20" />
      </motion.h1>

      {/* grade */}
      <Card className="bg-card/70 border-border backdrop-blur-md">
        <CardContent className="p-6 flex flex-col items-center" ref={containerRef}>
          {grid.map((rowData, r) => (
            <div key={r} className="flex gap-2 mb-2">
              {rowData.map((letter, c) => (
                <motion.div
                  key={c}
                  data-row={r}
                  className={`w-12 h-12 border-2 rounded-md flex items-center justify-center text-2xl font-bold
                    ${r < row ? "border-transparent" : "border-slate-500"}`}
                >
                  {letter}
                </motion.div>
              ))}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* status */}
      <AnimatePresence>
        {status !== "playing" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-6 text-center"
          >
            {status === "win" ? (
              <p className="text-emerald-400 text-lg font-semibold">
                🎉 Você acertou a palavra <span className="underline">{secret}</span>!
              </p>
            ) : (
              <p className="text-rose-400 text-lg font-semibold">
                💀 A palavra era <span className="underline">{secret}</span>.
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

/* ========= Funções auxiliares ========= */

function pickWord() {
  return WORDS[Math.floor(Math.random() * WORDS.length)];
}

function getFeedback(guess: string, secret: string) {
  const feedback: { letter: string; color: string }[] = [];
  const secretArr = secret.split("");
  const guessArr = guess.split("");

  for (let i = 0; i < guessArr.length; i++) {
    if (guessArr[i] === secretArr[i]) {
      feedback.push({ letter: guessArr[i], color: "#22c55e" }); // verde
      secretArr[i] = "*";
    } else feedback.push({ letter: guessArr[i], color: "#64748b" }); // cinza inicial
  }

  for (let i = 0; i < guessArr.length; i++) {
    if (feedback[i].color === "#22c55e") continue;
    const index = secretArr.indexOf(guessArr[i]);
    if (index !== -1) {
      feedback[i].color = "#facc15"; // amarelo
      secretArr[index] = "*";
    }
  }

  return feedback;
}

/* ========= animação CSS ========= */

const css = `
@keyframes flip {
  0% { transform: rotateX(0); }
  50% { transform: rotateX(90deg); }
  100% { transform: rotateX(0); }
}
`;
if (typeof document !== "undefined") {
  const style = document.createElement("style");
  style.innerHTML = css;
  document.head.appendChild(style);
}
