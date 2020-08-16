export function normalizeEmail (email: string): string {
  return email.trim().toLowerCase()
}

export function normalizeName (name: string): string {
  return name.trim()
}
