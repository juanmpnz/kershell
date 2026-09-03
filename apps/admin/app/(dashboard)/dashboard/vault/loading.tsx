export default function VaultLoading() {
  return (
    <div className="grid animate-pulse gap-5 p-8" aria-label="Cargando proyectos">
      <div className="h-20 rounded-[10px] border border-border bg-surface" />
      <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-4">
        {[0, 1, 2].map((item) => (
          <div
            className="h-[340px] rounded-[10px] border border-border bg-surface"
            key={item}
          />
        ))}
      </div>
    </div>
  );
}
