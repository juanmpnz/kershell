"use client";

export function ArchiveProjectForm({
  action,
  projectName,
}: {
  action: () => Promise<void>;
  projectName: string;
}) {
  return (
    <form
      action={action}
      onSubmit={(event) => {
        if (!window.confirm(`¿Archivar ${projectName}?`)) {
          event.preventDefault();
        }
      }}
    >
      <button
        className="rounded-md border border-danger/50 px-3 py-2 text-sm text-danger transition hover:bg-danger/10"
        type="submit"
      >
        Archivar proyecto
      </button>
    </form>
  );
}
