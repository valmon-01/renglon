"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const ADMIN_EMAIL = "valenmonti01@gmail.com";

const CATEGORIAS = [
  { value: "memoria", label: "Memoria" },
  { value: "objeto cotidiano", label: "Objeto cotidiano" },
  { value: "lugar", label: "Lugar" },
  { value: "cuerpo", label: "Cuerpo" },
  { value: "tiempo", label: "Tiempo" },
  { value: "vínculo", label: "Vínculo" },
  { value: "primera vez", label: "Primera vez" },
  { value: "ausencia", label: "Ausencia" },
  { value: "trabajo y rutina", label: "Trabajo y rutina" },
  { value: "infancia", label: "Infancia" },
  { value: "decisión", label: "Decisión" },
  { value: "miedo", label: "Miedo" },
];

interface Consigna {
  id: string;
  texto: string;
  categoria: string;
  fecha: string | null;
  aprobada: boolean;
  borrador: boolean;
  asignada_automaticamente: boolean;
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
  const [categoria, setCategoria] = useState("memoria");
  const [contexto, setContexto] = useState("");
  const [generando, setGenerando] = useState(false);
  const [consignasGeneradas, setConsignasGeneradas] = useState<string[]>([]);
  const [seleccionada, setSeleccionada] = useState<number | null>(null);
  const [programarFecha, setProgramarFecha] = useState(false);
  const [fecha, setFecha] = useState(hoyISO());
  const [aprobando, setAprobando] = useState(false);
  const [aprobadoMsg, setAprobadoMsg] = useState("");
  const [programadas, setProgramadas] = useState<Consigna[]>([]);
  const [banco, setBanco] = useState<Consigna[]>([]);
  const [borradores, setBorradores] = useState<Consigna[]>([]);

  const [agregarAlBancoIA, setAgregarAlBancoIA] = useState(false);
  const [agregarAlBancoPropias, setAgregarAlBancoPropias] = useState(false);
  const [moviendoBorradorId, setMoviendoBorradorId] = useState<string | null>(null);
  const [moviendoABorradorId, setMoviendoABorradorId] = useState<string | null>(null);

  const [programandoBancoId, setProgramandoBancoId] = useState<string | null>(null);
  const [fechaBancoSeleccionada, setFechaBancoSeleccionada] = useState(hoyISO());
  const [guardandoBancoId, setGuardandoBancoId] = useState<string | null>(null);
  const [errorBanco, setErrorBanco] = useState("");

