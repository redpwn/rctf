const p0 = 0.7
const p1 = 0.96

const c0 = -Math.atanh(p0)
const c1 = Math.atanh(p1)
const a = (x: number): number => (1 - Math.tanh(x)) / 2
const b = (x: number): number => (a((c1 - c0) * x + c0) - a(c1)) / (a(c0) - a(c1))

export const getScore = (rl: number, rh: number, s: number, solves: number): number => {
  const f = (x: number): number => rl + (rh - rl) * b(x / s)
  return Math.round(Math.max(f(solves), f(s)))
}
