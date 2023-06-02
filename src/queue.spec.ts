import { _Queue } from './queue'
import { QueueParams } from './types'

const makeSut = (params?: Partial<QueueParams<any>>): _Queue<any> => {
  const sut = new _Queue({
    job: {
      promise: () => {
        return new Promise(resolve => {
          setTimeout(() => {
            resolve()
          }, 1000)
        })
      }
    },
    ...params
  })
  return sut
}

jest.spyOn(console, 'error').mockImplementation()

describe('Queue', () => {
  it('should set default values', async () => {
    const sut = makeSut()

    expect(sut.retry).toBe(3)
    expect(sut.concurrency).toBe(Infinity)
    expect(sut.logError).toBe(true)
    expect(sut.waitingQueue.length).toBe(0)
    expect(sut.runningJobs).toBe(0)
    expect(sut.isPaused).toBe(false)
  })

  it('should set provided values', async () => {
    const provided: Partial<QueueParams<any>> = {
      logError: false,
      retry: 5,
      concurrency: 1
    }
    const sut = makeSut(provided)

    expect(sut.retry).toBe(provided.retry)
    expect(sut.concurrency).toBe(provided.concurrency)
    expect(sut.logError).toBe(provided.logError)
  })

  it('should add job controller to waitingQueue on `enqueue`', async () => {
    const sut = makeSut()
    const processSpy = jest.spyOn(sut, 'process')
    processSpy.mockImplementation()

    const data = 'any-data'
    sut.enqueue(data)

    expect(sut.waitingQueue[0]).toStrictEqual({
      attempts: 0,
      data
    })
  })

  it('should call `process` on `enqueue`', async () => {
    const sut = makeSut()
    const processSpy = jest.spyOn(sut, 'process')
    processSpy.mockImplementation()

    sut.enqueue('')

    expect(processSpy).toHaveBeenCalledTimes(1)
  })

  it('should call `enqueue` for each item of list', async () => {
    const sut = makeSut()
    const enqueueSpy = jest.spyOn(sut, 'enqueue')
    enqueueSpy.mockImplementation()

    sut.enqueueBulk(['', '', ''])

    expect(enqueueSpy).toHaveBeenCalledTimes(3)
  })

  it('should return the current `size` of the queue', async () => {
    const sut = makeSut()
    sut.waitingQueue = [
      { attempts: 0, data: '' },
      { attempts: 0, data: '' },
      { attempts: 0, data: '' }
    ]

    expect(sut.size).toBe(3)
    sut.process()
    expect(sut.size).toBe(2)
    sut.process()
    expect(sut.size).toBe(1)
    sut.process()
    expect(sut.size).toBe(0)

    sut.pause()
  })

  it('should `clear` queue', async () => {
    const sut = makeSut()
    sut.waitingQueue = [
      { attempts: 0, data: '' },
      { attempts: 0, data: '' },
      { attempts: 0, data: '' }
    ]

    expect(sut.size).toBe(3)
    sut.clear()
    expect(sut.size).toBe(0)
  })

  it('should `pause` queue', () => {
    const sut = makeSut()

    sut.pause()

    expect(sut.isPaused).toBe(true)
  })

  it('should not `process` queue on paused queue', async () => {
    const sut = makeSut()

    sut.waitingQueue = [{ data: '', attempts: 0 }]
    sut.pause()
    await sut.process()

    expect(sut.size).toBe(1)
  })

  it('should `process` queue on `resume`', async () => {
    const sut = makeSut()
    const processSpy = jest.spyOn(sut, 'process')

    sut.waitingQueue = [
      { data: '', attempts: 0 },
      { data: '', attempts: 0 }
    ]
    sut.resume()

    expect(sut.size).toBe(0)
    expect(sut.runningJobs).toBe(2)
    expect(processSpy).toHaveBeenCalledTimes(2)
    sut.pause()
  })

  it('should call `process` until reach concurrency', async () => {
    const sut = makeSut({
      concurrency: 2
    })
    const processSpy = jest.spyOn(sut, 'process')

    sut.waitingQueue = [
      { data: '', attempts: 0 },
      { data: '', attempts: 0 },
      { data: '', attempts: 0 },
      { data: '', attempts: 0 }
    ]
    sut.resume()

    expect(sut.size).toBe(2)
    expect(sut.runningJobs).toBe(2)
    expect(processSpy).toHaveBeenCalledTimes(2)
    sut.pause()
  })

  it('should retry until reach max retries', async () => {
    const sut = makeSut()
    const jobSpy = jest.spyOn(sut.job, 'promise')
    jobSpy.mockRejectedValue('')

    sut.waitingQueue = [{ data: '', attempts: 0 }]
    await sut.process()

    expect(jobSpy).toHaveBeenCalledTimes(sut.retry + 1)
  })

  it('should not process an empty waitingQueue', async () => {
    const sut = makeSut()

    sut.process()

    expect(sut.runningJobs).toBe(0)
  })

  it('should not process more than concurrency in parallel', async () => {
    const sut = makeSut()

    sut.runningJobs = sut.concurrency
    sut.process()

    expect(sut.runningJobs).toBe(sut.concurrency)
  })
})
