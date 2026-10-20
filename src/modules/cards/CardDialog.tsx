import { motion } from 'motion/react'
import { useState } from 'react'
import { questionCards } from '../../game/content'
import { answersAreCorrect } from '../../game/rules'
import type { GamePlayer, CardModal } from '../../game/types'
import './cards.css'

export function CardDialog({ modal, players, activePlayer, pending, onResolve, onHelp }: { modal: CardModal; players: GamePlayer[]; activePlayer: number; pending: CardModal | null; onResolve: (success?: boolean) => void; onHelp: (index: number) => void }) {
  const [answers, setAnswers] = useState<string[]>([])
  const question = modal.questionId ? questionCards.find((entry) => entry.id === modal.questionId) : undefined
  const toggleAnswer = (answer: string) => setAnswers((current) => current.includes(answer) ? current.filter((item) => item !== answer) : [...current, answer])
  const origin = modal.type === 'question' ? { x: '29vw', y: '-13vh' } : modal.type === 'interaction' ? { x: '18vw', y: '-22vh' } : { x: '2vw', y: '-22vh' }
  return <motion.div className="card-dialog" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><motion.div className="card-stage" initial={{ ...origin, rotateY: 90, scale: 0.22 }} animate={{ x: 0, y: 0, rotateY: 0, scale: 1 }} exit={{ ...origin, rotateY: -90, scale: 0.22 }} transition={{ type: 'spring', damping: 19 }}><img src={modal.image} alt={modal.title} /><div className="card-actions">{modal.type === 'question' && question && <><div className="answer-options">{Object.entries(question.choices).map(([letter, label]) => <button className={answers.includes(letter) ? 'selected-answer' : ''} key={letter} onClick={() => toggleAnswer(letter)}>{letter}. {label}</button>)}</div><button disabled={answers.length === 0} onClick={() => onResolve(answersAreCorrect(answers, question.answers))}>确认答案</button></>}{modal.type === 'interaction' && <button onClick={() => onResolve(true)}>任务完成 +{modal.lumens} 流明</button>}{modal.type === 'dengdeng' && modal.color === 'red' && <button onClick={() => onResolve()}>收入手中</button>}{modal.type === 'dengdeng' && modal.color === 'black' && <>{pending && players.map((player, index) => index !== activePlayer && player.officeSkips === 0 && player.redCards.length > 0 ? <button key={player.role} onClick={() => onHelp(index)}>{player.role} 打出红卡</button> : null)}<button onClick={() => onResolve()}>无人帮助，结算黑卡</button></>}</div></motion.div></motion.div>
}
