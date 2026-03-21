"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Flame } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { Session } from "@supabase/supabase-js";
import TypewriterLoader from "@/app/components/TypewriterLoader";
import OnboardingModal from "@/app/components/OnboardingModal";
import { getFechaLocal } from "@/utils/fecha";

interface ConsignaSemana {
  texto: string;
  fecha: string;
}

function toFechaLocal(d: Date): string {
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 10);
}

function getLunesSabadoDeSemana(): { lunes: string; sabado: string } {
  const hoy = new Date();
  const lunes = new Date(hoy);
  lunes.setDate(hoy.getDate() - 6); // domingo - 6 = lunes
  const sabado = new Date(hoy);
  sabado.setDate(hoy.getDate() - 1); // ayer = sábado
  return {
    lunes: toFechaLocal(lunes),
    sabado: toFechaLocal(sabado),
  };
}

export default function Home() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [consigna, setConsigna] = useState<string | null>(null);
  const [ultimaConsigna, setUltimaConsigna] = useState<string | null>(null);
  const [racha, setRacha] = useState<number>(0);
  const [cargando, setCargando] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [yaEscribioHoy, setYaEscribioHoy] = useState(false);
  const [esDomingo, setEsDomingo] = useState(false);
  const [consignasSemana, setConsignasSemana] = useState<ConsignaSemana[]>([]);
  const [consignasEscritas, setConsignasEscritas] = useState<Set<string>>(new Set());

  useEffect(() => {
    const hoy = getFechaLocal();
    const completadoHoy = !!localStorage.getItem(`renglon_completed_${hoy}`);
    setYaEscribioHoy(completadoHoy);

    const diaLocal = new Date().getDay();
    const domingo = diaLocal === 0;
    setEsDomingo(domingo);

    Promise.all([
      supabase.auth.getSession(),
      fetch("/api/asignar-consigna-diaria").then((r) => r.json()),
    ]).then(async ([{ data }, consignaData]) => {
      setSession(data.session);
      const consignaHoy = consignaData.consigna?.texto ?? null;
      setConsigna(consignaHoy);

      // Hoja libre: fetch consignas de la semana si es domingo y no escribió hoy
      if (domingo && !completadoHoy) {
        const { lunes, sabado } = getLunesSabadoDeSemana();
        const { data: semana } = await supabase
          .from("consignas")
          .select("texto, fecha")
          .eq("estado", "publicada")
          .gte("fecha", lunes)
          .lte("fecha", sabado)
          .order("fecha", { ascending: true });
        const semanaData = semana ?? [];
        setConsignasSemana(semanaData);

        // Qué consignas de la semana ya escribió el usuario
        if (data.session?.user.id && semanaData.length > 0) {
          const textosSemana = semanaData.map((c) => c.texto);
          const { data: escritos } = await supabase
            .from("textos")
            .select("consigna")
            .eq("user_id", data.session.user.id)
            .eq("borrador", false)
            .in("consigna", textosSemana);
          setConsignasEscritas(
            new Set((escritos ?? []).map((t) => t.consigna as string))
          );
        }
      }

      if (!consignaHoy) {
        const { data: ultima } = await supabase
          .from("consignas")
          .select("texto")
          .eq("estado", "publicada")
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

        const rachaBase = perfil?.racha_actual ?? 0;
        setRacha(completadoHoy ? rachaBase + 1 : rachaBase);

        if (perfil?.onboarding_completado === false)
          setShowOnboarding(true);
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
          backgroundImage:
            "radial-gradient(circle, #9e8e7e 1px, transparent 1px)",
          backgroundSize: "24px 24px",
          opacity: 0.18,
        }}
      />

      {/* Header sticky */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          backgroundColor: "#F5F0EA",
          borderBottom: "1px solid rgba(61,53,48,0.12)",
          padding: "16px 20px 14px",
          textAlign: "center",
        }}
      >
        <h1
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 28,
            fontStyle: "italic",
            fontWeight: 400,
            color: "#64313E",
            margin: 0,
            lineHeight: 1,
          }}
        >
          renglón
        </h1>
        <p
          style={{
            fontSize: 10,
            letterSpacing: "0.14em",
            color: "#9C8B7E",
            margin: "6px 0 0",
            textAlign: "center",
          }}
        >
          {new Date().toLocaleDateString("es-AR", {
            day: "2-digit",
            month: "2-digit",
            year: "2-digit",
          })}
        </p>
      </div>

      {/* Contenido principal */}
      <main className="mx-auto flex max-w-[600px] flex-col items-center px-6 pb-24 pt-10 text-center">
        {/* Hoja libre */}
        {esDomingo && !yaEscribioHoy && consignasSemana.length > 0 && consignasEscritas.size < consignasSemana.length ? (
          <>
            <p
              style={{
                fontSize: 11,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "var(--color-tinta-suave)",
                marginTop: 32,
                marginBottom: 16,
              }}
            >
              hoja libre
            </p>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontStyle: "italic",
                fontSize: 26,
                lineHeight: 1.4,
                color: "var(--color-tinta)",
                marginBottom: 8,
              }}
            >
              ¿Cuál te quedó pendiente?
            </h2>
            <p
              style={{
                fontSize: 13,
                color: "var(--color-tinta-suave)",
                marginBottom: 40,
                lineHeight: 1.6,
              }}
            >
              Una vez por semana, la consigna la elegís vos.
            </p>

            <div
              style={{
                width: "100%",
                display: "flex",
                flexDirection: "column",
                gap: 12,
              }}
            >
              {consignasSemana.map((c) => {
                const yaEscrita = consignasEscritas.has(c.texto);
                const fecha = new Date(c.fecha + "T12:00:00");
                const diaNombre = fecha.toLocaleDateString("es-AR", { weekday: "long" });
                const diaCorto = diaNombre.charAt(0).toUpperCase() + diaNombre.slice(1);
                const url = `/editor?consigna=${encodeURIComponent(c.texto)}&fecha=${c.fecha}`;

                if (yaEscrita) {
                  return (
                    <a
                      key={c.fecha}
                      href="/perfil"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        textAlign: "left",
                        backgroundColor: "var(--color-papel-oscuro)",
                        border: "1px solid var(--color-borde)",
                        borderRadius: 8,
                        padding: "16px 20px",
                        textDecoration: "none",
                        opacity: 0.45,
                        cursor: "default",
                      }}
                    >
                      <div>
                        <span
                          style={{
                            fontSize: 10,
                            letterSpacing: "0.12em",
                            textTransform: "uppercase",
                            color: "var(--color-tinta-suave)",
                            display: "block",
                            marginBottom: 6,
                          }}
                        >
                          {diaCorto}
                        </span>
                        <span
                          style={{
                            fontFamily: "var(--font-display)",
                            fontStyle: "italic",
                            fontSize: 18,
                            color: "var(--color-tinta)",
                            lineHeight: 1.4,
                          }}
                        >
                          {c.texto}
                        </span>
                      </div>
                      <span
                        style={{
                          fontSize: 14,
                          color: "var(--color-tinta-suave)",
                          flexShrink: 0,
                          marginLeft: 16,
                        }}
                      >
                        ✓
                      </span>
                    </a>
                  );
                }

                return (
                  <a
                    key={c.fecha}
                    href={session ? url : "/login"}
                    style={{
                      display: "block",
                      textAlign: "left",
                      backgroundColor: "var(--color-papel-oscuro)",
                      border: "1px solid var(--color-borde)",
                      borderRadius: 8,
                      padding: "16px 20px",
                      textDecoration: "none",
                      transition: "border-color 0.15s, background-color 0.15s",
                      cursor: "pointer",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLAnchorElement).style.borderColor = "var(--color-borravino)";
                      (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "var(--color-papel)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLAnchorElement).style.borderColor = "var(--color-borde)";
                      (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "var(--color-papel-oscuro)";
                    }}
                  >
                    <span
                      style={{
                        fontSize: 10,
                        letterSpacing: "0.12em",
                        textTransform: "uppercase",
                        color: "var(--color-tinta-suave)",
                        display: "block",
                        marginBottom: 6,
                      }}
                    >
                      {diaCorto}
                    </span>
                    <span
                      style={{
                        fontFamily: "var(--font-display)",
                        fontStyle: "italic",
                        fontSize: 18,
                        color: "var(--color-tinta)",
                        lineHeight: 1.4,
                      }}
                    >
                      {c.texto}
                    </span>
                  </a>
                );
              })}
            </div>
          </>
        ) : consigna === null ? (
          <div style={{ textAlign: "center", padding: "64px 32px" }}>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 6,
                marginBottom: 32,
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 1,
                  backgroundColor: "rgba(61,53,48,0.15)",
                }}
              />
              <div
                style={{
                  width: 64,
                  height: 1,
                  backgroundColor: "rgba(61,53,48,0.15)",
                }}
              />
              <div
                style={{
                  width: 48,
                  height: 1,
                  backgroundColor: "rgba(61,53,48,0.15)",
                }}
              />
            </div>

            {ultimaConsigna ? (
              <>
                <p
                  style={{
                    fontSize: 11,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    color: "#9C8B7E",
                    margin: "0 0 12px",
                  }}
                >
                  La consigna de ayer:
                </p>
                <p
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    fontStyle: "italic",
                    fontSize: 22,
                    color: "#3D3530",
                    margin: "0 0 32px",
                    lineHeight: 1.5,
                  }}
                >
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
                <p
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    fontStyle: "italic",
                    fontSize: 20,
                    color: "#3D3530",
                    margin: "0 0 12px",
                  }}
                >
                  Las consignas llegan cada mañana.
                </p>
                <p
                  style={{
                    fontSize: 14,
                    color: "#9C8B7E",
                    margin: "0 0 24px",
                  }}
                >
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
                <Flame
                  size={16}
                  strokeWidth={1.5}
                  style={{ color: "#64313E" }}
                />
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
              {yaEscribioHoy ? (
                <>
                  {/* Ya escribió: mostrar confirmación + link al feed */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "12px 24px",
                      backgroundColor: "rgba(100,49,62,0.08)",
                      borderRadius: 8,
                    }}
                  >
                    <span style={{ fontSize: 14, color: "#64313E" }}>✓</span>
                    <span
                      style={{
                        fontSize: 14,
                        color: "#3D3530",
                        fontStyle: "italic",
                      }}
                    >
                      Ya escribiste hoy
                    </span>
                  </div>
                  <Link
                    href="/feed"
                    className="rounded-[6px] bg-borravino px-8 py-3 text-sm font-medium text-blanco-roto transition-opacity hover:opacity-90"
                  >
                    Ver lo que escribieron otros
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href={session ? "/editor" : "/login"}
                    className="rounded-[6px] bg-borravino px-8 py-3 text-sm font-medium text-blanco-roto transition-opacity hover:opacity-90"
                  >
                    Escribir
                  </Link>
                </>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
