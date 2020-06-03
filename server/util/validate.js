const nameRegex = /^[ -~]{0,64}$/

export const validateName = (name) => {
  return nameRegex.test(name)
}
