import Link from "next/link";

export default function NotFound() {
  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center px-6 text-center"
      style={{ backgroundColor: "#F5F0E8" }}
    >
      <p
        style={{
          fontFamily: "'Playfair Display', serif",
          fontStyle: "italic",
          fontSize: 48,
          color: "#64313E",
          margin: "0 0 16px",
        }}
      >
        404
      </p>
      <p
        style={{
          fontFamily: "'Playfair Display', serif",
          fontStyle: "italic",
          fontSize: 20,
          color: "#3D3530",
          margin: "0 0 8px",
        }}
      >
        Esta página no existe.
      </p>
      <p style={{ fontSize: 14, color: "#9C8B7E", margin: "0 0 32px" }}>
        Pero tu próximo renglón sí.
      </p>
      <Link
        href="/home"
        style={{
          display: "inline-block",
          backgroundColor: "#64313E",
          color: "#FDFAF5",
          padding: "12px 32px",
          borderRadius: 6,
          fontSize: 14,
          fontWeight: 500,
          textDecoration: "none",
        }}
      >
        Volver al inicio
      </Link>
    </div>
  );
}
