'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from "framer-motion";
import { Gamepad2 } from "lucide-react";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white pb-20">
      {children}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-16 text-center text-muted-foreground flex flex-col items-center gap-2"
      >
        <div className="flex items-center justify-center">
          <Gamepad2 className="inline w-6 h-6 mr-2 text-cyan-400" />
          <span>Divirta-se com os melhores jogos clássicos online!</span>
        </div>

        <div className="text-sm text-muted-foreground/80">
          <span className="text-cyan-400 font-medium">Ludoteca</span> © {new Date().getFullYear()} — criado com ❤️ por{" "}
          <a href="https://teu-site.dev" target="_blank" rel="noopener noreferrer" className="font-semibold text-cyan-400 hover:text-cyan-300 transition-colors animate-pulse">
            Rodrigo Castro
          </a>
        </div>
      </motion.footer>
    </main>
  )
}
