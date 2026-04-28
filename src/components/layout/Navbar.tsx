"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-[60] pt-6 flex justify-center w-full px-4 md:px-8 pointer-events-none transition-transform duration-300">
      <div className="pointer-events-auto rounded-[2rem] bg-white/80 backdrop-blur-xl md:backdrop-blur-2xl border border-black/5 shadow-[0_8px_32px_rgb(0,0,0,0.06)] w-full max-w-[1000px] transition-all duration-500 hover:bg-white/95 overflow-hidden">
        <div className="flex h-[72px] items-center justify-between px-6 md:px-8">
          <div className="flex items-center gap-10">
            <Link href="/" className="flex items-center focus:outline-none shrink-0 border border-transparent hover:opacity-80 transition-opacity">
              <Image
                src="/images/logo.PNG"
                alt="Tela Logo"
                width={120}
                height={28}
                className="object-contain h-[28px] w-auto mix-blend-multiply"
                priority
              />
            </Link>
            <nav className="hidden md:flex items-center gap-8 text-[15px] font-medium text-[#093C15]/70">
              <Link href="https://tela.ng/Payment" className="transition-colors hover:text-[#093C15]">Payment</Link>
              <Link href="https://tela.ng/Business" className="transition-colors text-[#093C15] font-semibold">Business</Link>
              <Link href="https://tela.ng/ai" className="transition-colors hover:text-[#093C15]">Artificial Intelligence</Link>
            </nav>
          </div>
          
          <div className="flex items-center gap-4">
            <Link href="https://quiz.tela.ng/" className="hidden sm:inline-flex h-[44px] items-center justify-center rounded-full bg-[#093C15] px-6 text-[15px] font-semibold text-white transition-transform hover:scale-105 shadow-sm">
              Quiz
            </Link>
            
            {/* Mobile Menu Toggle */}
            <button 
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden w-10 h-10 flex items-center justify-center rounded-full bg-black/5 text-[#093C15] transition-colors hover:bg-black/10"
              aria-label="Toggle Menu"
            >
              {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        <div className={`md:hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[300px] border-t border-black/5 opacity-100' : 'max-h-0 opacity-0'}`}>
          <nav className="flex flex-col p-6 gap-4 text-[16px] font-semibold text-[#093C15]/80">
            <Link href="https://tela.ng/Payment" className="hover:text-[#093C15]" onClick={() => setIsOpen(false)}>Payment</Link>
            <Link href="https://tela.ng/Business" className="hover:text-[#093C15]" onClick={() => setIsOpen(false)}>Business</Link>
            <Link href="https://tela.ng/ai" className="hover:text-[#093C15]" onClick={() => setIsOpen(false)}>Artificial Intelligence</Link>
            <Link href="https://quiz.tela.ng/" className="flex items-center justify-center h-[48px] rounded-2xl bg-[#093C15] text-white mt-2" onClick={() => setIsOpen(false)}>
              Start Quiz
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
