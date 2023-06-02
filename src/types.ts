export type JobPromise<TData> = (data: TData) => Promise<void>

export interface Job<TData> {
  promise: JobPromise<TData>
}

export type JobCatalog = Record<string, Job<any>>

export type InferData<TJob extends Job<any>> = TJob extends Job<infer TData>
  ? TData
  : never

export interface QueueParams<TData> {
  concurrency?: number
  retry?: number
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
