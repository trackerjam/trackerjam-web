const ADMIN_IDS = process.env.ADMIN_IDS?.split(',').map((s) => s.trim()) || [];

export function checkAdminAccess(userId: string | null | undefined) {
  if (!userId) {
    return false;
  }

  return ADMIN_IDS.includes(userId);
}
