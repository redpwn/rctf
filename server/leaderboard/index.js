const path = require('path')
const { Worker } = require('worker_threads')
const database = require('../database')
const challenges = require('../challenges')
const cache = require('../cache')
const config = require('../../config')

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

const runUpdate = async () => {
  const worker = new Worker(path.join(__dirname, 'calculate.js'), {
    workerData: await fetchData()
  })
  worker.once('message', (data) => {
    cache.leaderboard.setLeaderboard(data)
  })
}

module.exports = {
  start: () => {
    setInterval(runUpdate, config.leaderboardUpdateInterval)
    runUpdate()
  }
}
