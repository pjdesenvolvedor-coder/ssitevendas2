
"use client";

import Link from "next/link";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";

export function Navbar() {
  const logoImg = PlaceHolderImages.find(img => img.id === 'logo')?.imageUrl || '';

  return (
    <nav className="fixed top-0 w-full z-50 bg-background/60 backdrop-blur-2xl border-b border-white/5 h-16">
      <div className="container mx-auto px-6 h-full flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-8 h-8 transition-transform group-hover:scale-110">
            <Image 
              src={logoImg} 
              alt="PJ CONTAS" 
              fill 
              className="object-contain"
              priority
            />
          </div>
          <span className="text-xl font-headline font-bold tracking-tight">
            <span className="text-primary">PJ</span> <span className="text-white">CONTAS</span>
          </span>
        </Link>
      </div>
    </nav>
  );
}
