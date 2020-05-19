export const placementString = (placement) => {
  let placementStr = String(placement)
  if (placement >= 11 && placement <= 13) {
    placementStr += 'th place'
  } else {
    switch (placement % 10) {
      case 1:
        placementStr += 'st place'
        break
      case 2:
        placementStr += 'nd place'
        break
      case 3:
        placementStr += 'rd place'
        break
      default:
        placementStr += 'th place'
    }
  }
  return placementStr
}
