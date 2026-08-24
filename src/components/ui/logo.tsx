import React from 'react';

export function ZingLogo({ size = 32 }: { size?: number }) {
  return (
    <div
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: `${Math.round(size * 0.28)}px`,
        background: "linear-gradient(135deg, #00E5FF 0%, #B534FF 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 0 20px rgba(0, 229, 255, 0.4)",
        flexShrink: 0,
      }}
    >
      <svg
        width={Math.round(size * 0.58)}
        height={Math.round(size * 0.58)}
        viewBox="0 0 24 24"
        fill="none"
      >
        <path
          d="M4 5h16L9 19h11"
          stroke="#000"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
