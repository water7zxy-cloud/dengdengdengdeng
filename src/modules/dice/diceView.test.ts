import { Box3, Vector3 } from 'three'
import { expect, it } from 'vitest'
import { createDiceModel, disposeDiceModel, getDicePose, getRestQuaternion } from './diceModel'
import { createDiceCamera } from './diceView'

it('keeps the entire dice inside the canvas throughout every result-to-result roll', () => {
  const camera = createDiceCamera()
  const { group } = createDiceModel()
  const box = new Box3()
  const corner = new Vector3()
  let maximum = 0
  for (let from = 1; from <= 6; from++) for (let value = 1; value <= 6; value++) for (let step = 0; step <= 24; step++) {
    const pose = getDicePose(value, step / 24, getRestQuaternion(from))
    group.position.copy(pose.position)
    group.quaternion.copy(pose.quaternion)
    box.setFromObject(group)
    for (const x of [box.min.x, box.max.x]) for (const y of [box.min.y, box.max.y]) for (const z of [box.min.z, box.max.z]) {
      corner.set(x, y, z).project(camera)
      maximum = Math.max(maximum, Math.abs(corner.x), Math.abs(corner.y))
    }
  }
  disposeDiceModel(group)
  expect(maximum, '动画中骰子投影越过画布边界，会被水平截断').toBeLessThan(.94)
})
