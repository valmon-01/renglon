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
  estado: string;
  created_at: string;
  texto_motivacional?: string | null;
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

  const [programandoBancoId, setProgramandoBancoId] = useState<string | null>(null);
  const [fechaBancoSeleccionada, setFechaBancoSeleccionada] = useState(hoyISO());
  const [guardandoBancoId, setGuardandoBancoId] = useState<string | null>(null);
  const [errorBanco, setErrorBanco] = useState("");

  const [textoPropio, setTextoPropio] = useState("");
  const [categoriaPropia, setCategoriaPropia] = useState("memoria");
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
      .eq("estado", "programada")
      .gte("fecha", hoy)
      .order("fecha", { ascending: true });

    const { data: dataBanco } = await supabase
      .from("consignas")
      .select("*")
      .eq("estado", "banco")
      .order("created_at", { ascending: true });

    const { data: dataBorradores } = await supabase
      .from("consignas")
      .select("*")
      .eq("estado", "borrador")
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
      const estadoEnviar = programarFecha ? "programada" : agregarAlBancoIA ? "banco" : "borrador";
      const res = await fetch("/api/aprobar-consigna", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          texto: consignasGeneradas[seleccionada],
          categoria,
          fecha: fechaEnviar,
          estado: estadoEnviar,
        }),
      });
      const data = await res.json();
      if (data.consigna) {
        setAprobadoMsg(
          programarFecha
            ? `Programada para el ${formatFechaLegible(fecha)}.`
            : agregarAlBancoIA
            ? "Agregada al banco."
            : "Guardada como borrador."
        );
        setSeleccionada(null);
        setConsignasGeneradas([]);
        setContexto("");
        setProgramarFecha(false);
        setAgregarAlBancoIA(false);
        await cargarConsignas();
      } else {
        setAprobadoMsg("Error al guardar.");
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
      const estadoEnviar = programarFechaPropia ? "programada" : agregarAlBancoPropias ? "banco" : "borrador";
      const res = await fetch("/api/aprobar-consigna", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          texto: textoPropio.trim(),
          categoria: categoriaPropia,
          fecha: fechaEnviar,
          estado: estadoEnviar,
        }),
      });
      const data = await res.json();
      if (data.consigna) {
        setGuardadoMsgPropio(
          programarFechaPropia
            ? `Programada para el ${formatFechaLegible(fechaPropia)}.`
            : agregarAlBancoPropias
            ? "Agregada al banco."
            : "Guardada como borrador."
        );
        setTextoPropio("");
        setProgramarFechaPropia(false);
        setAgregarAlBancoPropias(false);
        await cargarConsignas();
      } else {
        setGuardadoMsgPropio("Error al guardar.");
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
        body: JSON.stringify({ id: consigna.id, estado: "banco" }),
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

  async function handlePublicarHoy(id: string) {
    try {
      const res = await fetch("/api/aprobar-consigna", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, fecha: hoyISO() }),
      });
      const data = await res.json();
      if (data.consigna) await cargarConsignas();
    } catch (e) {
      console.error(e);
    }
  }

  async function handleEliminar(id: string) {
    await supabase.from("consignas").delete().eq("id", id);
    await cargarConsignas();
  }

  function handleProgramar(id: string) {
    setProgramandoBancoId((prev) => (prev === id ? null : id));
    setFechaBancoSeleccionada(hoyISO());
    setErrorBanco("");
  }

  if (verificando) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-papel">
        <span className="text-sm text-tinta-suave">Verificando acceso…</span>
      </div>
    );
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px 14px",
    border: "1px solid rgba(61,53,48,0.15)",
    borderRadius: 8,
    fontSize: 14,
    color: "#3D3530",
    backgroundColor: "white",
    outline: "none",
    boxSizing: "border-box",
  };

  function SectionHeader({ label, count }: { label: string; count: number }) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, marginTop: 32 }}>
        <span style={{ fontSize: 11, letterSpacing: "0.12em", color: "#9C8B7E" }}>{label}</span>
        <span style={{ fontSize: 11, color: "#64313E", backgroundColor: "rgba(100,49,62,0.08)", borderRadius: 12, padding: "2px 8px" }}>
          {count}
        </span>
      </div>
    );
  }

  function ConsignaCard({ consigna, showMoverAlBanco }: { consigna: Consigna; showMoverAlBanco?: boolean }) {
    return (
      <div style={{
        backgroundColor: "#FFFFFF",
        borderRadius: 10,
        borderLeft: "3px solid #64313E",
        boxShadow: "0 1px 8px rgba(0,0,0,0.05)",
        padding: "16px 20px",
        marginBottom: 12,
      }}>
        {/* Fila top: pill categoría + ⋯ */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 11, color: "#64313E", backgroundColor: "rgba(100,49,62,0.08)", borderRadius: 12, padding: "2px 10px" }}>
            {CATEGORIAS.find((c) => c.value === consigna.categoria)?.label ?? consigna.categoria}
          </span>
          <span style={{ color: "#9C8B7E", fontSize: 18, cursor: "pointer" }}>⋯</span>
        </div>

        {/* Texto consigna */}
        <p style={{
          fontFamily: "'Playfair Display', serif",
          fontStyle: "italic",
          fontSize: 15,
          color: "#3D3530",
          lineHeight: 1.5,
          margin: "10px 0 0",
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        } as React.CSSProperties}>{consigna.texto}</p>

        {/* Fecha si está programada */}
        {consigna.fecha && (
          <p style={{ fontSize: 12, color: "#9C8B7E", margin: "8px 0 0" }}>
            📅 {new Date(consigna.fecha + "T12:00:00").toLocaleDateString("es-AR", { day: "numeric", month: "short", year: "numeric" })}
          </p>
        )}

        {/* Acciones */}
        <div style={{ display: "flex", gap: 8, marginTop: 14, alignItems: "center" }}>
          {showMoverAlBanco ? (
            <button
              type="button"
              onClick={() => handleMoverAlBanco(consigna)}
              disabled={moviendoBorradorId === consigna.id}
              style={{ fontSize: 12, color: "#3D3530", backgroundColor: "white", border: "1px solid rgba(61,53,48,0.2)", borderRadius: 6, padding: "5px 12px", cursor: "pointer", opacity: moviendoBorradorId === consigna.id ? 0.5 : 1 }}
            >
              {moviendoBorradorId === consigna.id ? "Moviendo…" : "Al banco"}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => handleProgramar(consigna.id)}
              style={{ fontSize: 12, color: "#3D3530", backgroundColor: "white", border: "1px solid rgba(61,53,48,0.2)", borderRadius: 6, padding: "5px 12px", cursor: "pointer" }}
            >
              {programandoBancoId === consigna.id ? "Cancelar" : "Programar"}
            </button>
          )}

          <button
            type="button"
            onClick={() => handlePublicarHoy(consigna.id)}
            style={{ fontSize: 12, color: "white", backgroundColor: "#64313E", border: "none", borderRadius: 6, padding: "5px 12px", cursor: "pointer" }}
          >
            Publicar hoy
          </button>

          <button
            type="button"
            onClick={() => handleEliminar(consigna.id)}
            style={{ fontSize: 12, color: "#9C8B7E", background: "none", border: "none", marginLeft: "auto", cursor: "pointer" }}
          >
            Eliminar
          </button>
        </div>

        {/* Inline date picker para programar */}
        {programandoBancoId === consigna.id && (
          <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid rgba(61,53,48,0.1)", display: "flex", gap: 8, alignItems: "flex-end" }}>
            <input
              type="date"
              value={fechaBancoSeleccionada}
              min={hoyISO()}
              onChange={(e) => { setFechaBancoSeleccionada(e.target.value); setErrorBanco(""); }}
              style={{ ...inputStyle, flex: 1, padding: "8px 12px" }}
            />
            <button
              type="button"
              onClick={() => handleProgramarDesdeBanco(consigna)}
              disabled={guardandoBancoId === consigna.id}
              style={{ fontSize: 12, color: "white", backgroundColor: "#64313E", border: "none", borderRadius: 6, padding: "8px 14px", cursor: "pointer", opacity: guardandoBancoId === consigna.id ? 0.5 : 1, whiteSpace: "nowrap" }}
            >
              {guardandoBancoId === consigna.id ? "Guardando…" : "Confirmar"}
            </button>
          </div>
        )}
        {programandoBancoId === consigna.id && errorBanco && (
          <p style={{ fontSize: 12, color: "#64313E", marginTop: 6 }}>{errorBanco}</p>
        )}
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#F5F0E8" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px 48px" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", borderBottom: "1px solid rgba(61,53,48,0.1)", paddingBottom: 16, marginBottom: 32 }}>
          <span style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: 24, color: "#64313E" }}>renglón</span>
          <span style={{ fontSize: 13, color: "#9C8B7E" }}>Panel de administración</span>
        </div>

        {/* Grid dos columnas */}
        <div style={{ display: "grid", gridTemplateColumns: "380px 1fr", gap: 32, alignItems: "flex-start" }}>

          {/* COLUMNA IZQUIERDA */}
          <div style={{ position: "sticky", top: 24 }}>
            <div style={{ backgroundColor: "#FFFFFF", borderRadius: 12, padding: 24, boxShadow: "0 1px 8px rgba(0,0,0,0.05)" }}>
              <p style={{ fontSize: 11, letterSpacing: "0.12em", color: "#9C8B7E", marginBottom: 20, margin: "0 0 20px" }}>NUEVA CONSIGNA</p>

              {/* Select categoría IA */}
              <select
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                style={{ ...inputStyle, marginBottom: 12 }}
              >
                {CATEGORIAS.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>

              {/* Textarea contexto */}
              <textarea
                value={contexto}
                onChange={(e) => setContexto(e.target.value)}
                placeholder="Contexto o temática a explorar…"
                rows={4}
                style={{ ...inputStyle, resize: "none", marginBottom: 16 }}
              />

              {/* Botón generar */}
              <button
                type="button"
                onClick={handleGenerar}
                disabled={generando}
                style={{ width: "100%", backgroundColor: "#64313E", color: "white", borderRadius: 8, padding: "12px", fontSize: 14, border: "none", cursor: "pointer", opacity: generando ? 0.7 : 1 }}
              >
                {generando ? "Generando…" : "✨ Generar con IA"}
              </button>

              {/* Consignas generadas */}
              {consignasGeneradas.length > 0 && (
                <div style={{ marginTop: 16 }}>
                  {consignasGeneradas.map((c, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setSeleccionada(i === seleccionada ? null : i)}
                      style={{
                        width: "100%",
                        textAlign: "left",
                        padding: "10px 14px",
                        marginBottom: 8,
                        borderRadius: 8,
                        border: seleccionada === i ? "1.5px solid #64313E" : "1px solid rgba(61,53,48,0.15)",
                        backgroundColor: seleccionada === i ? "rgba(100,49,62,0.04)" : "white",
                        fontSize: 14,
                        color: "#3D3530",
                        fontFamily: "'Playfair Display', serif",
                        fontStyle: "italic",
                        lineHeight: 1.5,
                        cursor: "pointer",
                      }}
                    >
                      {c}
                    </button>
                  ))}

                  {seleccionada !== null && (
                    <div style={{ marginTop: 8 }}>
                      <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#3D3530", marginBottom: 8, cursor: "pointer" }}>
                        <input type="checkbox" checked={programarFecha} onChange={(e) => { setProgramarFecha(e.target.checked); if (e.target.checked) setAgregarAlBancoIA(false); }} style={{ accentColor: "#64313E" }} />
                        Programar para fecha
                      </label>
                      {!programarFecha && (
                        <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#3D3530", marginBottom: 8, cursor: "pointer" }}>
                          <input type="checkbox" checked={agregarAlBancoIA} onChange={(e) => setAgregarAlBancoIA(e.target.checked)} style={{ accentColor: "#64313E" }} />
                          Agregar al banco
                        </label>
                      )}
                      {programarFecha && (
                        <input
                          type="date"
                          value={fecha}
                          min={hoyISO()}
                          onChange={(e) => setFecha(e.target.value)}
                          style={{ ...inputStyle, marginBottom: 8 }}
                        />
                      )}
                      <button
                        type="button"
                        onClick={handleAprobar}
                        disabled={aprobando}
                        style={{ width: "100%", backgroundColor: "#64313E", color: "white", borderRadius: 8, padding: "10px", fontSize: 13, border: "none", cursor: "pointer", opacity: aprobando ? 0.7 : 1 }}
                      >
                        {aprobando ? "Guardando…" : programarFecha ? "Programar" : agregarAlBancoIA ? "Agregar al banco" : "Guardar como borrador"}
                      </button>
                      {aprobadoMsg && (
                        <p style={{ fontSize: 12, color: "#64313E", marginTop: 8, textAlign: "center" }}>{aprobadoMsg}</p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Divider */}
              <p style={{ textAlign: "center", fontSize: 12, color: "#9C8B7E", margin: "20px 0" }}>— o escribí la tuya —</p>

              {/* Input consigna propia */}
              <input
                type="text"
                value={textoPropio}
                onChange={(e) => { setTextoPropio(e.target.value); setErrorPropio(""); }}
                placeholder="Escribí tu consigna…"
                style={{ ...inputStyle, marginBottom: 12 }}
              />
              {errorPropio && <p style={{ fontSize: 12, color: "#64313E", marginBottom: 8 }}>{errorPropio}</p>}

              {/* Select categoría manual */}
              <select
                value={categoriaPropia}
                onChange={(e) => setCategoriaPropia(e.target.value)}
                style={{ ...inputStyle, marginBottom: 8 }}
              >
                {CATEGORIAS.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>

              <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#3D3530", marginBottom: 8, cursor: "pointer" }}>
                <input type="checkbox" checked={programarFechaPropia} onChange={(e) => { setProgramarFechaPropia(e.target.checked); if (e.target.checked) setAgregarAlBancoPropias(false); }} style={{ accentColor: "#64313E" }} />
                Programar para fecha
              </label>
              {!programarFechaPropia && (
                <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#3D3530", marginBottom: 8, cursor: "pointer" }}>
                  <input type="checkbox" checked={agregarAlBancoPropias} onChange={(e) => setAgregarAlBancoPropias(e.target.checked)} style={{ accentColor: "#64313E" }} />
                  Agregar al banco
                </label>
              )}
              {programarFechaPropia && (
                <input
                  type="date"
                  value={fechaPropia}
                  min={hoyISO()}
                  onChange={(e) => setFechaPropia(e.target.value)}
                  style={{ ...inputStyle, marginBottom: 8 }}
                />
              )}

              {/* Botón agregar al banco */}
              <button
                type="button"
                onClick={handleGuardarPropia}
                disabled={guardandoPropio}
                style={{ width: "100%", backgroundColor: "transparent", color: "#64313E", border: "1px solid #64313E", borderRadius: 8, padding: "12px", fontSize: 14, cursor: "pointer", marginTop: 8, opacity: guardandoPropio ? 0.7 : 1 }}
              >
                {guardandoPropio ? "Guardando…" : programarFechaPropia ? "Programar" : agregarAlBancoPropias ? "Agregar al banco" : "Guardar como borrador"}
              </button>

              {guardadoMsgPropio && (
                <p style={{ fontSize: 12, color: "#64313E", marginTop: 10, textAlign: "center" }}>{guardadoMsgPropio}</p>
              )}
            </div>
          </div>

          {/* COLUMNA DERECHA */}
          <div>

            {/* PROGRAMADAS */}
            <SectionHeader label="PROGRAMADAS" count={programadas.length} />
            {programadas.length === 0 ? (
              <p style={{ fontSize: 13, color: "#9C8B7E", fontStyle: "italic", padding: "12px 0" }}>No hay consignas aquí.</p>
            ) : (
              programadas.map((c) => <ConsignaCard key={c.id} consigna={c} />)
            )}

            {/* BANCO */}
            <SectionHeader label="BANCO" count={banco.length} />
            {banco.length === 0 ? (
              <p style={{ fontSize: 13, color: "#9C8B7E", fontStyle: "italic", padding: "12px 0" }}>No hay consignas aquí.</p>
            ) : (
              banco.map((c) => <ConsignaCard key={c.id} consigna={c} />)
            )}

            {/* BORRADORES */}
            <SectionHeader label="BORRADORES" count={borradores.length} />
            {borradores.length === 0 ? (
              <p style={{ fontSize: 13, color: "#9C8B7E", fontStyle: "italic", padding: "12px 0" }}>No hay consignas aquí.</p>
            ) : (
              borradores.map((c) => <ConsignaCard key={c.id} consigna={c} showMoverAlBanco />)
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
