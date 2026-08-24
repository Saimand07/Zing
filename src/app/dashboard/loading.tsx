import React from "react";

export default function DashboardLoading() {
  return (
    <div className="p-6 max-w-7xl mx-auto w-full flex flex-col gap-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col gap-2">
        <div className="h-8 bg-white/5 rounded-md w-64" />
        <div className="h-4 bg-white/5 rounded-md w-96" />
      </div>

      {/* Hero Stats / Banners */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="h-32 bg-white/5 rounded-2xl" />
        <div className="h-32 bg-white/5 rounded-2xl" />
        <div className="h-32 bg-white/5 rounded-2xl hidden lg:block" />
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
        <div className="lg:col-span-2 h-96 bg-white/5 rounded-2xl" />
        <div className="h-96 bg-white/5 rounded-2xl" />
      </div>
    </div>
  );
}
