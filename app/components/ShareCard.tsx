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
// padding_top(54) + header(120) + titulo(100) + gap(40) + gap(60) + footer(200) + padding_bottom(84)
const FIXED_HEIGHT = 658;

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
            paddingTop: 54,
            paddingRight: 84,
            paddingBottom: 84,
            paddingLeft: 72,
            background:
              "linear-gradient(170deg, #FFFFFF 0%, #FDFAF5 50%, #F5F0E8 100%)",
            position: "relative",
          }}
        >
          {/* Header: renglón (izquierda) + @username (derecha) */}
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
                fontFamily: "'Playfair Display', serif",
                fontStyle: "italic",
                fontSize: 45,
                color: "rgba(100,49,62,0.70)",
              }}
            >
              @{username}
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
              margin: "0 0 40px 0",
              position: "relative",
            }}
          >
            {titulo || "Sin título"}
          </h1>

          {/* Texto del escrito — flex:1 para distribuir espacio en cards cortas */}
          <div
            style={{
              flex: 1,
              minHeight: 0,
              position: "relative",
            }}
          >
            {/* Renglones alineados al cuerpo del texto — línea a 74px (84-10) = justo debajo de la baseline */}
            <div
              style={{
                position: "absolute",
                left: -72,
                right: -84,
                top: 0,
                bottom: 0,
                backgroundImage:
                  "repeating-linear-gradient(to bottom, transparent, transparent 73px, rgba(28,25,23,0.05) 73px, rgba(28,25,23,0.05) 74px, transparent 74px, transparent 84px)",
                backgroundPositionY: 0,
                backgroundSize: "100% 84px",
                pointerEvents: "none",
              }}
            />
            <p
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: 39,
                lineHeight: "84px",
                color: "rgba(28,25,23,0.72)",
                margin: 0,
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
                position: "relative",
              }}
            >
              {contenido}
            </p>
          </div>

          {/* Footer: fecha — consigna — flexShrink:0 para que nunca se comprima */}
          <div
            style={{
              flexShrink: 0,
              borderTop: "2px solid rgba(28,25,23,0.08)",
              paddingTop: 24,
              position: "relative",
            }}
          >
            <span
              style={{
                fontFamily: "'Playfair Display', serif",
                fontStyle: "italic",
                fontSize: 34,
                color: "rgba(28,25,23,0.50)",
                lineHeight: 1.5,
              }}
            >
              {formatFecha(fecha)} — {consigna}
            </span>
          </div>
        </div>
      </div>
    );
  }
);

ShareCard.displayName = "ShareCard";

export default ShareCard;
