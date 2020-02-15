const path = require('path')
const fs = require('fs')
const nodemailer = require('nodemailer')
const mustache = require('mustache')

const transport = nodemailer.createTransport(process.env.RCTF_SMTP_URL)
const fromAddress = process.env.RCTF_EMAIL_FROM
const ctfName = process.env.RCTF_NAME
const origin = process.env.RCTF_ORIGIN
const verifyHtml = fs.readFileSync(path.join(__dirname, 'emails/verify.html')).toString()
const verifyText = fs.readFileSync(path.join(__dirname, 'emails/verify.txt')).toString()

const sendVerification = async ({ token, email }) => {
  const emailView = {
    ctf_name: ctfName,
    origin,
    token: encodeURIComponent(token)
  }
  await transport.sendMail({
    from: `${ctfName} <${fromAddress}>`,
    to: email,
    subject: `Email verification for ${ctfName}`,
    html: mustache.render(verifyHtml, emailView),
    text: mustache.render(verifyText, emailView)
  })
}

module.exports = {
  sendVerification
}
