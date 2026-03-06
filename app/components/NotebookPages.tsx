"use client";

import { useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface Texto {
  id: string;
  titulo: string | null;
  contenido: string;
  consigna: string;
  created_at: string;
  publicado: boolean;
}

interface NotebookPagesProps {
  texts: Texto[];
  username: string;
  onClose: () => void;
}

function fechaDDMMYYYY(iso: string): string {
  const d = new Date(iso);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

export default function NotebookPages({ texts, username, onClose }: NotebookPagesProps) {
  const [page, setPage] = useState(0);
  const total = texts.length;
  const text = texts[page];

  if (!text) return null;

  return (
    <div
      style={{
        display: "flex",
        maxWidth: 680,
        margin: "0 auto",
        minHeight: 680,
        boxShadow: "4px 6px 32px rgba(28,25,23,0.16), -2px 0 0 rgba(28,25,23,0.08)",
        borderRadius: "4px 10px 10px 4px",
        animation: "openBook 0.35s ease",
      }}
    >
      {/* Lomo izquierdo */}
      <div
        style={{
          width: 18,
          background: "linear-gradient(to bottom, #4a2430, #64313E, #4a2430)",
          borderRadius: "4px 0 0 4px",
          flexShrink: 0,
        }}
      />

      {/* Página derecha */}
      <div
        style={{
          flex: 1,
          backgroundColor: "#FDFAF5",
          borderRadius: "0 10px 10px 0",
          position: "relative",
          display: "flex",
          flexDirection: "column",
          backgroundImage:
            "repeating-linear-gradient(to bottom, transparent, transparent 39px, #E8E2D8 39px, #E8E2D8 40px)",
          backgroundPositionY: "0px",
          overflow: "hidden",
        }}
      >
        {/* Línea de margen izquierda */}
        <div
          style={{
            position: "absolute",
            left: 44,
            top: 0,
            bottom: 0,
            width: 1,
            backgroundColor: "#C1DBE8",
            pointerEvents: "none",
          }}
        />

        {/* Contenido con padding */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            padding: "0 40px 40px 60px",
            position: "relative",
          }}
        >
          {/* Barra superior — height 40px */}
          <div
            style={{
              height: 40,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexShrink: 0,
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: 11,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                color: "#5C5147",
              }}
            >
              {username}
            </span>
            <button
              type="button"
              onClick={onClose}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                fontFamily: "var(--font-sans)",
                fontSize: 12,
                color: "#5C5147",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 0,
              }}
            >
              <X size={14} strokeWidth={1.5} />
            </button>
          </div>

          {/* Número de página — height 40px */}
          <div style={{ height: 40, display: "flex", alignItems: "center", flexShrink: 0 }}>
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontStyle: "italic",
                fontSize: 13,
                color: "#5C5147",
                opacity: 0.5,
              }}
            >
              {page + 1} / {total}
            </span>
          </div>

          {/* Título — height 40px, una línea */}
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontStyle: "italic",
              fontSize: 21,
              color: "#1C1917",
              lineHeight: "40px",
              height: "40px",
              margin: 0,
              padding: 0,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >
            {text.titulo || "Sin título"}
          </h2>

          {/* Fecha + consigna — height 40px */}
          <div style={{ height: 40, display: "flex", alignItems: "center", flexShrink: 0 }}>
            <span
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: 13,
                color: "#5C5147",
                opacity: 0.65,
              }}
            >
              {fechaDDMMYYYY(text.created_at)}
              {text.consigna ? ` — ${text.consigna}` : ""}
            </span>
          </div>

          {/* Cuerpo */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            } as React.CSSProperties}
          >
            <p
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: 15,
                color: "#1C1917",
                lineHeight: "40px",
                whiteSpace: "pre-wrap",
                margin: 0,
              }}
            >
              {text.contenido}
            </p>
          </div>

          {/* Navegación */}
          <div
            style={{
              borderTop: "1px solid #D6CFBF",
              paddingTop: 12,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexShrink: 0,
            }}
          >
            {/* Anterior */}
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                fontFamily: "var(--font-sans)",
                fontSize: 13,
                color: page === 0 ? "#D6CFBF" : "#64313E",
                background: "none",
                border: "none",
                cursor: page === 0 ? "default" : "pointer",
                padding: 0,
              }}
            >
              <ChevronLeft size={14} strokeWidth={1.5} />
              Anterior
            </button>

            {/* Puntos de página */}
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              {texts.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setPage(i)}
                  style={{
                    height: 6,
                    width: i === page ? 18 : 6,
                    borderRadius: 3,
                    backgroundColor: i === page ? "#64313E" : "#D6CFBF",
                    border: "none",
                    padding: 0,
                    cursor: "pointer",
                    transition: "width 0.2s ease, background-color 0.2s ease",
                  }}
                />
              ))}
            </div>

            {/* Siguiente */}
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(total - 1, p + 1))}
              disabled={page === total - 1}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                fontFamily: "var(--font-sans)",
                fontSize: 13,
                color: page === total - 1 ? "#D6CFBF" : "#64313E",
                background: "none",
                border: "none",
                cursor: page === total - 1 ? "default" : "pointer",
                padding: 0,
              }}
            >
              Siguiente
              <ChevronRight size={14} strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
