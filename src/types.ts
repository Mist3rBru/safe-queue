export interface JobParams<TData> {
  promise: (data: TData) => Promise<void>
}

export interface Job<TData> {
  promise: (data: TData) => Promise<void>
}

export interface JobController<TData> {
  data: TData
  attempts: number
}

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
