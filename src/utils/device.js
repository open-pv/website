export function isTouchDevice() {
  const isTouch =
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    navigator.msMaxTouchPoints > 0
  const isCoarse = window.matchMedia('(pointer: coarse)').matches
  if (isTouch && isCoarse) {
    console.log('The device is of type touch.')
  } else {
    console.log('The device is a laptop.')
  }
  return isTouch && isCoarse
}
