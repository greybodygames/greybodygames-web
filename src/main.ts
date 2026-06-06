import './style.css'
import { animate, springValue } from 'motion'

const identityStage = document.querySelector<HTMLElement>('.identity-stage')
const logoAnchor = document.querySelector<HTMLElement>('[data-logo-anchor]')
const plane = document.querySelector<HTMLElement>('[data-wordmark-plane]')
const wordmarkO = document.querySelector<HTMLElement>('[data-wordmark-o]')
const technicalLayer = document.querySelector<SVGElement>('.poster-technical-layer')
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)')

const alignLogoToWordmark = () => {
  if (!identityStage || !logoAnchor || !wordmarkO) {
    return
  }

  const stageRect = identityStage.getBoundingClientRect()
  const wordmarkORect = wordmarkO.getBoundingClientRect()

  identityStage.style.setProperty('--logo-left', `${wordmarkORect.left - stageRect.left + wordmarkORect.width / 2}px`)
  identityStage.style.setProperty('--logo-top', `${wordmarkORect.top - stageRect.top + wordmarkORect.height / 2}px`)
}

alignLogoToWordmark()
window.addEventListener('resize', alignLogoToWordmark)
document.fonts.ready.then(alignLogoToWordmark)

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

    if (technicalLayer) {
      technicalLayer.style.setProperty('--parallax-x', `${(x * -16).toFixed(2)}px`)
      technicalLayer.style.setProperty('--parallax-y', `${(y * -12).toFixed(2)}px`)
    }
  }

  const resetTargets = () => {
    rotationX.set(0)
    rotationY.set(0)
    translateX.set(0)
    translateY.set(0)
    translateZ.set(0)

    if (technicalLayer) {
      technicalLayer.style.setProperty('--parallax-x', '0px')
      technicalLayer.style.setProperty('--parallax-y', '0px')
    }
  }

  window.addEventListener('pointermove', setTargets, { passive: true })
  window.addEventListener('pointerleave', resetTargets)
  render()
  alignLogoToWordmark()

  reduceMotion.addEventListener('change', () => {
    unsubscribe.forEach((stop) => stop())
    resetTargets()
    animate(plane, { transform: 'translate3d(0, 0, 0)' }, { duration: 0.2 })
  })
}
