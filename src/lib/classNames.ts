export function classNames(classes: Record<string, boolean>): string {
  return Object.entries(classes)
    .flatMap(([key, value]) => (value ? [key] : []))
    .join(' ');
}
