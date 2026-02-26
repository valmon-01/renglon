"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const ADMIN_EMAIL = "valenmonti01@gmail.com";

const CATEGORIAS = [
  { value: "emocion", label: "Emoción" },
  { value: "lugar", label: "Lugar" },
  { value: "personaje", label: "Personaje" },
  { value: "objeto", label: "Objeto" },
  { value: "tiempo", label: "Tiempo" },
  { value: "memoria", label: "Memoria" },
];

interface ConsignaProgramada {
  id: string;
  texto: string;
  categoria: string;
  fecha: string;
  aprobada: boolean;
  created_at: string;
}

function hoyISO(): string {
  return new Date().toISOString().split("T")[0];
}

function formatFechaLegible(fecha: string): string {
  const [year, month, day] = fecha.split("-");
  return new Date(Number(year), Number(month) - 1, Number(day)).toLocaleDateString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

export default function Admin() {
  const router = useRouter();

  const [verificando, setVerificando] = useState(true);
  const [categoria, setCategoria] = useState("emocion");
  const [contexto, setContexto] = useState("");
  const [generando, setGenerando] = useState(false);
  const [consignasGeneradas, setConsignasGeneradas] = useState<string[]>([]);
  const [seleccionada, setSeleccionada] = useState<number | null>(null);
  const [fecha, setFecha] = useState(hoyISO());
  const [aprobando, setAprobando] = useState(false);
  const [aprobadoMsg, setAprobadoMsg] = useState("");
  const [programadas, setProgramadas] = useState<ConsignaProgramada[]>([]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user?.email !== ADMIN_EMAIL) {
        router.replace("/home");
      } else {
        setVerificando(false);
        cargarProgramadas();
      }
    });
  }, [router]);

  async function cargarProgramadas() {
    const { data } = await supabase
      .from("consignas")
      .select("*")
      .eq("aprobada", true)
      .gte("fecha", hoyISO())
      .order("fecha", { ascending: true });
    if (data) setProgramadas(data);
  }

  async function handleGenerar() {
    setGenerando(true);
    setConsignasGeneradas([]);
    setSeleccionada(null);
    setAprobadoMsg("");
    try {
      const res = await fetch("/api/generar-consignas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categoria, contexto }),
      });
      const data = await res.json();
      if (data.consignas) setConsignasGeneradas(data.consignas);
    } catch (e) {
      console.error(e);
    } finally {
      setGenerando(false);
    }
  }

  async function handleAprobar() {
    if (seleccionada === null) return;
    setAprobando(true);
    setAprobadoMsg("");
    try {
      const res = await fetch("/api/aprobar-consigna", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          texto: consignasGeneradas[seleccionada],
          categoria,
          fecha,
        }),
      });
      const data = await res.json();
      if (data.consigna) {
        setAprobadoMsg(`Consigna programada para el ${formatFechaLegible(fecha)}.`);
        setSeleccionada(null);
        setConsignasGeneradas([]);
        setContexto("");
        await cargarProgramadas();
      } else {
        setAprobadoMsg("Ocurrió un error al guardar. Revisá Supabase.");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setAprobando(false);
    }
  }

  if (verificando) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-papel">
        <span className="text-sm text-tinta-suave">Verificando acceso…</span>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-papel">
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
      <nav className="w-full border-b border-borde px-6 py-5">
        <div className="mx-auto flex max-w-[720px] items-center justify-between">
          <span className="font-display text-xl italic text-tinta">renglón</span>
          <span className="text-[11px] uppercase tracking-widest text-tinta-suave">
            admin
          </span>
        </div>
      </nav>

      <main className="mx-auto max-w-[720px] px-6 pb-24 pt-10">
        <h1 className="font-display text-[26px] italic text-tinta" style={{ lineHeight: "1.3" }}>
          Panel de administración
        </h1>
        <p className="mt-2 text-sm text-tinta-suave">
          Generá y programá consignas de escritura para los usuarios.
        </p>

        <hr className="my-8 border-borde" />

        {/* Formulario */}
        <section className="mb-10">
          <h2 className="mb-6 text-[11px] uppercase tracking-widest text-tinta-suave">
            Nueva consigna
          </h2>

          <div className="mb-6">
            <label className="mb-2 block text-[11px] uppercase tracking-widest text-tinta-suave">
              Categoría
            </label>
            <select
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              className="w-full border-b-[1.5px] border-borde bg-blanco-roto py-2.5 text-sm text-tinta outline-none focus:border-borravino"
            >
              {CATEGORIAS.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-8">
            <label className="mb-2 block text-[11px] uppercase tracking-widest text-tinta-suave">
              Contexto
            </label>
            <textarea
              value={contexto}
              onChange={(e) => setContexto(e.target.value)}
              placeholder="Contame el contexto o temática que querés explorar"
              rows={3}
              className="w-full resize-none border-b-[1.5px] border-borde bg-blanco-roto py-2.5 text-sm text-tinta outline-none placeholder:text-tinta-suave/60 focus:border-borravino"
            />
          </div>

          <button
            onClick={handleGenerar}
            disabled={generando}
            className="rounded-[6px] bg-borravino px-7 py-2.5 text-sm font-medium text-blanco-roto transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {generando ? "Generando…" : "Generar consignas"}
          </button>
        </section>

        {/* Consignas generadas */}
        {consignasGeneradas.length > 0 && (
          <section className="mb-10">
            <h2 className="mb-4 text-[11px] uppercase tracking-widest text-tinta-suave">
              Seleccioná una consigna
            </h2>

            <div className="flex flex-col gap-3">
              {consignasGeneradas.map((c, i) => (
                <button
                  key={i}
                  onClick={() => setSeleccionada(i === seleccionada ? null : i)}
                  className={`rounded-[8px] border px-5 py-4 text-left transition-all ${
                    seleccionada === i
                      ? "border-borravino bg-papel-oscuro"
                      : "border-borde bg-papel-oscuro hover:border-borravino/40"
                  }`}
                >
                  <span
                    className="font-display italic text-tinta"
                    style={{ fontSize: "17px", lineHeight: "1.5" }}
                  >
                    {c}
                  </span>
                </button>
              ))}
            </div>

            {/* Selector de fecha y botón aprobar */}
            {seleccionada !== null && (
              <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-end">
                <div className="flex-1">
                  <label className="mb-2 block text-[11px] uppercase tracking-widest text-tinta-suave">
                    Fecha
                  </label>
                  <input
                    type="date"
                    value={fecha}
                    min={hoyISO()}
                    onChange={(e) => setFecha(e.target.value)}
                    className="w-full border-b-[1.5px] border-borde bg-blanco-roto py-2.5 text-sm text-tinta outline-none focus:border-borravino"
                  />
                </div>
                <button
                  onClick={handleAprobar}
                  disabled={aprobando}
                  className="rounded-[6px] bg-borravino px-7 py-2.5 text-sm font-medium text-blanco-roto transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                  {aprobando ? "Guardando…" : "Aprobar y programar"}
                </button>
              </div>
            )}
          </section>
        )}

        {/* Confirmación */}
        {aprobadoMsg && (
          <div className="mb-10 rounded-[8px] border border-borde bg-papel-oscuro px-5 py-4">
            <p className="text-sm text-tinta">{aprobadoMsg}</p>
          </div>
        )}

        <hr className="my-8 border-borde" />

        {/* Consignas programadas */}
        <section>
          <h2 className="mb-5 text-[11px] uppercase tracking-widest text-tinta-suave">
            Próximas consignas programadas
          </h2>

          {programadas.length === 0 ? (
            <p className="text-sm text-tinta-suave">No hay consignas programadas.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {programadas.map((c) => (
                <div
                  key={c.id}
                  className="rounded-[8px] border border-borde bg-papel-oscuro px-5 py-4"
                >
                  <div className="flex items-start justify-between gap-6">
                    <span
                      className="font-display italic text-tinta"
                      style={{ fontSize: "16px", lineHeight: "1.5" }}
                    >
                      {c.texto}
                    </span>
                    <div className="flex shrink-0 flex-col items-end gap-1.5">
                      <span className="text-xs text-tinta-suave">
                        {formatFechaLegible(c.fecha)}
                      </span>
                      <span className="rounded-[4px] bg-cielo px-2 py-0.5 text-[11px] text-borravino">
                        {CATEGORIAS.find((cat) => cat.value === c.categoria)?.label ?? c.categoria}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
