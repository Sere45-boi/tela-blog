import React from "react";

export default function Loading() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar Skeleton */}
      <div className="h-20 border-b border-black/5 flex items-center px-8">
        <div className="w-24 h-6 bg-black/5 animate-pulse rounded-md" />
        <div className="ml-auto flex gap-6">
          <div className="w-16 h-4 bg-black/5 animate-pulse rounded-md" />
          <div className="w-16 h-4 bg-black/5 animate-pulse rounded-md" />
        </div>
      </div>

      <main className="pt-24 px-8 max-w-7xl mx-auto">
        {/* Hero Skeleton */}
        <div className="flex flex-col items-center mb-24">
          <div className="w-32 h-6 bg-black/5 animate-pulse rounded-full mb-8" />
          <div className="w-full max-w-3xl h-20 bg-black/5 animate-pulse rounded-2xl mb-8" />
          <div className="w-full max-w-xl h-6 bg-black/5 animate-pulse rounded-md mb-12" />
          <div className="w-full max-w-2xl h-16 bg-black/5 animate-pulse rounded-2xl" />
        </div>

        {/* Featured Card Skeleton */}
        <div className="w-full h-[400px] bg-black/5 animate-pulse rounded-[2.5rem] mb-16" />

        {/* Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="flex flex-col h-full rounded-[2rem] border border-black/5 overflow-hidden">
               <div className="aspect-[4/3] bg-black/5 animate-pulse" />
               <div className="p-8">
                 <div className="w-20 h-4 bg-black/5 animate-pulse rounded-md mb-4" />
                 <div className="w-full h-12 bg-black/5 animate-pulse rounded-md mb-4" />
                 <div className="w-full h-16 bg-black/5 animate-pulse rounded-md" />
               </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
