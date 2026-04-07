'use client';

import PropertyCardSkeleton from '@/components/common/PropertyCardSkeleton';

function MapAreaSkeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`relative bg-gradient-to-br from-gray-100 via-gray-200/80 to-gray-100 overflow-hidden ${className}`}
    >
      <div
        className="absolute inset-0 opacity-40 animate-pulse"
        style={{
          backgroundImage: `
            linear-gradient(0deg, transparent 24%, rgba(255,255,255,0.45) 25%, rgba(255,255,255,0.45) 26%, transparent 27%, transparent 74%, rgba(255,255,255,0.45) 75%, rgba(255,255,255,0.45) 76%, transparent 77%),
            linear-gradient(90deg, transparent 24%, rgba(255,255,255,0.35) 25%, rgba(255,255,255,0.35) 26%, transparent 27%, transparent 74%, rgba(255,255,255,0.35) 75%, rgba(255,255,255,0.35) 76%, transparent 77%)
          `,
          backgroundSize: '48px 48px',
        }}
      />
      <div className="absolute top-[28%] left-[38%] h-7 px-2.5 rounded-full bg-white/90 border border-gray-200/80 shadow-md animate-pulse w-16" />
      <div className="absolute top-[52%] left-[55%] h-7 px-2.5 rounded-full bg-gray-900/85 shadow-md animate-pulse w-20" />
      <div className="absolute top-[40%] left-[62%] h-7 px-2.5 rounded-full bg-white/90 border border-gray-200/80 shadow-md animate-pulse w-14" />
    </div>
  );
}

export default function SearchMapViewSkeleton() {
  return (
    <>
      {/* Mobile: full-bleed map + peek sheet (matches SearchMapView) */}
      <div className="fixed inset-0 top-16 z-10 lg:hidden">
        <div className="absolute inset-0">
          <MapAreaSkeleton className="w-full h-full" />
        </div>
        <div
          className="absolute bottom-0 left-0 right-0 z-30 bg-white rounded-t-2xl shadow-[0_-4px_24px_rgba(0,0,0,0.12)]"
          style={{ height: 140 }}
        >
          <div className="flex items-center justify-center py-3">
            <div className="w-10 h-1 rounded-full bg-gray-300" />
          </div>
          <div className="px-3 space-y-3">
            <div className="h-4 bg-gray-200 rounded w-24 animate-pulse" />
            <div className="flex gap-3 overflow-hidden">
              <div className="shrink-0 w-[min(72vw,280px)]">
                <PropertyCardSkeleton />
              </div>
              <div className="shrink-0 w-[min(72vw,280px)] opacity-60">
                <PropertyCardSkeleton />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop: 40% card grid | 60% map */}
      <div className="hidden lg:flex flex-row h-[calc(100vh-180px)] min-h-[500px] w-full gap-0">
        <div className="w-[40%] h-full overflow-y-auto pr-4 pb-20">
          <div className="grid grid-cols-2 gap-4">
            {Array.from({ length: 6 }, (_, i) => (
              <PropertyCardSkeleton key={i} />
            ))}
          </div>
        </div>
        <div className="w-[60%] h-full sticky top-0 rounded-xl overflow-hidden border border-gray-200">
          <MapAreaSkeleton className="w-full h-full min-h-[500px]" />
        </div>
      </div>
    </>
  );
}
