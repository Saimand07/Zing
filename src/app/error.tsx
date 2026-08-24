"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-zinc-200 px-4">
      <div className="flex items-center justify-center w-16 h-16 bg-orange-500/10 rounded-full mb-6">
        <AlertTriangle className="w-8 h-8 text-orange-500" />
      </div>
      <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
      <p className="text-zinc-400 mb-8 max-w-md text-center text-sm">
        {error.message || "An unexpected error occurred while rendering this page."}
      </p>
      <button
        onClick={() => reset()}
        className="flex items-center gap-2 px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg font-medium transition-colors border border-white/5"
      >
        <RefreshCw size={16} />
        Try Again
      </button>
    </div>
  );
}
