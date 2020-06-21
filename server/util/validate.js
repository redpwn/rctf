const nameRegex = /^[ -~]{2,64}$/

export const validateName = (name) => {
  return nameRegex.test(name)
}
