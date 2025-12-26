import { colormaps } from '@openpv/simshady'
import { c0, c1, c2 } from '@/constants/colors'

export const rgbToCss = ([r, g, b]) => {
  return `rgb(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)})`
}

export const generateColorGradient = (steps = 50) => {
  const colorMap = colormaps.interpolateThreeColors({ c0, c1, c2 })
  return Array.from({ length: steps }, (_, i) => {
    const t = i / (steps - 1)
    return rgbToCss(colorMap(t))
  }).join(',')
}
