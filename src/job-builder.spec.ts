import { JobBuilder } from './job-builder'

interface User {
  name: string
  email: string
}

describe('JobBuilder', () => {
  it('should return a job builder', () => {
    const sut = new JobBuilder()

    const builder = sut.job('foo', async () => {})

    expect(builder).toBeInstanceOf(JobBuilder)
  })

  it('should return a catalog of provided jobs on build', () => {
    const sut = new JobBuilder()

    const catalog = sut
      .job('foo', async () => {})
      .job('bar', async (user: User) => {})
      .job('baz', {
        promise: async (user: User) => {}
      })
      .build()

    expect(catalog).toStrictEqual<typeof catalog>({
      foo: {
        promise: expect.any(Function)
      },
      bar: {
        promise: expect.any(Function)
      },
      baz: {
        promise: expect.any(Function)
      }
    })
  })

  it('should not allow duplicate job keys', () => {
    const sut = new JobBuilder()

    const catalog = sut
      .job('foo', async () => {})
      // @ts-expect-error
      .job('foo', async (user: User) => {})
      .build()

    expect(catalog).toStrictEqual<typeof catalog>({
      foo: {
        promise: expect.any(Function)
      }
    })
  })
})
