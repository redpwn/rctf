import path from 'path'
import { Worker } from 'worker_threads'
import * as database from '../database'
import { getAllChallenges } from '../challenges'
import * as cache from '../cache'
import config from '../config/server'
import { WorkerRequest, WorkerResponse } from './types'

const fetchData = async (): Promise<WorkerRequest> => {
  const [solves, users, graphUpdate] = await Promise.all([
    database.solves.getAllSolves(),
    database.users.getAllUsers(),
    cache.leaderboard.getGraphUpdate(),
  ])
  return {
    solves,
    users,
    graphUpdate,
    challenges: getAllChallenges(),
    config,
  }
}

let updating = false

const runUpdate = async () => {
  if (config.startTime > Date.now() || updating) {
    return
  }
  updating = true
  const worker = new Worker(path.join(__dirname, 'worker.js'), {
    workerData: await fetchData(),
  })
  worker.once('message', async (data: WorkerResponse) => {
    await cache.leaderboard.setLeaderboard(data)
    await cache.leaderboard.setGraph(data)
    updating = false
  })
}

export const startUpdater = (): void => {
  setInterval(runUpdate, config.leaderboard.updateInterval)
  void runUpdate()
}
