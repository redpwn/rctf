import got from 'got'
import config from '../config/server'

export enum RecaptchaProtectedActions {
  register = 'register',
  recover = 'recover',
  setEmail = 'setEmail'
}

export const verifyRecaptchaCode = async (code: string): Promise<boolean> => {
  if (!config.recaptcha) {
    throw new Error('recaptcha is not configured')
  }
  const { body }: { body: { success: boolean } } = await got({
    url: 'https://www.google.com/recaptcha/api/siteverify',
    method: 'POST',
    responseType: 'json',
    form: {
      secret: config.recaptcha.secretKey,
      response: code
    }
  })
  return body.success
}

export const checkProtectedAction = (action: RecaptchaProtectedActions): boolean => {
  return config.recaptcha?.protectedActions.includes(action) ?? false
}
