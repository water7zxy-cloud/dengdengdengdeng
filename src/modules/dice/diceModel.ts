import { CircleGeometry, Euler, Group, Mesh, MeshStandardMaterial, Quaternion, Vector3 } from 'three'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'

const up = new Vector3(0, 1, 0)
export const diceFaces: Array<{ value: number; normal: [number, number, number]; color: number }> = [
  { value: 1, normal: [0, 0, 1], color: 0xdf1919 },
  { value: 6, normal: [0, 0, -1], color: 0x151515 },
  { value: 2, normal: [0, 1, 0], color: 0x087fd1 },
  { value: 5, normal: [0, -1, 0], color: 0x151515 },
  { value: 3, normal: [1, 0, 0], color: 0x087fd1 },
  { value: 4, normal: [-1, 0, 0], color: 0xdf1919 },
]
const pipSlots: Record<number, number[]> = { 1: [4], 2: [0, 8], 3: [0, 4, 8], 4: [0, 2, 6, 8], 5: [0, 2, 4, 6, 8], 6: [0, 2, 3, 5, 6, 8] }
export const DICE_ROLL_MS = 2400

export function getRestQuaternion(value: number) {
  const face = diceFaces.find(face => face.value === value)
  if (!face) throw new RangeError('骰子结果必须为 1–6')
  const alignment = new Quaternion().setFromUnitVectors(new Vector3(...face.normal), up)
  return new Quaternion().setFromAxisAngle(up, .24).multiply(alignment)
}

export function createDiceModel() {
  const group = new Group()
  const body = new Mesh(new RoundedBoxGeometry(2, 2, 2, 4, .22), new MeshStandardMaterial({ color: 0xffffff, roughness: .22, metalness: 0 }))
  body.name = 'solid-rounded-body'
  body.castShadow = true
  body.receiveShadow = false
  group.add(body)
  const geometry = new CircleGeometry(.17, 24)
  const materials = new Map<number, MeshStandardMaterial>()
  for (const face of diceFaces) {
    let material = materials.get(face.color)
    if (!material) {
      material = new MeshStandardMaterial({ color: face.color, roughness: .35, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1 })
      materials.set(face.color, material)
    }
    const normal = new Vector3(...face.normal)
    const orientation = new Quaternion().setFromUnitVectors(new Vector3(0, 0, 1), normal)
    for (const slot of pipSlots[face.value]) {
      const pip = new Mesh(geometry, material)
      pip.name = `pip-${face.value}-${slot}`
      pip.position.set((slot % 3 - 1) * .48, (Math.floor(slot / 3) - 1) * .48, 1.0001).applyQuaternion(orientation)
      pip.quaternion.copy(orientation)
      group.add(pip)
    }
  }
  return { group, body }
}

/** Kinematic visual roll: no physics engine and no second random result. */
export function getDicePose(value: number, progress: number, from = getRestQuaternion(2)) {
  const t = Math.max(0, Math.min(1, progress))
  const eased = 1 - (1 - t) ** 3
  const target = getRestQuaternion(value)
  const quaternion = from.clone().slerp(target, eased)
  const spin = new Quaternion().setFromEuler(new Euler(Math.PI * 4 * eased, Math.PI * 2 * eased, Math.PI * 2 * eased))
  quaternion.premultiply(spin)
  if (t === 1) quaternion.copy(target)
  const localUp = up.clone().applyQuaternion(quaternion.clone().invert())
  const support = .78 * (Math.abs(localUp.x) + Math.abs(localUp.y) + Math.abs(localUp.z)) + .22
  const bounce = t < .5 ? Math.sin(t / .5 * Math.PI) * 1.1 : t < .8 ? Math.sin((t - .5) / .3 * Math.PI) * .25 : Math.sin((t - .8) / .2 * Math.PI) * .04
  return { quaternion, lift: Math.max(0, bounce), position: new Vector3(-1.5 * (1 - eased), support + Math.max(0, bounce), -.2 * (1 - eased)) }
}

export function disposeDiceModel(group: Group) {
  const geometries = new Set<CircleGeometry | RoundedBoxGeometry>()
  const materials = new Set<MeshStandardMaterial>()
  group.traverse(child => {
    if (child instanceof Mesh) {
      geometries.add(child.geometry)
      const list = Array.isArray(child.material) ? child.material : [child.material]
      list.forEach(material => materials.add(material))
    }
  })
  geometries.forEach(geometry => geometry.dispose())
  materials.forEach(material => material.dispose())
  group.clear()
}
