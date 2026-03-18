export default function AdminLoading() {
  return (
    <div className="w-full h-[calc(100vh-120px)] flex flex-col items-center justify-center">
      <div className="relative w-20 h-20 mb-8">
        <div className="absolute inset-0 border-4 border-[#41cc00]/10 rounded-full" />
        <div className="absolute inset-0 border-4 border-t-[#41cc00] rounded-full animate-spin" style={{ animationDuration: '1.2s' }} />
        <div className="absolute inset-4 border-4 border-b-[#093C15] rounded-full animate-spin" style={{ animationDuration: '0.8s', animationDirection: 'reverse' }} />
      </div>
      
      <div className="flex flex-col items-center gap-2">
        <div className="h-6 w-48 bg-black/5 rounded-lg animate-pulse" />
        <div className="h-4 w-32 bg-black/[0.03] rounded-md animate-pulse" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 w-full max-w-[1400px]">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-48 rounded-3xl bg-white border border-black/5 p-8 flex flex-col justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-black/[0.02] animate-pulse" />
              <div className="space-y-2">
                <div className="h-4 w-24 bg-black/[0.05] rounded animate-pulse" />
                <div className="h-3 w-16 bg-black/[0.02] rounded animate-pulse" />
              </div>
            </div>
            <div className="h-10 w-full bg-black/[0.02] rounded-xl animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
