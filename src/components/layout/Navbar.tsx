import React from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 glass">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-8">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl font-medium tracking-tight">Tela</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
            <Link href="/" className="transition-colors hover:text-foreground">Insights</Link>
            <Link href="/categories/engineering" className="transition-colors hover:text-foreground">Engineering</Link>
            <Link href="/categories/product" className="transition-colors hover:text-foreground">Product</Link>
            <Link href="/categories/design" className="transition-colors hover:text-foreground">Design</Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <button className="text-muted-foreground transition-colors hover:text-foreground" aria-label="Search">
            <Search className="h-5 w-5" />
          </button>
          <Button variant="primary" size="sm" className="hidden sm:inline-flex rounded-full">
            Subscribe
          </Button>
        </div>
      </div>
    </header>
  );
}
