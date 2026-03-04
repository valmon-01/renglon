import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

const FALLBACK = "Escribí sobre un objeto que alguien te dejó y que no pediste.";

async function getConsignaHoy(): Promise<string> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const hoy = new Date().toISOString().slice(0, 10);
  const { data } = await supabase
    .from("consignas")
    .select("texto")
    .eq("fecha", hoy)
    .eq("aprobada", true)
    .single();
  return data?.texto ?? FALLBACK;
}

export default async function Landing() {
  const consigna = await getConsignaHoy();

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

        {/* Título principal */}
        <h1
          className="mb-6 text-center font-display italic leading-tight text-tinta"
          style={{ fontSize: "clamp(36px, 6vw, 56px)" }}
        >
          El hábito de escribir,
          <br />
          <span style={{ color: "#64313E" }}>un renglón a la vez.</span>
        </h1>

        {/* 3. Subtítulo */}
        <p
          className="mx-auto mb-12 text-center font-display italic"
          style={{
            fontSize: "17px",
            lineHeight: "1.7",
            maxWidth: "520px",
            color: "#5C5147",
          }}
        >
          Cada día una consigna nueva te invita a recordar, imaginar o crear. Escribís lo tuyo, lo compartís si querés, y después leés lo que crearon los demás.
        </p>

        {/* 4. Preview de consigna — cuaderno */}
        <div
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
            {/* Label ocupa exactamente un renglón */}
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
            {/* Consigna alineada a los renglones */}
            <p
              className="text-center font-display italic text-tinta"
              style={{ fontSize: "20px", lineHeight: "40px" }}
            >
              {consigna}
            </p>
          </div>
        </div>

        {/* 5. CTA único */}
        <div className="flex justify-center">
          <Link
            href="/registro"
            className="rounded-[6px] bg-borravino text-sm font-medium text-blanco-roto transition-opacity hover:opacity-90"
            style={{ padding: "14px 40px" }}
          >
            Empezar a escribir
          </Link>
        </div>

      </main>

      {/* ¿Cómo funciona? */}
      <section className="mx-auto max-w-[680px] px-6 pb-24">

        {/* Título de sección */}
        <div className="mb-12 flex flex-col items-center gap-4">
          <h2
            className="text-center font-display text-tinta"
            style={{ fontSize: "28px" }}
          >
            ¿Cómo funciona?
          </h2>
          <div style={{ width: "60px", height: "1px", backgroundColor: "#C1DBE8" }} />
        </div>

        {/* Pasos */}
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
          ].map(({ num, title, desc }, i, arr) => (
            <div key={num} className="flex gap-6">
              {/* Línea conectora + número */}
              <div className="flex flex-col items-center">
                <p
                  className="font-display italic"
                  style={{ fontSize: "14px", lineHeight: "1", color: "#64313E" }}
                >
                  {num}
                </p>
                {i < arr.length - 1 && (
                  <div
                    className="mt-3 flex-1"
                    style={{ width: "1px", backgroundColor: "#D6CFBF", minHeight: "40px" }}
                  />
                )}
              </div>

              {/* Contenido */}
              <div className={i < arr.length - 1 ? "pb-10" : ""}>
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
            </div>
          ))}
        </div>
      </section>

      {/* Cierre */}
      <section className="mx-auto max-w-[680px] px-6 pb-24">
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
          <p
            className="text-tinta-suave"
            style={{ fontSize: "13px", fontFamily: "Inter, sans-serif" }}
          >
            Es gratis. No hace falta experiencia previa.
          </p>
        </div>
      </section>

    </div>
  );
}
