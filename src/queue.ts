import { Job, Queue, QueueParams } from './types'

interface JobController<TData> {
  data: TData
  attempts: number
}

export class _Queue<TData> implements Queue<TData> {
  public readonly job: Job<TData>
  public readonly retry: number
  public readonly concurrency: number
  public readonly logError: boolean
  public waitingQueue: JobController<TData>[]
  public runningJobs: number
  public isPaused: boolean

  constructor(params: QueueParams<TData>) {
    this.job = params.job
    this.retry = params.retry ?? 3
    this.concurrency = params.concurrency ?? Infinity
    this.logError = params.logError ?? true
    this.waitingQueue = []
    this.runningJobs = 0
    this.isPaused = false
  }

  get size(): number {
    return this.waitingQueue.length
  }

  clear(): void {
    this.waitingQueue = []
  }

  pause(): void {
    this.isPaused = true
  }

  resume(): void {
    this.isPaused = false
    const limit = this.size < this.concurrency ? this.size : this.concurrency
    for (let i = 0; i < limit; i++) {
      void this.process()
    }
  }

  enqueue(data: TData): void {
    this.waitingQueue.push({
      data,
      attempts: 0
    })
    void this.process()
  }

  enqueueBulk(dataBulk: TData[]): void {
    for (const data of dataBulk) {
      void this.enqueue(data)
    }
  }

  async process(): Promise<void> {
    if (this.isPaused || this.runningJobs >= this.concurrency) {
      return
    }

    const queueJob = this.waitingQueue.shift()
    if (!queueJob) {
      return
    }

    this.runningJobs++
    return this.job
      .promise(queueJob.data)
      .catch(error => {
        this.handleError(error, queueJob)
      })
      .finally(() => {
        this.runningJobs--
        this.process()
      })
  }

  handleError(error: Error, queueJob: JobController<TData>): void {
    if (this.logError) {
      console.error(error)
    }

    if (queueJob.attempts < this.retry) {
      queueJob.attempts++
      this.waitingQueue.unshift(queueJob)
      this.process()
    }
  }
}
