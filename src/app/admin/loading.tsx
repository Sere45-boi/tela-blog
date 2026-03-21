import { GlassCard } from "@/components/ui/Card";

export default function AdminLoading() {
  return (
    <div className="max-w-[1400px] w-full space-y-5 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="h-8 w-48 bg-black/5 rounded-lg mb-2" />
          <div className="h-4 w-64 bg-black/[0.03] rounded-md" />
        </div>
        <div className="flex items-center gap-2.5">
          <div className="h-10 w-32 bg-white/60 backdrop-blur-md rounded-xl border border-black/5" />
          <div className="h-10 w-36 bg-[#093C15]/10 rounded-xl" />
        </div>
      </div>

      {/* Top 3 Stat Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <GlassCard key={`top-${i}`} className="p-5 h-[140px] flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-xl bg-black/[0.04]" />
              <div className="flex flex-col items-end gap-2">
                <div className="w-20 h-8 bg-black/[0.04] rounded-lg" />
                <div className="w-24 h-3 bg-black/[0.02] rounded-md" />
              </div>
            </div>
            <div className="pt-3 border-t border-black/5">
              <div className="w-32 h-3 bg-black/[0.02] rounded-md" />
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Growth Strip Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={`growth-${i}`} className="bg-white/40 backdrop-blur-md border border-black/5 rounded-xl p-4 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-black/[0.03]" />
              <div className="space-y-1.5">
                <div className="w-24 h-2.5 bg-black/[0.03] rounded-sm" />
                <div className="w-32 h-4 bg-black/[0.05] rounded-md" />
              </div>
            </div>
            <div className="w-4 h-4 bg-black/[0.02] rounded-full" />
          </div>
        ))}
      </div>

      {/* Main Body Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
        <div className="lg:col-span-2 space-y-4">
          <GlassCard className="p-6 h-[400px]">
            <div className="flex justify-between items-center mb-8">
              <div className="space-y-2">
                <div className="w-32 h-5 bg-black/[0.04] rounded-md" />
                <div className="w-48 h-3 bg-black/[0.02] rounded-sm" />
              </div>
              <div className="w-24 h-6 bg-[#41cc00]/10 rounded-lg" />
            </div>
            <div className="w-full h-64 bg-black/[0.02] rounded-xl border border-black/5" />
          </GlassCard>
        </div>
        <div className="h-full">
          <GlassCard className="h-[400px] p-8 bg-[#093C15]/5 border-[#093C15]/10 flex flex-col">
            <div className="flex justify-between items-center mb-8">
              <div className="w-24 h-4 bg-black/[0.04] rounded-sm" />
              <div className="w-2 h-2 rounded-full bg-[#41cc00]/30" />
            </div>
            <div className="flex-1 space-y-8">
              {[1, 2, 3].map((i) => (
                <div key={`insight-${i}`} className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-black/[0.03] shrink-0" />
                  <div className="space-y-2 w-full">
                    <div className="w-3/4 h-4 bg-black/[0.04] rounded-sm" />
                    <div className="w-full h-3 bg-black/[0.02] rounded-sm" />
                    <div className="w-5/6 h-3 bg-black/[0.02] rounded-sm" />
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
