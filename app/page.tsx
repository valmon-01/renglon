import Link from "next/link";
import { Pencil } from "lucide-react";

export default function Home() {
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
      <nav className="w-full px-6 py-5">
        <div className="mx-auto flex max-w-[720px] items-center justify-between">
          <span className="font-display text-xl italic text-tinta">renglón</span>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-[6px] border border-borravino px-4 py-2 text-sm text-borravino transition-colors hover:bg-borravino hover:text-blanco-roto"
              style={{ borderWidth: "1.5px" }}
            >
              Entrar
            </Link>
            <Link
              href="/registro"
              className="rounded-[6px] bg-borravino px-4 py-2 text-sm text-blanco-roto transition-colors hover:opacity-90"
            >
              Empezar
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <main className="relative mx-auto max-w-[720px] overflow-hidden px-6 pb-24 pt-16">

        {/* Marca de agua */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 flex select-none items-center justify-center font-display italic leading-none"
          style={{ fontSize: "clamp(100px, 22vw, 200px)", color: "rgba(100, 49, 62, 0.06)" }}
        >
          renglón
        </span>

        <div className="relative z-10 flex flex-col items-center gap-8 text-center">

          {/* Tag pill */}
          <div className="flex items-center gap-2 rounded-full border border-borde bg-papel-oscuro px-4 py-2 text-sm text-tinta-suave">
            <Pencil size={14} strokeWidth={1.5} />
            <span>Una consigna nueva cada día</span>
          </div>

          {/* Título */}
          <h1 className="font-display text-5xl leading-tight text-tinta sm:text-6xl">
            Un espacio para escribir
            <br />
            <em className="italic text-borravino">sin excusas</em>
          </h1>

          {/* Subtítulo */}
          <p className="max-w-md text-base leading-relaxed text-tinta-suave">
            Escribís primero. Después leés lo de los demás.
          </p>

          {/* Botones */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/registro"
              className="rounded-[6px] border border-transparent bg-borravino px-6 py-3 text-sm font-medium text-blanco-roto transition-colors hover:opacity-90"
            >
              Crear mi cuenta
            </Link>
            <Link
              href="/feed"
              className="rounded-[6px] border border-borravino px-6 py-3 text-sm font-medium text-borravino transition-colors hover:bg-borravino hover:text-blanco-roto"
              style={{ borderWidth: "1.5px" }}
            >
              Ver el feed de hoy
            </Link>
          </div>

        </div>
      </main>

      {/* ¿Cómo funciona? */}
      <section className="mx-auto max-w-[720px] px-6 pb-24">
        <h2 className="mb-12 text-center font-display text-2xl text-tinta">
          ¿Cómo funciona?
        </h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {[
            {
              num: "01",
              title: "Recibís la consigna",
              desc: "Cada día al abrir la app encontrás una nueva consigna para escribir.",
            },
            {
              num: "02",
              title: "Escribís lo tuyo",
              desc: "Tenés el espacio para escribir tu texto sin distracciones.",
            },
            {
              num: "03",
              title: "Lo compartís",
              desc: "Tu texto aparece en el feed. Leés, descubrís, conectás.",
            },
          ].map(({ num, title, desc }) => (
            <div
              key={num}
              className="rounded-[8px] border border-borde bg-papel-oscuro p-6"
            >
              <span className="font-display text-3xl italic text-borravino">
                {num}
              </span>
              <h3 className="mt-3 text-sm font-semibold text-tinta">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-tinta-suave">
                {desc}
              </p>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
