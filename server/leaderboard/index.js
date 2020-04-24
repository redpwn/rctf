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

const runBulkGraphUpdate = async ({ start, end, challsUpdate }) => {
  const worker = new Worker(path.join(__dirname, 'calculate.js'), {
    workerData: {
      graph: true,
      start,
      end,
      challsUpdate,
      data: await fetchData()
    }
  })
  worker.once('message', async (data) => {
    await cache.leaderboard.setGraph(data)
  })
}

let updating = false

const runUpdate = async () => {
  if (updating) {
    return
  }
  updating = true
  const updateData = await cache.leaderboard.getGraphUpdate()
  if (updateData.challsUpdate > updateData.graphRecalc) {
    runBulkGraphUpdate({
      start: config.startTime,
      end: Math.min(Date.now(), config.endTime),
      challsUpdate: updateData.challsUpdate
    })
  }
  const worker = new Worker(path.join(__dirname, 'calculate.js'), {
    workerData: {
      graph: false,
      lastUpdate: updateData.graphUpdate,
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
