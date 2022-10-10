export function times<T>(n: number, act: (i: number) => T): T[] {
  const result = [];

  for (let i = 0; i < n; i++) {
    result.push(act(i));
  }

  return result;
}
