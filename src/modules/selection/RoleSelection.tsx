import { roles } from '../../game/content'
import type { RoleId } from '../../game/rules'
import './selection.css'
import { RoleScene } from './RoleScene'
import { playCardFlip, playSoftChoiceClick } from '../audio/soundtrack'

export function RoleSelection({ selectedIds, onToggleRole, onStart }: { selectedIds: RoleId[]; onToggleRole: (role: RoleId) => void; onStart: () => void }) {
  return <main className="selection">
    <header><img src="/assets/logo.png" alt="等灯 logo" /><h1>请选择本局角色卡</h1></header>
    <section className="role-table" aria-label="角色卡片">{roles.map(role => {
      const chosen = selectedIds.includes(role.id)
      return <button type="button" className={`role-card role-theme-${role.scene} ${chosen ? 'chosen' : ''}`} key={role.id} aria-pressed={chosen}
        aria-label={chosen ? `${role.id}，对应地点：${role.sceneLabel}。${role.ability} 再次点击取消选择` : `${role.id}，${role.title}，点击选择并翻面`}
        onClick={() => { playCardFlip(); onToggleRole(role.id) }}>
        <span className="role-card-inner">
          <span className="role-card-face role-card-front" aria-hidden={chosen}>
            <span className="role-portrait"><RoleScene scene={role.scene} /><img src={role.image} alt="" /></span><span className="role-card-name">{role.id}</span><span>{role.title}</span>
          </span>
          <span className="role-card-face role-card-back" aria-hidden={!chosen}>
            <span className="role-card-name">{role.id}</span><span className="role-card-location">对应地点：<br />{role.sceneLabel}</span><span className="role-card-ability">{role.ability}</span>
          </span>
        </span>
      </button>
    })}</section>
    <footer><span aria-live="polite">已选 {selectedIds.length} 位玩家</span><button className="start-button" disabled={selectedIds.length === 0} onClick={() => { playSoftChoiceClick(); onStart() }}>围桌开始</button></footer>
  </main>
}
