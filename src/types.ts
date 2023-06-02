export type JobPromise<TData> = (data: TData) => Promise<void>

export interface Job<TData> {
  promise: JobPromise<TData>
}

export type JobCatalog = Record<string, Job<any>>

/**
 * Type alias to use with `Queue` type
 * @example
 * type MailJob = typeof mailJob
 * type MailQueue = Queue<InferData<MailJob>>
 */
export type InferData<TJob extends Job<any>> = TJob extends Job<infer TData>
  ? TData
  : never

export interface QueueParams<TData> {
  /**
   * Define the max number of concurrency processes
   * @default Infinity
   */
  concurrency?: number
  /**
   * Define the max number of execution retries for each promise
   * @default 3
   */
  retry?: number
  /**
   * Define if promise errors will be logged to the console
   * @default true
   */
  logError?: boolean
  /**
   * Is the promise that will be executed for each queue's item
   */
  job: Job<TData>
}

export interface Queue<TData> {
  /**
   * Add an item to queue and runs it in sequence
   */
  enqueue(data: TData): void
  /**
   * Calls `enqueue` for each item of the given list
   */
  enqueueBulk(data: TData[]): void
  /**
   * Clears waiting queue
   */
  clear(): void
  /**
   * Stops queue process until `resume` is called
   */
  pause(): void
  /**
   * Resume the process of the queue after `pause` is called
   */
  resume(): void
  /**
   * Returns the current queue's size
   */
  size: number
}
