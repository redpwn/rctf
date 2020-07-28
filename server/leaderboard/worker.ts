import { workerData, parentPort } from 'worker_threads'
import calculate from './calculate'

parentPort.postMessage(calculate(workerData.data))
