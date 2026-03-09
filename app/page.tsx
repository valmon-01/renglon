"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

const FALLBACK = "Escribí sobre un objeto que alguien te dejó y que no pediste.";

export default function Landing() {
  const [consigna, setConsigna] = useState<string>(FALLBACK);
  const [displayLinea1, setDisplayLinea1] = useState("");
  const [displayLinea2, setDisplayLinea2] = useState("");
  const [fase, setFase] = useState<1 | 2 | 3>(1);

  const textoLinea1 = "El hábito de escribir,";
  const textoLinea2 = "un renglón a la vez.";

  // Fetch consigna
  useEffect(() => {
    fetch("/api/asignar-consigna-diaria")
      .then((r) => r.json())
      .then((data) => {
        if (data.consigna?.texto) setConsigna(data.consigna.texto);
      })
      .catch(() => {});
  }, []);

  // Typewriter
  useEffect(() => {
    if (fase === 1) {
      if (displayLinea1.length < textoLinea1.length) {
        const t = setTimeout(() => {
          setDisplayLinea1(textoLinea1.slice(0, displayLinea1.length + 1));
        }, 55);
        return () => clearTimeout(t);
      } else {
        const t = setTimeout(() => setFase(2), 500);
        return () => clearTimeout(t);
      }
    }
    if (fase === 2) {
      if (displayLinea2.length < textoLinea2.length) {
        const t = setTimeout(() => {
          setDisplayLinea2(textoLinea2.slice(0, displayLinea2.length + 1));
        }, 55);
        return () => clearTimeout(t);
      } else {
        const t = setTimeout(() => setFase(3), 200);
        return () => clearTimeout(t);
      }
    }
  }, [fase, displayLinea1, displayLinea2]);

  return (
    <div className="relative min-h-screen bg-papel">

      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        .cursor-blink {
          animation: blink 0.8s step-end infinite;
          color: #64313E;
        }
      `}</style>

      {/* Textura de puntos */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: "radial-gradient(circle, #9e8e7e 1px, transparent 1px)",
          backgroundSize: "24px 24px",
          opacity: 0.18,
        }}
      />

      {/* Navbar */}
      <nav className="w-full px-6 py-5">
        <div className="mx-auto flex max-w-[680px] items-center justify-between">
          <span className="font-display text-xl italic text-tinta">renglón</span>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-[6px] border border-borravino px-4 py-2 text-sm text-borravino transition-colors hover:bg-borravino hover:text-blanco-roto"
              style={{ borderWidth: "1.5px" }}
            >
              Iniciar sesión
            </Link>
            <Link
              href="/registro"
              className="rounded-[6px] bg-borravino px-4 py-2 text-sm text-blanco-roto transition-colors hover:opacity-90"
            >
              Registrarse
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <main className="relative mx-auto max-w-[680px] px-6 pb-24 pt-12">

        {/* Título principal con typewriter */}
        <h1
          className="mb-6 text-center font-display italic leading-tight text-tinta"
          style={{ fontSize: "clamp(36px, 6vw, 56px)" }}
        >
          <span>
            {displayLinea1}
            {fase === 1 && <span className="cursor-blink">|</span>}
          </span>
          <br />
          <span style={{ color: "#64313E" }}>
            {displayLinea2}
            {fase === 2 && <span className="cursor-blink">|</span>}
          </span>
        </h1>

        {/* Subtítulo con fade in */}
        <motion.p
          className="mx-auto mb-12 text-center font-display italic"
          style={{
            fontSize: "17px",
            lineHeight: "1.7",
            maxWidth: "520px",
            color: "#5C5147",
          }}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: fase >= 3 ? 1 : 0, y: fase >= 3 ? 0 : 8 }}
          transition={{ duration: 0.7 }}
        >
          Cada día una consigna nueva te invita a recordar, imaginar o crear. Escribís lo tuyo, lo compartís si querés, y después leés lo que crearon los demás.
        </motion.p>

        {/* Preview de consigna — cuaderno con slide up */}
        <motion.div
          className="relative mx-auto mb-12 overflow-hidden"
          style={{
            maxWidth: "460px",
            backgroundColor: "#FDFAF5",
            border: "1px solid #D6CFBF",
            borderRadius: "8px",
            backgroundImage:
              "repeating-linear-gradient(to bottom, transparent, transparent 39px, #D6CFBF 39px, #D6CFBF 40px)",
            backgroundPositionY: "24px",
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: fase >= 3 ? 1 : 0, y: fase >= 3 ? 0 : 20 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          {/* Línea de margen */}
          <div
            className="pointer-events-none absolute bottom-0 top-0"
            style={{ left: "44px", width: "1px", backgroundColor: "#C1DBE8" }}
          />
          <div
            style={{
              paddingLeft: "52px",
              paddingRight: "52px",
              paddingTop: "24px",
              paddingBottom: "24px",
            }}
          >
            <p
              className="text-center uppercase tracking-widest text-tinta-suave"
              style={{
                fontSize: "10px",
                lineHeight: "40px",
                fontFamily: "Inter, sans-serif",
              }}
            >
              Consigna de hoy
            </p>
            <p
              className="text-center font-display italic text-tinta"
              style={{ fontSize: "20px", lineHeight: "40px" }}
            >
              {consigna}
            </p>
          </div>
        </motion.div>

        {/* CTA con fade in */}
        <motion.div
          className="flex justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: fase >= 3 ? 1 : 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <motion.div whileHover={{ scale: 1.02 }}>
            <Link
              href="/registro"
              className="rounded-[6px] bg-borravino text-sm font-medium text-blanco-roto transition-opacity hover:opacity-90"
              style={{ padding: "14px 40px", display: "inline-block" }}
            >
              Empezar a escribir
            </Link>
          </motion.div>
        </motion.div>

      </main>

      {/* ¿Cómo funciona? */}
      <section className="mx-auto max-w-[680px] px-6" style={{ paddingBottom: "48px" }}>

        <div className="mb-12 flex flex-col items-center gap-4">
          <h2
            className="text-center font-display text-tinta"
            style={{ fontSize: "28px" }}
          >
            ¿Cómo funciona?
          </h2>
          <div style={{ width: "60px", height: "1px", backgroundColor: "#C1DBE8" }} />
        </div>

        {/* Pasos con scroll reveal */}
        <div className="flex flex-col">
          {[
            {
              num: "01",
              title: "Recibís la consigna",
              desc: "Cada día hay una consigna nueva: un objeto, un recuerdo, una escena. Tu punto de partida está listo.",
            },
            {
              num: "02",
              title: "Escribís lo tuyo",
              desc: "Un espacio limpio, sin distracciones. Solo vos y el renglón en blanco. Escribís desde donde podás.",
            },
            {
              num: "03",
              title: "Lo compartís y leés",
              desc: "Publicás si querés. Y entonces se abre el feed: lo que escribieron los demás sobre la misma consigna, hoy.",
            },
          ].map(({ num, title, desc }, index, arr) => (
            <motion.div
              key={num}
              className="flex gap-6"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
            >
              {/* Línea conectora + número */}
              <div className="flex flex-col items-center">
                <p
                  className="font-display italic"
                  style={{ fontSize: "14px", lineHeight: "1", color: "#64313E" }}
                >
                  {num}
                </p>
                {index < arr.length - 1 && (
                  <div
                    className="mt-3 flex-1"
                    style={{ width: "1px", backgroundColor: "#D6CFBF", minHeight: "40px" }}
                  />
                )}
              </div>

              {/* Contenido */}
              <div className={index < arr.length - 1 ? "pb-10" : ""}>
                <p
                  className="font-medium text-tinta"
                  style={{ fontSize: "16px", fontFamily: "Inter, sans-serif" }}
                >
                  {title}
                </p>
                <p
                  className="mt-1.5 text-tinta-suave"
                  style={{ fontSize: "14px", lineHeight: "1.6", fontFamily: "Inter, sans-serif" }}
                >
                  {desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Cierre */}
      <section className="mx-auto max-w-[680px] px-6" style={{ paddingBottom: "48px" }}>
        <div style={{ height: "1px", backgroundColor: "#D6CFBF" }} className="mb-12" />
        <div className="flex flex-col items-center gap-5 text-center">
          <p
            className="font-display italic text-tinta"
            style={{ fontSize: "20px" }}
          >
            La consigna de hoy ya está esperándote.
          </p>
          <Link
            href="/registro"
            className="rounded-[6px] bg-borravino text-sm font-medium text-blanco-roto transition-opacity hover:opacity-90"
            style={{ padding: "14px 40px" }}
          >
            Empezar a escribir
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid rgba(61,53,48,0.08)", padding: "40px 24px 48px" }}>
        <div style={{ maxWidth: 480, margin: "0 auto", textAlign: "center" }}>

          <p style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 32, color: "#3D3530" }}>
            renglón
          </p>
          <p style={{ fontSize: 16, color: "#9C8B7E", marginTop: 8, fontStyle: "italic", fontFamily: "var(--font-display)" }}>
            El hábito de escribir, un renglón a la vez.
          </p>

          <div style={{ display: "flex", justifyContent: "center", gap: 20, marginTop: 12 }}>
            <a
              href="https://instagram.com/soyrenglon"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#9C8B7E", display: "inline-flex", transition: "color 0.2s" }}
              className="hover:text-[#3D3530]"
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                <circle cx="12" cy="12" r="4"/>
                <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none"/>
              </svg>
            </a>
            <a
              href="https://tiktok.com/@soyrenglon"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#9C8B7E", display: "inline-flex", transition: "color 0.2s" }}
              className="hover:text-[#3D3530]"
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.32 6.32 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.75a4.85 4.85 0 0 1-1.01-.06z"/>
              </svg>
            </a>
          </div>

        </div>
      </footer>

    </div>
  );
}
