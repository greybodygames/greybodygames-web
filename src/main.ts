import './style.css'
import { animate, springValue } from 'motion'

const identityStage = document.querySelector<HTMLElement>('.identity-stage')
const logoAnchor = document.querySelector<HTMLElement>('[data-logo-anchor]')
const plane = document.querySelector<HTMLElement>('[data-wordmark-plane]')
const wordmarkO = document.querySelector<HTMLElement>('[data-wordmark-o]')
const orbitCanvas = document.querySelector<HTMLCanvasElement>('[data-orbit-canvas]')
const starfieldCanvas = document.querySelector<HTMLCanvasElement>('[data-starfield-canvas]')
const connectorCanvas = document.querySelector<HTMLCanvasElement>('[data-technical-connectors]')
const annotationIndices = {
  about: document.querySelector<HTMLElement>('.annotation-about > .annotation-index'),
  work: document.querySelector<HTMLElement>('.annotation-work > .annotation-index'),
}
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)')

type Star = {
  x: number
  y: number
  radius: number
  alpha: number
  depth: number
}

type OrbitRing = {
  inset: number
  alpha: number
  width: number
  dash?: number[]
}

type OrbitArc = {
  inset: number
  alpha: number
  width: number
  start: number
  length: number
  degreesPerSecond: number
  dash?: number[]
}

type OrbitPoint = {
  inset: number
  angle: number
  size: number
  alpha: number
  degreesPerSecond: number
}

const createSeededRandom = (seed: number) => {
  let value = seed

  return () => {
    value |= 0
    value = (value + 0x6d2b79f5) | 0

    let result = Math.imul(value ^ (value >>> 15), 1 | value)
    result = (result + Math.imul(result ^ (result >>> 7), 61 | result)) ^ result

    return ((result ^ (result >>> 14)) >>> 0) / 4294967296
  }
}

const createStarfield = (count: number) => {
  const random = createSeededRandom(0x9e3779b9)

  return Array.from({ length: count }, (): Star => {
    const depth = 0.28 + random() * 0.9
    const brightness = random()

    return {
      x: random(),
      y: random(),
      radius: 0.45 + random() * random() * 1.45,
      alpha: 0.18 + brightness * brightness * 0.62,
      depth,
    }
  })
}

const stars = createStarfield(210)
let starfieldParallaxX = 0
let starfieldParallaxY = 0

const orbitRings: OrbitRing[] = [
  { inset: 0, alpha: 0.16, width: 1 },
  { inset: 8, alpha: 0.2, width: 1, dash: [7, 8] },
  { inset: 15, alpha: 0.28, width: 0.75 },
  { inset: 22, alpha: 0.34, width: 0.85 },
  { inset: 29, alpha: 0.42, width: 1.2 },
]

const orbitArcs: OrbitArc[] = [
  { inset: 4, alpha: 0.56, width: 1.15, start: 252, length: 168, degreesPerSecond: -5.5 },
  { inset: 12, alpha: 0.62, width: 1.15, start: 292, length: 156, degreesPerSecond: -7.25 },
  { inset: 19, alpha: 0.44, width: 1, start: 34, length: 136, degreesPerSecond: -4.25 },
  { inset: 26, alpha: 0.5, width: 1, start: 118, length: 146, degreesPerSecond: -8.5, dash: [5, 6] },
]

const orbitPoints: OrbitPoint[] = [
  { inset: 0, angle: 312, size: 7, alpha: 0.74, degreesPerSecond: 9.5 },
  { inset: 8, angle: 132, size: 7, alpha: 0.86, degreesPerSecond: 12.5 },
  { inset: 15, angle: 246, size: 8, alpha: 0.78, degreesPerSecond: 7.75 },
  { inset: 22, angle: 34, size: 6, alpha: 0.7, degreesPerSecond: 14 },
  { inset: 29, angle: 78, size: 7, alpha: 0.76, degreesPerSecond: 10.75 },
]

