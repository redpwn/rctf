import config from '../../config/server'

export const calcSamples = ({ start, end }) => {
  const samples = []
  const sampleStart = Math.ceil(start / config.graphSampleTime) * config.graphSampleTime
  const sampleEnd = Math.floor(end / config.graphSampleTime) * config.graphSampleTime

  for (let sample = sampleStart; sample <= sampleEnd; sample += config.graphSampleTime) {
    samples.push(sample)
  }
  return samples
}

export const getPreviousSample = () => {
  return Math.floor(Math.min(Date.now(), config.endTime) / config.graphSampleTime) * config.graphSampleTime
}
