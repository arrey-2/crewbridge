import Link from 'next/link';

export function EmptyState({ message, ctaHref, ctaLabel }: { message: string; ctaHref: string; ctaLabel: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-8 text-center">
      <p className="mb-4 text-slate-300">{message}</p>
      <Link className="rounded-xl bg-gradient-to-r from-violet-500 to-blue-500 px-4 py-2 font-semibold" href={ctaHref}>
        {ctaLabel}
      </Link>
    </div>
  );
}
