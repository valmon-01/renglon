import React from "react";

export interface ShareCardProps {
  titulo: string | null;
  contenido: string;
  consigna: string;
  username: string;
  fecha: string; // ISO string
}

function formatFecha(iso: string): string {
  const d = new Date(iso);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yy = String(d.getFullYear()).slice(2);
  return `${dd}/${mm}/${yy}`;
}

// ~48 chars per line at 1080px card width (content area ~870px, font 39px)
const CHARS_PER_LINE = 48;
const LINE_HEIGHT_PX = 84;
// padding_top(96) + header(120) + titulo(100) + gap(60) + gap(60) + footer(120) + padding_bottom(72)
const FIXED_HEIGHT = 628;

// All inline styles — required for html2canvas compatibility
const ShareCard = React.forwardRef<HTMLDivElement, ShareCardProps>(
  ({ titulo, contenido, consigna, username, fecha }, ref) => {
    // Dynamic height based on line count
    const lines = contenido.split("\n").reduce((acc, line) => {
      return acc + Math.max(1, Math.ceil(line.length / CHARS_PER_LINE));
    }, 0);
    const rawHeight = FIXED_HEIGHT + lines * LINE_HEIGHT_PX;
    const cardHeight = Math.min(1920, Math.max(1350, rawHeight));

    // Costura positions every ~180px
    const costuraPositions: number[] = [];
    for (let pos = 180; pos < cardHeight; pos += 180) {
      costuraPositions.push(pos);
    }

    return (
      <div
        ref={ref}
        style={{
          width: 1080,
          height: cardHeight,
          display: "flex",
          flexDirection: "row",
          borderRadius: 24,
          overflow: "hidden",
        }}
      >
        {/* Lomo — inside flex, not absolute, so html2canvas captures it */}
        <div
          style={{
            width: 54,
            flexShrink: 0,
            background: "linear-gradient(to right, #4a2530, #64313E)",
            position: "relative",
          }}
        >
          {costuraPositions.map((top) => (
            <div
              key={top}
              style={{
                position: "absolute",
                left: "50%",
                top,
                transform: "translateX(-50%)",
                width: 21,
                height: 4,
                backgroundColor: "rgba(245,240,232,0.25)",
                borderRadius: 2,
              }}
            />
          ))}
        </div>

        {/* Área de contenido */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            paddingTop: 96,
            paddingRight: 84,
            paddingBottom: 72,
            paddingLeft: 72,
            background:
              "linear-gradient(170deg, #FFFFFF 0%, #FDFAF5 50%, #F5F0E8 100%)",
            position: "relative",
          }}
        >
          {/* Renglones de cuaderno — cada 84px, alineados al line-height del texto */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage:
                "repeating-linear-gradient(to bottom, transparent, transparent 83px, rgba(28,25,23,0.05) 83px, rgba(28,25,23,0.05) 84px)",
              pointerEvents: "none",
            }}
          />

          {/* Header: renglón + fecha */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              marginBottom: 48,
              position: "relative",
            }}
          >
            <span
              style={{
                fontFamily: "'Playfair Display', serif",
                fontStyle: "italic",
                fontSize: 45,
                color: "rgba(100,49,62,0.70)",
              }}
            >
              renglón
            </span>
            <span
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: 32,
                color: "rgba(28,25,23,0.38)",
              }}
            >
              {formatFecha(fecha)}
            </span>
          </div>

          {/* Título */}
          <h1
            style={{
              fontFamily: "'Playfair Display', serif",
              fontStyle: "italic",
              fontSize: 78,
              fontWeight: 400,
              color: "#1C1917",
              lineHeight: 1.15,
              margin: "0 0 48px 0",
              position: "relative",
            }}
          >
            {titulo || "Sin título"}
          </h1>

          {/* Divisoria */}
          <div
            style={{
              width: 108,
              height: 3,
              backgroundColor: "rgba(100,49,62,0.20)",
              marginBottom: 60,
              position: "relative",
            }}
          />

          {/* Texto del escrito — flex:1 para distribuir espacio en cards cortas */}
          <div
            style={{
              flex: 1,
              position: "relative",
            }}
          >
            <p
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: 39,
                lineHeight: "84px",
                color: "rgba(28,25,23,0.72)",
                margin: 0,
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
              }}
            >
              {contenido}
            </p>
          </div>

          {/* Footer: consigna + @username */}
          <div
            style={{
              borderTop: "2px solid rgba(28,25,23,0.08)",
              paddingTop: 24,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: 24,
              position: "relative",
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <span
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: 28,
                  letterSpacing: "0.10em",
                  textTransform: "uppercase",
                  color: "rgba(28,25,23,0.38)",
                  display: "block",
                  marginBottom: 12,
                }}
              >
                Consigna
              </span>
              <span
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontStyle: "italic",
                  fontSize: 34,
                  color: "#1C1917",
                  lineHeight: 1.5,
                }}
              >
                {consigna}
              </span>
            </div>
            <span
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: 36,
                fontWeight: 500,
                color: "#64313E",
                flexShrink: 0,
                paddingTop: 36,
              }}
            >
              @{username}
            </span>
          </div>
        </div>
      </div>
    );
  }
);

ShareCard.displayName = "ShareCard";

export default ShareCard;
