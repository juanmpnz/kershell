import { LoginForm } from "./LoginForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <LoginForm
      initialError={error ? "La identidad de Google no está autorizada." : ""}
    />
  );
}
