"use client";

import { supabase } from "@/lib/supabase";

const PASOS = [
  {
    num: "01",
    titulo: "Recibís la consigna del día",
    desc: "Una pregunta, un recuerdo, una escena. Tu punto de partida.",
  },
  {
    num: "02",
    titulo: "Escribís lo tuyo",
    desc: "Solo vos y el renglón en blanco. Sin presión, sin distracciones.",
  },
  {
    num: "03",
    titulo: "Leés lo que escribieron otros",
    desc: "Primero escribís. Después se abre el feed del día.",
  },
];

interface Props {
  onClose: () => void;
  userId: string;
}

export default function OnboardingModal({ onClose, userId }: Props) {
  async function handleEmpezar() {
    await supabase
      .from("profiles")
      .update({ onboarding_completado: true })
      .eq("id", userId);
    onClose();
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.4)",
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      <div
        style={{
          backgroundColor: "#FDFAF5",
          borderRadius: 12,
          maxWidth: 340,
          width: "100%",
          padding: "48px 32px 40px",
          boxShadow: "0 24px 64px rgba(28,25,23,0.2)",
        }}
      >
        {/* Header */}
        <p
          style={{
            fontFamily: "var(--font-display)",
            fontStyle: "italic",
            fontSize: 13,
            color: "#64313E",
            textAlign: "center",
            marginBottom: 32,
          }}
        >
          renglón
        </p>

        {/* Título */}
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontStyle: "italic",
            fontSize: 26,
            color: "#3D3530",
            textAlign: "center",
            marginBottom: 32,
            margin: "0 0 32px",
          }}
        >
          Así funciona esto.
        </h2>

        {/* Pasos */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {PASOS.map(({ num, titulo, desc }) => (
            <div key={num} style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
              <span
                style={{
                  fontSize: 11,
                  color: "#9C8B7E",
                  letterSpacing: "0.1em",
                  marginTop: 2,
                  minWidth: 20,
                  fontFamily: "var(--font-sans)",
                }}
              >
                {num}
              </span>
              <div>
                <p
                  style={{
                    fontSize: 14,
                    fontWeight: 500,
                    color: "#3D3530",
                    marginBottom: 2,
                    margin: "0 0 2px",
                    fontFamily: "var(--font-sans)",
                  }}
                >
                  {titulo}
                </p>
                <p
                  style={{
                    fontSize: 13,
                    color: "#9C8B7E",
                    lineHeight: "1.5",
                    margin: 0,
                    fontFamily: "var(--font-sans)",
                  }}
                >
                  {desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Botón */}
        <button
          type="button"
          onClick={handleEmpezar}
          style={{
            backgroundColor: "#64313E",
            color: "#F5F0EA",
            borderRadius: 8,
            padding: "14px 0",
            width: "100%",
            fontSize: 15,
            marginTop: 40,
            border: "none",
            cursor: "pointer",
            fontFamily: "var(--font-display)",
            fontStyle: "italic",
          }}
        >
          Empezar a escribir →
        </button>
      </div>
    </div>
  );
}
