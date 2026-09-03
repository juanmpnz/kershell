const MESSAGES = {
  archived: "Proyecto archivado correctamente.",
  created: "Proyecto creado correctamente.",
  updated: "Proyecto actualizado correctamente.",
} as const;

export function ActionNotice({ notice }: { notice?: string }) {
  const message =
    notice === "archived" || notice === "created" || notice === "updated"
      ? MESSAGES[notice]
      : null;

  return message ? (
    <p
      className="mx-8 mt-6 rounded-md border border-[rgba(122,226,161,0.4)] bg-[rgba(122,226,161,0.1)] px-4 py-3 text-sm text-[var(--ok)]"
      role="status"
    >
      {message}
    </p>
  ) : null;
}
