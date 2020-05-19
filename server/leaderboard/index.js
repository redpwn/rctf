import path from 'path'
import { Worker } from 'worker_threads'
import * as database from '../database'
import { getAllChallenges } from '../challenges'
import * as cache from '../cache'
import config from '../../config/server'

const fetchData = async () => {
  const [solves, users] = await Promise.all([
    database.solves.getAllSolves(),
    database.users.getAllUsers()
  ])
  return {
    solves,
    users,
    allChallenges: getAllChallenges()
  }
}

export const runBulkGraphUpdate = async ({ start, end, challsUpdate }) => {
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
  if (config.startTime > Date.now()) {
    return
  }
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
      end: config.endTime,
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

export const startUpdater = () => {
  setInterval(runUpdate, config.leaderboard.updateInterval)
  runUpdate()
  runBulkGraphUpdate({
    start: config.startTime,
    end: Math.min(Date.now(), config.endTime)
  })
}
