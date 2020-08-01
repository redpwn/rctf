const nameRegex = /^[ -~]{2,64}$/

export const validateName = (name: string): boolean => {
  return nameRegex.test(name)
}
