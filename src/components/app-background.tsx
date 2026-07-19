"use client";

import { usePathname } from "next/navigation";
import { WebGLLiquid } from "@/components/ui/webgl-liquid";

export function AppBackground() {
  const pathname = usePathname();
  
  // Do not render on the landing page, as it has its own GLSLHills background
  if (pathname === "/") {
    return null;
  }
  
  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: -1, pointerEvents: "none" }}>
      <WebGLLiquid className="absolute inset-0" opacity={0.65} />
    </div>
  );
}
