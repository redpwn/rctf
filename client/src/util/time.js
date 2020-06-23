export const formatTime = (time) => {
  const date = new Date(time)
  const tz = date.getTimezoneOffset()
  const tzHour = String(Math.floor(Math.abs(tz) / 60)).padStart(2, '0')
  const tzMinute = String(Math.abs(tz) % 60).padStart(2, '0')
  const tzSign = tz > 0 ? '-' : '+'
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString()} UTC${tzSign}${tzHour}:${tzMinute}`
}
