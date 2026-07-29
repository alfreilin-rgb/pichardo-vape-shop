export default function PropertySkeleton() {
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white">
      <div className="aspect-[4/3] animate-pulse bg-slate-200" />
      <div className="space-y-4 p-5">
        <div className="h-4 w-28 animate-pulse rounded bg-slate-200" />
        <div className="h-7 animate-pulse rounded bg-slate-200" />
        <div className="h-7 w-40 animate-pulse rounded bg-slate-200" />
        <div className="h-16 animate-pulse rounded bg-slate-100" />
        <div className="h-10 animate-pulse rounded bg-slate-200" />
      </div>
    </div>
  );
}
