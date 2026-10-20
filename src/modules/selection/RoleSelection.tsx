import { roles, type RoleDefinition } from '../../game/content'
import type { RoleId } from '../../game/rules'
import './selection.css'

export function RoleSelection({ selected, selectedIds, onChoose, onStart }: { selected: RoleDefinition[]; selectedIds: RoleId[]; onChoose: (role: RoleId) => void; onStart: () => void }) {
  return <main className="selection"><header><img src="/assets/logo.png" alt="等灯 logo" /><div><h1>请选择本局角色</h1><p>每个角色既是玩家，也是地图上的一盏灯。</p></div></header><section className="role-table">{roles.map((role) => { const chosen = selectedIds.includes(role.id); return <article className={`role-card ${chosen ? 'chosen' : ''}`} key={role.id}><img src={role.image} alt={role.id} /><h2>{role.id}</h2><p>{role.title}</p><p className="scene">对应地点：{role.sceneLabel}</p><p>{role.ability}</p><button aria-label={chosen ? `${role.id}已加入` : `选择${role.id}`} disabled={chosen} onClick={() => onChoose(role.id)}>{chosen ? `${role.id}已加入` : '选择'}</button></article> })}</section><footer><span>已选 {selected.length} 位玩家</span><button className="start-button" disabled={selected.length === 0} onClick={onStart}>围桌开始</button></footer></main>
}
