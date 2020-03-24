const path = require('path')
const { Worker } = require('worker_threads')
const database = require('../database')
const challenges = require('../challenges')
const cache = require('../cache')
const config = require('../../config/server')

const fetchData = async () => {
  const [solves, users] = await Promise.all([
    database.solves.getAllSolves(),
    database.users.getAllUsers()
  ])
  return {
    solves,
    users,
    allChallenges: challenges.getAllChallenges()
  }
}

let updating = false

const runUpdate = async () => {
  if (updating) {
    return
  }
  updating = true
  const worker = new Worker(path.join(__dirname, 'calculate.js'), {
    workerData: {
      graph: false,
      lastUpdate: await cache.leaderboard.getGraphUpdate(),
      data: await fetchData()
    }
  })
  worker.once('message', async (data) => {
    await cache.leaderboard.setLeaderboard(data)
    if (data.isSample) {
      await cache.leaderboard.setGraph({
        leaderboards: [{
          sample: data.sample,
          scores: data.sampleScores
        }]
      })
    }
    updating = false
  })
}

const runBulkGraphUpdate = async ({ start, end }) => {
  const worker = new Worker(path.join(__dirname, 'calculate.js'), {
    workerData: {
      graph: true,
      start,
      end,
      data: await fetchData()
    }
  })
  worker.once('message', async (data) => {
    await cache.leaderboard.setGraph(data)
  })
}

module.exports = {
  startUpdater: () => {
    setInterval(runUpdate, config.leaderboardUpdateInterval)
    runUpdate()
    runBulkGraphUpdate({
      start: config.startTime,
      end: Math.min(Date.now(), config.endTime)
    })
  },
  runBulkGraphUpdate
}
