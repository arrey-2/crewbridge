import Link from 'next/link';

const featureCards = [
  {
    title: 'Traducción de obra en tiempo real',
    body: 'Mensajes claros entre contratistas y cuadrillas con español natural para campo, no traducciones raras o demasiado formales.'
  },
  {
    title: 'Alertas de seguridad visibles',
    body: 'Detecta instrucciones con riesgo potencial para que el equipo confirme antes de seguir en la obra.'
  },
  {
    title: 'Bitácora y PDF listos',
    body: 'Guarda conversaciones por proyecto y exporta resúmenes rápidos para seguimiento, evidencia y coordinación.'
  }
];

export default function Home() {
  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(168,85,247,0.22),transparent_28%),radial-gradient(circle_at_top_right,rgba(249,115,22,0.18),transparent_24%),linear-gradient(180deg,#020617_0%,#020617_42%,#050816_100%)]" />
      <div className="absolute left-[-8rem] top-24 -z-10 h-72 w-72 rounded-full bg-fuchsia-500/20 blur-3xl" />
      <div className="absolute right-[-5rem] top-10 -z-10 h-64 w-64 rounded-full bg-violet-500/20 blur-3xl" />
      <div className="absolute bottom-10 right-1/4 -z-10 h-56 w-56 rounded-full bg-amber-500/10 blur-3xl" />

      <section className="grid items-center gap-12 px-2 py-10 lg:grid-cols-[1.05fr_0.95fr] lg:py-20">
        <div className="max-w-2xl space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium uppercase tracking-[0.24em] text-violet-200/90 backdrop-blur">
            CrewBridge · Comunicación de obra
          </div>
          <div className="space-y-5">
            <h1 className="max-w-3xl text-5xl font-semibold tracking-tight text-white sm:text-6xl lg:text-7xl">
              Menos confusión.<br />
              Más claridad.<br />
              <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-amber-300 bg-clip-text text-transparent">
                Mejor trabajo en campo.
              </span>
            </h1>
            <p className="max-w-xl text-lg leading-8 text-slate-300 sm:text-xl">
              CrewBridge ayuda a contratistas y cuadrillas hispanohablantes a entenderse mejor con traducción enfocada en construcción,
              alertas de seguridad, bitácoras por proyecto y exportación en PDF.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/signup"
              className="rounded-2xl bg-gradient-to-r from-violet-500 via-fuchsia-500 to-orange-400 px-6 py-3 text-base font-semibold text-white shadow-[0_0_40px_rgba(168,85,247,0.25)] transition hover:scale-[1.02]"
            >
              Crear cuenta
            </Link>
            <Link
              href="/login"
              className="rounded-2xl border border-white/10 bg-white/5 px-6 py-3 text-base font-semibold text-white backdrop-blur transition hover:border-white/20 hover:bg-white/10"
            >
              Iniciar sesión
            </Link>
            <Link
              href="/login?message=Try+Demo+Mode"
              className="rounded-2xl border border-violet-400/20 px-6 py-3 text-base font-semibold text-violet-200 transition hover:border-violet-300/40 hover:bg-violet-400/10"
            >
              Ver demo
            </Link>
          </div>

          <div className="grid gap-3 pt-2 text-sm text-slate-300 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur">Español más natural para cuadrillas mexicanas</div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur">Mensajes rápidos con enfoque de seguridad</div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur">Bitácoras por proyecto y exportación PDF</div>
          </div>
        </div>

        <div className="relative">
          <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-violet-500/20 via-transparent to-amber-400/20 blur-2xl" />
          <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/80 p-4 shadow-2xl backdrop-blur-xl">
            <div className="grid gap-4 lg:grid-cols-[220px_1fr]">
              <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
                <div className="mb-5 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-violet-500 to-orange-400" />
                  <div>
                    <div className="font-semibold">CrewBridge</div>
                    <div className="text-xs text-slate-400">Obra y coordinación</div>
                  </div>
                </div>
                <div className="space-y-2 text-sm text-slate-300">
                  <div className="rounded-xl bg-white/5 px-3 py-2">Resumen</div>
                  <div className="rounded-xl px-3 py-2 text-slate-400">Traducciones</div>
                  <div className="rounded-xl px-3 py-2 text-slate-400">Bitácoras</div>
                  <div className="rounded-xl px-3 py-2 text-slate-400">Alertas</div>
                </div>
              </div>

              <div className="space-y-4 rounded-[1.5rem] border border-white/10 bg-[#050816] p-4">
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Mensajes</div>
                    <div className="mt-3 text-3xl font-semibold">2 vías</div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Seguridad</div>
                    <div className="mt-3 text-3xl font-semibold">Flags</div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Exportación</div>
                    <div className="mt-3 text-3xl font-semibold">PDF</div>
                  </div>
                </div>

                <div className="grid gap-3 xl:grid-cols-[1.2fr_0.8fr]">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="mb-3 text-sm font-medium text-slate-300">Ejemplo de traducción</div>
                    <div className="space-y-3 text-sm leading-6 text-slate-300">
                      <div className="rounded-xl border border-white/10 bg-slate-950/80 p-3">
                        <div className="mb-1 text-xs uppercase tracking-[0.2em] text-slate-500">English</div>
                        Check the trench depth before laying pipe and call me if the line is off.
                      </div>
                      <div className="rounded-xl border border-violet-400/20 bg-violet-500/10 p-3 text-violet-100">
                        <div className="mb-1 text-xs uppercase tracking-[0.2em] text-violet-200/70">Español</div>
                        Revisen la profundidad de la zanja antes de meter la tubería y avísenme si la línea quedó chueca.
                      </div>
                    </div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="mb-3 text-sm font-medium text-slate-300">Qué resuelve</div>
                    <ul className="space-y-3 text-sm text-slate-300">
                      <li>Menos errores por traducción literal</li>
                      <li>Mensajes entendibles para campo</li>
                      <li>Seguimiento por proyecto sin complicarse</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 border-t border-white/10 py-10 md:grid-cols-3">
        {featureCards.map((card) => (
          <div key={card.title} className="rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-6 backdrop-blur-sm transition hover:border-white/20 hover:bg-white/[0.05]">
            <div className="mb-4 h-11 w-11 rounded-2xl bg-gradient-to-br from-violet-500/30 to-orange-400/20" />
            <h2 className="text-xl font-semibold text-white">{card.title}</h2>
            <p className="mt-3 text-sm leading-7 text-slate-300">{card.body}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
