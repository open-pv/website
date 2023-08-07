export function addToArray(ar1, ar2) {
  for (var i = 0; i < ar1.length; i++) {
    ar1[i] += ar2[i]
  }
}

// from https://observablehq.com/@flimsyhat/webgl-color-maps
export function intensity_colormap(t) {
  //viridis
  const c0 = [0.2777273272234177, 0.005407344544966578, 0.3340998053353061]
  const c1 = [0.1050930431085774, 1.404613529898575, 1.384590162594685]
  const c2 = [-0.3308618287255563, 0.214847559468213, 0.09509516302823659]
  const c3 = [-4.634230498983486, -5.799100973351585, -19.33244095627987]
  const c4 = [6.228269936347081, 14.17993336680509, 56.69055260068105]
  const c5 = [4.776384997670288, -13.74514537774601, -65.35303263337234]
  const c6 = [-5.435455855934631, 4.645852612178535, 26.3124352495832]

  //const res = c0*0.004+t*(c1+t*(c2+t*(c3+t*(c4+t*(c5+t*c6)))))*0.004;
  const res = [
    c0[0] +
      t *
        (c1[0] +
          t * (c2[0] + t * (c3[0] + t * (c4[0] + t * (c5[0] + t * c6[0]))))),
    c0[1] +
      t *
        (c1[1] +
          t * (c2[1] + t * (c3[1] + t * (c4[1] + t * (c5[1] + t * c6[1]))))),
    c0[2] +
      t *
        (c1[2] +
          t * (c2[2] + t * (c3[2] + t * (c4[2] + t * (c5[2] + t * c6[2]))))),
  ]
  return res
}

export function deleteChildDivs(parentDivClass) {
  let parentDiv = document.getElementsByClassName(parentDivClass)
  for (var i = 0; i < parentDiv.length; i++) {
    let div = parentDiv[i]

    // Remove all child elements by setting innerHTML to an empty string
    div.innerHTML = ""
  }
}
