import './dice.css'

export function Die({ value }: { value: number | null }) { return <div className="die" aria-label={value ? `骰子点数${value}` : '骰子'}><span>{value ?? '●'}</span></div> }
