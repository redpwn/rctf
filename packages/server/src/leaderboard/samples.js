import config from '../config/server'

const graphSampleTime = config.leaderboard.graphSampleTime

export const calcSamples = ({ start, end }) => {
  const samples = []
  const sampleStart = Math.ceil(start / graphSampleTime) * graphSampleTime
  const sampleEnd = Math.floor(end / graphSampleTime) * graphSampleTime

  for (let sample = sampleStart; sample <= sampleEnd; sample += graphSampleTime) {
    samples.push(sample)
  }
  return samples
}
