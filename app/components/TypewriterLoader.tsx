"use client";

import { useState, useEffect } from "react";

const FRASES = [
  "abriendo la libreta...",
  "buscando las palabras...",
  "preparando el renglón...",
  "el papel te espera...",
  "casi listo para escribir...",
];

export default function TypewriterLoader() {
  const [frase] = useState(() => FRASES[Math.floor(Math.random() * FRASES.length)]);
  const [displayed, setDisplayed] = useState("");

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setDisplayed(frase.slice(0, i));
      if (i >= frase.length) clearInterval(interval);
    }, 60);
    return () => clearInterval(interval);
  }, [frase]);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        backgroundColor: "#F5F0EA",
      }}
    >
      <p
        style={{
          fontFamily: "var(--font-display)",
          fontStyle: "italic",
          fontSize: 20,
          color: "#3D3530",
          margin: 0,
        }}
      >
        {displayed}
        <span
          style={{
            display: "inline-block",
            color: "#9C8B7E",
            animation: "blink 800ms ease-in-out infinite",
          }}
        >
          |
        </span>
      </p>
      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 0; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
