import { useState, type CSSProperties } from 'react'
import './map-focus-guide.css'

type Focus = { path: string; kind?: 'area' | 'line'; strokeWidth?: number }
type MapStep = {
  section: string
  title: string
  text: string
  note?: string
  focus?: Focus
  callout: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'bottom-center'
  art?: 'lumens' | 'dengdeng' | 'interaction' | 'question'
}

const circlePath = (x: number, y: number, rx: number, ry: number) =>
  `M ${x - rx} ${y} A ${rx} ${ry} 0 1 0 ${x + rx} ${y} A ${rx} ${ry} 0 1 0 ${x - rx} ${y} Z`

const roundedRectPath = (x: number, y: number, width: number, height: number, radius: number) =>
  `M ${x + radius} ${y} H ${x + width - radius} Q ${x + width} ${y} ${x + width} ${y + radius} V ${y + height - radius} Q ${x + width} ${y + height} ${x + width - radius} ${y + height} H ${x + radius} Q ${x} ${y + height} ${x} ${y + height - radius} V ${y + radius} Q ${x} ${y} ${x + radius} ${y} Z`

const focusCircle = (x: number, y: number, rx: number, ry: number) => ({ path: circlePath(x, y, rx, ry) })

const mapSteps: MapStep[] = [
  { section: '地图地点', title: '家 Home · 旅程的起点与终点', text: '每位玩家出发的地方，完成去程和返程后，玩家最终回到Home 结算游戏。', focus: { path: 'M10.955 20.604 L11.073 21.112 L11.649 21.084 L11.615 26.447 L11.988 30.003 L14.985 30.342 L20.809 29.805 L20.877 21.197 L21.368 20.632 L16.238 13.830 L15.171 14.592 L13.190 17.979 Z' }, callout: 'bottom-right' },
  { section: '地图地点', title: '教室 Classroom · 学习与相处', text: '灯管为学习和同伴相处带来光亮，帮助孩子们在校园中理解彼此、建立边界。', focus: { path: 'M4.572 77.448 L5.046 82.472 L7.179 86.960 L14.883 86.960 L17.152 83.404 L17.271 81.795 L15.967 76.178 L14.815 74.513 L13.190 75.557 L8.060 72.933 Z' }, callout: 'bottom-right' },
  { section: '地图地点', title: '操场 Playground · 游戏与安全', text: '路灯照亮孩子们在操场的游戏与安全。', focus: { path: 'M36.217 43.184 L37.504 46.881 L50.576 47.982 L50.203 43.127 L48.510 35.394 L43.786 32.430 L37.792 39.317 Z' }, callout: 'bottom-right' },
  { section: '地图地点', title: '田野 Field · 安静与陪伴', text: '乡间的月光照见孩子们安静的心事与陪伴。', focus: { path: 'M40.738 93.649 L42.194 97.657 L54.013 97.657 L56.688 93.508 L54.436 87.581 L47.189 83.630 L41.788 90.601 Z' }, callout: 'top-left' },
  { section: '地图地点', title: '办公室 Office · 帮助与倾听', text: '台灯为孩子们带来指引的光亮，老师认真倾听与解决孩子们的烦恼。', focus: { path: 'M68.354 63.223 L69.997 69.207 L78.496 69.404 L80.477 66.610 L79.953 60.485 L71.063 60.090 Z' }, callout: 'top-left' },
  { section: '地图地点', title: '小卖铺 Village shop · 分享与尊重', text: '灯泡照亮分享与尊重，到达这里后，玩家沿路线开启返程。', focus: { path: 'M95.445 72.933 L92.601 73.328 L88.368 83.206 L88.554 98.109 L93.143 98.052 L98.307 99.181 L99.136 98.730 L99.306 83.093 L98.121 79.198 Z' }, callout: 'top-left' },
  { section: '地图路径', title: '地点之间的路径 · 六个格子', text: '六个场景之间以六个格子相连，其中3个格子是功能格，遇到功能格时翻开对应卡牌。', focus: { path: 'M13.2 26.4 L10.4 33.7 L7.2 40.4 L5.9 47.8 L4.6 55.4 L3.7 63.0 L3.4 72.2 L5.8 77.0 L13.6 78.2 L10.3 72.8 L10.8 63.0 L12.4 55.6 L14.3 48.0 L16.2 40.7 L19.0 33.7 L21.5 27.3 Z' }, callout: 'bottom-center', art: undefined },
  { section: '功能格与卡牌', title: '黄色问号格 · 问题卡', text: '走到黄色问号格，翻开问题卡并回答；答对后获得卡面对应的流明。', note: '答题结算后，问题卡放回牌堆，之后仍可再次抽到。', focus: { path: `${circlePath(9.29, 47.68, 2.95, 4.92)} ${roundedRectPath(82.7, 16.9, 11.8, 29.7, 1.1)}` }, callout: 'bottom-right', art: 'question' },
  { section: '功能格与卡牌', title: '蓝色三角格 · 互动卡', text: '走到蓝色三角格，翻开互动卡，按卡面内容完成小游戏或任务。获胜或完成任务的人可以获得卡面对应的流明数。', note: '任务结算后，互动卡放回牌堆，之后仍可再次抽到。', focus: { path: `${circlePath(7.14, 62.93, 3.35, 5.58)} ${roundedRectPath(67.7, 7.4, 11.6, 29.5, 1.1)}` }, callout: 'bottom-right', art: 'interaction' },
  { section: '功能格与卡牌', title: '红色圆形格 · dengdeng 卡', text: '走到红色圆形格，抽取一张 dengdeng 卡。红卡带来友善、陪伴或求助行动，获得 +1 至 +5 流明；黑卡代表不友善、欺凌或危险行为，扣除 1 至 5 流明。', note: '所有dengdeng卡使用完后归回原处，红色 dengdeng 卡只有在黑色 dengdeng卡出现时才能使用，游戏结束时，未使用红卡不计分。', focus: { path: `${focusCircle(6.75, 72.13, 3.05, 5.08).path} ${roundedRectPath(55.2, 10.2, 8.1, 20.2, 1.1)}` }, callout: 'bottom-right', art: 'dengdeng' },
  { section: '功能格', title: '遇到流浪小动物', text: '经过地图上的两处爪印格，遇到流浪小动物，可直接获得 1 流明；遇到流浪小动物要善待它们。', focus: { path: `${circlePath(47.22, 63.76, 3.15, 5.25)} ${circlePath(30.61, 84.67, 3.15, 5.25)}` }, callout: 'bottom-right' },
  { section: '流明卡', title: '1、5、10 流明卡', text: '流明是游戏的分数，也是大家计分用的筹码。每位玩家开始时有 10 流明；1、5、10 是不同的卡面数值。', note: '游戏结束时，流明总数最高者获胜。', focus: { path: `${circlePath(28.348, 10.779, 4.022, 6.716)} ${circlePath(38.366, 15.044, 4.019, 6.662)} ${circlePath(47.306, 22.241, 4.016, 6.656)}` }, callout: 'bottom-right', art: 'lumens' },
  { section: '游戏规则', title: '准备好了吗？掷骰子出发', text: '玩家轮流掷骰，沿相连的格子逐格前进；到达小卖铺后折返，最终回到 Home。落在功能格时按卡牌说明结算。', note: '所有玩家完成往返后比较流明总数，流明最多的玩家获胜。', callout: 'bottom-center' },
]

