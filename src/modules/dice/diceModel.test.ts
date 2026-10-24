import { describe, expect, it } from 'vitest'
import { Box3, Mesh, Raycaster, Vector3 } from 'three'
import { createDiceModel, diceFaces, disposeDiceModel, getDicePose, getRestQuaternion } from './diceModel'

describe('solid rounded 3D dice', () => {
  it('keeps all six pip counts fixed and opposite faces add up to seven', () => {
    const { group } = createDiceModel()
    for (let value = 1; value <= 6; value++) {
      const face = diceFaces.find(face => face.value === value)!
      expect(group.children.filter(child => child.name.startsWith(`pip-${value}-`))).toHaveLength(value)
      const opposite = diceFaces.find(other => new Vector3(...other.normal).dot(new Vector3(...face.normal)) < -.99)!
      expect(opposite.value + value).toBe(7)
    }
    disposeDiceModel(group)
  })

  it.each([1, 2, 3, 4, 5, 6])('rests flat with game result %i facing upwards', value => {
    const quaternion = getRestQuaternion(value)
    const face = diceFaces.find(face => face.value === value)!
    expect(new Vector3(...face.normal).applyQuaternion(quaternion).y).toBeCloseTo(1, 8)
    const { group } = createDiceModel()
    const pose = getDicePose(value, 1)
    group.quaternion.copy(pose.quaternion)
    group.position.copy(pose.position)
    const box = new Box3().setFromObject(group)
    expect(box.min.y).toBeCloseTo(0, 3)
    expect(box.max.y).toBeCloseTo(2.004, 2)
    disposeDiceModel(group)
  })

  it('has an opaque depth-tested body with a closed surface along all view axes', () => {
    const { group, body } = createDiceModel()
    expect(body.material.transparent).toBe(false)
    expect(body.material.opacity).toBe(1)
    expect(body.material.depthWrite).toBe(true)
    group.updateMatrixWorld(true)
    for (const normal of diceFaces.map(face => new Vector3(...face.normal))) {
      const hits = new Raycaster(normal.clone().multiplyScalar(4), normal.clone().negate()).intersectObject(body)
      expect(hits.length).toBeGreaterThan(0)
    }
    expect(body.geometry.getAttribute('position').count).toBeLessThan(10000)
    expect(group.children.filter(child => child instanceof Mesh).length).toBe(22)
    disposeDiceModel(group)
  })

  it('keeps the same mesh and pip colors while changing only the roll pose', () => {
    const { group } = createDiceModel()
    const before = group.children.map(child => ({ name: child.name, uuid: child.uuid }))
    for (const t of [0, .2, .6, .9, 1]) {
      const pose = getDicePose(4, t)
      group.position.copy(pose.position)
      group.quaternion.copy(pose.quaternion)
      expect(group.position.y).toBeGreaterThanOrEqual(1)
    }
    expect(group.children.map(child => ({ name: child.name, uuid: child.uuid }))).toEqual(before)
    expect(getDicePose(4, 1).quaternion.angleTo(getRestQuaternion(4))).toBeCloseTo(0, 6)
    disposeDiceModel(group)
  })

  it('keeps the rounded solid above the ground during every roll', () => {
    const { group, body } = createDiceModel()
    const vertices = body.geometry.getAttribute('position')
    const vertex = new Vector3()
    for (const value of [1, 2, 3, 4, 5, 6]) for (let i = 0; i <= 24; i++) {
      const pose = getDicePose(value, i / 24)
      for (let index = 0; index < vertices.count; index++) {
        vertex.fromBufferAttribute(vertices, index).applyQuaternion(pose.quaternion).add(pose.position)
        if (vertex.y < -.0001) throw new Error(`骰子 ${value} 在进度 ${i}/24 穿过地面`)
      }
    }
    disposeDiceModel(group)
  })
})
