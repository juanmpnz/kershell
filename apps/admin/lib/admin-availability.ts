export function isAdminEnabled(value = process.env.ADMIN_ENABLED) {
  return value === "true";
}
