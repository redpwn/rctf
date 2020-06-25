export const formatAbsoluteTime = (time) => {
  const date = new Date(time)
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`
}

export const formatAbsoluteTimeWithTz = (time) => {
  const date = new Date(time)
  const tz = date.getTimezoneOffset()
  const tzHour = String(Math.floor(Math.abs(tz) / 60)).padStart(2, '0')
  const tzMinute = String(Math.abs(tz) % 60).padStart(2, '0')
  const tzSign = tz > 0 ? '-' : '+'
  return `${formatAbsoluteTime(time)} UTC${tzSign}${tzHour}:${tzMinute}`
}

export const formatRelativeTime = (time) => {
  const ms = Date.now() - time
  const sec = Math.floor(ms / 1000)
  if (sec < 60) {
    return 'just now'
  }
  const min = Math.floor(sec / 60)
  if (min < 60) {
    return `${min} minute${min === 1 ? '' : 's'} ago`
  }
  const hr = Math.floor(min / 60)
  if (hr < 24) {
    return `${hr} hour${hr === 1 ? '' : 's'} ago`
  }
  const days = Math.floor(hr / 24)
  if (days < 7) {
    return `${days} day${days === 1 ? '' : 's'} ago`
  }
  return formatAbsoluteTime(time)
}
