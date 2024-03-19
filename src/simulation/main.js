// This is the only file where both functionality and GUI stuff is allowed

import { downloadBuildings } from "./download"
import { setLocation } from "./location"

export async function main(inputValue, inputChanged, oldLocation) {
  const location = await setLocation(inputValue, inputChanged, oldLocation)

  if (typeof location !== "undefined" && location != null) {
    downloadBuildings(location, inputChanged)
  } else {
    window.setLoading(false)
    window.setShowThreeViewer(false)
    window.setShowErrorMessage(true)
  }

  if (inputChanged) {
    window.mapLocationChanged = false
  }
}