const toRadians = (degrees: number) => (degrees * Math.PI) / 180
const radiusFromInset = (size: number, inset: number) => (size * (1 - inset / 50)) / 2
const wrapCoordinate = (value: number, size: number) => ((value % size) + size) % size
const logoVisibleRadiusScale = 58.208328 / (135.46666 / 2)
const connectorEndpointRadius = 4.5
const elementCircle = (element: Element, containerRect: DOMRect) => {
  const rect = element.getBoundingClientRect()

  return {
    radius: Math.min(rect.width, rect.height) / 2,
    x: rect.left + rect.width / 2 - containerRect.left,
    y: rect.top + rect.height / 2 - containerRect.top,
  }
}

const pointOnCircleEdge = (from: ReturnType<typeof elementCircle>, to: { x: number; y: number }) => {
  const dx = to.x - from.x
  const dy = to.y - from.y
  const distance = Math.hypot(dx, dy)

  if (distance === 0) {
    return from
  }

  return {
    x: from.x + (dx / distance) * from.radius,
    y: from.y + (dy / distance) * from.radius,
  }
}

const pointOnLogoEdge = (logo: ReturnType<typeof elementCircle>, angle: number) => ({
  x: logo.x + Math.cos(toRadians(angle)) * logo.radius,
  y: logo.y + Math.sin(toRadians(angle)) * logo.radius,
})

const drawTechnicalConnectors = () => {
  if (!connectorCanvas || !logoAnchor) {
    return
  }

  const rect = connectorCanvas.getBoundingClientRect()

  if (rect.width <= 0 || rect.height <= 0) {
    return
  }

  const pixelRatio = Math.min(window.devicePixelRatio || 1, 2)
  const targetWidth = Math.round(rect.width * pixelRatio)
  const targetHeight = Math.round(rect.height * pixelRatio)

  if (connectorCanvas.width !== targetWidth || connectorCanvas.height !== targetHeight) {
    connectorCanvas.width = targetWidth
    connectorCanvas.height = targetHeight
  }

  const context = connectorCanvas.getContext('2d')

  if (!context) {
    return
  }

  const logo = elementCircle(logoAnchor, rect)
  logo.radius *= logoVisibleRadiusScale
  const connectors = [
    { index: annotationIndices.work, logoAngle: -30 },
    { index: annotationIndices.about, logoAngle: 30 },
  ]

  context.clearRect(0, 0, connectorCanvas.width, connectorCanvas.height)
  context.save()
  context.scale(pixelRatio, pixelRatio)
  context.lineWidth = 1
  context.strokeStyle = 'rgba(255, 255, 255, 0.46)'

  connectors.forEach(({ index, logoAngle }) => {
    if (!index) {
      return
    }

    const logoEdge = pointOnLogoEdge(logo, logoAngle)
    const indexCircle = elementCircle(index, rect)
    const indexEdge = pointOnCircleEdge(indexCircle, logoEdge)
    const connectorEnd = pointOnCircleEdge({ ...logoEdge, radius: connectorEndpointRadius }, indexEdge)

    context.beginPath()
    context.moveTo(indexEdge.x, indexEdge.y)
    context.lineTo(connectorEnd.x, connectorEnd.y)
    context.stroke()

    context.beginPath()
    context.arc(logoEdge.x, logoEdge.y, connectorEndpointRadius, 0, Math.PI * 2)
    context.stroke()
  })

  context.restore()
}

const drawStarfieldCanvas = () => {
  if (!starfieldCanvas) {
    return
  }

  const rect = starfieldCanvas.getBoundingClientRect()
  const width = rect.width
  const height = rect.height

  if (width <= 0 || height <= 0) {
    return
  }

  const pixelRatio = Math.min(window.devicePixelRatio || 1, 2)
  const targetWidth = Math.round(width * pixelRatio)
  const targetHeight = Math.round(height * pixelRatio)

  if (starfieldCanvas.width !== targetWidth || starfieldCanvas.height !== targetHeight) {
    starfieldCanvas.width = targetWidth
    starfieldCanvas.height = targetHeight
  }

  const context = starfieldCanvas.getContext('2d')

  if (!context) {
    return
  }

  context.clearRect(0, 0, starfieldCanvas.width, starfieldCanvas.height)
  context.save()
  context.scale(pixelRatio, pixelRatio)

  stars.forEach((star) => {
    const x = wrapCoordinate(star.x * width + starfieldParallaxX * star.depth, width)
    const y = wrapCoordinate(star.y * height + starfieldParallaxY * star.depth, height)

    context.beginPath()
    context.fillStyle = `rgba(255, 255, 255, ${star.alpha})`
    context.arc(x, y, star.radius, 0, Math.PI * 2)
    context.fill()
  })

  context.restore()
}

