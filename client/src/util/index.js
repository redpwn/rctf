export * as strings from './strings'

export const encodeFile = file => new Promise((resolve, reject) => {
  const reader = new FileReader()
  reader.readAsDataURL(file)
  reader.addEventListener('load', () => resolve(reader.result))
  reader.addEventListener('error', error => reject(error))
})
