import { Job, JobController, Queue, QueueParams } from './types'

export class _Queue<TData> implements Queue<TData> {
  public readonly job: Job<TData>
  public readonly maxAttempts: number
  public readonly maxParallelProcs: number
  public readonly logError: boolean
  public waitingQueue: JobController<TData>[]
  public runningJobs: number
  public isPaused: boolean

  constructor(params: QueueParams<TData>) {
    this.job = params.job
    this.maxAttempts = params.maxAttempts ?? 3
    this.maxParallelProcs = params.maxParallelProcs ?? Infinity
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

  stop(): void {
    this.isPaused = true
  }

  resume(): void {
    this.isPaused = false
    for (let i = 0; i < this.maxParallelProcs; i++) {
      this.process()
    }
  }

  enqueue(data: TData): void {
    this.waitingQueue.push({
      data,
      attempts: 0
    })
    this.process()
  }

  enqueueBulk(dataBulk: TData[]): void {
    for (const data of dataBulk) {
      this.enqueue(data)
    }
  }

  handleError(error: Error, queueJob: JobController<TData>): void {
    if (this.logError) {
      console.error(error)
    }

    if (queueJob.attempts < this.maxAttempts) {
      queueJob.attempts++
      this.waitingQueue.unshift(queueJob)
      this.process()
    }
  }

  async process(): Promise<void> {
    if (this.isPaused || this.runningJobs >= this.maxParallelProcs) {
      return
    }

    const queueJob = this.waitingQueue.shift()
    if (!queueJob) {
      return
    }

    this.runningJobs++
    this.job
      .promise(queueJob.data)
      .catch(error => {
        this.handleError(error, queueJob)
      })
      .finally(() => {
        this.runningJobs--
        this.process()
      })
  }
}
