export function toArray(input: any): any[] {
  if (Array.isArray(input)) return input;
  if (!input || typeof input !== 'object') return [];
  const cand = [input.items, input.data, input.result, input.results, input.list];
  for (const c of cand) if (Array.isArray(c)) return c;
  const values = Object.values(input);
  return Array.isArray(values) ? values : [];
}
