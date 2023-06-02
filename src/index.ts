import { JobBuilder } from './job-builder'
import { _Queue } from './queue'
import { Queue, QueueParams, Job, JobPromise, JobCatalog } from './types'

export * from './types'

export function createJob<TData>(promise: JobPromise<TData>): Job<TData> {
  return { promise }
}

export function createJobs<
  TCatalog extends JobCatalog = {}
>(): JobBuilder<TCatalog> {
  return new JobBuilder()
}

export function createQueue<TData>(params: QueueParams<TData>): Queue<TData> {
  return new _Queue(params)
}
