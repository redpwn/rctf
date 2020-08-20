import { workerData, parentPort } from 'worker_threads'
import calculate from './calculate'

if (parentPort === null) {
  throw new Error('must be run in a worker thread')
}

const response = calculate(workerData)
parentPort.postMessage(response)
