import { OrthographicCamera } from 'three'

export const DICE_VIEW_SIZE = 432
export function createDiceCamera() {
  const camera = new OrthographicCamera(-4.4, 4.4, 4.4, -4.4, .1, 40)
  camera.position.set(4, 3.5, 6)
  camera.lookAt(0, 1, 0)
  camera.updateMatrixWorld(true)
  return camera
}
