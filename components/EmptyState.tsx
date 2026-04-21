import Link from 'next/link';

export function EmptyState({ message, ctaHref, ctaLabel }: { message: string; ctaHref: string; ctaLabel: string }) {
  return (
    <div className="rounded-lg border border-slate-700 bg-panel p-8 text-center">
      <p className="mb-4 text-slate-300">{message}</p>
      <Link className="rounded-md bg-amber-500 px-4 py-2 font-semibold text-black" href={ctaHref}>
        {ctaLabel}
      </Link>
    </div>
  );
}
