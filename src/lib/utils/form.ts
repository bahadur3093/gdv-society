export function getChangedFields<T extends Record<string, unknown>>(
  original: T,
  updated: T,
): Partial<T> {
  const changes: Partial<T> = {};

  for (const key of Object.keys(updated) as (keyof T)[]) {
    const oldVal = original[key];
    const newVal = updated[key];

    // Deep compare for arrays/objects (like files)
    if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
      changes[key] = newVal;
    }
  }

  return changes;
}
