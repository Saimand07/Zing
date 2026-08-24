import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-zinc-200">
      <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-4" />
      <p className="text-zinc-500 font-medium text-sm animate-pulse">
        Loading Zing...
      </p>
    </div>
  );
}