const drawOrbitCanvas = (elapsedSeconds = 0) => {
  if (!orbitCanvas) {
    return
  }

  const rect = orbitCanvas.getBoundingClientRect()
  const size = Math.min(rect.width, rect.height)

  if (size <= 0) {
    return
  }

  const pixelRatio = Math.min(window.devicePixelRatio || 1, 2)
  const targetSize = Math.round(size * pixelRatio)

  if (orbitCanvas.width !== targetSize || orbitCanvas.height !== targetSize) {
    orbitCanvas.width = targetSize
    orbitCanvas.height = targetSize
  }

  const context = orbitCanvas.getContext('2d')

  if (!context) {
    return
  }

  context.clearRect(0, 0, orbitCanvas.width, orbitCanvas.height)
  context.save()
  context.scale(pixelRatio, pixelRatio)
  context.translate(size / 2, size / 2)
  context.lineCap = 'round'
  context.lineJoin = 'round'

  orbitRings.forEach((ring) => {
    context.beginPath()
    context.setLineDash(ring.dash ?? [])
    context.strokeStyle = `rgba(255, 255, 255, ${ring.alpha})`
    context.lineWidth = ring.width
    context.arc(0, 0, radiusFromInset(size, ring.inset), 0, Math.PI * 2)
    context.stroke()
  })

  orbitArcs.forEach((arc) => {
    const radius = radiusFromInset(size, arc.inset)
    const angleOffset = reduceMotion.matches ? 0 : elapsedSeconds * arc.degreesPerSecond
    const start = toRadians(arc.start + angleOffset)
    const end = toRadians(arc.start + arc.length + angleOffset)

    context.beginPath()
    context.setLineDash(arc.dash ?? [])
    context.strokeStyle = `rgba(255, 255, 255, ${arc.alpha})`
    context.lineWidth = arc.width
    context.arc(0, 0, radius, start, end)
    context.stroke()
  })

  context.setLineDash([])

  orbitPoints.forEach((point) => {
    const radius = radiusFromInset(size, point.inset)
    const angleOffset = reduceMotion.matches ? 0 : elapsedSeconds * point.degreesPerSecond
    const angle = toRadians(point.angle + angleOffset - 90)
    const x = Math.cos(angle) * radius
    const y = Math.sin(angle) * radius
    const dotRadius = point.size / 2

    context.beginPath()
    context.fillStyle = `rgba(255, 255, 255, ${point.alpha})`
    context.arc(x, y, dotRadius, 0, Math.PI * 2)
    context.fill()
  })

  context.restore()
}

let orbitAnimationFrame: number | null = null
let orbitAnimationStartedAt = 0

const stopOrbitAnimation = () => {
  if (orbitAnimationFrame === null) {
    return
  }

  window.cancelAnimationFrame(orbitAnimationFrame)
  orbitAnimationFrame = null
}

const renderOrbitAnimation = (timestamp: number) => {
  drawOrbitCanvas((timestamp - orbitAnimationStartedAt) / 1000)

  if (!reduceMotion.matches) {
    orbitAnimationFrame = window.requestAnimationFrame(renderOrbitAnimation)
  }
}

const startOrbitAnimation = () => {
  stopOrbitAnimation()

  if (reduceMotion.matches) {
    drawOrbitCanvas()
    return
  }

  orbitAnimationStartedAt = performance.now()
  orbitAnimationFrame = window.requestAnimationFrame(renderOrbitAnimation)
}

const alignWordmarkPivot = () => {
  if (!identityStage || !logoAnchor || !plane || !wordmarkO) {
    return
  }

  const currentTransform = plane.style.transform
  plane.style.transform = 'translate3d(0, 0, 0)'

  const stageRect = identityStage.getBoundingClientRect()
  const planeRect = plane.getBoundingClientRect()
  const wordmarkORect = wordmarkO.getBoundingClientRect()
  const pivotX = wordmarkORect.left + wordmarkORect.width / 2
  const pivotY = wordmarkORect.top + wordmarkORect.height / 2

  identityStage.style.setProperty('--logo-left', `${pivotX - stageRect.left}px`)
  identityStage.style.setProperty('--logo-top', `${pivotY - stageRect.top}px`)
  plane.style.setProperty('--wordmark-pivot-x', `${pivotX - planeRect.left}px`)
  plane.style.setProperty('--wordmark-pivot-y', `${pivotY - planeRect.top}px`)

  plane.style.transform = currentTransform
  drawTechnicalConnectors()
}

