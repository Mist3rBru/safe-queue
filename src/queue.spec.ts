import { _Queue } from './queue'
import { Job } from './types'

class JobSpy implements Job<any> {
  data: any
  calledTimes = 0

  async promise(data: any): Promise<void> {
    this.data = data
    this.calledTimes++
    throw new Error()
  }
}

const jobSpy = new JobSpy()

const sut = new _Queue({
  job: jobSpy,
  logError: false
})

describe('Queue', () => {
  afterEach(() => {
    sut.clear()
    jobSpy.calledTimes = 0
    jobSpy.data = undefined
  })

  describe('enqueue()', () => {
    it('should call process once', async () => {
      const processSpy = jest.spyOn(sut, 'process')
      processSpy.mockResolvedValueOnce()

      const data = 'any-data'
      sut.enqueue(data)

      expect(sut.waitingQueue).toStrictEqual([
        {
          attempts: 0,
          data
        }
      ])
      expect(processSpy).toHaveBeenCalledTimes(1)
    })
  })

  describe('enqueueBulk()', () => {
    it('should call enqueue in bulk', async () => {
      const addSpy = jest.spyOn(sut, 'enqueue')

      sut.enqueueBulk(['', '', ''])

      expect(addSpy).toHaveBeenCalledTimes(3)
    })
  })

  describe('process()', () => {
    beforeAll(async () => {
      jest.useFakeTimers()
    })

    afterEach(async () => {
      jest.clearAllMocks()
      jest.clearAllTimers()
    })

    it('should call job promise with correct values', async () => {
      const data = 'any-data'
      sut.waitingQueue = [
        {
          attempts: sut.maxAttempts,
          data
        }
      ]

      await sut.process()

      expect(jobSpy.calledTimes).toBe(1)
      expect(jobSpy.data).toBe(data)
    })
  })
})
