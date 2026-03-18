"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Flame } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { Session } from "@supabase/supabase-js";
import TypewriterLoader from "@/app/components/TypewriterLoader";
import OnboardingModal from "@/app/components/OnboardingModal";


export default function Home() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [consigna, setConsigna] = useState<string | null>(null);
  const [ultimaConsigna, setUltimaConsigna] = useState<string | null>(null);
  const [racha, setRacha] = useState<number>(0);
  const [cargando, setCargando] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const hoy = new Date().toISOString().slice(0, 10);
    if (localStorage.getItem(`renglon_completed_${hoy}`)) {
      router.push("/feed");
      return;
    }

    Promise.all([
      supabase.auth.getSession(),
      fetch("/api/asignar-consigna-diaria").then((r) => r.json()),
    ]).then(async ([{ data }, consignaData]) => {
      setSession(data.session);
      const consignaHoy = consignaData.consigna?.texto ?? null;
      setConsigna(consignaHoy);
      if (!consignaHoy) {
        const { data: ultima } = await supabase
          .from("consignas")
          .select("texto")
          .eq("aprobada", true)
          .eq("borrador", false)
          .not("fecha", "is", null)
          .order("fecha", { ascending: false })
          .limit(1)
          .maybeSingle();
        setUltimaConsigna(ultima?.texto ?? null);
      }
      if (data.session?.user.id) {
        const { data: perfil } = await supabase
          .from("profiles")
          .select("racha_actual, onboarding_completado")
          .eq("id", data.session.user.id)
          .single();
        const hoy = new Date().toISOString().slice(0, 10);
        const yaEscribioHoy = !!localStorage.getItem(`renglon_completed_${hoy}`);
        const rachaBase = perfil?.racha_actual ?? 0;
        setRacha(yaEscribioHoy ? rachaBase + 1 : rachaBase);
        if (perfil?.onboarding_completado === false) setShowOnboarding(true);
      }
      setCargando(false);
    });
  }, []);

  if (cargando) return <TypewriterLoader />;

  return (
    <div className="relative min-h-screen bg-papel">
      {showOnboarding && session?.user.id && (
        <OnboardingModal
          userId={session.user.id}
          onClose={() => setShowOnboarding(false)}
        />
      )}

      {/* Textura de puntos */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: "radial-gradient(circle, #9e8e7e 1px, transparent 1px)",
          backgroundSize: "24px 24px",
          opacity: 0.18,
        }}
      />

      {/* Header sticky */}
      <div style={{
        position: "sticky",
        top: 0,
        zIndex: 10,
        backgroundColor: "#F5F0EA",
        borderBottom: "1px solid rgba(61,53,48,0.12)",
        padding: "16px 20px 14px",
        textAlign: "center",
      }}>
        <h1 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 28,
          fontStyle: "italic",
          fontWeight: 400,
          color: "#64313E",
          margin: 0,
          lineHeight: 1,
        }}>renglón</h1>
        <p style={{
          fontSize: 10,
          letterSpacing: "0.14em",
          color: "#9C8B7E",
          margin: "6px 0 0",
          textAlign: "center",
        }}>
          {new Date().toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "2-digit" })}
        </p>
      </div>

      {/* Contenido principal */}
      <main className="mx-auto flex max-w-[600px] flex-col items-center px-6 pb-24 pt-10 text-center">

        {consigna === null ? (
          <div style={{ textAlign: "center", padding: "64px 32px" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, marginBottom: 32 }}>
              <div style={{ width: 48, height: 1, backgroundColor: "rgba(61,53,48,0.15)" }} />
              <div style={{ width: 64, height: 1, backgroundColor: "rgba(61,53,48,0.15)" }} />
              <div style={{ width: 48, height: 1, backgroundColor: "rgba(61,53,48,0.15)" }} />
            </div>
            {ultimaConsigna ? (
              <>
                <p style={{ fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "#9C8B7E", margin: "0 0 12px" }}>
                  La consigna de ayer:
                </p>
                <p style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: 22, color: "#3D3530", margin: "0 0 32px", lineHeight: 1.5 }}>
                  {ultimaConsigna}
                </p>
                <Link
                  href={session ? "/editor" : "/login"}
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
                  Escribir sobre esta consigna
                </Link>
              </>
            ) : (
              <>
                <p style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: 20, color: "#3D3530", margin: "0 0 12px" }}>
                  Las consignas llegan cada mañana.
                </p>
                <p style={{ fontSize: 14, color: "#9C8B7E", margin: "0 0 24px" }}>
                  Mientras tanto, podés explorar el feed.
                </p>
                <Link
                  href="/feed"
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
                  Ver el feed
                </Link>
              </>
            )}
          </div>
        ) : (
          <>
            {/* Label consigna */}
            <p className="mt-8 text-[11px] uppercase tracking-widest text-tinta-suave">
              consigna de hoy
            </p>

            {/* Consigna */}
            <h1
              className="mt-4 font-display italic text-tinta"
              style={{ fontSize: "28px", lineHeight: "1.4" }}
            >
              {consigna}
            </h1>

            {/* Racha — solo con sesión */}
            {session && (
              <p className="mt-6 flex items-center gap-1.5 text-sm text-tinta-suave">
                <Flame size={16} strokeWidth={1.5} style={{ color: "#64313E" }} />
                {racha} días seguidos
              </p>
            )}

            {/* Mensaje sin sesión */}
            {!session && (
              <p className="mt-6 text-sm text-tinta-suave">
                Iniciá sesión para escribir tu versión
              </p>
            )}

            {/* Acciones */}
            <div className="mt-10 flex flex-col items-center gap-4">
              <Link
                href={session ? "/editor" : "/login"}
                className="rounded-[6px] bg-borravino px-8 py-3 text-sm font-medium text-blanco-roto transition-opacity hover:opacity-90"
              >
                Escribir
              </Link>

              <Link
                href="/feed"
                className="text-sm text-tinta-suave underline underline-offset-4 transition-colors hover:text-tinta"
              >
                Ver lo que escribieron otros
              </Link>
            </div>
          </>
        )}

      </main>
    </div>
  );
}