alignWordmarkPivot()
window.addEventListener('resize', alignWordmarkPivot)
window.addEventListener('resize', () => {
  drawOrbitCanvas()
  drawStarfieldCanvas()
  drawTechnicalConnectors()
})
window.addEventListener('load', alignWordmarkPivot)
window.addEventListener('load', () => {
  drawStarfieldCanvas()
  startOrbitAnimation()
  drawTechnicalConnectors()
})
document.fonts.ready.then(alignWordmarkPivot)

if (starfieldCanvas) {
  const starfieldCanvasObserver = new ResizeObserver(drawStarfieldCanvas)
  starfieldCanvasObserver.observe(starfieldCanvas)
  drawStarfieldCanvas()
}

if (connectorCanvas) {
  const connectorCanvasObserver = new ResizeObserver(drawTechnicalConnectors)
  connectorCanvasObserver.observe(connectorCanvas)
  drawTechnicalConnectors()
}

if (orbitCanvas) {
  const orbitCanvasObserver = new ResizeObserver(() => drawOrbitCanvas())
  orbitCanvasObserver.observe(orbitCanvas)
  startOrbitAnimation()
}

reduceMotion.addEventListener('change', startOrbitAnimation)

if (plane && !reduceMotion.matches) {
  const rotationX = springValue(0 as number, { stiffness: 90, damping: 18, mass: 0.9 })
  const rotationY = springValue(0 as number, { stiffness: 90, damping: 18, mass: 0.9 })
  const translateX = springValue(0 as number, { stiffness: 100, damping: 20, mass: 0.8 })
  const translateY = springValue(0 as number, { stiffness: 100, damping: 20, mass: 0.8 })
  const translateZ = springValue(0 as number, { stiffness: 85, damping: 19, mass: 0.9 })

  const render = () => {
    plane.style.transform = [
      `translate3d(${translateX.get().toFixed(2)}px, ${translateY.get().toFixed(2)}px, ${translateZ.get().toFixed(2)}px)`,
      `rotateX(${rotationX.get().toFixed(2)}deg)`,
      `rotateY(${rotationY.get().toFixed(2)}deg)`,
    ].join(' ')
  }

  const unsubscribe = [
    rotationX.on('change', render),
    rotationY.on('change', render),
    translateX.on('change', render),
    translateY.on('change', render),
    translateZ.on('change', render),
  ]

  const setTargets = (event: PointerEvent) => {
    const x = event.clientX / window.innerWidth - 0.5
    const y = event.clientY / window.innerHeight - 0.5
    const isCompact = window.matchMedia('(max-width: 980px)').matches
    const rotationScale = isCompact ? 18 : 32
    const shiftScale = isCompact ? 10 : 24

    rotationX.set(y * -rotationScale)
    rotationY.set(x * rotationScale * 1.18)
    translateX.set(x * shiftScale)
    translateY.set(y * shiftScale)
    translateZ.set((Math.abs(x) + Math.abs(y)) * 42)

    if (starfieldCanvas) {
      starfieldParallaxX = x * -28
      starfieldParallaxY = y * -18
      drawStarfieldCanvas()
    }
  }

  const resetTargets = () => {
    rotationX.set(0)
    rotationY.set(0)
    translateX.set(0)
    translateY.set(0)
    translateZ.set(0)

    if (starfieldCanvas) {
      starfieldParallaxX = 0
      starfieldParallaxY = 0
      drawStarfieldCanvas()
    }
  }

  window.addEventListener('pointermove', setTargets, { passive: true })
  window.addEventListener('pointerleave', resetTargets)
  render()
  alignWordmarkPivot()

  reduceMotion.addEventListener('change', () => {
    unsubscribe.forEach((stop) => stop())
    resetTargets()
    animate(plane, { transform: 'translate3d(0, 0, 0)' }, { duration: 0.2 })
  })
}
