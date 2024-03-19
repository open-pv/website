// This is the only file where both functionality and GUI stuff is allowed

import { setLocation } from "./location"

export async function main(inputValue, inputChanged, loc) {
  const newloc = await setLocation(inputValue, inputChanged, loc)

  if (typeof newloc !== "undefined" && newloc != null) {
    downloadBuildings(newloc, inputChanged)
  } else {
    window.setLoading(false)
    window.setShowThreeViewer(false)
    window.setShowErrorMessage(true)
  }

  if (inputChanged) {
    window.mapLocationChanged = false
  }
}
