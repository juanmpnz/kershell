"use client";

export function ArchiveSubscriptionForm({ action, name }: { action: () => Promise<void>; name: string }) {
  return <form action={action} onSubmit={(event) => { if (!window.confirm(`¿Archivar ${name}?`)) event.preventDefault(); }}><button className="rounded-md border border-danger/50 px-3 py-2 text-sm text-danger" type="submit">Archivar</button></form>;
}
