export const diceAnimation = {
  initial: { opacity: 0, scale: 0.3, rotate: -40 },
  animate: { opacity: 1, scale: 1, rotate: 0 },
  exit: { opacity: 0, scale: 1.4, rotate: 120 },
}

export function randomDie(): number {
  return Math.floor(Math.random() * 6) + 1
}
