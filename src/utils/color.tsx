/**
 * Converts a hex code into a rgba representation
 */
export function hexToRgba(hexCode : string, alpha : number) : string {
  const r = parseInt(hexCode.slice(1, 3), 16),
        g = parseInt(hexCode.slice(3, 5), 16),
        b = parseInt(hexCode.slice(5, 7), 16);

  return "rgba(" + r + ", " + g + ", " + b + ", " + alpha + ")";
}
