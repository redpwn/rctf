const config = require('../../config/server')

const calcSamples = ({ start, end }) => {
  const samples = []
  const sampleStart = Math.ceil(start / config.graphSampleTime) * config.graphSampleTime
  const sampleEnd = Math.floor(end / config.graphSampleTime) * config.graphSampleTime

  for (let sample = sampleStart; sample <= sampleEnd; sample += config.graphSampleTime) {
    samples.push(sample)
  }
  return samples
}

const getNextSample = () => {
  return Math.ceil(Date.now() / config.graphSampleTime) * config.graphSampleTime
}

module.exports = {
  calcSamples,
  getNextSample
}
