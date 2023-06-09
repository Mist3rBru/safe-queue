# `safe-queue`

A simple and type-safe, self managed queue

## Install

```sh
  npm install @mist3rbru/safe-queue
```

## Usage

Here we run only one promise at the time. For example, set concurrency to 4 to run four promises at the same time.

```ts
import { createJob, createQueue } from 'safe-queue'

interface User {
  name: string
  email: string
}

const mailUserJob = createJob(async (user: User) => {
  // implementation
})

const queue = createQueue({
  job: mailUserJob,
  concurrency: 1
})

queue.enqueue({
  name: 'John',
  email: 'john@gmail.com'
})
```
