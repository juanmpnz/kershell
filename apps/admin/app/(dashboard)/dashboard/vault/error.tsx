"use client";

export default function VaultError({ reset }: { reset: () => void }) {
  return (
    <div className="grid place-items-center p-8">
      <div className="max-w-lg rounded-[10px] border border-danger/40 bg-surface p-8 text-center">
        <h1 className="text-lg font-semibold text-text">
          No pudimos cargar el vault
        </h1>
        <p className="mt-2 text-sm leading-6 text-text-dim">
          La base de datos no respondió correctamente. No se mostraron datos de
          respaldo para evitar trabajar sobre información desactualizada.
        </p>
        <button
          className="mt-5 rounded-md bg-accent px-4 py-2 text-sm font-semibold text-accent-ink"
          onClick={reset}
          type="button"
        >
          Reintentar
        </button>
      </div>
    </div>
  );
}
