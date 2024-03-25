// This is the only file where both functionality and GUI stuff is allowed

import { downloadBuildings } from "./download"
import { setLocation } from "./location"
import { calc_webgl } from "./pv_simulation"

export async function main(inputValue, inputChanged, oldLocation) {
  const location = await setLocation(inputValue, inputChanged, oldLocation)

  if (typeof location !== "undefined" && location != null) {
    const { loc, laser_points, resetCamera } = downloadBuildings(
      location,
      inputChanged
    )

    calc_webgl(loc, laser_points, resetCamera)
  } else {
    window.setLoading(false)
    window.setShowThreeViewer(false)
    window.setShowErrorMessage(true)
  }

  if (inputChanged) {
    window.mapLocationChanged = false
  }
}
