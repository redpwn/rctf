const path = require('path')
const fs = require('fs')
const nodemailer = require('nodemailer')
const mustache = require('mustache')
const config = require('../../config')

const transport = nodemailer.createTransport(config.smtpUrl)
const verifyHtml = fs.readFileSync(path.join(__dirname, 'emails/verify.html')).toString()
const verifyText = fs.readFileSync(path.join(__dirname, 'emails/verify.txt')).toString()

const sendVerification = async ({ token, email }) => {
  const emailView = {
    ctf_name: config.ctfName,
    origin: config.origin,
    token: encodeURIComponent(token)
  }
  await transport.sendMail({
    from: `${config.ctfName} <${config.emailFrom}>`,
    to: email,
    subject: `Email verification for ${config.ctfName}`,
    html: mustache.render(verifyHtml, emailView),
    text: mustache.render(verifyText, emailView)
  })
}

module.exports = {
  sendVerification
}
