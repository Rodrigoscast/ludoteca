"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, RotateCw, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'
import { p } from "framer-motion/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

const THEMES = [
  "Animais", "Animais Marinhos", "Animes", "Ciência", "Cidades do Brasil", "Comidas", "Corpos Celestes",
  "Esportes", "Fantasia", "Filmes", "Harry Potter", "Heróis e Vilões", "Instrumentos Musicais", 
  "Jogos", "League of Legends", "Linguagens de Programação", "Livros", "Mangás", "Mitologia", "Moda", "Música", "Natureza",
  "Objetos", "Países", "Partes do Corpo", "Percy Jackson", "Personagens Históricos", "Profissões", "Sentimentos",
  "Senhor dos Anéis", "Séries", "Star Wars", "Tecnologia", "Espaço Sideral"
];

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

const MAX_ERRORS = 6;

export default function ForcaPage() {
  const router = useRouter();
  const [secret, setSecret] = useState('');
  const [nivel, setNivel] = useState(1);
  const [dica, setDica] = useState('')
  const [guesses, setGuesses] = useState<string[]>([]);
  const [status, setStatus] = useState<"playing" | "win" | "lose">("playing");
  const [wrongs, setWrongs] = useState(0)
  const [acertos, setAcertos] = useState(0)
  const [tema, setTema] = useState('todos')

  const masked = useMemo(() => {
    // garante tudo em maiúsculo pra comparação justa
    const normalizedSecret = secret.toUpperCase();

    return normalizedSecret
      .split("")
      .map((ch) => {
        if (ch === " ") return "-"; // mantém espaços
        return guesses.includes(ch) ? ch : "_";
      })
      .join(" "); // adiciona espaço entre os traços só pra visual
  }, [secret, guesses]);

  const pickWord = async() => {
    let temaEscolhido

    if(tema == 'todos'){
      temaEscolhido = THEMES[Math.floor(Math.random() * THEMES.length)];
    } else {
      temaEscolhido = tema
    }
    
    if (!temaEscolhido.trim() || !nivel) return;

    setDica(temaEscolhido)
    
    try {
        const res = await fetch("/api/palavra", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ tema: temaEscolhido, nivel }),
        });

        const data = await res.json();
        let resposta = data.resposta || "Desculpe, algo deu errado 😅";

        resposta = resposta
          .normalize("NFD")               // separa acentos das letras
          .replace(/[\u0300-\u036f]/g, "") // remove os acentos
          .replace(/ç/g, "c")             // substitui cedilha
          .replace(/Ç/g, "C")
          .replace(/[^a-zA-Z-\s]/g, "")   // remove caracteres que não são letras, espaço ou hífen
          .trim();

        setSecret(resposta);

    } catch (err) {
        toast.error("Erro ao carregar palavra, tente novamente mais tarde.")
    }
  }

  useEffect(() => {
    pickWord()
  }, [])

  useEffect(() => {
    if (status !== "playing") return;

    if (acertos === secret.replace(/\s/g, "").length && secret.replace(/\s/g, "").length > 0) setStatus("win");

    if (wrongs >= MAX_ERRORS) setStatus("lose")

  }, [guesses, wrongs, status, acertos]);

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

  const handleGuess = (letter: string) => {
    if (status !== "playing") return;
    if (guesses.find((x) => x == letter)) return;

    // cria novo array, não muta o antigo
    setGuesses((prev) => {
      if (prev.find((x) => x == letter)) return prev;
      return [...prev, letter];
    });
  };


  function resetGame() {
    setWrongs(0)
    setAcertos(0)
    pickWord()
    setGuesses([]);
    setStatus("playing");
  }

  useEffect(() => {
    resetGame()
  }, [tema])

  useEffect(() => {
    let erros = 0;
    let correct = 0;

    guesses.forEach((x) => {
      if (!secret.toUpperCase().includes(x)) {
        erros++;
      } else {
        const letras = secret.toUpperCase().split(x).length - 1;
        correct += letras
      }
    });

    setWrongs(erros);
    setAcertos(correct);
  }, [guesses, secret]);

  const partsToShow = Math.min(wrongs, MAX_ERRORS);

  return (
    <main className="min-h-screen px-6 py-8 flex flex-col items-center">
      <ToastContainer position="top-right" autoClose={3000} />
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

      <div className="w-full gap-8 flex justify-center">
        {/* Forca (SVG) */}
        <Card className="bg-card/80 border-border backdrop-blur-md w-8/10">
          <CardContent className="p-6 relative">
            <div>
              <div className="w-full flex justify-center gap-2 text-green-700 mt-5 text-2xl">
                <strong>Dica:</strong>{dica}
              </div>
              <div className="w-full flex justify-center">
                <HangmanDrawing show={partsToShow} />
              </div>
              <div className="mt-6 text-center">
                <p className="tracking-widest text-2xl font-mono">
                  {masked}
                </p>
              </div>
              <div className="w-full flex justify-center gap-2 text-red-400 mt-5">
                {guesses.map((x) => {
                  if(secret.toUpperCase().includes(x)) return;
                  return(
                    <p key={x}>{x}</p>
                  )
                })}
              </div>              
            </div>

            <Select onValueChange={(value) => setTema(value)}>
              <SelectTrigger className="bg-card absolute top-0 left-7">
                <SelectValue placeholder="Selecione um Tema" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                {THEMES.map((x) => (
                  <SelectItem value={x} key={x}>
                    {x}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              onClick={resetGame}
              className="bg-cyan-500 hover:bg-cyan-600 absolute top-0 right-7"
            >
              <RotateCw className="w-4 h-4 mr-2" />
              Reiniciar
            </Button>

            <div className="flex items-center flex-row justify-start gap-1 text-blue-700">
              <Info />
              <p>Use seu teclado!</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={status === "win"} onOpenChange={() => {}}>
        <DialogContent className="bg-card border-border text-center py-8">
          <DialogHeader>
            <DialogTitle className="text-3xl font-bold text-emerald-400">
              🎉 Parabéns!
            </DialogTitle>
            <DialogDescription className="text-lg text-muted-foreground">
              Você adivinhou a palavra corretamente!
            </DialogDescription>
          </DialogHeader>

          <div className="my-6">
            <p className="text-2xl font-semibold">
              A palavra era: <span className="text-emerald-400">{secret}</span>
            </p>
          </div>

          <Button
            onClick={resetGame}
            className="bg-emerald-500 hover:bg-emerald-600 mt-2"
          >
            Jogar Novamente
          </Button>
        </DialogContent>
      </Dialog>

      <Dialog open={status === "lose"} onOpenChange={() => {}}>
        <DialogContent className="bg-card border-border text-center py-8">
          <DialogHeader>
            <DialogTitle className="text-3xl font-bold text-rose-400">
              💀 Que pena!
            </DialogTitle>
            <DialogDescription className="text-lg text-muted-foreground">
              Você não conseguiu adivinhar a palavra a tempo...
            </DialogDescription>
          </DialogHeader>

          <div className="my-6">
            <p className="text-2xl font-semibold">
              A palavra era: <span className="text-rose-400">{secret}</span>
            </p>
          </div>

          <Button
            onClick={resetGame}
            className="bg-rose-500 hover:bg-rose-600 mt-2"
          >
            Tentar Novamente
          </Button>
        </DialogContent>
      </Dialog>
    </main>
  );
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
