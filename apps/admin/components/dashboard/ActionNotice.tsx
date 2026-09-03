const MESSAGES = {
  project: { archived: "Proyecto archivado correctamente.", created: "Proyecto creado correctamente.", updated: "Proyecto actualizado correctamente." },
  subscription: { archived: "Suscripción archivada correctamente.", created: "Suscripción creada correctamente.", updated: "Suscripción actualizada correctamente." },
} as const;

export function ActionNotice({ entity = "project", notice }: { entity?: keyof typeof MESSAGES; notice?: string }) {
  const message =
    notice === "archived" || notice === "created" || notice === "updated"
      ? MESSAGES[entity][notice]
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
