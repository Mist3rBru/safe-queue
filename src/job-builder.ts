import { Job, JobCatalog, JobPromise } from './types'

export class JobBuilder<TCatalog extends JobCatalog = {}> {
  private catalog: TCatalog = {} as TCatalog

  job<TKey extends string, TData>(
    key: TKey extends keyof TCatalog ? never : TKey,
    job: Job<TData> | JobPromise<TData>
  ): JobBuilder<
    {
      [K in keyof TCatalog]: K extends TKey ? Job<TData> : TCatalog[K]
    } & {
      [K in TKey]: Job<TData>
    }
  > {
    if ('promise' in job) {
      // @ts-ignore
      this.catalog[key] = job
    } else {
      // @ts-ignore
      this.catalog[key] = { promise: job }
    }
    // @ts-ignore
    return this
  }

  build() {
    return this.catalog
  }
}
