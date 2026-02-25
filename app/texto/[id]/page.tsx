"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Heart } from "lucide-react";
import { supabase } from "@/lib/supabase";

type Texto = {
  id: string;
  contenido: string;
  titulo: string | null;
  created_at: string;
  consigna: string;
  profiles: { username: string }[] | { username: string } | null;
}

function iniciales(nombre: string): string {
  return nombre
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

function fechaCorta(iso: string): string {
  const d = new Date(iso);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const aaaa = d.getFullYear();
  return `${dd}/${mm}/${aaaa}`;
}

export default function TextoIndividual() {
  const { id } = useParams<{ id: string }>();
  const [texto, setTexto] = useState<Texto | null>(null);
  const [cargando, setCargando] = useState(true);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    supabase
      .from("textos")
      .select("id, contenido, titulo, created_at, consigna, profiles(username)")
      .eq("id", id)
      .single()
      .then(({ data }) => {
        setTexto(data as unknown as Texto);
        setCargando(false);
      });
  }, [id]);

  if (cargando) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-papel">
        <span className="text-sm text-tinta-suave">Cargando…</span>
      </div>
    );
  }

  if (!texto) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-papel">
        <p className="text-tinta-suave">No se encontró el texto.</p>
        <Link
          href="/feed"
          className="text-sm text-borravino underline underline-offset-2"
        >
          Volver al feed
        </Link>
      </div>
    );
  }

  const autor = Array.isArray(texto.profiles)
    ? texto.profiles[0]?.username
    : texto.profiles?.username;
  const username = autor ?? "Autor";

  return (
    <div className="flex min-h-screen flex-col bg-papel">

      {/* Navbar */}
      <nav className="sticky top-0 z-20 flex items-center justify-between border-b border-borde bg-papel px-6 py-4">
        <Link
          href="/feed"
          className="flex items-center gap-2 text-sm text-tinta-suave transition-colors hover:text-tinta"
        >
          <ArrowLeft size={18} strokeWidth={1.5} />
          Feed
        </Link>
        <div className="flex items-center gap-2.5">
          <span className="text-sm text-tinta">{username}</span>
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-medium"
            style={{ backgroundColor: "#C1DBE8", color: "#64313E" }}
          >
            {iniciales(username)}
          </div>
        </div>
      </nav>

      {/* Cuaderno */}
      <div className="flex-1 overflow-auto">
        <div
          className="relative mx-auto w-full"
          style={{
            maxWidth: "720px",
            minHeight: "calc(100vh - 65px)",
            backgroundColor: "#FDFAF5",
            backgroundImage:
              "repeating-linear-gradient(transparent, transparent 39px, #D6CFBF 39px, #D6CFBF 40px)",
            backgroundPositionY: "24px",
          }}
        >
          {/* Línea de margen */}
          <div
            className="pointer-events-none absolute bottom-0 top-0"
            style={{ left: "44px", width: "1px", backgroundColor: "#C1DBE8" }}
          />

          {/* Contenido */}
          <div
            className="relative"
            style={{
              paddingLeft: "52px",
              paddingRight: "52px",
              paddingTop: "24px",
              paddingBottom: "120px",
            }}
          >

            {/* Renglón 1: fecha DD/MM/AAAA — derecha */}
            <p
              className="select-none text-right font-display italic text-tinta-suave"
              style={{ fontSize: "1rem", lineHeight: "40px" }}
            >
              {fechaCorta(texto.created_at)}
            </p>

            {/* Renglón 2: consigna */}
            <p
              className="select-none font-display italic text-tinta-suave"
              style={{ fontSize: "1rem", lineHeight: "40px" }}
            >
              {texto.consigna}
            </p>

            {/* Renglón 3: título (si existe) */}
            {texto.titulo && (
              <p
                className="italic text-tinta"
                style={{
                  fontSize: "1rem",
                  lineHeight: "40px",
                  fontFamily: "Inter, sans-serif",
                }}
              >
                {texto.titulo}
              </p>
            )}

            {/* Desde renglón 4: texto completo */}
            <div
              className="text-tinta"
              style={{
                fontSize: "1rem",
                lineHeight: "40px",
                fontFamily: "Inter, sans-serif",
              }}
            >
              {texto.contenido.split("\n").map((linea, i) => (
                <p key={i}>{linea || "\u00A0"}</p>
              ))}
            </div>

            {/* Corazón centrado */}
            <div className="flex justify-center" style={{ marginTop: "80px" }}>
              <button
                type="button"
                onClick={() => setLiked(!liked)}
                aria-label={liked ? "Quitar me gusta" : "Me gusta"}
                className={`flex flex-col items-center gap-2 transition-colors ${
                  liked ? "text-borravino" : "text-tinta-suave hover:text-borravino"
                }`}
              >
                <Heart
                  size={28}
                  strokeWidth={1.5}
                  fill={liked ? "currentColor" : "none"}
                />
                <span className="text-xs" style={{ fontFamily: "Inter, sans-serif" }}>
                  {liked ? "Te gustó" : "Me gusta"}
                </span>
              </button>
            </div>

          </div>
        </div>
      </div>

    </div>
  );
}
