/** Deterministic conversation ID matching iOS convention */
export function makeConvoId(uid1: string, uid2: string): string {
  return [uid1, uid2].sort().join("_");
}