function GuideArtwork({ art }: { art: NonNullable<MapStep['art']> }) {
  if (art === 'lumens') return <div className="map-guide-art map-guide-lumens">
    <img src="/assets/lumen-cards/png版本/流明卡背面.png" alt="流明卡背面" />
    {[1, 5, 10].map((value) => <img key={value} src={`/assets/lumen-cards/png版本/流明卡${value}.png`} alt={`${value} 流明卡正面`} />)}
  </div>
  const assets: Record<Exclude<NonNullable<MapStep['art']>, 'lumens'>, string[]> = {
    dengdeng: ['/assets/dengdeng-cards/红卡内容/1.jpg', '/assets/dengdeng-cards/黑卡内容/1.jpg'],
    interaction: ['/assets/interaction-cards/互动卡内容/1.jpg'],
    question: ['/assets/question-cards/问题内容另一面/1.jpg'],
  }
  return <div className={`map-guide-art map-guide-cards ${art}`}>
    {assets[art].map((src) => <img key={src} src={src} alt={art === 'dengdeng' ? (src.includes('红卡') ? '红色 dengdeng 卡正面' : '黑色 dengdeng 卡正面') : art === 'interaction' ? '互动卡正面' : '问题卡正面'} />)}
  </div>
}

export function MapFocusGuide({ mode, onExit }: { mode: 'intro' | 'overlay'; onExit: () => void }) {
  const [stepIndex, setStepIndex] = useState(0)
  const step = mapSteps[stepIndex]
  const isIntro = mode === 'intro'
  const focusSvg = step.focus ? `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="none"><defs><mask id="clear-focus" maskUnits="userSpaceOnUse" x="0" y="0" width="100" height="100" mask-type="luminance"><rect width="100" height="100" fill="white"/><path d="${step.focus.path}" fill="${step.focus.kind === 'line' ? 'none' : 'black'}" stroke="${step.focus.kind === 'line' ? 'black' : 'none'}" stroke-width="${step.focus.strokeWidth ?? 0}" stroke-linecap="round" stroke-linejoin="round"/></mask></defs><rect width="100" height="100" fill="white" mask="url(#clear-focus)"/></svg>` : ''
  const style = { '--focus-mask': focusSvg ? `url("data:image/svg+xml,${encodeURIComponent(focusSvg)}")` : 'none' } as CSSProperties
  const wide = !step.focus
  const routeStep = step.section === '地图路径'
  const isLast = stepIndex === mapSteps.length - 1
  return <div className={`map-focus-guide ${wide ? 'map-focus-guide-wide' : ''} ${routeStep ? 'map-guide-route-step' : ''} ${isIntro ? 'map-guide-intro' : ''}`} style={style} role="dialog" aria-modal="true" aria-labelledby="map-guide-title">
    <div className="map-guide-shade" aria-hidden="true" />
    {!wide && <svg className="map-guide-spot" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><path d={step.focus?.path} fill="none" stroke="rgba(255,242,0,.96)" strokeWidth={step.focus?.kind === 'line' ? step.focus.strokeWidth : 0.35} strokeLinecap="round" strokeLinejoin="round" /></svg>}
    <div className="map-guide-top-actions">
      <button onClick={onExit}>{isIntro ? '退出指引' : '关闭指引'} <span aria-hidden="true">×</span></button>
    </div>
    <section className={`map-guide-readout callout-${step.callout} ${step.art ? `has-art has-art-${step.art}` : ''} ${step.title === '遇到流浪小动物' ? 'map-guide-paw-step' : ''} ${step.title.startsWith('教室 ') ? 'map-guide-classroom-step' : ''}`} key={stepIndex}>
      <div className="map-guide-copy">
        <span className="map-guide-section">{step.section} · {String(stepIndex + 1).padStart(2, '0')} / {mapSteps.length}</span>
        <h1 id="map-guide-title">{step.title}</h1>
        <p>{step.text}</p>
        {step.note && <p className="map-guide-note">{step.note}</p>}
      </div>
      {step.art && <GuideArtwork art={step.art} />}
      <footer className="map-guide-controls">
        <button disabled={stepIndex === 0} onClick={() => setStepIndex((index) => index - 1)}>上一步</button>
        <button className="map-guide-next" onClick={() => isLast ? onExit() : setStepIndex((index) => index + 1)}>{isLast ? (isIntro ? '开始游戏' : '完成') : '下一步'}</button>
      </footer>
    </section>
  </div>
}
