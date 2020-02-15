module.exports = {
  rDeployDirectory: '.rdeploy',
  verifyEmail: true,
  tokenKey: process.env.RCTF_TOKEN_KEY,
  ctfName: process.env.RCTF_NAME,
  origin: process.env.RCTF_ORIGIN,
  databaseUrl: process.env.RCTF_DATABASE_URL,
  redisUrl: process.env.RCTF_REDIS_URL,
  smtpUrl: process.env.RCTF_SMTP_URL,
  emailFrom: process.env.RCTF_EMAIL_FROM,
  divisions: {
    eligible: 0,
    ineligible: 1
  },
  loginTimeout: 10 * 60 * 1000
}
