import { useState } from 'react'
import './rules-guide.css'

type GuideStep = {
  eyebrow: string
  title: string
  body: string
  note?: string
  visual: 'places' | 'tiles' | 'lumens' | 'question' | 'interaction' | 'red' | 'black'
}

const steps: GuideStep[] = [
  {
    eyebrow: '01 · MAP',
    title: '先认识地图上的地点',
    body: 'Home 是每位玩家的起点。教室、操场、田野和办公室代表不同的生活场景；小卖铺是去程终点，到达后开始沿路线返程。',
    note: '大家轮流掷骰，按点数沿相连的格子前进。所有玩家回到 Home 后，流明最多的人获胜。',
    visual: 'places',
  },
  {
    eyebrow: '02 · BOARD',
    title: '路上的格子会带来不同事件',
    body: '黄色问号格抽问题卡；蓝色三角格抽互动卡；红色圆形格抽 dengdeng 卡。普通路径格只负责前进。',
    note: '遇到流浪猫或狗的爪印格，善待小动物即可直接获得 1 流明。',
    visual: 'tiles',
  },
  {
    eyebrow: '03 · LUMEN',
    title: '1、5、10 流明卡',
    body: '流明是游戏分数，也是玩家的计分筹码。每位玩家开始时有 10 流明，之后按卡牌和事件获得或扣除流明。',
    note: '1、5、10 是不同面值；游戏结束时，流明总数最高者获胜。',
    visual: 'lumens',
  },
  {
    eyebrow: '04 · QUESTION',
    title: '问题卡',
    body: '问题卡共 20 张，围绕校园中的欺凌与边界情境，包含单选和多选题。答对后获得卡片对应数量的流明。',
    note: '不同问题对应的流明分数不同；问题卡结算后回到牌堆。',
    visual: 'question',
  },
  {
    eyebrow: '05 · INTERACTION',
    title: '互动卡',
    body: '互动卡共 20 张，会带来不同的小游戏或任务。游戏获胜者或完成任务的玩家获得一颗心心。',
    note: '互动卡结算后回到牌堆，继续参与后续游戏。',
    visual: 'interaction',
  },
  {
    eyebrow: '06 · DENGDENG',
    title: '红色 dengdeng 卡',
    body: '红卡代表友善、陪伴和求助，面值为 +1 至 +5 流明。抽到后暂时留在手中；遇到黑卡时，其他玩家可以各打出一张红卡，一起帮助抵消黑卡。',
    note: '每位帮助者最多打出一张，并获得自己打出的红卡对应流明；使用后的红卡回到牌堆。',
    visual: 'red',
  },
  {
    eyebrow: '07 · DENGDENG',
    title: '黑色 dengdeng 卡',
    body: '黑卡代表不友善、欺凌或危险行为，面值为 1 至 5 流明。若无人打出红卡帮助，抽卡玩家扣除对应流明，并在办公室停一轮。',
    note: '黑卡结算后回到牌堆。除暂时持有的红卡外，所有卡牌用完都会回到各自牌堆；本局结束时未使用的红卡不计分。',
    visual: 'black',
  },
]

function StepArtwork({ visual }: { visual: GuideStep['visual'] }) {
  if (visual === 'places') return <div className="guide-places" aria-label="地图地点">
    {[
      ['Home', '起点', 'red'], ['教室', '学习与相处', 'blue'], ['操场', '游戏与安全边界', 'yellow'],
      ['田野', '安静与陪伴', 'blue'], ['办公室', '求助与倾听', 'red'], ['小卖铺', '折返终点', 'yellow'],
    ].map(([name, label, color]) => <div className="guide-place" key={name}><i className={`bauhaus-dot ${color}`} /><strong>{name}</strong><span>{label}</span></div>)}
  </div>
  if (visual === 'tiles') return <div className="guide-tiles" aria-label="功能格类型">
    <div><i className="tile-symbol question-symbol">?</i><strong>问题卡</strong><span>黄色 · 问号</span></div>
    <div><i className="tile-symbol interaction-symbol">△</i><strong>互动卡</strong><span>蓝色 · 三角</span></div>
    <div><i className="tile-symbol dengdeng-symbol">○</i><strong>dengdeng 卡</strong><span>红色 · 圆形</span></div>
    <div><i className="tile-symbol paw-symbol">🐾</i><strong>小动物</strong><span>爪印 · +1 流明</span></div>
  </div>
  if (visual === 'lumens') return <div className="guide-lumens" aria-label="流明卡面值">
    {[1, 5, 10].map((value) => <img key={value} src={`/assets/lumen-cards/png版本/流明卡${value}.png`} alt={`${value} 流明卡`} />)}
  </div>
  const cards: Record<'question' | 'interaction' | 'red' | 'black', { src: string; alt: string }> = {
    question: { src: '/assets/question-cards/问题卡背面（5.7cmX8.8cm）.jpg', alt: '问题卡' },
    interaction: { src: '/assets/interaction-cards/互动背面（5.7cmX8.8cm）.jpg', alt: '互动卡' },
    red: { src: '/assets/dengdeng-cards/红卡内容/1.jpg', alt: '红色 dengdeng 卡' },
    black: { src: '/assets/dengdeng-cards/黑卡内容/1.jpg', alt: '黑色 dengdeng 卡' },
  }
  return <div className={`guide-card-preview ${visual}`}><img src={cards[visual].src} alt={cards[visual].alt} /></div>
}

export function RulesGuide({ mode, onExit }: { mode: 'intro' | 'overlay'; onExit: () => void }) {
  const [stepIndex, setStepIndex] = useState(0)
  const step = steps[stepIndex]
  const isLast = stepIndex === steps.length - 1
  const isOverlay = mode === 'overlay'

  return <div className={`rules-guide ${isOverlay ? 'rules-guide-overlay' : 'rules-guide-intro'}`} role="dialog" aria-modal="true" aria-labelledby="rules-guide-title">
    <section className="rules-guide-sheet">
      <header className="rules-guide-topline"><span>等灯 dengdeng · 游戏介绍</span><button className="rules-guide-exit" onClick={onExit}>退出指引 <b aria-hidden="true">×</b></button></header>
      <div className="rules-guide-progress" aria-label={`第 ${stepIndex + 1} 步，共 ${steps.length} 步`}>
        {steps.map((entry, index) => <i key={entry.eyebrow + entry.title} className={index <= stepIndex ? 'complete' : ''} />)}
      </div>
      <div className="rules-guide-content" key={stepIndex}>
        <div className="rules-guide-copy">
          <span className="rules-guide-eyebrow">{step.eyebrow}</span>
          <h1 id="rules-guide-title">{step.title}</h1>
          <p>{step.body}</p>
          {step.note && <p className="rules-guide-note">{step.note}</p>}
        </div>
        <StepArtwork visual={step.visual} />
      </div>
      <footer className="rules-guide-controls">
        <span>{String(stepIndex + 1).padStart(2, '0')} / {String(steps.length).padStart(2, '0')}</span>
        <div>
          <button className="rules-guide-prev" disabled={stepIndex === 0} onClick={() => setStepIndex((index) => index - 1)}>上一步</button>
          <button className="rules-guide-next" onClick={() => isLast ? onExit() : setStepIndex((index) => index + 1)}>{isLast ? (isOverlay ? '完成' : '开始游戏') : '下一步'}</button>
        </div>
      </footer>
    </section>
  </div>
}