  const [textoPropio, setTextoPropio] = useState("");
  const [programarFechaPropia, setProgramarFechaPropia] = useState(false);
  const [fechaPropia, setFechaPropia] = useState(hoyISO());
  const [guardandoPropio, setGuardandoPropio] = useState(false);
  const [guardadoMsgPropio, setGuardadoMsgPropio] = useState("");
  const [errorPropio, setErrorPropio] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user?.email !== ADMIN_EMAIL) {
        router.replace("/home");
      } else {
        setVerificando(false);
        cargarConsignas();
      }
    });
  }, [router]);

  async function cargarConsignas() {
    const hoy = hoyISO();

    const { data: dataProgramadas } = await supabase
      .from("consignas")
      .select("*")
      .eq("aprobada", true)
      .eq("borrador", false)
      .gte("fecha", hoy)
      .order("fecha", { ascending: true });

    const { data: dataBanco } = await supabase
      .from("consignas")
      .select("*")
      .eq("aprobada", true)
      .eq("borrador", false)
      .is("fecha", null)
      .order("created_at", { ascending: true });

    const { data: dataBorradores } = await supabase
      .from("consignas")
      .select("*")
      .eq("borrador", true)
      .order("created_at", { ascending: false });

    if (dataProgramadas) setProgramadas(dataProgramadas);
    if (dataBanco) setBanco(dataBanco);
    if (dataBorradores) setBorradores(dataBorradores);
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
      const fechaEnviar = programarFecha ? fecha : null;
      const borradorEnviar = !programarFecha && !agregarAlBancoIA;
      const res = await fetch("/api/aprobar-consigna", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          texto: consignasGeneradas[seleccionada],
          categoria,
          fecha: fechaEnviar,
          borrador: borradorEnviar,
        }),
      });
      const data = await res.json();
      if (data.consigna) {
        setAprobadoMsg(
          programarFecha
            ? `Consigna programada para el ${formatFechaLegible(fecha)}.`
            : agregarAlBancoIA
            ? "Consigna agregada al banco."
            : "Consigna guardada como borrador."
        );
        setSeleccionada(null);
        setConsignasGeneradas([]);
        setContexto("");
        setProgramarFecha(false);
        setAgregarAlBancoIA(false);
        await cargarConsignas();
      } else {
        setAprobadoMsg("Ocurrió un error al guardar. Revisá Supabase.");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setAprobando(false);
    }
  }

  async function handleProgramarDesdeBanco(consigna: Consigna) {
    setGuardandoBancoId(consigna.id);
    setErrorBanco("");
    try {
      const res = await fetch("/api/aprobar-consigna", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: consigna.id, fecha: fechaBancoSeleccionada }),
      });
      const data = await res.json();
      if (data.error) {
        setErrorBanco(data.error);
      } else if (data.consigna) {
        setBanco((prev) => prev.filter((c) => c.id !== consigna.id));
        setProgramadas((prev) =>
          [...prev, data.consigna].sort((a, b) =>
            (a.fecha ?? "").localeCompare(b.fecha ?? "")
          )
        );
        setProgramandoBancoId(null);
        setFechaBancoSeleccionada(hoyISO());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setGuardandoBancoId(null);
    }
  }

  async function handleGuardarPropia() {
    if (!textoPropio.trim()) {
      setErrorPropio("El texto no puede estar vacío.");
      return;
    }
    setGuardandoPropio(true);
    setGuardadoMsgPropio("");
    setErrorPropio("");
    try {
      const fechaEnviar = programarFechaPropia ? fechaPropia : null;
      const borradorEnviar = !programarFechaPropia && !agregarAlBancoPropias;
      const res = await fetch("/api/aprobar-consigna", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          texto: textoPropio.trim(),
          categoria: "memoria",
          fecha: fechaEnviar,
          borrador: borradorEnviar,
        }),
      });
      const data = await res.json();
      if (data.consigna) {
        setGuardadoMsgPropio(
          programarFechaPropia
            ? `Consigna programada para el ${formatFechaLegible(fechaPropia)}.`
            : agregarAlBancoPropias
            ? "Consigna agregada al banco."
            : "Consigna guardada como borrador."
        );
        setTextoPropio("");
        setProgramarFechaPropia(false);
        setAgregarAlBancoPropias(false);
        await cargarConsignas();
      } else {
        setGuardadoMsgPropio("Ocurrió un error al guardar. Revisá Supabase.");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setGuardandoPropio(false);
    }
  }

  async function handleMoverAlBanco(consigna: Consigna) {
    setMoviendoBorradorId(consigna.id);
    try {
      const res = await fetch("/api/aprobar-consigna", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: consigna.id, borrador: false }),
      });
      const data = await res.json();
      if (data.consigna) {
        setBorradores((prev) => prev.filter((c) => c.id !== consigna.id));
        setBanco((prev) => [data.consigna, ...prev]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setMoviendoBorradorId(null);
    }
  }

  async function handleMoverABorradores(consigna: Consigna) {
    setMoviendoABorradorId(consigna.id);
    try {
      const res = await fetch("/api/aprobar-consigna", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: consigna.id, borrador: true }),
      });
      const data = await res.json();
      if (data.consigna) {
        setBanco((prev) => prev.filter((c) => c.id !== consigna.id));
        setBorradores((prev) => [data.consigna, ...prev]);
        if (programandoBancoId === consigna.id) setProgramandoBancoId(null);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setMoviendoABorradorId(null);
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
          <span className="text-[11px] uppercase tracking-widest text-tinta-suave">admin</span>
        </div>
      </nav>

      <main className="mx-auto max-w-[1100px] px-6 pb-24 pt-10">

        {/* Formularios — ancho reducido */}
        <div className="max-w-[720px]">
          <h1 className="font-display text-[26px] italic text-tinta" style={{ lineHeight: "1.3" }}>
            Panel de administración
          </h1>
          <p className="mt-2 text-sm text-tinta-suave">
            Generá y programá consignas de escritura para los usuarios.
          </p>

          <hr className="my-8 border-borde" />

          {/* Formulario IA */}
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

              {seleccionada !== null && (
                <div className="mt-6 flex flex-col gap-4">
                  <label className="flex cursor-pointer items-center gap-3">
                    <input
                      type="checkbox"
                      checked={programarFecha}
                      onChange={(e) => { setProgramarFecha(e.target.checked); if (e.target.checked) setAgregarAlBancoIA(false); }}
                      className="h-4 w-4 accent-borravino"
                    />
                    <span className="text-sm text-tinta">Programar para fecha específica</span>
                  </label>

                  {!programarFecha && (
                    <label className="flex cursor-pointer items-center gap-3">
                      <input
                        type="checkbox"
                        checked={agregarAlBancoIA}
                        onChange={(e) => setAgregarAlBancoIA(e.target.checked)}
                        className="h-4 w-4 accent-borravino"
                      />
                      <span className="text-sm text-tinta">Agregar directo al banco</span>
                    </label>
                  )}

                  <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                    {programarFecha && (
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
                    )}
                    <button
                      onClick={handleAprobar}
                      disabled={aprobando}
                      className="rounded-[6px] bg-borravino px-7 py-2.5 text-sm font-medium text-blanco-roto transition-opacity hover:opacity-90 disabled:opacity-50"
                    >
                      {aprobando
                        ? "Guardando…"
                        : programarFecha
                        ? "Programar para fecha específica"
                        : agregarAlBancoIA
                        ? "Agregar al banco"
                        : "Guardar como borrador"}
                    </button>
                  </div>
                </div>
              )}
            </section>
          )}

          {/* Confirmación IA */}
          {aprobadoMsg && (
            <div className="mb-10 rounded-[8px] border border-borde bg-papel-oscuro px-5 py-4">
              <p className="text-sm text-tinta">{aprobadoMsg}</p>
            </div>
          )}

          {/* Divider */}
          <div className="my-10 flex items-center gap-4">
            <div className="h-px flex-1 bg-borde" />
            <span className="text-[11px] uppercase tracking-widest text-tinta-suave">
              — o escribí la tuya —
            </span>
            <div className="h-px flex-1 bg-borde" />
          </div>

          {/* Escribir consigna propia */}
          <section className="mb-10">
            <h2 className="mb-6 text-[11px] uppercase tracking-widest text-tinta-suave">
              Escribir consigna propia
            </h2>

            <div className="mb-6">
              <label className="mb-2 block text-[11px] uppercase tracking-widest text-tinta-suave">
                Consigna
              </label>
              <textarea
                value={textoPropio}
                onChange={(e) => { setTextoPropio(e.target.value); setErrorPropio(""); }}
                placeholder="Escribí tu propia consigna..."
                rows={3}
                className="w-full resize-none border-b-[1.5px] border-borde bg-blanco-roto py-2.5 text-sm text-tinta outline-none placeholder:text-tinta-suave/60 focus:border-borravino"
              />
              {errorPropio && (
                <p className="mt-1 text-xs text-borravino">{errorPropio}</p>
              )}
            </div>

            <div className="mb-4">
              <label className="flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  checked={programarFechaPropia}
                  onChange={(e) => { setProgramarFechaPropia(e.target.checked); if (e.target.checked) setAgregarAlBancoPropias(false); }}
                  className="h-4 w-4 accent-borravino"
                />
                <span className="text-sm text-tinta">Programar para fecha específica</span>
              </label>
            </div>

            {!programarFechaPropia && (
              <div className="mb-6">
                <label className="flex cursor-pointer items-center gap-3">
                  <input
                    type="checkbox"
                    checked={agregarAlBancoPropias}
                    onChange={(e) => setAgregarAlBancoPropias(e.target.checked)}
                    className="h-4 w-4 accent-borravino"
                  />
                  <span className="text-sm text-tinta">Agregar directo al banco</span>
                </label>
              </div>
            )}

            <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
              {programarFechaPropia && (
                <div className="flex-1">
                  <label className="mb-2 block text-[11px] uppercase tracking-widest text-tinta-suave">
                    Fecha
                  </label>
                  <input
                    type="date"
                    value={fechaPropia}
                    min={hoyISO()}
                    onChange={(e) => setFechaPropia(e.target.value)}
                    className="w-full border-b-[1.5px] border-borde bg-blanco-roto py-2.5 text-sm text-tinta outline-none focus:border-borravino"
                  />
                </div>
              )}
              <button
                onClick={handleGuardarPropia}
                disabled={guardandoPropio}
                className="rounded-[6px] bg-borravino px-7 py-2.5 text-sm font-medium text-blanco-roto transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {guardandoPropio
                  ? "Guardando…"
                  : programarFechaPropia
                  ? "Programar para fecha específica"
                  : agregarAlBancoPropias
                  ? "Agregar al banco"
                  : "Guardar como borrador"}
              </button>
            </div>

            {guardadoMsgPropio && (
              <div className="mt-6 rounded-[8px] border border-borde bg-papel-oscuro px-5 py-4">
                <p className="text-sm text-tinta">{guardadoMsgPropio}</p>
              </div>
            )}
          </section>

          <hr className="mb-10 border-borde" />
        </div>

        {/* Grid: Borradores | Banco | Programadas */}
        <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-3">

          {/* Borradores */}
          <section>
            <h2 className="mb-5 text-[11px] uppercase tracking-widest text-tinta-suave">
              Borradores ({borradores.length})
            </h2>
            {borradores.length === 0 ? (
              <p className="text-sm text-tinta-suave">No hay borradores guardados.</p>
            ) : (
              <div
                className="flex flex-col gap-3"
                style={{ maxHeight: "600px", overflowY: "auto" }}
              >
                {borradores.map((c) => (
                  <div
                    key={c.id}
                    className="rounded-[8px] border border-borde bg-papel-oscuro px-4 py-4"
                  >
                    <p
                      className="mb-3 font-display italic text-tinta"
                      style={{ fontSize: "15px", lineHeight: "1.5" }}
                    >
                      {c.texto}
                    </p>
                    <div className="flex items-center justify-between gap-2">
                      <span className="rounded-[4px] bg-cielo px-2 py-0.5 text-[11px] text-borravino">
                        {CATEGORIAS.find((cat) => cat.value === c.categoria)?.label ?? c.categoria}
                      </span>
                      <button
                        onClick={() => handleMoverAlBanco(c)}
                        disabled={moviendoBorradorId === c.id}
                        className="text-[11px] text-tinta-suave underline underline-offset-2 transition-colors hover:text-borravino disabled:opacity-50"
                      >
                        {moviendoBorradorId === c.id ? "Moviendo…" : "Mover al banco"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Banco */}
          <section>
            <h2 className="mb-5 text-[11px] uppercase tracking-widest text-tinta-suave">
              Banco ({banco.length})
            </h2>
            {banco.length === 0 ? (
              <p className="text-sm text-tinta-suave">El banco está vacío.</p>
            ) : (
              <div
                className="flex flex-col gap-3"
                style={{ maxHeight: "600px", overflowY: "auto" }}
              >
                {banco.map((c, idx) => (
                  <div
                    key={c.id}
                    className="rounded-[8px] border border-borde bg-papel-oscuro px-4 py-4"
                  >
                    <div className="mb-3 flex items-start gap-2">
                      <span className="mt-0.5 shrink-0 text-[11px] tabular-nums text-tinta-suave/60">
                        {idx + 1}
                      </span>
                      <p
                        className="font-display italic text-tinta"
                        style={{ fontSize: "15px", lineHeight: "1.5" }}
                      >
                        {c.texto}
                      </p>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="rounded-[4px] bg-cielo px-2 py-0.5 text-[11px] text-borravino">
                        {CATEGORIAS.find((cat) => cat.value === c.categoria)?.label ?? c.categoria}
                      </span>
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleMoverABorradores(c)}
                          disabled={moviendoABorradorId === c.id}
                          className="text-[11px] text-tinta-suave underline underline-offset-2 transition-colors hover:text-borravino disabled:opacity-50"
                        >
                          {moviendoABorradorId === c.id ? "Moviendo…" : "Mover a borradores"}
                        </button>
                        <button
                          onClick={() => {
                            if (programandoBancoId === c.id) {
                              setProgramandoBancoId(null);
                              setErrorBanco("");
                            } else {
                              setProgramandoBancoId(c.id);
                              setFechaBancoSeleccionada(hoyISO());
                              setErrorBanco("");
                            }
                          }}
                          className="text-[11px] text-tinta-suave underline underline-offset-2 transition-colors hover:text-borravino"
                        >
                          {programandoBancoId === c.id ? "Cancelar" : "Programar"}
                        </button>
                      </div>
                    </div>

                    {programandoBancoId === c.id && (
                      <div className="mt-4 border-t border-borde pt-4">
                        <div className="flex flex-col gap-3">
                          <div>
                            <label className="mb-2 block text-[11px] uppercase tracking-widest text-tinta-suave">
                              Fecha
                            </label>
                            <input
                              type="date"
                              value={fechaBancoSeleccionada}
                              min={hoyISO()}
                              onChange={(e) => {
                                setFechaBancoSeleccionada(e.target.value);
                                setErrorBanco("");
                              }}
                              className="w-full border-b-[1.5px] border-borde bg-blanco-roto py-2.5 text-sm text-tinta outline-none focus:border-borravino"
                            />
                          </div>
                          <button
                            onClick={() => handleProgramarDesdeBanco(c)}
                            disabled={guardandoBancoId === c.id}
                            className="rounded-[6px] bg-borravino px-5 py-2 text-sm font-medium text-blanco-roto transition-opacity hover:opacity-90 disabled:opacity-50"
                          >
                            {guardandoBancoId === c.id ? "Guardando…" : "Confirmar"}
                          </button>
                        </div>
                        {errorBanco && (
                          <p className="mt-2 text-xs text-borravino">{errorBanco}</p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Programadas */}
          <section>
            <h2 className="mb-5 text-[11px] uppercase tracking-widest text-tinta-suave">
              Programadas ({programadas.length})
            </h2>
            {programadas.length === 0 ? (
              <p className="text-sm text-tinta-suave">No hay consignas programadas.</p>
            ) : (
              <div
                className="flex flex-col gap-3"
                style={{ maxHeight: "600px", overflowY: "auto" }}
              >
                {programadas.map((c) => (
                  <div
                    key={c.id}
                    className="rounded-[8px] border border-borde bg-papel-oscuro px-4 py-4"
                  >
                    <p
                      className="mb-3 font-display italic text-tinta"
                      style={{ fontSize: "15px", lineHeight: "1.5" }}
                    >
                      {c.texto}
                    </p>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs text-tinta-suave">
                        {formatFechaLegible(c.fecha!)}
                      </span>
                      <span className="rounded-[4px] bg-cielo px-2 py-0.5 text-[11px] text-borravino">
                        {CATEGORIAS.find((cat) => cat.value === c.categoria)?.label ?? c.categoria}
                      </span>
                      {c.asignada_automaticamente && (
                        <span className="rounded-[4px] border border-borde px-2 py-0.5 text-[11px] text-tinta-suave">
                          auto
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

        </div>
      </main>
    </div>
  );
}
