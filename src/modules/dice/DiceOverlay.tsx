import { motion } from 'motion/react'
import { Die } from './Die'
import { diceAnimation } from './config'
import './dice.css'

export function DiceOverlay({ value }: { value: number | null }) {
  return <motion.div className="central-die" initial={diceAnimation.initial} animate={diceAnimation.animate} exit={diceAnimation.exit}><Die value={value} /></motion.div>
}
