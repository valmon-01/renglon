"use client";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center px-6 text-center"
      style={{ backgroundColor: "#F5F0E8" }}
    >
      <p
        style={{
          fontFamily: "'Playfair Display', serif",
          fontStyle: "italic",
          fontSize: 20,
          color: "#3D3530",
          margin: "0 0 8px",
        }}
      >
        Algo salió mal.
      </p>
      <p style={{ fontSize: 14, color: "#9C8B7E", margin: "0 0 24px" }}>
        Podés intentar de nuevo.
      </p>
      <button
        onClick={() => reset()}
        style={{
          backgroundColor: "#64313E",
          color: "#FDFAF5",
          padding: "12px 32px",
          borderRadius: 6,
          fontSize: 14,
          fontWeight: 500,
          border: "none",
          cursor: "pointer",
        }}
      >
        Reintentar
      </button>
    </div>
  );
}
