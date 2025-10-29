"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useEffect } from "react";

export const jogos = [
  {
    nome: "Jogo da Forca",
    icone: <img src="/icons/hangman.png" alt="Forca" className="w-15 h-15" /> ,
    descricao: "Adivinhe a palavra antes que o boneco seja completado!",
    rota: "/jogos/forca",
  },
  {
    nome: "Jogo da Velha",
    icone: <img src="/icons/tic-tac-toe.png" alt="Velha" className="w-15 h-15" /> ,
    descricao: "Clássico duelo de X e O. Será que você vence o bot?",
    rota: "",
  },
  {
    nome: "Letrix",
    icone: <img src="/icons/alphabet.png" alt="Letrix" className="w-15 h-15" /> ,
    descricao: "Descubra a palavra secreta em até 8 tentativas!",
    rota: "/jogos/letrix",
  },
  {
    nome: "Sudoku",
    icone: <img src="/icons/sudoku.png" alt="Sudoku" className="w-15 h-15" /> ,
    descricao: "Complete a grade numérica sem repetir números.",
    rota: "",
  },
  {
    nome: "Campo Minado",
    icone: <img src="/icons/bomb.png" alt="Campo Minado" className="w-15 h-15" /> ,
    descricao: "Evite as minas escondidas e revele todo o campo!",
    rota: "",
  },
  {
    nome: "Tetris",
    icone: <img src="/icons/tetris.png" alt="Tetris" className="w-15 h-15" /> ,
    descricao: "Empilhe blocos coloridos e forme linhas completas!",
    rota: "",
  }
];

export default function HomePage() {
  const router = useRouter();
  
  let delay = 0.2

  return (
    <main className="min-h-screen flex flex-col items-center py-20 px-6">
      <motion.h1
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="text-5xl font-extrabold mb-10 text-center flex flex-row items-center justify-center gap-10 w-full"
      >
        <img src="/icons/dice.png" alt="Dados" className="w-30 h-30" /> 
        <p>Bem-vindo à <span className="text-cyan-400">Ludoteca</span></p>
        <div className="w-30" />
      </motion.h1>

      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl w-full"
      >
        {jogos.map((jogo, i) => {

          delay += 0.2

          return(
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: 1,
                scale: 1,
                transition: {
                  duration: 0.6,
                  ease: "easeOut",
                  delay,
                },
              }}
              className="cursor-pointer"
            >
              <motion.div
                animate={{
                  opacity: 1,
                  scale: 1,
                  transition: {
                    duration: 0.2,
                    ease: "easeOut",
                  },
                }}
                whileHover={{
                  scale: 1.05,
                  transition: {
                    type: "spring",
                    stiffness: 300,
                  },
                }}
                className="cursor-pointer"
              >
                <Card
                  className={`group border-border backdrop-blur-md transition h-80 ${
                    jogo.rota
                      ? "bg-card/80 hover:border-cyan-400 cursor-pointer"
                      : "bg-muted/60 border-muted-foreground/20 opacity-70 cursor-not-allowed"
                  }`}                  
                >
                  <CardContent className="flex flex-col items-center gap-4 p-6 text-center justify-between h-full">
                    <div className="w-full flex flex-col items-center justify-center gap-2">
                      {jogo.icone}
                      <h2 className="text-xl font-bold">{jogo.nome}</h2>
                    </div>

                    <p className="text-muted-foreground">{jogo.descricao}</p>

                    {jogo.rota ? (
                      <Button
                        className="relative mt-3 text-white cursor-pointer overflow-hidden rounded-md transition-all duration-300
                                  bg-cyan-500 group-hover:scale-105"
                        variant="default"
                        onClick={() => {
                          if (jogo.rota) router.push(jogo.rota);
                        }}
                      >
                        <span className="relative z-10">Jogar</span>
                        <span
                          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500
                                    bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500
                                    bg-[length:300%_300%] animate-gradient-move"
                        />
                      </Button>
                    ) : (
                      <div className="mt-3 text-sm text-muted bg-zinc-800/60 px-4 py-2 rounded-md border border-zinc-700 select-none flex flex-row items-center gap-2">
                        <img src="/icons/clock.png" alt="Dados" className="w-5 h-5" />  <p>Em breve</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          )
        })}
      </motion.div>     
    </main>
  );
}
