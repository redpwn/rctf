import path from 'path'
import fs from 'fs'
import nodemailer from 'nodemailer'
import mustache from 'mustache'
import config from '../../config/server'

const transport = nodemailer.createTransport(config.smtpUrl)
const verifyHtml = fs.readFileSync(path.join(__dirname, 'emails/verify.html')).toString()
const verifyText = fs.readFileSync(path.join(__dirname, 'emails/verify.txt')).toString()

export const sendVerification = async ({ token, kind, email }) => {
  const emailView = {
    ctf_name: config.ctfName,
    origin: config.origin,
    token: encodeURIComponent(token),
    register: kind === 'register',
    recover: kind === 'recover',
    update: kind === 'update'
  }
  let subject
  if (kind === 'register') {
    subject = `Email verification for ${config.ctfName}`
  } else if (kind === 'recover') {
    subject = `Account recovery for ${config.ctfName}`
  } else if (kind === 'update') {
    subject = `Update your ${config.ctfName} email`
  }

  await transport.sendMail({
    from: `${config.ctfName} <${config.emailFrom}>`,
    to: email,
    subject,
    html: mustache.render(verifyHtml, emailView),
    text: mustache.render(verifyText, emailView)
  })
}
