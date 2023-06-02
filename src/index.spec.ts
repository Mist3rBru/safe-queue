import { createJob, createQueue } from './index'
import { _Queue } from './queue'

describe('createQueue', () => {
  it('should return a Queue instance', () => {
    const queue = createQueue({
      job: {
        promise: async () => {}
      }
    })

    expect(queue).toBeInstanceOf(_Queue)
  })
})

describe('createJob', () => {
  it('should return a Job instance', () => {
    const job = createJob(async () => {})

    expect(job).toStrictEqual({
      promise: expect.any(Function)
    })
  })
})
