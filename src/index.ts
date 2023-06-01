import { _Queue } from './queue'
import { Queue, QueueParams, Job, JobParams } from './types'

export * from './types'

export function createJob<TData>(
  promise: (data: TData) => Promise<void>
): Job<TData> {
  return { promise }
}

export function createQueue<TData>(params: QueueParams<TData>): Queue<TData> {
  return new _Queue(params)
}
