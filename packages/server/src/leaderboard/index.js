import path from 'path'
import { Worker } from 'worker_threads'
import * as database from '../database'
import { getAllChallenges } from '../challenges'
import * as cache from '../cache'
import config from '../config/server'

const fetchData = async () => {
  const [solves, users, graphUpdate] = await Promise.all([
    database.solves.getAllSolves(),
    database.users.getAllUsers(),
    cache.leaderboard.getGraphUpdate()
  ])
  return {
    solves,
    users,
    graphUpdate,
    allChallenges: getAllChallenges()
  }
}

let updating = false

const runUpdate = async () => {
  if (config.startTime > Date.now() || updating) {
    return
  }
  updating = true
  const worker = new Worker(path.join(__dirname, 'calculate.js'), {
    workerData: {
      data: await fetchData()
    }
  })
  worker.once('message', async (data) => {
    await cache.leaderboard.setLeaderboard(data)
    await cache.leaderboard.setGraph({ leaderboards: data.graphLeaderboards })
    updating = false
  })
}

export const startUpdater = () => {
  setInterval(runUpdate, config.leaderboard.updateInterval)
  runUpdate()
}
