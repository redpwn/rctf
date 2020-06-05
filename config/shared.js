module.exports = {
  divisions: {
    'High School': 0,
    College: 1,
    Other: 2
  },
  defaultDivision: 2,
  ctfName: process.env.RCTF_NAME,
  ctftimeClientId: process.env.RCTF_CTFTIME_CLIENT_ID,
  origin: process.env.RCTF_ORIGIN,
  startTime: parseInt(process.env.RCTF_START_TIME) || Date.now() - 24 * 60 * 60 * 1000,
  endTime: parseInt(process.env.RCTF_END_TIME) || Date.now() + 24 * 60 * 60 * 1000
}
