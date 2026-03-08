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

// All inline styles — required for html2canvas compatibility
const ShareCard = React.forwardRef<HTMLDivElement, ShareCardProps>(
  ({ titulo, contenido, consigna, username, fecha }, ref) => {
    return (
      <div
        ref={ref}
        style={{
          width: 1080,
          minHeight: 1350,
          display: "flex",
          flexDirection: "row",
          background: "linear-gradient(170deg, #FFFFFF 0%, #FDFAF5 50%, #F5F0E8 100%)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Lomo (spine) — flat, no 3D */}
        <div
          style={{
            width: 18,
            flexShrink: 0,
            background: "linear-gradient(to right, #4a2530, #64313E)",
            borderRadius: "4px 0 0 4px",
            position: "relative",
          }}
        >
          {/* Costuras decorativas */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage:
                "repeating-linear-gradient(to bottom, transparent, transparent 59px, rgba(245,240,232,0.25) 59px, rgba(245,240,232,0.25) 66px)",
            }}
          />
        </div>

        {/* Renglones de cuaderno sobre el contenido */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 18,
            right: 0,
            bottom: 0,
            backgroundImage:
              "repeating-linear-gradient(to bottom, transparent, transparent 27px, rgba(28,25,23,0.05) 27px, rgba(28,25,23,0.05) 28px)",
            pointerEvents: "none",
          }}
        />

        {/* Área de contenido */}
        <div
          style={{
            flex: 1,
            paddingTop: 32,
            paddingRight: 28,
            paddingBottom: 24,
            paddingLeft: 38,
            display: "flex",
            flexDirection: "column",
            position: "relative",
          }}
        >
          {/* Header: renglón + fecha */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              marginBottom: 40,
            }}
          >
            <span
              style={{
                fontFamily: "'Playfair Display', serif",
                fontStyle: "italic",
                fontSize: 15,
                color: "rgba(100,49,62,0.70)",
              }}
            >
              renglón
            </span>
            <span
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: 10.5,
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
              fontSize: 26,
              fontWeight: 400,
              color: "#1C1917",
              lineHeight: 1.2,
              margin: "0 0 20px 0",
            }}
          >
            {titulo || "Sin título"}
          </h1>

          {/* Divisoria */}
          <div
            style={{
              width: 36,
              height: 1,
              backgroundColor: "rgba(100,49,62,0.20)",
              marginBottom: 32,
            }}
          />

          {/* Texto completo — sin truncar */}
          <p
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: 13,
              lineHeight: "28px",
              color: "rgba(28,25,23,0.72)",
              margin: 0,
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              flex: 1,
            }}
          >
            {contenido}
          </p>

          {/* Espaciador */}
          <div style={{ minHeight: 48 }} />

          {/* Footer: consigna + @username */}
          <div
            style={{
              borderTop: "1px solid rgba(28,25,23,0.08)",
              paddingTop: 20,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: 16,
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <span
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: 9.5,
                  letterSpacing: "0.10em",
                  textTransform: "uppercase",
                  color: "rgba(28,25,23,0.38)",
                  display: "block",
                  marginBottom: 6,
                }}
              >
                Consigna
              </span>
              <span
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontStyle: "italic",
                  fontSize: 11.5,
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
                fontSize: 12,
                fontWeight: 500,
                color: "#64313E",
                flexShrink: 0,
                paddingTop: 18,
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
