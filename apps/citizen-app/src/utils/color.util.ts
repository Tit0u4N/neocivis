export function hexToGradient(hex: string): [string, string] {
  return [`${hex}14`, `${hex}26`]; // 8% → 15% opacity (light → slightly deeper, 135deg)
}
