import { useEffect, useRef, useState } from 'react'
import { CanvasTexture, DirectionalLight, HemisphereLight, Mesh, MeshBasicMaterial, NeutralToneMapping, PCFSoftShadowMap, PlaneGeometry, Scene, ShadowMaterial, WebGLRenderer } from 'three'
import { createDiceModel, DICE_ROLL_MS, disposeDiceModel, getDicePose, getRestQuaternion } from './diceModel'
import { createDiceCamera, DICE_VIEW_SIZE } from './diceView'

interface Props { value: number; rolling: boolean; onReady: () => void; onSettled: () => void }
interface Controller { show: (value: number, rolling: boolean) => void }

export default function ThreeDie(props: Props) {
  const host = useRef<HTMLDivElement>(null)
  const callbacks = useRef(props)
  callbacks.current = props
  const controller = useRef<Controller | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    const element = host.current
    if (!element) return
    let renderer: WebGLRenderer
    try {
      renderer = new WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' })
    } catch (error) {
      console.error('3D 骰子初始化失败', error)
      setFailed(true)
      callbacks.current.onReady()
      return
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.25))
    renderer.setSize(DICE_VIEW_SIZE, DICE_VIEW_SIZE)
    renderer.setClearColor(0x000000, 0)
    renderer.toneMapping = NeutralToneMapping
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = PCFSoftShadowMap
    element.appendChild(renderer.domElement)
    const scene = new Scene()
    const camera = createDiceCamera()
    scene.add(new HemisphereLight(0xffffff, 0xc5c5c5, 1.35))
    const light = new DirectionalLight(0xffffff, 4)
    light.position.set(-3, 6, 4)
    light.castShadow = true
    light.shadow.mapSize.set(512, 512)
    light.shadow.camera.left = light.shadow.camera.bottom = -3
    light.shadow.camera.right = light.shadow.camera.top = 3
    light.shadow.normalBias = .002
    light.shadow.bias = -.00002
    scene.add(light)
    const fill = new DirectionalLight(0xffffff, 1.1)
    fill.position.set(4, 2, -2)
    scene.add(fill)
    const floor = new Mesh(new PlaneGeometry(200, 200), new ShadowMaterial({ opacity: .3 }))
    floor.rotation.x = -Math.PI / 2
    floor.receiveShadow = true
    scene.add(floor)
    const shadowCanvas = document.createElement('canvas')
    shadowCanvas.width = shadowCanvas.height = 128
    const shadowContext = shadowCanvas.getContext('2d')!
    const gradient = shadowContext.createRadialGradient(64, 64, 16, 64, 64, 64)
    gradient.addColorStop(0, 'rgba(0,0,0,.8)')
    gradient.addColorStop(.55, 'rgba(0,0,0,.55)')
    gradient.addColorStop(1, 'rgba(0,0,0,0)')
    shadowContext.fillStyle = gradient
    shadowContext.fillRect(0, 0, 128, 128)
    const contactTexture = new CanvasTexture(shadowCanvas)
    const contact = new Mesh(new PlaneGeometry(2.8, 2.8), new MeshBasicMaterial({ map: contactTexture, transparent: true, opacity: .5, depthWrite: false, toneMapped: false }))
    contact.rotation.x = -Math.PI / 2
    contact.position.y = .002
    scene.add(contact)
    const { group } = createDiceModel()
    scene.add(group)
    let frame = 0
    let disposed = false
    let unavailable = false
    let rollingValue: number | null = null
    let startTime = 0
    let from = getRestQuaternion(callbacks.current.value)
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const render = () => renderer.render(scene, camera)
    const show = (value: number, rolling: boolean) => {
      cancelAnimationFrame(frame)
      if (!rolling) {
        rollingValue = null
        group.quaternion.copy(getRestQuaternion(value))
        group.position.set(0, 1, 0)
        contact.position.set(0, .002, 0)
        contact.scale.setScalar(1)
        contact.material.opacity = .5
        render()
        return
      }
      from = group.quaternion.clone()
      rollingValue = value
      startTime = performance.now()
      const animate = (now: number) => {
        if (disposed || rollingValue === null) return
        const progress = reduced ? 1 : Math.min(1, (now - startTime) / DICE_ROLL_MS)
        const pose = getDicePose(value, progress, from)
        group.quaternion.copy(pose.quaternion)
        group.position.copy(pose.position)
        contact.position.set(pose.position.x, .002, pose.position.z)
        contact.scale.setScalar(1 + pose.lift * .3)
        contact.material.opacity = .5 / (1 + pose.lift * 1.5)
        render()
        if (progress < 1) frame = requestAnimationFrame(animate)
        else {
          rollingValue = null
          callbacks.current.onSettled()
        }
      }
      frame = requestAnimationFrame(animate)
    }
    group.quaternion.copy(getRestQuaternion(callbacks.current.value))
    group.position.set(0, 1, 0)
    void renderer.compileAsync(scene, camera).then(() => {
      if (disposed || unavailable) return
      controller.current = { show }
      show(callbacks.current.value, callbacks.current.rolling)
      callbacks.current.onReady()
    }).catch(error => {
      if (disposed) return
      console.error('3D 骰子渲染准备失败', error)
      unavailable = true
      setFailed(true)
      callbacks.current.onReady()
    })
    const onLost = (event: Event) => {
      event.preventDefault()
      unavailable = true
      cancelAnimationFrame(frame)
      controller.current = null
      setFailed(true)
    }
    renderer.domElement.addEventListener('webglcontextlost', onLost)
    return () => {
      disposed = true
      cancelAnimationFrame(frame)
      controller.current = null
      renderer.domElement.removeEventListener('webglcontextlost', onLost)
      disposeDiceModel(group)
      floor.geometry.dispose()
      floor.material.dispose()
      contact.geometry.dispose()
      contact.material.dispose()
      contactTexture.dispose()
      renderer.dispose()
      renderer.forceContextLoss()
      renderer.domElement.remove()
    }
  }, [])

  useEffect(() => { controller.current?.show(props.value, props.rolling) }, [props.value, props.rolling])
  useEffect(() => {
    if (!failed || !props.rolling) return
    const timer = window.setTimeout(() => callbacks.current.onSettled(), DICE_ROLL_MS)
    return () => window.clearTimeout(timer)
  }, [failed, props.rolling])

  return <div className="first-roll-three-die" style={{ width: DICE_VIEW_SIZE, height: DICE_VIEW_SIZE, left: (110 - DICE_VIEW_SIZE) / 2, top: (110 - DICE_VIEW_SIZE) / 2 }} ref={host} role="img" aria-label={props.rolling ? '骰子滚动中' : `骰子朝上点数 ${props.value}`}>
    {failed && <span className="three-die-fallback" role="status">此浏览器无法显示 3D 骰子<br />点数：{props.value}</span>}
  </div>
}
