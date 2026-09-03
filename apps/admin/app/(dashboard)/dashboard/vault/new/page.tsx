import { PageHeader } from "@/components/dashboard/PageHeader";
import { ProjectForm } from "@/components/dashboard/ProjectForm";

export default function NewProjectPage() {
  return (
    <>
      <PageHeader
        eyebrow="Vault · proyectos"
        sub="Los datos se validan en el servidor y quedan asociados únicamente a tu owner."
        title="Nuevo proyecto"
      />
      <ProjectForm />
    </>
  );
}
