"use client";

export function DeleteCredentialReferenceForm({
  action,
  name,
}: {
  action: () => Promise<void>;
  name: string;
}) {
  return (
    <form
      action={action}
      onSubmit={(event) => {
        if (
          !window.confirm(
            `¿Eliminar la referencia ${name}? El secreto externo no se modificará.`,
          )
        ) {
          event.preventDefault();
        }
      }}
    >
      <button
        className="rounded-md border border-danger/50 px-3 py-2 text-sm text-danger"
        type="submit"
      >
        Eliminar referencia
      </button>
    </form>
  );
}
