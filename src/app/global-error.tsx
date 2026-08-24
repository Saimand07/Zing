"use client";

import { useEffect } from "react";
import { AlertCircle } from "lucide-react";

export default function GlobalError({
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
    <html lang="en">
      <body>
        <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950 text-zinc-200 px-4">
          <div className="flex items-center justify-center w-16 h-16 bg-red-500/10 rounded-full mb-6">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold mb-2">A Critical Error Occurred</h2>
          <p className="text-zinc-400 mb-8 max-w-md text-center">
            Something went fundamentally wrong in the application. We've logged the error and are working on it.
          </p>
          <button
            onClick={() => reset()}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            Recover Application
          </button>
        </div>
      </body>
    </html>
  );
}
