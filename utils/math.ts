
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export const mapRange = (value: number, inMin: number, inMax: number, outMin: number, outMax: number) => {
  return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
};
