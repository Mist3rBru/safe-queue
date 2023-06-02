export type JobPromise<TData> = (data: TData) => Promise<void>

export interface JobParams<TData> {
  promise: JobPromise<TData>
}

export interface Job<TData> {
  promise: JobPromise<TData>
}

export type JobCatalog = Record<string, Job<any>>

export interface QueueParams<TData> {
  maxParallelProcs?: number
  maxRetries?: number
  logError?: boolean
  job: Job<TData>
}

export interface Queue<TData> {
  enqueue(data: TData): void
  enqueueBulk(data: TData[]): void
  clear(): void
  pause(): void
  resume(): void
  size: number
}
