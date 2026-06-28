const ALLOWED_EMAIL =
  process.env.NEXT_PUBLIC_CHAT_ALLOWED_EMAIL?.toLowerCase().trim();

export function isChatAllowedForEmail(
  email: string | null | undefined,
): boolean {
  if (!email) return false;
  if (!ALLOWED_EMAIL) return false;
  return email.toLowerCase().trim() === ALLOWED_EMAIL;
}
